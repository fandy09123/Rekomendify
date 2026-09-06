import { useCallback, useState } from "react";
import { parseCoordinates } from "@/lib/geo";

export type LatLng = { lat: number; lng: number };

export function toLatLng(coords: string | null | undefined): LatLng | null {
  const c = parseCoordinates(coords);
  if (!c) return null;
  const [lat, lng] = c.split(",").map(Number);
  return { lat, lng };
}

/** Jarak haversine dalam meter. */
export function distanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

/** "350 m" / "1,2 km" — pembulatan yang nyaman dibaca. */
export function formatDistance(m: number): string {
  if (m < 1000) return `${Math.round(m / 10) * 10} m`;
  const km = m / 1000;
  return `${km < 10 ? km.toFixed(1).replace(".", ",") : Math.round(km)} km`;
}

type GeoState = "idle" | "loading" | "granted" | "denied" | "unsupported";

/** Geolokasi browser yang aman untuk SSR: hanya diakses saat handler dipanggil. */
export function useUserLocation() {
  const [position, setPosition] = useState<LatLng | null>(null);
  const [state, setState] = useState<GeoState>("idle");

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setState("unsupported");
      return;
    }
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setState("granted");
      },
      () => setState("denied"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, []);

  const clear = useCallback(() => {
    setPosition(null);
    setState("idle");
  }, []);

  return { position, state, request, clear };
}
