import { useCallback, useEffect, useRef, useState } from "react";
import { Check, X, ZoomIn } from "lucide-react";

export type AspectOption = { key: string; label: string; value: number | null };

/** Pilihan rasio standar. value = null berarti mengikuti rasio asli gambar. */
export const ASPECT_OPTIONS: AspectOption[] = [
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "16:9", label: "16:9", value: 16 / 9 },
  { key: "1:1", label: "1:1", value: 1 },
  { key: "original", label: "Asli", value: null },
];

/**
 * Pemotong gambar dengan pilihan rasio.
 * Murni canvas + pointer events, tanpa dependensi tambahan.
 * `lockAspect` dipakai mekanisme yang wajib satu rasio (mis. banner promosi 16:9).
 */
export function ImageCropper({
  file,
  lockAspect,
  defaultAspect = 4 / 3,
  onCancel,
  onCropped,
}: {
  file: File;
  lockAspect?: number;
  defaultAspect?: number;
  onCancel: () => void;
  onCropped: (file: File) => void;
}) {
  const [src, setSrc] = useState<string | null>(null);
  const [nat, setNat] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [busy, setBusy] = useState(false);
  const [choice, setChoice] = useState<string>(
    lockAspect ? "locked" : ASPECT_OPTIONS.find((o) => o.value === defaultAspect)?.key ?? "4:3",
  );
  const frameRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const selected = ASPECT_OPTIONS.find((o) => o.key === choice) ?? null;
  const naturalAspect = nat ? nat.w / nat.h : 4 / 3;
  const aspect = lockAspect ?? (selected?.value ?? naturalAspect);

  // Ganti rasio → reset posisi & perbesaran agar hasil tetap terprediksi.
  useEffect(() => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
  }, [choice]);

  const frameW = frameRef.current?.clientWidth ?? 0;
  const frameH = frameW / aspect;
  const baseScale = nat && frameW ? Math.max(frameW / nat.w, frameH / nat.h) : 1;
  const scale = baseScale * zoom;
  const dispW = nat ? nat.w * scale : 0;
  const dispH = nat ? nat.h * scale : 0;

  const clamp = useCallback(
    (o: { x: number; y: number }) => ({
      x: Math.min(0, Math.max(frameW - dispW, o.x)),
      y: Math.min(0, Math.max(frameH - dispH, o.y)),
    }),
    [frameW, frameH, dispW, dispH],
  );

  useEffect(() => {
    setOffset((o) => clamp(o));
  }, [clamp]);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const d = drag.current;
    setOffset(clamp({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) }));
  };
  const onPointerUp = () => { drag.current = null; };

  const apply = async () => {
    if (!src || !nat || !frameW) return;
    setBusy(true);
    try {
      const img = new Image();
      img.src = src;
      await img.decode();
      const outW = Math.min(1600, Math.max(640, Math.round(nat.w)));
      const outH = Math.round(outW / aspect);
      const canvas = document.createElement("canvas");
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas tidak tersedia");
      const sx = -offset.x / scale;
      const sy = -offset.y / scale;
      const sw = frameW / scale;
      const sh = frameH / scale;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
      const blob: Blob | null = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.92));
      if (!blob) throw new Error("Gagal memotong gambar");
      const suffix = lockAspect ? "16x9" : choice.replace(":", "x");
      const name = file.name.replace(/\.[^.]+$/, "") + `-${suffix}.jpg`;
      onCropped(new File([blob], name, { type: "image/jpeg" }));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/60 p-4" onClick={onCancel}>
      <div onClick={(e) => e.stopPropagation()} className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-3xl bg-card p-5">
        <h3 className="font-display text-xl">Sesuaikan gambar</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {lockAspect
            ? "Rasio dikunci 16:9 agar banner tampil konsisten."
            : "Pilih rasio, lalu geser dan atur perbesaran agar bagian penting tetap terlihat."}
        </p>

        {!lockAspect && (
          <div className="mt-3 flex flex-wrap gap-2">
            {ASPECT_OPTIONS.map((o) => (
              <button
                key={o.key}
                type="button"
                onClick={() => setChoice(o.key)}
                aria-pressed={choice === o.key}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                  choice === o.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-foreground"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        )}

        <div
          ref={frameRef}
          className="relative mt-4 w-full touch-none select-none overflow-hidden rounded-2xl border border-border bg-muted"
          style={{ aspectRatio: String(aspect) }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {src && (
            <img
              src={src}
              alt="Pratinjau"
              draggable={false}
              onLoad={(e) => {
                const el = e.currentTarget;
                setNat({ w: el.naturalWidth, h: el.naturalHeight });
              }}
              className="absolute left-0 top-0 max-w-none origin-top-left"
              style={{ width: dispW || undefined, height: dispH || undefined, transform: `translate(${offset.x}px, ${offset.y}px)` }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <span key={i} className="border border-background/25" />
            ))}
          </div>
        </div>

        <label className="mt-4 flex items-center gap-3">
          <ZoomIn className="size-4 shrink-0 text-muted-foreground" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
            aria-label="Perbesaran gambar"
          />
        </label>

        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onCancel} className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-sm font-semibold">
            <X className="size-4" /> Batal
          </button>
          <button type="button" disabled={busy || !nat} onClick={apply} className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
            <Check className="size-4" /> {busy ? "Memproses…" : "Gunakan"}
          </button>
        </div>
      </div>
    </div>
  );
}
