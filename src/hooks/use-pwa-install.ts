import { useState, useEffect, useCallback } from "react";

/** Event yang ditembakkan browser sebelum prompt install PWA */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export type InstallPlatform = "ios" | "android" | "desktop" | "unknown";

interface UsePwaInstallReturn {
  /** true jika browser menyediakan prompt native DAN app belum terpasang */
  canInstall: boolean;
  /** true jika app sudah berjalan dalam mode standalone (sudah terpasang) */
  isInstalled: boolean;
  /** Platform pengguna — dipakai untuk menampilkan panduan manual */
  platform: InstallPlatform;
  /** true bila perlu panduan manual (mis. iOS Safari yang tak punya prompt) */
  needsManualGuide: boolean;
  /** Panggil untuk memunculkan prompt install browser */
  install: () => Promise<"accepted" | "dismissed" | "unavailable">;
}

function detectPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && (navigator as any).maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

/**
 * Hook untuk menangkap dan menggunakan beforeinstallprompt event.
 * Bila browser tidak mendukung prompt (mis. iOS Safari), hook tetap
 * melaporkan platform sehingga UI bisa menampilkan panduan manual.
 */
export function usePwaInstall(): UsePwaInstallReturn {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>("unknown");

  useEffect(() => {
    if (typeof window === "undefined") return;
    setPlatform(detectPlatform());

    // Cek apakah sudah berjalan sebagai standalone (sudah terpasang)
    const mq = window.matchMedia("(display-mode: standalone)");
    const checkInstalled = () => {
      const standalone =
        mq.matches || (window.navigator as { standalone?: boolean }).standalone === true;
      setIsInstalled(standalone);
    };
    checkInstalled();
    mq.addEventListener("change", checkInstalled);

    // Tangkap beforeinstallprompt sebelum browser memunculkannya sendiri
    const handler = (e: Event) => {
      e.preventDefault(); // Cegah prompt otomatis browser
      setPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Jika app berhasil diinstall, sembunyikan tombol
    const installedHandler = () => {
      setPrompt(null);
      setIsInstalled(true);
    };
    window.addEventListener("appinstalled", installedHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
      mq.removeEventListener("change", checkInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<
    "accepted" | "dismissed" | "unavailable"
  > => {
    if (!prompt) return "unavailable";
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setPrompt(null); // Prompt hanya bisa digunakan sekali
    return outcome;
  }, [prompt]);

  const canInstall = !!prompt && !isInstalled;

  return {
    canInstall,
    isInstalled,
    platform,
    needsManualGuide: !isInstalled && !canInstall && platform !== "unknown",
    install,
  };
}
