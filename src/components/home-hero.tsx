import { Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import mascots from "@/assets/mascots.png";

/**
 * Satu ruang visual untuk sambutan maskot + promosi wilayah.
 * Rasio tetap 16:9 agar tidak ada layout shift antar slide.
 */
export function HomeHero({
  regionSlug,
  mascotName,
  welcomeMessage,
  ads,
}: {
  regionSlug: string;
  mascotName: string;
  welcomeMessage: string;
  ads: any[];
}) {
  const slides = useMemo(
    () => [{ kind: "welcome" as const, id: "welcome" }, ...ads.map((a: any) => ({ kind: "ad" as const, id: a.id, ad: a }))],
    [ads],
  );
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const drag = useRef<{ x: number; y: number; locked: null | "x" | "y" } | null>(null);
  const [dx, setDx] = useState(0);

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const t = setInterval(() => setIndex((v) => (v + 1) % count), 6000);
    return () => clearInterval(t);
  }, [count, paused]);

  useEffect(() => {
    if (index > count - 1) setIndex(0);
  }, [count, index]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (count < 2) return;
    drag.current = { x: e.clientX, y: e.clientY, locked: null };
    setPaused(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const mx = e.clientX - d.x;
    const my = e.clientY - d.y;
    if (!d.locked) {
      if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
      d.locked = Math.abs(mx) > Math.abs(my) ? "x" : "y";
    }
    if (d.locked === "x") setDx(mx);
  };
  const endDrag = () => {
    const d = drag.current;
    drag.current = null;
    setPaused(false);
    if (d?.locked === "x" && Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1));
    setDx(0);
  };

  return (
    <section aria-label="Sambutan dan promosi wilayah" className="mt-5">
      <div
        className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft"
        style={{ touchAction: "pan-y" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="aspect-[16/9] w-full">
          <div
            className="flex h-full w-full transition-transform duration-300 ease-out"
            style={{ transform: `translate3d(calc(${-index * 100}% + ${dx}px), 0, 0)` }}
          >
            {slides.map((s) =>
              s.kind === "welcome" ? (
                <WelcomeSlide key={s.id} name={mascotName} message={welcomeMessage} />
              ) : (
                <AdSlide key={s.id} regionSlug={regionSlug} ad={(s as any).ad} draggingRef={drag} />
              ),
            )}
          </div>
        </div>
      </div>

      {count > 1 && (
        <div className="mt-2 flex justify-center gap-1.5">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-label={`Tampilkan slide ${i + 1}`}
              aria-current={i === index}
              onClick={() => go(i)}
              className={`h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-primary" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function WelcomeSlide({ name, message }: { name: string; message: string }) {
  return (
    <div className="flex h-full w-full shrink-0 items-center gap-3 bg-card px-4 sm:gap-4 sm:px-5">
      <motion.img
        src={mascots}
        alt="Cak Mulyo & Jeng Sari"
        width={96}
        height={96}
        decoding="async"
        draggable={false}
        className="size-20 shrink-0 select-none sm:size-24"
        animate={{ rotate: [0, -3, 3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-primary">{name}</p>
        <p className="mt-1 line-clamp-3 text-sm leading-relaxed text-foreground">{message}</p>
      </div>
    </div>
  );
}

function AdSlide({ regionSlug, ad, draggingRef }: { regionSlug: string; ad: any; draggingRef: React.MutableRefObject<any> }) {
  const target = ad.locations ?? null;

  const body = (
    <>
      {ad.image_url ? (
        <img src={ad.image_url} alt={ad.title} loading="lazy" draggable={false} className="absolute inset-0 size-full select-none object-cover" />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-3 sm:p-4">
        <h3 className="line-clamp-1 font-display text-base text-white sm:text-lg">{ad.title}</h3>
        {ad.description && <p className="line-clamp-2 text-[11px] leading-snug text-white/85 sm:text-xs">{ad.description}</p>}
      </div>
    </>
  );

  const className = "relative block h-full w-full shrink-0 overflow-hidden bg-muted";

  if (!target) return <div className={className}>{body}</div>;

  return (
    <Link
      to="/r/$slug/$loc"
      params={{ slug: regionSlug, loc: target.slug }}
      aria-label={`${ad.title} — buka ${target.name}`}
      // Tap yang berubah menjadi geser tidak boleh membuka halaman.
      onClick={(e) => {
        if (draggingRef.current?.locked === "x") e.preventDefault();
      }}
      className={className}
    >
      {body}
    </Link>
  );
}
