/**
 * Inisialisasi UX native: status bar, splash screen, keyboard, tombol Back.
 * Semua dipanggil dari `useEffect` di root dan tidak melakukan apa pun di web.
 *
 * Tidak ada permintaan izin dan tidak ada request jaringan di sini —
 * startup APK harus langsung menampilkan UI dari aset lokal.
 */
import { isNativeApp, supportsNativeKeyboard, supportsNativeStatusBar } from "./capabilities";

/** Status bar terang + splash disembunyikan setelah UI siap. */
async function initChrome(): Promise<void> {
  if (supportsNativeStatusBar()) {
    try {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: "#fbf7ef" });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch {
      /* perangkat lama bisa menolak sebagian API status bar */
    }
  }

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide();
  } catch {
    /* splash mungkin sudah tertutup */
  }

  if (supportsNativeKeyboard()) {
    try {
      const { Keyboard, KeyboardResize } = await import("@capacitor/keyboard");
      await Keyboard.setResizeMode({ mode: KeyboardResize.Native });
      await Keyboard.setScroll({ isDisabled: false });
    } catch {
      /* abaikan */
    }
  }
}

/**
 * Tombol Back Android: mundur di router lokal bila masih ada riwayat,
 * jika sudah di halaman awal → keluar dari aplikasi.
 */
async function initBackButton(canGoBack: () => boolean, goBack: () => void): Promise<() => void> {
  try {
    const { App } = await import("@capacitor/app");
    const handle = await App.addListener("backButton", () => {
      if (canGoBack()) {
        goBack();
        return;
      }
      void App.exitApp();
    });
    return () => void handle.remove();
  } catch {
    return () => {};
  }
}

export interface NativeShellHooks {
  canGoBack: () => boolean;
  goBack: () => void;
}

/** Dipanggil sekali dari root. Mengembalikan fungsi cleanup. */
export function initNativeShell(hooks: NativeShellHooks): () => void {
  if (!isNativeApp()) return () => {};

  let detachBack: (() => void) | undefined;
  let cancelled = false;

  void initChrome();
  void initBackButton(hooks.canGoBack, hooks.goBack).then((off) => {
    if (cancelled) off();
    else detachBack = off;
  });

  return () => {
    cancelled = true;
    detachBack?.();
  };
}
