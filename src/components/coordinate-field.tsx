import { useEffect, useRef, useState } from "react";
import { MapPin, Crosshair, ChevronDown, Loader2 } from "lucide-react";
import { parseCoordinates } from "@/lib/geo";

const DEFAULT_CENTER: [number, number] = [-7.797068, 110.370529]; // Yogyakarta

function toLatLng(value: string | null | undefined): [number, number] | null {
  const c = parseCoordinates(value);
  if (!c) return null;
  const [lat, lng] = c.split(",").map(Number);
  return [lat, lng];
}

/** Peta OpenStreetMap yang hanya dimuat di browser (aman untuk SSR). */
function LeafletPicker({
  value,
  onPick,
}: {
  value: string | null | undefined;
  onPick: (coords: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ default: L }] = await Promise.all([
        // @ts-ignore
        import("leaflet"),
        // @ts-ignore
        import("leaflet/dist/leaflet.css"),
      ]);
      if (cancelled || !containerRef.current || mapRef.current) return;

      const start = toLatLng(value) ?? DEFAULT_CENTER;
      const map = L.map(containerRef.current, { attributionControl: true }).setView(start, toLatLng(value) ? 16 : 11);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const icon = L.divIcon({
        className: "",
        html: `<span style="display:block;width:20px;height:20px;border-radius:9999px;background:var(--primary,#0f766e);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)"></span>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const place = (lat: number, lng: number) => {
        const c = `${lat.toFixed(6)},${lng.toFixed(6)}`;
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        else markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map).on("dragend", (e: any) => {
          const p = e.target.getLatLng();
          onPickRef.current(`${p.lat.toFixed(6)},${p.lng.toFixed(6)}`);
        });
        onPickRef.current(c);
      };

      if (toLatLng(value)) {
        const [lat, lng] = toLatLng(value)!;
        markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map).on("dragend", (e: any) => {
          const p = e.target.getLatLng();
          onPickRef.current(`${p.lat.toFixed(6)},${p.lng.toFixed(6)}`);
        });
      }

      map.on("click", (e: any) => place(e.latlng.lat, e.latlng.lng));
      mapRef.current = map;
      setReady(true);
      setTimeout(() => map.invalidateSize(), 50);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sinkronkan marker ketika koordinat diketik manual.
  useEffect(() => {
    const ll = toLatLng(value);
    if (!ll || !mapRef.current) return;
    if (markerRef.current) {
      const cur = markerRef.current.getLatLng();
      if (Math.abs(cur.lat - ll[0]) < 1e-6 && Math.abs(cur.lng - ll[1]) < 1e-6) return;
      markerRef.current.setLatLng(ll);
      mapRef.current.panTo(ll);
    }
  }, [value]);

  return (
    <div className="relative">
      <div ref={containerRef} className="h-64 w-full rounded-xl" style={{ zIndex: 0 }} />
      {!ready && (
        <div className="absolute inset-0 grid place-items-center rounded-xl bg-muted/60 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      )}
    </div>
  );
}

export function CoordinateField({
  label = "Koordinat (lat,lng)",
  value,
  onChange,
  hint,
}: {
  label?: string;
  value: string | null | undefined;
  onChange: (v: string) => void;
  hint?: string;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [locating, setLocating] = useState(false);
  useEffect(() => setMounted(true), []);

  const valid = !!parseCoordinates(value);
  const dirty = !!(value && String(value).trim());

  const locate = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        onChange(`${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`);
        setLocating(false);
        setOpen(true);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div>
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1 space-y-2">
        <div className="flex gap-2">
          <input
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="input flex-1"
            placeholder="-8.002344,111.817618"
            inputMode="text"
            aria-invalid={dirty && !valid}
          />
          <button
            type="button"
            onClick={locate}
            disabled={locating}
            aria-label="Gunakan lokasi saya"
            title="Gunakan lokasi saya"
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-card text-foreground hover:bg-accent/10 disabled:opacity-60"
          >
            {locating ? <Loader2 className="size-4 animate-spin" /> : <Crosshair className="size-4" />}
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent/10"
        >
          <MapPin className="size-3.5" /> {open ? "Tutup peta" : "Pilih di peta"}
          <ChevronDown className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>

        {mounted && open && (
          <div className="overflow-hidden rounded-xl border border-border">
            <LeafletPicker value={value} onPick={onChange} />
            <p className="border-t border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
              Ketuk peta untuk memindahkan penanda, atau geser penanda. Koordinat terisi otomatis.
            </p>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground">
          {dirty && !valid ? (
            <span className="text-destructive">Format belum benar. Contoh: -8.002344,111.817618</span>
          ) : (
            hint ?? "Boleh diisi manual atau lewat peta."
          )}
        </p>
      </div>
    </div>
  );
}
