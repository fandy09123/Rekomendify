import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { PwaInstallBanner } from "@/components/pwa-install-banner";
import { OnboardingGate } from "@/components/onboarding-gate";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center batik-bg px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Wilayah tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Halaman yang Anda cari tidak ada atau belum tersedia.
        </p>
        <div className="mt-6">
          <Link to="/" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center batik-bg px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">Halaman gagal dimuat</h1>
        <p className="mt-2 text-sm text-muted-foreground">Coba muat ulang halaman.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">Coba lagi</button>
          <a href="/" className="rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-accent/10">Beranda</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#c2603a" },
      { title: "Rekomendify — Pemandu Wisata Digital Lokal" },
      { name: "description", content: "Jelajahi wilayah wisata, UMKM, dan tempat menarik di sekitar Anda dengan pemandu digital Cak Mulyo & Jeng Sari." },
      { property: "og:title", content: "Rekomendify — Pemandu Wisata Digital" },
      { property: "og:description", content: "Buka, dituntun, jelajahi wilayah." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // iOS PWA
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "Desa Mulyosari" },
      { name: "mobile-web-app-capable", content: "yes" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest", crossOrigin: "use-credentials" },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "apple-touch-icon", href: "/icon-192.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  // Registrasi Service Worker untuk PWA + Web Push.
  // `updateViaCache: "none"` mencegah browser memakai sw.js lama dari HTTP cache.
  // Browser sendiri sudah mengecek sw.js pada setiap navigasi (cold start PWA,
  // reload, buka tab baru), jadi pemeriksaan manual hanya perlu untuk sesi yang
  // dibiarkan terbuka lama: dipicu saat tab kembali aktif, dengan throttle 15 menit.
  const SW_UPDATE_THROTTLE_MS = 15 * 60_000;
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    let reg: ServiceWorkerRegistration | null = null;
    let last = 0;
    let refreshing = false;
    const hadController = !!navigator.serviceWorker.controller;

    // Muat ulang halaman saat Service Worker baru mengambil alih (controllerchange)
    const onControllerChange = () => {
      if (refreshing) return;
      if (!hadController) return; // Abaikan pada klaim pertama visitor baru
      refreshing = true;
      window.location.reload();
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    const check = () => {
      if (!reg || document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - last < SW_UPDATE_THROTTLE_MS) return; // hindari update loop
      last = now;
      reg.update().catch(() => {});
    };

    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((r) => {
        reg = r;
        last = Date.now();
      })
      .catch((err) => console.warn("[SW] Registrasi gagal:", err));

    document.addEventListener("visibilitychange", check);
    return () => {
      document.removeEventListener("visibilitychange", check);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    return () => sub.subscription.unsubscribe();
  }, [router, queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster />
      <PwaInstallBanner />
      <OnboardingGate />
    </QueryClientProvider>
  );
}
