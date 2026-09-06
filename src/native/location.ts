/**
 * Location service — satu API untuk web dan APK.
 *
 * Web/PWA : navigator.geolocation.
 * APK      : plugin Capacitor Geolocation (izin Android diminta di sini,
 *            hanya saat pengguna menekan fitur "Terdekat"/"Lokasi saya").
 */
import { supportsNativeLocation } from "./capabilities";

export type LatLng = { lat: number; lng: number };

export type LocationResult =
  | { ok: true; position: LatLng }
  | { ok: false; reason: "denied" | "unavailable" | "timeout"; message: string };

const MESSAGES = {
  denied:
    "Izin lokasi belum diberikan. Aktifkan izin Lokasi untuk aplikasi ini, lalu coba lagi. Daftar tetap bisa dijelajahi seperti biasa.",
  unavailable: "Perangkat ini belum mendukung deteksi lokasi.",
  timeout: "Lokasi belum ditemukan. Pastikan GPS aktif lalu coba lagi.",
} as const;

const OPTIONS = { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 } as const;

/** Ambil posisi sekali. Tidak pernah dipanggil saat startup. */
export async function getCurrentPosition(): Promise<LocationResult> {
  if (supportsNativeLocation()) {
    try {
      const { Geolocation } = await import("@capacitor/geolocation");
      const current = await Geolocation.checkPermissions();
      if (current.location !== "granted" && current.coarseLocation !== "granted") {
        const asked = await Geolocation.requestPermissions({ permissions: ["location", "coarseLocation"] });
        if (asked.location !== "granted" && asked.coarseLocation !== "granted") {
          return { ok: false, reason: "denied", message: MESSAGES.denied };
        }
      }
      const pos = await Geolocation.getCurrentPosition(OPTIONS);
      return { ok: true, position: { lat: pos.coords.latitude, lng: pos.coords.longitude } };
    } catch (error) {
      const text = String((error as Error)?.message ?? error);
      if (/denied|permission/i.test(text)) return { ok: false, reason: "denied", message: MESSAGES.denied };
      if (/timeout/i.test(text)) return { ok: false, reason: "timeout", message: MESSAGES.timeout };
      return { ok: false, reason: "unavailable", message: MESSAGES.unavailable };
    }
  }

  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return { ok: false, reason: "unavailable", message: MESSAGES.unavailable };
  }

  return new Promise<LocationResult>((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ ok: true, position: { lat: pos.coords.latitude, lng: pos.coords.longitude } }),
      (err) =>
        resolve(
          err.code === err.TIMEOUT
            ? { ok: false, reason: "timeout", message: MESSAGES.timeout }
            : { ok: false, reason: "denied", message: MESSAGES.denied },
        ),
      OPTIONS,
    );
  });
}
