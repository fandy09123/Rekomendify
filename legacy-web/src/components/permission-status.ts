import { useEffect, useState } from "react";

export type PermState = "granted" | "denied" | "prompt" | "unsupported" | "unknown";

/**
 * Membaca status izin perangkat tanpa pernah memicu permintaan izin.
 * `navigator.permissions` tidak ada di sebagian Safari lama → "unknown".
 */
export function useDevicePermission(name: "geolocation" | "camera"): PermState {
  const [state, setState] = useState<PermState>("unknown");

  useEffect(() => {
    let alive = true;
    let status: any = null;

    const supported =
      name === "geolocation"
        ? typeof navigator !== "undefined" && "geolocation" in navigator
        : typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

    if (!supported) {
      setState("unsupported");
      return;
    }

    (async () => {
      try {
        if (!navigator.permissions?.query) {
          if (alive) setState("unknown");
          return;
        }
        status = await navigator.permissions.query({ name: name as PermissionName });
        if (!alive) return;
        setState(status.state as PermState);
        status.onchange = () => setState(status.state as PermState);
      } catch {
        if (alive) setState("unknown");
      }
    })();

    return () => {
      alive = false;
      if (status) status.onchange = null;
    };
  }, [name]);

  return state;
}

/** Status izin notifikasi browser (tidak memicu prompt). */
export function useNotificationPermission(): PermState {
  const [state, setState] = useState<PermState>("unknown");
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setState("unsupported");
      return;
    }
    const map = () => {
      const p = Notification.permission;
      setState(p === "default" ? "prompt" : (p as PermState));
    };
    map();
    const onVis = () => document.visibilityState === "visible" && map();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);
  return state;
}
