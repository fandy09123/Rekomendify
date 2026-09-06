import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { PageShell } from "@/components/rekomendify";
import { listSaved, removeSaved, type SavedLocation } from "@/lib/saved-locations";
import { Bookmark, MapPin, Trash2, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/saved")({
  validateSearch: z.object({ region: z.string().optional(), regionName: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Location Tersimpan — Rekomendify" },
      { name: "description", content: "Daftar lokasi yang Anda simpan di perangkat ini." },
    ],
  }),
  component: SavedPage,
});

function SavedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { region, regionName } = Route.useSearch();
  const [items, setItems] = useState<SavedLocation[]>([]);

  useEffect(() => {
    const refresh = () => setItems(listSaved());
    refresh();
    window.addEventListener("rekomendify:saved-changed", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("rekomendify:saved-changed", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const handleBack = () => {
    if (region) {
      navigate({ to: "/r/$slug", params: { slug: region }, replace: true });
      return;
    }
    navigate({ to: "/" });
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-5 pt-6">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> {regionName ?? "Kembali"}
        </button>
        <div className="mt-3 flex items-center gap-2">
          <Bookmark className="size-5 text-primary" />
          <h1 className="font-display text-3xl">Location Tersimpan</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Disimpan di perangkat ini. Tidak dikirim ke server.
        </p>

        <div className="mt-6 space-y-2.5">
          {items.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Belum ada lokasi yang disimpan. Buka detail lokasi lalu tekan tombol Simpan.
            </div>
          )}
          {items.map((l) => (
            <div
              key={l.id}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3"
            >
              <Link
                to="/r/$slug/$loc"
                params={{ slug: l.regionSlug, loc: l.slug }}
                search={{ from: location.href, fromLabel: "Tersimpan" }}
                className="group flex min-w-0 flex-1 items-center gap-3"
              >
                <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {l.photo_url ? (
                    <img
                      src={l.photo_url}
                      alt={l.name}
                      loading="lazy"
                      decoding="async"
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <MapPin className="size-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {l.category && (
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-accent">
                      {l.category}
                    </p>
                  )}
                  <h3 className="truncate font-display text-base">{l.name}</h3>
                  {l.regionName && (
                    <p className="truncate text-xs text-muted-foreground">{l.regionName}</p>
                  )}
                </div>
              </Link>
              <button
                onClick={() => removeSaved(l.id)}
                aria-label="Hapus"
                className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
