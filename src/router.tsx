import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { attachQueryPersistence } from "./lib/query-persist";


let clientQueryClient: QueryClient | undefined;

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
    retry: (failureCount: number) => {
      if (typeof navigator !== "undefined" && navigator.onLine === false) return false;
      return failureCount < 1;
    },
  },
  mutations: {
    retry: false,
  },
} as const;

let persistenceAttached = false;

export const getRouter = () => {
  const queryClient =
    typeof window !== "undefined"
      ? (clientQueryClient ??= new QueryClient({ defaultOptions }))
      : new QueryClient({ defaultOptions });

  // Cache data publik di perangkat (IndexedDB) supaya aplikasi tetap berisi
  // saat tanpa koneksi. Hanya di klien, hanya sekali, dan tidak pernah
  // menghapus cache saat startup.
  if (typeof window !== "undefined" && !persistenceAttached) {
    persistenceAttached = true;
    void attachQueryPersistence(queryClient);
  }



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
