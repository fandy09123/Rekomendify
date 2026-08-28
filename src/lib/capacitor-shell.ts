/**
 * Integrasi native khusus Capacitor.
 *
 * Semua fungsi di sini aman dipanggil di browser biasa: jika bukan native
 * platform, fungsi langsung keluar tanpa efek dan tanpa error.
 */
import { Capacitor } from "@capacitor/core";

export function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/**
 * Tombol Back Android:
 * - Jika WebView masih punya history (canGoBack) -> mundur satu halaman.
 * - Jika tidak ada history -> keluar aplikasi (perilaku Android normal).
 *
 * Tidak pernah memanggil history.back() secara membabi buta, sehingga tidak
 * terjadi back-loop maupun aplikasi yang tidak bisa ditutup.
 */
export async function registerAndroidBackHandler(): Promise<() => void> {
  if (!isNativePlatform()) return () => {};

  try {
    const { App } = await import("@capacitor/app");
    const handle = await App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        void App.exitApp();
      }
    });
    return () => void handle.remove();
  } catch (error) {
    console.warn("[app-shell] back button listener unavailable:", error);
    return () => {};
  }
}
