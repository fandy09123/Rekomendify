import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

let clientQueryClient: QueryClient | undefined;

export const getRouter = () => {
  const queryClient =
    typeof window !== "undefined"
      ? (clientQueryClient ??= new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: 1000 * 60 * 5, // 5 menit cache segar
              gcTime: 1000 * 60 * 30, // 30 menit simpan di memory
              refetchOnWindowFocus: false,
              retry: 1,
            },
          },
        }))
      : new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: 1000 * 60 * 5,
              gcTime: 1000 * 60 * 30,
              refetchOnWindowFocus: false,
              retry: 1,
            },
          },
        });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadDelay: 50,
    defaultPreloadStaleTime: 1000 * 60 * 5,
    defaultPendingMs: 150,
  });

  return router;
};

