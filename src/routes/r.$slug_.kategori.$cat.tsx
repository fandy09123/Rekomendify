import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { getRegionBySlug } from "@/lib/public.functions";
import { PageShell, LocationCard } from "@/components/rekomendify";
import { NearbySwitch } from "@/components/nearby-switch";
import { seededShuffle, useSessionSeed } from "@/lib/ordering";
import { distanceMeters, formatDistance, toLatLng, useUserLocation } from "@/lib/distance";
import { ArrowLeft, LayoutGrid, Search, X } from "lucide-react";
import { SearchFilters } from "@/components/search-filters";
import { passesFilters, type HoursFilter, type PriceFilter } from "@/lib/location-search";
import { useIncrementalList } from "@/hooks/use-incremental-list";
import { InfiniteListFooter } from "@/components/infinite-list-footer";


export const Route = createFileRoute("/r/$slug_/kategori/$cat")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData({
      queryKey: ["region", params.slug],
      queryFn: () => getRegionBySlug({ data: { slug: params.slug } }),
    });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    const cat = loaderData?.categories?.find((c: any) => c.slug === params.cat || c.id === params.cat);
    const title = `${cat?.name ?? "Kategori"} di ${loaderData?.region?.name ?? "wilayah"} — Rekomendify`;
    const desc = `Daftar tempat kategori ${cat?.name ?? ""} di ${loaderData?.region?.name ?? "wilayah"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: KategoriPage,
  errorComponent: ({ error }) => <div className="p-8 text-center text-sm">{error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center">Kategori tidak ditemukan.</div>,
});

function KategoriPage() {
  const { slug, cat } = Route.useParams();
  const initialData = Route.useLoaderData();
  const { data } = useQuery({
    queryKey: ["region", slug],
    queryFn: () => getRegionBySlug({ data: { slug } }),
    initialData,
  });

  const category = useMemo(
    () => data?.categories?.find((c: any) => c.slug === cat || c.id === cat) ?? null,
    [data, cat],
  );

  const seed = useSessionSeed();
  const { position, state, request, clear } = useUserLocation();
  const [nearby, setNearby] = useState(false);
  const [query, setQuery] = useState("");
  const [price, setPrice] = useState<PriceFilter>("all");
  const [hours, setHours] = useState<HoursFilter>("all");

  const list = useMemo(() => {
    if (!data || !category) return [];
    const all = data.locations.filter((l: any) =>
      l.category_id === category.id &&
      passesFilters(l, { query, price, hours, categories: data.categories as any }),
    );
    // Featured tetap di atas dan tidak diacak; sisanya diacak stabil per sesi.
    const feat = all.filter((l: any) => l.is_featured);
    const plain = seededShuffle(all.filter((l: any) => !l.is_featured), seed, `cat:${cat}`);
    const ordered = [...feat, ...plain];

    if (!nearby || !position) return ordered.map((l: any) => ({ ...l, _dist: null as number | null }));

    return ordered
      .map((l: any) => {
        const p = toLatLng(l.coordinates);
        return { ...l, _dist: p ? distanceMeters(position, p) : null };
      })
      .sort((a: any, b: any) => (a._dist ?? Infinity) - (b._dist ?? Infinity));
  }, [data, category, query, price, hours, seed, cat, nearby, position]);

  const page = useIncrementalList(
    list,
    `cat:${slug}:${cat}:${query}:${price}:${hours}:${nearby ? "near" : "std"}`,
    10,
  );

  if (!data) return null;
  const { region, categories } = data;

  return (
    <PageShell>
      <div className="batik-bg pb-4">
        <div className="mx-auto max-w-md px-5 pt-6">
          <Link
            to="/r/$slug"
            params={{ slug: region.slug }}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> {region.name}
          </Link>

          <div className="mt-3 flex items-center gap-3">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-2xl">
              {category?.icon || <LayoutGrid className="size-6 text-primary" />}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-3xl leading-tight">{category?.name ?? "Kategori"}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{list.length} tempat di {region.name}</p>
            </div>
          </div>

          {/* Search bar — identik dengan Jelajah, tanpa autofocus agar keyboard tidak otomatis muncul */}
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Cari di ${category?.name ?? "kategori ini"}…`}
              aria-label={`Cari tempat di kategori ${category?.name ?? "ini"}`}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Hapus pencarian"
                className="shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5">
        {/* Pindah kategori tanpa kembali ke beranda */}
        {categories.length > 1 && (
          <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto pb-1">
            {categories.map((c: any) => (
              <Link
                key={c.id}
                to="/r/$slug/kategori/$cat"
                params={{ slug: region.slug, cat: c.slug ?? c.id }}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${
                  c.id === category?.id
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground"
                }`}
              >
                {c.icon ? `${c.icon} ` : ""}{c.name}
              </Link>
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

        <div className="mt-4 space-y-2.5">
          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              {query.trim()
                ? `Tidak ada tempat yang cocok dengan "${query.trim()}" di kategori ini.`
                : "Belum ada tempat pada kategori ini."}
            </div>
          ) : (
            list.map((l: any) => (
              <LocationCard
                key={l.id}
                regionSlug={region.slug}
                locSlug={l.slug}
                name={l.name}
                photo={l.photo_url}
                category={category?.name}
                hours={l.hours}
                price={l.price_range}
                featured={l.is_featured}
                distance={l._dist != null ? formatDistance(l._dist) : null}
              />
            ))
          )}
        </div>

      </div>
    </PageShell>
  );
}
