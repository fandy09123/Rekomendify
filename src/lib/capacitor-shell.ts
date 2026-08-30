/**
 * Jembatan tipis ke lapisan native App Shell.
 *
 * Tombol Back Android dan permission hardware (kamera, lokasi, notifikasi)
 * ditangani sepenuhnya di native (MainActivity.java), sesuai prinsip
 * "native capability stays native". File ini hanya menyediakan akses aman
 * ke bridge tersebut dari sisi web, dan aman dipanggil di browser biasa.
 */
import { Capacitor } from "@capacitor/core";

export type PermissionState = "granted" | "denied" | "prompt";

export interface NativePermissionStatus {
  platform: "android";
  camera: PermissionState;
  location: PermissionState;
  notifications: PermissionState;
}

interface AndroidShellBridge {
  getPermissionStatus: () => string;
  requestCameraPermission: () => void;
  requestLocationPermission: () => void;
  requestNotificationPermission: () => void;
  openAppSettings: () => void;
  reload: () => void;
}

function bridge(): AndroidShellBridge | null {
  if (typeof window === "undefined") return null;
  return (window as unknown as { AndroidShell?: AndroidShellBridge }).AndroidShell ?? null;
}

export function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

/** Status permission perangkat sebenarnya; null bila tidak berjalan di APK. */
export function getNativePermissionStatus(): NativePermissionStatus | null {
  const api = bridge();
  if (!api) return null;
  try {
    const parsed = JSON.parse(api.getPermissionStatus()) as Partial<NativePermissionStatus>;
    if (parsed.platform !== "android") return null;
    return parsed as NativePermissionStatus;
  } catch (error) {
    console.warn("[app-shell] native permission status unavailable:", error);
    return null;
  }
}

export function requestNativePermission(kind: "camera" | "location" | "notifications"): boolean {
  const api = bridge();
  if (!api) return false;
  if (kind === "camera") api.requestCameraPermission();
  else if (kind === "location") api.requestLocationPermission();
  else api.requestNotificationPermission();
  return true;
}

export function openNativeAppSettings(): boolean {
  const api = bridge();
  if (!api) return false;
  api.openAppSettings();
  return true;
}

/**
 * Muat ulang halaman saat ini. Di APK, reload dilakukan oleh WebView native
 * (setara refresh browser: cookie, storage, dan IndexedDB tidak dihapus).
 * Di browser biasa, fallback ke location.reload().
 */
export function reloadApp(): void {
  const api = bridge();
  if (api) {
    api.reload();
    return;
  }
  if (typeof window !== "undefined") window.location.reload();
}

/** Dipicu native saat app kembali foreground, agar status izin dibaca ulang. */
export function subscribeToNativePermissionChanges(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("androidshell:permissionschanged", onChange);
  return () => window.removeEventListener("androidshell:permissionschanged", onChange);
}
