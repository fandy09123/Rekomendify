import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";

import { LoadingScreen } from "@/components/shell/LoadingScreen";
import { OfflineScreen } from "@/components/shell/OfflineScreen";
import { APP_CONFIG } from "@/config";
import { canReachTarget, subscribeToConnectionChanges } from "@/lib/connectivity";


const TITLE = `${APP_CONFIG.VILLAGE_NAME} — Aplikasi Desa Wisata`;
const DESCRIPTION = `Aplikasi resmi ${APP_CONFIG.VILLAGE_NAME}. Buka aplikasi untuk melihat informasi desa wisata, wisata, produk, dan layanan terbaru.`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AppShell,
});

type ShellState = "checking" | "redirecting" | "offline";

function AppShell() {
  const [state, setState] = useState<ShellState>("checking");
  const redirected = useRef(false);

  const attempt = useCallback(async () => {
    setState("checking");

    const reachable = await canReachTarget();
    if (!reachable) {
      setState("offline");
      return;
    }

    // Redirect penuh: WebView mengambil alih ke website Rekomendify.
    // Guard `redirected` mencegah kemungkinan redirect/reload berulang.
    if (redirected.current) return;
    redirected.current = true;
    setState("redirecting");
    window.location.replace(APP_CONFIG.TARGET_URL);
  }, []);

  useEffect(() => {
    void attempt();
  }, [attempt]);

  // Register handler tombol Back Android (no-op di browser biasa).
  useEffect(() => {
    let dispose: (() => void) | undefined;
    void registerAndroidBackHandler().then((fn) => {
      dispose = fn;
    });
    return () => dispose?.();
  }, []);

  // Jika koneksi kembali saat layar offline tampil, coba lagi otomatis.
  useEffect(() => {
    if (state !== "offline") return;
    return subscribeToConnectionChanges(() => void attempt());
  }, [state, attempt]);

  if (state === "offline") {
    return (
      <OfflineScreen
        title="Koneksi Terputus"
        description="Aplikasi belum dapat terhubung. Harap periksa jaringan Anda lalu coba lagi."
        onRetry={() => void attempt()}
        retrying={false}
      />
    );
  }

  return (
    <LoadingScreen
      message={state === "redirecting" ? "Membuka aplikasi..." : "Menyiapkan aplikasi..."}
    />
  );
}
