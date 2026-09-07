import { createStart, createMiddleware, createCsrfMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { isNativeAppOrigin, nativeCorsMiddleware } from "./lib/native-cors";
import { nativeServerFnFetch } from "./native/api-origin";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Lindungi semua server function dari CSRF.
// Aplikasi Android memuat UI dari aset lokal, jadi permintaannya bersifat
// cross-site dengan Origin WebView yang sudah diketahui — hanya origin itu
// yang diizinkan, selain origin website itu sendiri.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
  secFetchSite: (value, ctx) => {
    if (value === "same-origin" || value === "none") return true;
    return isNativeAppOrigin(ctx.request.headers.get("Origin"));
  },
  origin: (value, ctx) => value === new URL(ctx.request.url).origin || isNativeAppOrigin(value),
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [nativeCorsMiddleware, csrfMiddleware, errorMiddleware],
  serverFns: { fetch: nativeServerFnFetch },
}));
