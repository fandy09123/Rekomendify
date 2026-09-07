/**
 * Mengizinkan APK (origin WebView `https://localhost`) memanggil server function
 * website. Hanya origin WebView yang dikenal — bukan wildcard.
 *
 * Kredensial dikirim lewat header Authorization (bearer Supabase), bukan cookie,
 * sehingga `Access-Control-Allow-Credentials` tidak diperlukan.
 */
import { createMiddleware } from "@tanstack/react-start";

export const NATIVE_APP_ORIGINS = new Set([
  "https://localhost",
  "capacitor://localhost",
  "http://localhost",
]);

const ALLOW_HEADERS = "content-type, authorization, x-tsr-serverfn, x-tsr-redirect";

export function isNativeAppOrigin(origin: string | null | undefined): boolean {
  return !!origin && NATIVE_APP_ORIGINS.has(origin);
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-headers": ALLOW_HEADERS,
    "access-control-max-age": "86400",
    vary: "Origin",
  };
}

/** Menambahkan header CORS untuk origin aplikasi native, termasuk preflight. */
export const nativeCorsMiddleware = createMiddleware().server(async ({ next, request }) => {
  const origin = request.headers.get("Origin");
  if (!isNativeAppOrigin(origin)) return next();

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin!) });
  }

  const result = await next();
  const response = (result as unknown as { response?: Response }).response;
  const target = response instanceof Response ? response : (result as unknown as Response);
  if (target instanceof Response) {
    for (const [key, value] of Object.entries(corsHeaders(origin!))) {
      target.headers.set(key, value);
    }
  }
  return result;
});
