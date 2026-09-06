/**
 * Link eksternal (Google Maps, WhatsApp, Instagram, YouTube).
 *
 * Route internal aplikasi TIDAK boleh lewat sini — itu ditangani
 * TanStack Router lokal. Fungsi ini hanya untuk tujuan di luar aplikasi.
 */
import { supportsNativeBrowser, isNativeApp } from "./capabilities";

const APP_SCHEMES = /^(tel:|mailto:|sms:|whatsapp:|geo:|intent:)/i;

export async function openExternal(url: string): Promise<void> {
  if (typeof window === "undefined" || !url) return;

  // Skema aplikasi (telepon/WA/maps) selalu diserahkan ke sistem operasi.
  if (APP_SCHEMES.test(url)) {
    window.location.href = url;
    return;
  }

  if (isNativeApp() && supportsNativeBrowser()) {
    try {
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url, presentationStyle: "popover" });
      return;
    } catch {
      /* fallback ke perilaku web di bawah */
    }
  }

  window.open(url, "_blank", "noopener,noreferrer");
}
