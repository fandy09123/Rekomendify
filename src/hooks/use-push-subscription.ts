import { useCallback, useEffect, useRef, useState } from "react";
import {
  getPushConfig,
  syncPushSubscription,
  setRegionFollow,
  deactivatePushSubscription,
} from "@/lib/push.functions";
import { DEFAULT_VAPID_PUBLIC_KEY } from "@/lib/push-config";

/**
 * State langganan Web Push untuk satu perangkat.
 *
 * Semua akses browser API dilakukan di dalam `useEffect` / event handler,
 * sehingga markup SSR dan hidrasi pertama tetap identik.
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const sanitized = base64String.trim().replace(/\s+/g, "");
  const padding = "=".repeat((4 - (sanitized.length % 4)) % 4);
  const base64 = (sanitized + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function bufferToB64url(buf: ArrayBuffer | null): string {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function toPayload(sub: PushSubscription) {
  return {
    endpoint: sub.endpoint,
    p256dh: bufferToB64url(sub.getKey("p256dh")),
    auth: bufferToB64url(sub.getKey("auth")),
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 400) : null,
  };
}

export interface PushState {
  /** Browser mendukung Service Worker + Push API. */
  supported: boolean;
  /** Server sudah punya VAPID key. */
  configured: boolean;
  /** Pemeriksaan awal selesai (hindari flicker tombol). */
  ready: boolean;
  permission: NotificationPermission | "unsupported";
  /** Perangkat ini punya langganan aktif. */
  subscribed: boolean;
  /** Wilayah yang diikuti perangkat ini. */
  regionSlugs: string[];
  busy: boolean;
  error: string | null;
  isFollowing: (slug: string) => boolean;
  /** Meminta izin + membuat langganan. Mengembalikan true bila berhasil. */
  enable: () => Promise<boolean>;
  /** Mengikuti / berhenti mengikuti satu wilayah (otomatis subscribe dulu). */
  toggleFollow: (slug: string, follow: boolean) => Promise<boolean>;
  /** Mematikan notifikasi sepenuhnya untuk perangkat ini. */
  disable: () => Promise<void>;
}

const getSwRegistrationWithTimeout = (timeoutMs = 2500): Promise<ServiceWorkerRegistration | null> => {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
  ]);
};

async function ensureActiveServiceWorker(reg: ServiceWorkerRegistration): Promise<ServiceWorkerRegistration> {
  if (reg.active && reg.active.state === "activated") {
    return reg;
  }
  const worker = reg.active || reg.installing || reg.waiting;
  if (!worker) return reg;
  if (worker.state === "activated") return reg;

  return new Promise((resolve) => {
    const onStateChange = () => {
      if (worker.state === "activated" || reg.active) {
        worker.removeEventListener("statechange", onStateChange);
        resolve(reg);
      }
    };
    worker.addEventListener("statechange", onStateChange);
    setTimeout(() => {
      worker.removeEventListener("statechange", onStateChange);
      resolve(reg);
    }, 3000);
  });
}

function isIOSNonStandalone(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && (navigator as any).maxTouchPoints > 1);
  if (!isIOS) return false;
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as { standalone?: boolean }).standalone === true;
  return !isStandalone;
}

function mapPushError(e: any): string {
  const msg = e?.message ?? String(e ?? "");
  if (isIOSNonStandalone()) {
    return "Untuk menerima notifikasi di iPhone/iPad, tambahkan Rekomendify ke Layar Utama (Add to Home Screen) terlebih dahulu.";
  }
  if (msg.includes("Izin notifikasi ditolak") || msg.includes("permission") || msg.includes("denied") || msg.includes("NotAllowedError")) {
    return "Izin notifikasi ditolak. Aktifkan izin notifikasi Rekomendify di pengaturan browser Anda.";
  }
  if (msg.includes("Registration failed") || msg.includes("push service error")) {
    return "Gagal mendaftarkan notifikasi di perangkat mobile. Pastikan Layanan Google Play / koneksi internet aktif, lalu coba muat ulang.";
  }
  return msg || "Gagal mengaktifkan notifikasi push.";
}

