import { APP_CONFIG } from "@/native/tenant";

/**
 * Connectivity check ringan.
 *
 * navigator.onLine hanya menandakan ada interface jaringan, bukan bahwa server
 * target benar-benar dapat dijangkau. Karena itu kita lakukan satu request
 * ringan ber-timeout ke TARGET_URL dengan mode "no-cors": kita tidak perlu
 * membaca isinya, cukup tahu bahwa request tidak gagal di level jaringan.
 */
const PROBE_TIMEOUT_MS = 6000;

export async function canReachTarget(): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return false;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    // cache-busting minimal agar tidak memakai hasil lama, tanpa cache agresif.
    await fetch(`${APP_CONFIG.TARGET_URL}?_shell=${Date.now()}`, {
      method: "GET",
      mode: "no-cors",
      cache: "no-store",
      redirect: "follow",
      signal: controller.signal,
    });
    return true;
  } catch (error) {
    // Error teknis hanya untuk developer, tidak ditampilkan ke user.
    console.warn("[app-shell] connectivity probe failed:", error);
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Berlangganan event online/offline bawaan browser/WebView. */
export function subscribeToConnectionChanges(onOnline: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", onOnline);
  return () => window.removeEventListener("online", onOnline);
}
