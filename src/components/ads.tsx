import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

// Banner promosi beranda kini menyatu dengan sambutan maskot: lihat components/home-hero.tsx.


/** Kartu promosi kontekstual di halaman detail lokasi. */
export function ContextualAdCard({ regionSlug, ad }: { regionSlug: string; ad: any }) {
  const loc = ad.locations;
  if (!loc) return null;
  return (
    <Link
      to="/r/$slug/$loc"
      params={{ slug: regionSlug, loc: loc.slug }}
      className="flex gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-3 transition active:scale-[0.99]"
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        {(ad.image_url || loc.photo_url) && (
          <img src={ad.image_url || loc.photo_url} alt={ad.title} className="size-full object-cover" loading="lazy" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Promosi</span>
        <p className="truncate text-sm font-semibold">{ad.title}</p>
        {ad.description && <p className="line-clamp-2 text-xs text-muted-foreground">{ad.description}</p>}
      </div>
    </Link>
  );
}

/** Badge kecil untuk lokasi yang sedang disorot berbayar. */
export function PromotedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-mustard/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
      <Sparkles className="size-3" /> Promosi
    </span>
  );
}
