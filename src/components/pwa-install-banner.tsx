import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";
import { InstallGuideSheet } from "@/components/install-app";

const DISMISS_KEY = "rekomendify:pwa-banner-dismissed";

/**
 * Banner instalasi PWA yang muncul di bagian bawah layar.
 * Tampil jika app belum terpasang dan browser mendukung prompt native,
 * atau pada iOS yang butuh panduan manual.
 */
export function PwaInstallBanner() {
  const { canInstall, isInstalled, platform, install } = usePwaInstall();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  });
  const [installing, setInstalling] = useState(false);
  const [guide, setGuide] = useState(false);

  const show = !isInstalled && !dismissed && (canInstall || platform === "ios");
  if (!show) return null;

  const handleInstall = async () => {
    if (!canInstall) return setGuide(true);
    setInstalling(true);
    const outcome = await install();
    setInstalling(false);
    if (outcome === "accepted") {
      setDismissed(true); // sudah install, sembunyikan banner
    } else if (outcome === "unavailable") {
      setGuide(true);
    }
  };

  const handleDismiss = () => {
    window.localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          key="pwa-banner"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] inset-x-0 z-50 flex justify-center px-4 pointer-events-none"
        >
          <div className="pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-card/95 shadow-lift backdrop-blur p-3 flex items-center gap-3">
            {/* Icon */}
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <img
                src="/icon-192.png"
                alt="Rekomendify"
                className="size-8 rounded-lg"
                onError={(e) => {
                  // Fallback jika ikon belum ada
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>

            {/* Text */}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground leading-tight">
                Pasang Aplikasi
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
                {canInstall ? "Akses lebih cepat seperti aplikasi" : "Lihat cara menambah ke Layar Utama"}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleInstall}
                disabled={installing}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                <Download className="size-3.5" />
                {installing ? "Memuat…" : canInstall ? "Pasang" : "Cara"}
              </button>
              <button
                onClick={handleDismiss}
                aria-label="Tutup"
                className="flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
      {guide && <InstallGuideSheet onClose={() => setGuide(false)} />}
    </>
  );
}
