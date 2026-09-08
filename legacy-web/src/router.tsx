import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

let clientQueryClient: QueryClient | undefined;

/**
 * Galat yang tidak layak diulang: 429 (rate limit / WAF) dan 4xx lain seperti
 * izin atau permintaan salah. Mengulanginya hanya menambah beban dan biaya.
 */
function isNonRetryable(error: unknown): boolean {
  const status =
    (error as { status?: number; statusCode?: number } | null)?.status ??
    (error as { statusCode?: number } | null)?.statusCode;
  if (typeof status === "number") return status >= 400 && status < 500;
  const msg = String((error as Error | null)?.message ?? "");
  return /\b(429|too many requests|rate limit|401|403)\b/i.test(msg);
}

/**
 * Kebijakan cache default.
 * - staleTime 5 menit: data publik satu desa jarang berubah, jadi navigasi
 *   bolak-balik (Beranda → Jelajah → Detail → kembali) memakai cache.
 * - refetchOnWindowFocus/Reconnect dimatikan: satu event jaringan tidak boleh
 *   memicu puluhan request sekaligus. Data tetap diperbarui ketika stale pada
 *   mount berikutnya atau saat pengguna me-refresh.
 * - retry dimatikan saat perangkat offline supaya tidak menumpuk percobaan
 *   yang pasti gagal (penting untuk WebView Capacitor & jaringan buruk).
 */
const defaultOptions = {
  queries: {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: (failureCount: number, error: unknown) => {
      if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
      // 429/4xx (rate limit, izin, permintaan salah) tidak akan berubah hasilnya
      // bila diulang — mengulang justru menambah beban saat sedang dibatasi.
      if (isNonRetryable(error)) return false;
      return failureCount < 1;
    },
  },
  mutations: {
    retry: false,
  },
} as const;

export const getRouter = () => {
  const queryClient =
    typeof window !== "undefined"
      ? (clientQueryClient ??= new QueryClient({ defaultOptions }))
      : new QueryClient({ defaultOptions });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadDelay: 120,
    defaultPreloadStaleTime: 1000 * 60 * 5,
    defaultPendingMs: 150,
  });

  return router;
};
