/**
 * Deteksi kapabilitas — SATU-SATUNYA tempat yang boleh menentukan
 * "apakah kode ini sedang berjalan di dalam APK Android".
 *
 * Aturan:
 * - Tidak pakai user-agent hack, tidak pakai ukuran layar.
 * - Memakai API resmi Capacitor (`Capacitor.isNativePlatform()`).
 * - Aman untuk SSR: semua fungsi mengembalikan false di server.
 */
import { Capacitor } from "@capacitor/core";

/** Berjalan di dalam WebView aplikasi native (APK), bukan browser biasa. */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** Platform aktif: "android" | "ios" | "web". */
export function nativePlatform(): string {
  if (typeof window === "undefined") return "web";
  try {
    return Capacitor.getPlatform();
  } catch {
    return "web";
  }
}

export function isAndroidApp(): boolean {
  return isNativeApp() && nativePlatform() === "android";
}

function hasPlugin(name: string): boolean {
  if (!isNativeApp()) return false;
  try {
    return Capacitor.isPluginAvailable(name);
  } catch {
    return false;
  }
}

export const supportsNativeCamera = () => hasPlugin("Camera");
export const supportsNativeLocation = () => hasPlugin("Geolocation");
export const supportsNativePush = () => hasPlugin("PushNotifications");
export const supportsNativeBrowser = () => hasPlugin("Browser");
export const supportsNativeStatusBar = () => hasPlugin("StatusBar");
export const supportsNativeKeyboard = () => hasPlugin("Keyboard");

/**
 * Web Push (VAPID + Service Worker) hanya untuk browser/PWA.
 * Di APK, transport notifikasi adalah FCM native — jangan dicampur.
 */
export function supportsWebPush(): boolean {
  if (typeof window === "undefined") return false;
  if (isNativeApp()) return false;
  return "serviceWorker" in navigator && "PushManager" in window;
}

/** Service Worker hanya didaftarkan untuk web/PWA; APK sudah membawa aset lokal. */
export function shouldRegisterServiceWorker(): boolean {
  if (typeof window === "undefined") return false;
  if (isNativeApp()) return false;
  return "serviceWorker" in navigator;
}
