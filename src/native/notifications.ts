/**
 * Notifikasi — DUA transport yang tidak pernah dicampur:
 *
 * Web/PWA : Web Push (VAPID + Service Worker) — tetap memakai
 *           `use-push-subscription.ts` milik website, tidak diubah.
 * APK      : FCM native lewat plugin Capacitor PushNotifications.
 *
 * Izin notifikasi hanya diminta ketika pengguna menekan tombol pengaktifan
 * (POST_NOTIFICATIONS Android 13+). Bila izin sudah ditolak permanen, kita
 * tidak memprompt berulang — pengguna diarahkan ke pengaturan sistem.
 *
 * CATATAN PENTING (langkah manual developer):
 * Registrasi token native hanya benar-benar mengirim notifikasi setelah
 * `android/app/google-services.json` dari Firebase console ditambahkan dan
 * backend punya pengirim FCM. Sebelum itu, fungsi di sini melaporkan status
 * apa adanya (`unconfigured`) dan TIDAK memalsukan keberhasilan.
 */
import { supportsNativePush, isNativeApp } from "./capabilities";

export type NativePushState = "granted" | "denied" | "prompt" | "unsupported";

export interface NativePushRegistration {
  token: string;
  platform: "android" | "ios";
}

/** Status izin notifikasi native tanpa memicu prompt. */
export async function getNativePushState(): Promise<NativePushState> {
  if (!supportsNativePush()) return "unsupported";
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const status = await PushNotifications.checkPermissions();
    if (status.receive === "granted") return "granted";
    if (status.receive === "denied") return "denied";
    return "prompt";
  } catch {
    return "unsupported";
  }
}

/**
 * Meminta izin lalu mendaftarkan perangkat ke FCM.
 * Mengembalikan token bila berhasil, atau alasan kegagalan yang jujur.
 */
export async function enableNativePush(): Promise<
  | { ok: true; registration: NativePushRegistration }
  | { ok: false; reason: "denied" | "unsupported" | "unconfigured"; message: string }
> {
  if (!supportsNativePush()) {
    return { ok: false, reason: "unsupported", message: "Notifikasi native tidak tersedia di perangkat ini." };
  }

  const { PushNotifications } = await import("@capacitor/push-notifications");
  const current = await PushNotifications.checkPermissions();

  if (current.receive === "denied") {
    return {
      ok: false,
      reason: "denied",
      message:
        "Notifikasi sedang dinonaktifkan untuk aplikasi ini. Buka Pengaturan → Aplikasi → Notifikasi untuk mengaktifkannya.",
    };
  }

  if (current.receive !== "granted") {
    const asked = await PushNotifications.requestPermissions();
    if (asked.receive !== "granted") {
      return { ok: false, reason: "denied", message: "Izin notifikasi belum diberikan." };
    }
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({
        ok: false,
        reason: "unconfigured",
        message:
          "Perangkat belum bisa didaftarkan ke layanan notifikasi. Konfigurasi Firebase (google-services.json) belum tersedia.",
      });
    }, 12_000);

    void PushNotifications.addListener("registration", (token) => {
      clearTimeout(timer);
      resolve({ ok: true, registration: { token: token.value, platform: "android" } });
    });

    void PushNotifications.addListener("registrationError", () => {
      clearTimeout(timer);
      resolve({
        ok: false,
        reason: "unconfigured",
        message: "Pendaftaran notifikasi gagal. Konfigurasi Firebase belum lengkap.",
      });
    });

    void PushNotifications.register();
  });
}

/**
 * Menangani tap notifikasi native → navigasi in-app (bukan membuka browser).
 * Dipasang sekali dari root, hanya di APK.
 */
export async function attachNativePushHandlers(navigate: (path: string) => void): Promise<() => void> {
  if (!isNativeApp() || !supportsNativePush()) return () => {};
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    const handle = await PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
      const url = (action.notification.data as Record<string, unknown> | undefined)?.["url"];
      if (typeof url !== "string" || !url) return;
      try {
        const parsed = new URL(url, "http://localhost");
        navigate(parsed.pathname + parsed.search);
      } catch {
        /* payload tidak valid — abaikan */
      }
    });
    return () => void handle.remove();
  } catch {
    return () => {};
  }
}