export function usePushSubscription(): PushState {
  const [supported, setSupported] = useState(false);
  const [configured, setConfigured] = useState(false);
  const [ready, setReady] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const [subscribed, setSubscribed] = useState(false);
  const [regionSlugs, setRegionSlugs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const publicKeyRef = useRef<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const ok =
        typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;
      if (!ok) {
        if (alive) setReady(true);
        return;
      }
      if (!alive) return;
      setSupported(true);
      setPermission(Notification.permission);

      try {
        // Public key sudah ada di bundle (aman & memang untuk browser), jadi
        // tidak perlu satu server function call di setiap mount halaman.
        publicKeyRef.current = DEFAULT_VAPID_PUBLIC_KEY;
        setConfigured(Boolean(publicKeyRef.current));

        const reg = await getSwRegistrationWithTimeout(2500);
        if (reg) {
          const existing = await reg.pushManager.getSubscription();
          if (!alive) return;
          if (existing && Notification.permission === "granted") {
            setSubscribed(true);
            const cached = readSyncCache(existing.endpoint);
            if (cached) {
              // Langganan tidak berubah dan baru saja disinkronkan — cukup pakai
              // daftar wilayah dari cache perangkat, tanpa write ke database.
              if (alive) setRegionSlugs(cached);
            } else {
              const res = await syncPushSubscription({ data: toPayload(existing) });
              if (!alive) return;
              setRegionSlugs(res.regionSlugs ?? []);
              writeSyncCache(existing.endpoint, res.regionSlugs ?? []);
            }
          }
        }
      } catch {
        // Diamkan: notifikasi bersifat opsional, jangan ganggu halaman.
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /** Memastikan ada langganan aktif; mengembalikan payload langganan. */
  const ensureSubscription = useCallback(async () => {
    if (isIOSNonStandalone()) {
      throw new Error("Untuk menerima notifikasi di iPhone/iPad, tambahkan Rekomendify ke Layar Utama (Add to Home Screen) terlebih dahulu.");
    }
    if (!supported) throw new Error("Browser atau perangkat ini belum mendukung notifikasi Web Push.");
    const key = publicKeyRef.current;
    if (!key) throw new Error("Notifikasi belum dikonfigurasi di server.");

    const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    setPermission(perm);
    if (perm !== "granted") throw new Error("Izin notifikasi ditolak. Aktifkan lewat pengaturan browser.");

    let reg = await getSwRegistrationWithTimeout(4000);
    if (!reg) throw new Error("Service Worker belum siap. Coba muat ulang halaman.");

    reg = await ensureActiveServiceWorker(reg);

    const appServerKey = urlBase64ToUint8Array(key) as unknown as BufferSource;

    // Langganan lama bisa saja dibuat dengan VAPID public key sebelumnya.
    // Bila kuncinya berbeda, lepas dulu agar tidak menghasilkan langganan
    // yang tidak bisa dikirimi push oleh server (410/403).
    let existing = await reg.pushManager.getSubscription();
    if (existing) {
      const existingKey = bufferToB64url(existing.options?.applicationServerKey ?? null);
      const wantedKey = key.trim().replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
      if (existingKey && existingKey !== wantedKey) {
        try {
          await deactivatePushSubscription({ data: { endpoint: existing.endpoint } });
        } catch {
          // abaikan: pembersihan sisi server bersifat best-effort
        }
        await existing.unsubscribe().catch(() => {});
        existing = null;
      }
    }

    const sub =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey,
      }));
    setSubscribed(true);
    return toPayload(sub);

  }, [supported]);

  const enable = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const payload = await ensureSubscription();
      const res = await syncPushSubscription({ data: payload });
      setRegionSlugs(res.regionSlugs ?? []);
      return true;
    } catch (e: any) {
      setError(mapPushError(e));
      return false;
    } finally {
      setBusy(false);
    }
  }, [ensureSubscription]);

  const toggleFollow = useCallback(
    async (slug: string, follow: boolean) => {
      setBusy(true);
      setError(null);
      try {
        const payload = await ensureSubscription();
        const res = await setRegionFollow({ data: { ...payload, regionSlug: slug, follow } });
        setRegionSlugs(res.regionSlugs ?? []);
        return true;
      } catch (e: any) {
        setError(mapPushError(e));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [ensureSubscription],
  );

  const disable = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const reg = await getSwRegistrationWithTimeout(4000);
      const sub = reg ? await reg.pushManager.getSubscription() : null;
      if (sub) {
        await deactivatePushSubscription({ data: { endpoint: sub.endpoint } });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      setRegionSlugs([]);
    } catch (e: any) {
      setError(e?.message ?? "Gagal menonaktifkan notifikasi.");
    } finally {
      setBusy(false);
    }
  }, []);

  const isFollowing = useCallback((slug: string) => regionSlugs.includes(slug), [regionSlugs]);

  return {
    supported,
    configured,
    ready,
    permission,
    subscribed,
    regionSlugs,
    busy,
    error,
    isFollowing,
    enable,
    toggleFollow,
    disable,
  };
}
