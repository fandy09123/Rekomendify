/**
 * Dedupe pencatatan kunjungan.
 *
 * Satu wisatawan bisa bolak-balik Beranda → Detail → Beranda puluhan kali dalam
 * satu sesi. Tanpa dedupe, setiap mount menghasilkan satu INSERT `visits`
 * (sekaligus satu invocation server function). Kita tetap mencatat kunjungan
 * yang bermakna: satu kunjungan per target per jendela waktu.
 */

const WINDOW_MS = 30 * 60 * 1000; // 30 menit
const STORAGE_KEY = "rekomendify.visit-marks.v1";

type Marks = Record<string, number>;

function read(): Marks {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Marks;
  } catch {
    return {};
  }
}

function write(marks: Marks) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(marks));
  } catch {
    /* storage penuh / mode privat — abaikan, cukup lewati dedupe */
  }
}

/**
 * `true` bila kunjungan ini belum dicatat dalam jendela waktu berjalan.
 * Menandai key sekaligus, jadi pemanggilan berikutnya di sesi yang sama
 * mengembalikan `false`.
 */
export function shouldRecordVisit(key: string, windowMs: number = WINDOW_MS): boolean {
  if (typeof window === "undefined") return false;
  const now = Date.now();
  const marks = read();
  const last = marks[key];
  if (typeof last === "number" && now - last < windowMs) return false;
  // Bersihkan penanda kedaluwarsa agar sessionStorage tidak tumbuh.
  for (const [k, v] of Object.entries(marks)) {
    if (now - v >= WINDOW_MS) delete marks[k];
  }
  marks[key] = now;
  write(marks);
  return true;
}

/**
 * Dedupe aksi wisatawan (WhatsApp / rute / simpan / bagikan).
 *
 * Tombol aksi mudah ditekan berulang; tanpa jeda, satu niat yang sama bisa
 * menghasilkan puluhan INSERT `engagement_events`. Jendela 5 menit cukup
 * untuk membuang klik beruntun tanpa menghilangkan sinyal konversi nyata.
 */
export function shouldRecordEngagement(key: string): boolean {
  return shouldRecordVisit(`eng:${key}`, 5 * 60 * 1000);
}

