/**
 * Status onboarding izin — disimpan lokal di perangkat (localStorage).
 * Tidak ada data yang dikirim ke server dari modul ini.
 */
const KEY = "rekomendify:onboarding:v1";

export function hasSeenOnboarding(): boolean {
  try {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return true;
  }
}

export function markOnboardingSeen() {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    /* mode privat / storage penuh — abaikan */
  }
}

export function resetOnboarding() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    /* abaikan */
  }
}

/** Rute yang tidak boleh ditimpa onboarding (alur teknis / admin). */
export function isOnboardingBlockedPath(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/q/") ||
    pathname.endsWith("/scan") ||
    pathname === "/privasi"
  );
}
