import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Upload, X, Loader2, ImagePlus, ArrowLeft, ArrowRight, Sparkles, Camera } from "lucide-react";
import { stageImage, discardStaged, isStagedUrl, type StagedMeta } from "@/lib/upload-client";
import { formatBytes } from "@/lib/image-compress";
import { ImageCropper } from "@/components/image-cropper";

const ACCEPT = "image/png,image/jpeg,image/jpg,image/webp,image/gif";


function savingsLabel(meta: StagedMeta | null): string | null {
  if (!meta || meta.bytes >= meta.originalBytes) return null;
  const pct = Math.round((1 - meta.bytes / meta.originalBytes) * 100);
  if (pct < 3) return null;
  return `Dikompres ${formatBytes(meta.originalBytes)} → ${formatBytes(meta.bytes)} (−${pct}%)`;
}

export function ImageUploader({
  value,
  onChange,
  label = "Gambar",
  hint,
  lockAspect,
  defaultAspect,
}: {
  value: string | null | undefined;
  onChange: (url: string | null) => void;
  label?: string;
  hint?: string;
  /** Kunci rasio untuk mekanisme yang butuh ukuran seragam (mis. banner 16:9). */
  lockAspect?: number;
  defaultAspect?: number;
}) {
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [meta, setMeta] = useState<StagedMeta | null>(null);
  const [pending, setPending] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Input terpisah dengan `capture` agar Chrome Android langsung membuka kamera
  // belakang. Izin kamera baru diminta saat tombol ini benar-benar ditekan.
  const cameraRef = useRef<HTMLInputElement>(null);


  // Admin memilih rasio saat memotong; banner tertentu dikunci oleh pemanggil.
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || !files[0]) return;
    setPending(files[0]);
  }, []);


  const stage = useCallback(
    async (file: File) => {
      setBusy(true);
      try {
        const staged = await stageImage(file);
        if (isStagedUrl(value)) discardStaged(value);
        setMeta(staged.meta);
        onChange(staged.url);
      } catch (e: any) {
        toast.error(e.message ?? "Gambar gagal diproses");
      } finally {
        setBusy(false);
      }
    },
    [onChange, value],
  );

  const clear = () => {
    if (isStagedUrl(value)) discardStaged(value);
    setMeta(null);
    onChange(null);
  };

  const savings = savingsLabel(meta);

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        className={`mt-1 relative overflow-hidden rounded-2xl border-2 border-dashed p-2 transition ${
          drag ? "border-primary bg-primary/5" : "border-border bg-muted/30"
        }`}
      >
        {value ? (
          <div className="flex items-stretch gap-3">
            <img src={value} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" />
            <div className="flex min-w-0 flex-1 flex-col justify-between gap-2 p-1">
              <div className="min-w-0">
                {isStagedUrl(value) ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    <Sparkles className="size-3" /> Siap disimpan
                  </span>
                ) : (
                  <p className="line-clamp-2 break-all text-xs text-muted-foreground">{value}</p>
                )}
                {savings && <p className="mt-1 text-[11px] text-muted-foreground">{savings}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => cameraRef.current?.click()} disabled={busy}
                  aria-label="Ambil foto ulang dengan kamera"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold hover:bg-accent/10 disabled:opacity-60">
                  <Camera className="size-3.5" /> Ambil ulang
                </button>
                <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}
                  aria-label="Pilih gambar lain dari galeri"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold hover:bg-accent/10 disabled:opacity-60">
                  {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />} Galeri
                </button>
                <button type="button" onClick={clear} disabled={busy}
                  aria-label="Hapus gambar"
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-60">
                  <X className="size-3.5" /> Hapus
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-xl px-4 py-7 text-center">
            {busy ? <Loader2 className="size-6 animate-spin text-primary" /> : <ImagePlus className="size-6 text-muted-foreground" />}
            {/* Kompresi terjadi di browser, jadi foto besar dari HP tetap aman. */}
            <p className="text-sm font-medium">{busy ? "Mengompres…" : "Tambahkan gambar"}</p>
            <div className="flex w-full max-w-xs flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                disabled={busy}
                aria-label="Ambil foto dengan kamera"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                <Camera className="size-4" aria-hidden="true" /> Ambil Foto
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                aria-label="Pilih gambar dari galeri"
                className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold hover:bg-accent/10 disabled:opacity-60"
              >
                <Upload className="size-4" aria-hidden="true" /> Pilih dari Galeri
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              {hint ?? (lockAspect ? "JPG, PNG, WebP · rasio 16:9 · dikompres otomatis" : "JPG, PNG, WebP · pilih rasio saat memotong")}
            </p>
            <p className="text-[11px] text-muted-foreground">Bisa juga seret gambar ke area ini.</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); if (inputRef.current) inputRef.current.value = ""; }}
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); if (cameraRef.current) cameraRef.current.value = ""; }}
        />

      </div>
      {pending && (
        <ImageCropper
          file={pending}
          lockAspect={lockAspect}
          defaultAspect={defaultAspect}
          onCancel={() => setPending(null)}
          onCropped={(f) => { setPending(null); void stage(f); }}
        />
      )}

    </div>
  );
}

