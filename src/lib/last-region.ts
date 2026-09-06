/**
 * Ingatan wilayah terakhir untuk PWA — sepenuhnya di sisi klien.
 *
 * Prinsip:
 * - localStorage menyimpan wilayah TERAKHIR yang benar-benar dikunjungi
 *   (selalu ditimpa, bukan "wilayah pertama" yang permanen).
 * - sessionStorage menandai bahwa auto-redirect sudah dipakai pada sesi ini,
 *   sehingga pengguna PWA bisa keluar wilayah dan menjelajah wilayah lain
 *   tanpa langsung dilempar balik.
 */

const KEY = "rekomendify:last-region";
const LEGACY_KEY = "rekomendify:pwa-home-region";
const SESSION_FLAG = "rekomendify:launch-redirect-done";

export function setLastRegion(slug: string) {
  if (typeof window === "undefined" || !slug) return;
  try {
    window.localStorage.setItem(KEY, slug);
    // Wilayah "home" versi lama tidak lagi dipakai; bersihkan agar tidak menjebak.
    window.localStorage.removeItem(LEGACY_KEY);
  } catch {}
}

export function getLastRegion(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

/** Dipakai saat pengguna menekan "Keluar dari Wilayah". */
export function clearLastRegion() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
    window.localStorage.removeItem(LEGACY_KEY);
    window.sessionStorage.setItem(SESSION_FLAG, "1");
  } catch {}
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(display-mode: standalone)").matches === true ||
    (window.navigator as any).standalone === true
  );
}

/**
 * True hanya sekali per peluncuran aplikasi (cold start). Setelah itu navigasi
 * ke beranda global selalu dihormati.
 */
export function consumeLaunchRedirect(): string | null {
  if (typeof window === "undefined") return null;
  try {
    if (window.sessionStorage.getItem(SESSION_FLAG)) return null;
    window.sessionStorage.setItem(SESSION_FLAG, "1");
    return getLastRegion();
  } catch {
    return null;
  }
}
