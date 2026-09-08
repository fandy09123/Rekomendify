/**
 * Daily activity tracking — frontend-only throttling.
 *
 * Tujuan: menekan jumlah request Supabase (target Free Tier) dengan aturan
 * "satu perangkat = maksimal 1 request per aktivitas per hari", selama request
 * sebelumnya BERHASIL. Kegagalan tidak pernah disimpan, sehingga percobaan
 * berikutnya di hari yang sama tetap diperbolehkan.
 *
 * Tidak ada tabel/kolom/endpoint baru: helper ini memakai server function
 * `recordVisit` yang sudah ada (tabel `visits`).
 */

import { recordVisit } from "@/lib/public.functions";

const STORAGE_KEY = "last_supabase_visit";

type DayLog = { date: string; keys: string[] };

/** Tanggal LOKAL perangkat (bukan UTC) dalam format YYYY-MM-DD. */
export function localDateKey(d: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function readLog(): DayLog {
  const today = localDateKey();
  try {
    if (typeof window === "undefined") return { date: today, keys: [] };
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: today, keys: [] };
    // Format lama / sederhana: hanya string tanggal.
    if (!raw.startsWith("{")) return { date: raw, keys: raw === today ? ["app"] : [] };
    const parsed = JSON.parse(raw) as Partial<DayLog>;
    if (parsed?.date !== today || !Array.isArray(parsed.keys)) return { date: today, keys: [] };
    return { date: today, keys: parsed.keys.filter((k) => typeof k === "string") };
  } catch {
    // Incognito / storage dibatasi / WebView terbatas — anggap belum tercatat.
    return { date: today, keys: [] };
  }
}

function writeLog(log: DayLog) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
  } catch {
    /* storage tidak tersedia — tracking tetap jalan, hanya tanpa throttle persisten */
  }
}

/** `true` bila aktivitas ini sudah berhasil dicatat hari ini. */
export function isTrackedToday(activity: string): boolean {
  return readLog().keys.includes(activity);
}

/** `true` bila ADA aktivitas apa pun yang sudah berhasil dicatat hari ini. */
export function hasTrackedAnythingToday(): boolean {
  return readLog().keys.length > 0;
}

function markTracked(activity: string) {
  const log = readLog();
  if (!log.keys.includes(activity)) log.keys.push(activity);
  writeLog(log);
}

/**
 * Guard in-memory: mencegah dua invocation bersamaan (React Strict Mode double
 * effect, dua komponen memanggil hal yang sama). Entry dihapus setelah selesai
 * agar kegagalan tidak memblokir percobaan berikutnya.
 */
const inflight = new Map<string, Promise<boolean>>();

/**
 * Jalankan `run` maksimal sekali per hari per `activity`.
 * Mengembalikan `true` bila request benar-benar dikirim dan sukses.
 */
export function trackDailyActivity(
  activity: string,
  run: () => Promise<unknown>,
): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (isTrackedToday(activity)) return Promise.resolve(false);
  const existing = inflight.get(activity);
  if (existing) return existing;

  const task = (async () => {
    try {
      await run();
      markTracked(activity);
      return true;
    } catch (err) {
      // Gagal → TIDAK disimpan, sehingga masih boleh dicoba lagi nanti.
      console.warn(
        `[analytics] gagal mencatat "${activity}":`,
        err instanceof Error ? err.message : err,
      );
      return false;
    } finally {
      inflight.delete(activity);
    }
  })();

  inflight.set(activity, task);
  return task;
}

type VisitInput = {
  regionId?: string | null;
  locationId?: string | null;
  qrAssignmentId?: string | null;
  source?: "qr" | "gps" | "direct";
};

/**
 * Catat kunjungan (tabel `visits`) maksimal sekali per hari untuk kombinasi
 * target yang sama. `activity` opsional untuk mengelompokkan aktivitas.
 */
export function trackDailyVisit(input: VisitInput = {}, activity?: string): Promise<boolean> {
  const source = input.source ?? "direct";
  const key =
    activity ??
    `visit:${input.locationId ?? "-"}:${input.regionId ?? "-"}:${source}`;
  return trackDailyActivity(key, () =>
    recordVisit({
      data: {
        regionId: input.regionId ?? null,
        locationId: input.locationId ?? null,
        qrAssignmentId: input.qrAssignmentId ?? null,
        source,
      },
    }),
  );
}

/**
 * Aktivitas "aplikasi dibuka" di level root. Hanya dikirim bila hari ini belum
 * ada aktivitas lain yang tercatat — sehingga membuka aplikasi langsung ke
 * halaman wilayah tetap hanya menghasilkan satu request.
 */
export function trackAppOpen(): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (hasTrackedAnythingToday()) return Promise.resolve(false);
  return trackDailyVisit({ source: "direct" }, "app-open");
}