export function GalleryUploader({
  value,
  onChange,
  max = 5,
  label = "Galeri (maks 5 gambar)",
}: {
  value: string[] | null | undefined;
  onChange: (urls: string[]) => void;
  max?: number;
  label?: string;
}) {
  const list = value ?? [];
  const [busy, setBusy] = useState(false);
  const [queue, setQueue] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const canAdd = list.length < max;

  // Setiap gambar galeri melewati pemotong 4:3 satu per satu.
  const addFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const slots = max - list.length;
      const picked = Array.from(files).slice(0, slots);
      if (Array.from(files).length > slots) {
        toast.message(`Hanya ${slots} gambar yang ditambahkan.`, { description: `Maksimum ${max} gambar.` });
      }
      setQueue((q) => [...q, ...picked]);
    },
    [list.length, max],
  );

  const stageCropped = useCallback(
    async (file: File) => {
      setBusy(true);
      try {
        const staged = await stageImage(file);
        onChange([...list, staged.url]);
      } catch (e: any) {
        toast.error(e.message ?? "Gambar gagal diproses");
      } finally {
        setBusy(false);
      }
    },
    [list, onChange],
  );


  const remove = (i: number) => {
    discardStaged(list[i]);
    onChange(list.filter((_, idx) => idx !== i));
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div
        onDragOver={(e) => { if (canAdd) e.preventDefault(); }}
        onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
        className="mt-1 rounded-2xl border-2 border-dashed border-border bg-muted/20 p-3"
      >
        {list.length === 0 && (
          <p className="mb-2 text-center text-xs text-muted-foreground">Belum ada gambar galeri.</p>
        )}
        {list.length > 0 && (
          <ul className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {list.map((url, i) => (
              <li key={url + i} className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted">
                <img src={url} alt={`Gambar galeri ${i + 1}`} className="size-full object-cover" />

                {/* Tombol hapus selalu terlihat agar admin tidak bingung. */}
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Hapus gambar ${i + 1}`}
                  title="Hapus gambar"
                  className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-foreground/70 text-background shadow-soft backdrop-blur transition hover:bg-destructive hover:text-destructive-foreground active:scale-90"
                >
                  <X className="size-3.5" />
                </button>

                {isStagedUrl(url) && (
                  <span className="absolute left-1 top-1 grid size-5 place-items-center rounded-full bg-primary text-primary-foreground" title="Siap disimpan">
                    <Sparkles className="size-3" />
                  </span>
                )}

                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-1">
                  <span className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">{i + 1}</span>
                  <span className="flex gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0}
                      aria-label={`Geser gambar ${i + 1} ke kiri`}
                      className="grid size-6 place-items-center rounded-full bg-black/60 text-white disabled:opacity-30" title="Geser kiri">
                      <ArrowLeft className="size-3" />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1}
                      aria-label={`Geser gambar ${i + 1} ke kanan`}
                      className="grid size-6 place-items-center rounded-full bg-black/60 text-white disabled:opacity-30" title="Geser kanan">
                      <ArrowRight className="size-3" />
                    </button>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || !canAdd}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-semibold hover:bg-accent/10 disabled:opacity-50"
        >
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
          {busy ? "Mengompres…" : canAdd ? `Tambah gambar (${list.length}/${max})` : `Batas ${max} gambar tercapai`}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => { addFiles(e.target.files); if (inputRef.current) inputRef.current.value = ""; }}
        />
      </div>
      {queue[0] && (
        <ImageCropper
          file={queue[0]}
          onCancel={() => setQueue((q) => q.slice(1))}
          onCropped={(f) => { setQueue((q) => q.slice(1)); void stageCropped(f); }}
        />
      )}
    </div>
  );
}
