/**
 * Di APK, seluruh UI dimuat dari aset lokal (origin WebView `https://localhost`),
 * sementara data tetap datang dari backend website yang sudah ada.
 *
 * Karena itu panggilan server function harus diarahkan ke origin website.
 * Tidak ada `server.url`, tidak ada iframe, tidak ada duplikasi business logic —
 * hanya base URL RPC yang berbeda.
 */
import { TARGET_ORIGIN } from "./tenant";
import { isNativeApp } from "./capabilities";

/** Origin backend (API) untuk build APK. Di web selalu origin sendiri. */
export const API_ORIGIN = TARGET_ORIGIN;

/** Origin WebView yang diizinkan memanggil server function lintas origin. */
export const NATIVE_ORIGINS = ["https://localhost", "capacitor://localhost", "http://localhost"] as const;

/**
 * Fetch kustom untuk server function.
 * Hanya aktif di APK: URL relatif/localhost diarahkan ke API_ORIGIN.
 */
export function nativeServerFnFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  if (!isNativeApp()) return fetch(input, init);

  try {
    const raw =
      typeof input === "string" ? input : input instanceof URL ? input.toString() : (input as Request).url;
    const url = new URL(raw, window.location.origin);
    if (url.origin === window.location.origin) {
      const target = new URL(url.pathname + url.search, API_ORIGIN);
      const request = input instanceof Request ? new Request(target, input) : target;
      return fetch(request, { ...init, mode: "cors", credentials: "omit" });
    }
  } catch {
    /* biarkan fetch bawaan menangani */
  }

  return fetch(input, init);
}
