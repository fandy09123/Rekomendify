import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getRegionBySlug } from "@/lib/public.functions";
import { PageShell, LocationCard } from "@/components/rekomendify";
import { NearbySwitch } from "@/components/nearby-switch";
import { seededShuffle, useSessionSeed } from "@/lib/ordering";
import { distanceMeters, formatDistance, toLatLng, useUserLocation } from "@/lib/distance";
import { Search, ArrowLeft, X } from "lucide-react";
import { SearchFilters } from "@/components/search-filters";
import { passesFilters, type HoursFilter, type PriceFilter } from "@/lib/location-search";
import { useIncrementalList } from "@/hooks/use-incremental-list";
import { InfiniteListFooter } from "@/components/infinite-list-footer";


export const Route = createFileRoute("/r/$slug_/jelajah")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData({
      queryKey: ["region", params.slug],
      queryFn: () => getRegionBySlug({ data: { slug: params.slug } }),
    });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Jelajah ${loaderData?.region?.name ?? ""} — Rekomendify` },
      { name: "description", content: `Cari tempat, kuliner, dan wisata di ${loaderData?.region?.name ?? "wilayah"}.` },
    ],
  }),
  component: JelajahWilayah,
  errorComponent: ({ error }) => <div className="p-8 text-center text-sm">{error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center">Wilayah tidak ditemukan.</div>,
});

function JelajahWilayah() {
  const { slug } = Route.useParams();
  const initialData = Route.useLoaderData();
  const { data } = useQuery({
    queryKey: ["region", slug],
    queryFn: () => getRegionBySlug({ data: { slug } }),
    initialData,
  });

  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [nearby, setNearby] = useState(false);
  const [price, setPrice] = useState<PriceFilter>("all");
  const [hours, setHours] = useState<HoursFilter>("all");
  const seed = useSessionSeed();
  const { position, state, request, clear } = useUserLocation();

  const filtered = useMemo(() => {
    if (!data) return [];
    const base = data.locations.filter((l: any) =>
      (!activeCat || l.category_id === activeCat) &&
      passesFilters(l, { query, price, hours, categories: data.categories as any }),
    );
    // Featured tetap di atas; sisanya diacak stabil per sesi.
    const ordered = [
      ...base.filter((l: any) => l.is_featured),
      ...seededShuffle(base.filter((l: any) => !l.is_featured), seed, `jelajah:${activeCat ?? "all"}`),
    ];
    if (!nearby || !position) return ordered.map((l: any) => ({ ...l, _dist: null as number | null }));
    return ordered
      .map((l: any) => {
        const p = toLatLng(l.coordinates);
        return { ...l, _dist: p ? distanceMeters(position, p) : null };
      })
      .sort((a: any, b: any) => (a._dist ?? Infinity) - (b._dist ?? Infinity));
  }, [data, activeCat, query, price, hours, seed, nearby, position]);

  const page = useIncrementalList(
    filtered,
    `jelajah:${slug}:${activeCat ?? "all"}:${query}:${price}:${hours}:${nearby ? "near" : "std"}`,
    10,
  );

  if (!data) return null;
  const { region, categories } = data;



  return (
    <PageShell>
      <div className="batik-bg pb-4">
        <div className="mx-auto max-w-md px-5 pt-6">
          <Link to="/r/$slug" params={{ slug: region.slug }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> {region.name}
          </Link>
          <h1 className="mt-2 font-display text-3xl leading-tight">Jelajah Wilayah</h1>
          <p className="mt-1 text-sm text-muted-foreground">Cari & saring tempat di {region.name}.</p>

          <div className="mt-5 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
            <Search className="size-4 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari tempat, kopi, nasi pecel…"
              aria-label="Cari tempat"
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Hapus pencarian"
                className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground">
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5">
        {categories.length > 0 && (
          <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setActiveCat(null)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${activeCat === null ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}>Semua</button>
            {categories.map((c: any) => (
              <button key={c.id} onClick={() => setActiveCat(c.id)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${activeCat === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}>
                {c.icon ? `${c.icon} ` : ""}{c.name}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4">
          <SearchFilters price={price} hours={hours} onPrice={setPrice} onHours={setHours} />
        </div>

        <div className="mt-4">
          <NearbySwitch
            active={nearby}
            state={state}
            onNearby={() => { setNearby(true); if (!position) request(); }}
            onDefault={() => { setNearby(false); clear(); }}
          />
        </div>

        <p className="mt-5 text-xs uppercase tracking-wider text-muted-foreground">{filtered.length} tempat</p>
        <div className="mt-2 space-y-2.5">
          {filtered.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Tidak ada tempat yang cocok.
            </div>
          )}
          {page.visible.map((l: any) => (
            <LocationCard
              key={l.id}
              regionSlug={region.slug}
              locSlug={l.slug}
              name={l.name}
              photo={l.photo_url}
              category={categories.find((c: any) => c.id === l.category_id)?.name}
              hours={l.hours}
              price={l.price_range}
              featured={l.is_featured}
              distance={l._dist != null ? formatDistance(l._dist) : null}
            />
          ))}

        </div>
        <InfiniteListFooter
          hasMore={page.hasMore}
          total={page.total}
          sentinelRef={page.sentinelRef}
          onLoadMore={page.loadMore}
          emptyDoneLabel="Semua tempat sudah ditampilkan."
        />

      </div>
    </PageShell>
  );
}
