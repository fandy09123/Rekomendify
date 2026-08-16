import { useMemo, useRef, useState } from "react";
import { Play } from "lucide-react";

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) return u.pathname.slice(1) || null;
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/\/(embed|shorts)\/([^/?#]+)/);
      if (m) return m[2];
    }
  } catch {}
  return null;
}

export function MediaGallery({
  photo,
  gallery,
  youtube,
  alt,
}: {
  photo?: string | null;
  gallery?: string[] | null;
  youtube?: string | null;
  alt: string;
}) {
  const ytId = youtube ? youtubeId(youtube) : null;
  const slides = useMemo(() => {
    const imgs = [photo, ...(gallery ?? [])].filter((u): u is string => !!u);
    const uniq = Array.from(new Set(imgs));
    const items: Array<{ kind: "image" | "video"; src: string; poster?: string }> = uniq.map(
      (src) => ({ kind: "image", src }),
    );
    if (ytId)
      items.push({
        kind: "video",
        src: ytId,
        poster: `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`,
      });
    return items;
  }, [photo, gallery, ytId]);

  const [idx, setIdx] = useState(0);
  const [playingVideo, setPlayingVideo] = useState(false);
  const drag = useRef<{ x: number; y: number; locked: null | "x" | "y" } | null>(null);
  // Rasio alami tiap gambar: portrait ditampilkan utuh (contain + backdrop blur),
  // landscape/square tetap memenuhi frame (cover).
  const [portrait, setPortrait] = useState<Record<string, boolean>>({});

  if (slides.length === 0) return null;
  const current = slides[Math.min(idx, slides.length - 1)];
  const isPortrait = current.kind === "image" && portrait[current.src];

  const markRatio = (img: HTMLImageElement) => {
    const src = img.currentSrc || img.src;
    const isTall = img.naturalHeight > img.naturalWidth * 1.05;
    setPortrait((p) => (p[src] === isTall ? p : { ...p, [src]: isTall }));
  };

  const go = (n: number) => {
    setPlayingVideo(false);
    setIdx((prev) => (prev + n + slides.length) % slides.length);
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (slides.length < 2) return;
    drag.current = { x: event.clientX, y: event.clientY, locked: null };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const activeDrag = drag.current;
    if (!activeDrag) return;
    const dx = event.clientX - activeDrag.x;
    const dy = event.clientY - activeDrag.y;
    if (!activeDrag.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      activeDrag.locked = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    }
  };

  const endDrag = (event: React.PointerEvent) => {
    const activeDrag = drag.current;
    drag.current = null;
    if (activeDrag?.locked !== "x") return;
    const dx = event.clientX - activeDrag.x;
    if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
  };

  return (
    <div className="relative w-full">
      <div
        className={`relative w-full overflow-hidden bg-muted transition-[aspect-ratio] duration-300 ${
          isPortrait ? "aspect-[3/4] sm:aspect-[4/5]" : "aspect-[4/3] sm:aspect-[16/9]"
        }`}
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        {current.kind === "image" ? (
          <>
            {isPortrait && (
              <img
                src={current.src}
                alt=""
                aria-hidden
                className="absolute inset-0 size-full scale-110 object-cover blur-2xl opacity-60"
              />
            )}
            <img
              src={current.src}
              alt={alt}
              ref={(el) => {
                if (el?.complete && el.naturalWidth) markRatio(el);
              }}
              onLoad={(e) => markRatio(e.currentTarget)}
              className={`relative size-full ${isPortrait ? "object-contain" : "object-cover"}`}
            />
          </>
        ) : playingVideo ? (
          <iframe
            key={current.src}
            src={`https://www.youtube.com/embed/${current.src}?autoplay=1&rel=0`}
            title={alt}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlayingVideo(true)}
            className="group relative size-full"
          >
            {current.poster && (
              <img src={current.poster} alt={alt} className="size-full object-cover" />
            )}
            <span className="absolute inset-0 grid place-items-center bg-black/30">
              <span className="grid size-16 place-items-center rounded-full bg-white/95 text-primary shadow-lift transition group-hover:scale-105">
                <Play className="size-7 translate-x-0.5 fill-primary" />
              </span>
            </span>
          </button>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mx-auto max-w-md px-3 pb-8 pt-3">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {slides.map((s, i) => (
              <button
                key={s.src + i}
                type="button"
                onClick={() => {
                  setPlayingVideo(false);
                  setIdx(i);
                }}
                className={`relative size-14 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === idx ? "border-primary" : "border-transparent opacity-70"}`}
              >
                <img
                  src={s.kind === "image" ? s.src : (s.poster ?? "")}
                  alt=""
                  className="size-full object-cover"
                />
                {s.kind === "video" && (
                  <span className="absolute inset-0 grid place-items-center bg-black/30 text-white">
                    <Play className="size-4 fill-white" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
