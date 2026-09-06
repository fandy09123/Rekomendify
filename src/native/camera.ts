/**
 * Camera service — satu API untuk web dan APK.
 *
 * Web/PWA : <input type="file" capture> (perilaku website yang sudah ada).
 * APK      : plugin Capacitor Camera (native picker/kamera Android).
 *
 * Izin kamera TIDAK PERNAH diminta saat startup — hanya ketika fungsi di sini
 * dipanggil oleh aksi pengguna.
 */
import { supportsNativeCamera } from "./capabilities";

export type CameraSource = "camera" | "photos";

export type CameraResult =
  | { ok: true; file: File }
  | { ok: false; reason: "cancelled" | "denied" | "unavailable"; message: string };

const MESSAGES = {
  denied:
    "Izin kamera belum diberikan. Buka Pengaturan → Aplikasi → izin, lalu aktifkan Kamera untuk memakai fitur ini.",
  unavailable: "Kamera tidak tersedia di perangkat ini. Anda masih bisa memilih foto dari galeri.",
  cancelled: "Pengambilan foto dibatalkan.",
} as const;

function dataUrlToFile(dataUrl: string, name: string): File {
  const [head, body] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(head ?? "")?.[1] ?? "image/jpeg";
  const bin = atob(body ?? "");
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], name, { type: mime });
}

/** True bila aplikasi bisa memakai kamera native (bukan input file). */
export function hasNativeCamera(): boolean {
  return supportsNativeCamera();
}

/**
 * Ambil satu foto. Mengembalikan File supaya alur kompres/crop/upload website
 * yang sudah ada tetap dipakai tanpa duplikasi logic.
 */
export async function pickPhoto(source: CameraSource = "camera"): Promise<CameraResult> {
  if (!supportsNativeCamera()) {
    return { ok: false, reason: "unavailable", message: MESSAGES.unavailable };
  }

  try {
    const { Camera, CameraResultType, CameraSource: Src } = await import("@capacitor/camera");

    // Periksa dulu, minta hanya bila memang belum diberikan.
    const wanted = source === "camera" ? { permissions: ["camera" as const] } : { permissions: ["photos" as const] };
    const current = await Camera.checkPermissions();
    const key = source === "camera" ? current.camera : current.photos;
    if (key !== "granted") {
      const asked = await Camera.requestPermissions(wanted);
      const after = source === "camera" ? asked.camera : asked.photos;
      if (after !== "granted") return { ok: false, reason: "denied", message: MESSAGES.denied };
    }

    const photo = await Camera.getPhoto({
      quality: 82,
      allowEditing: false,
      correctOrientation: true,
      resultType: CameraResultType.DataUrl,
      source: source === "camera" ? Src.Camera : Src.Photos,
    });

    if (!photo.dataUrl) return { ok: false, reason: "cancelled", message: MESSAGES.cancelled };
    const ext = (photo.format || "jpeg").replace("jpeg", "jpg");
    return { ok: true, file: dataUrlToFile(photo.dataUrl, `foto-${Date.now()}.${ext}`) };
  } catch (error) {
    const text = String((error as Error)?.message ?? error);
    if (/cancel/i.test(text)) return { ok: false, reason: "cancelled", message: MESSAGES.cancelled };
    if (/denied|permission/i.test(text)) return { ok: false, reason: "denied", message: MESSAGES.denied };
    return { ok: false, reason: "unavailable", message: MESSAGES.unavailable };
  }
}
