import { createFileRoute, notFound, Link, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { getRegionBySlug, recordVisit, listRegionAds } from "@/lib/public.functions";
import { PromotedBadge } from "@/components/ads";
import { HomeHero } from "@/components/home-hero";
import { PageShell, LocationCard } from "@/components/rekomendify";
import { ArrowLeft, Bookmark, LayoutGrid, MoreHorizontal } from "lucide-react";
import { setLastRegion, clearLastRegion } from "@/lib/last-region";
import { seededShuffle, useSessionSeed } from "@/lib/ordering";
import { ShareButton } from "@/components/share-button";
import { PushFollowButton } from "@/components/push-follow-button";
import { useIncrementalList } from "@/hooks/use-incremental-list";
import { InfiniteListFooter } from "@/components/infinite-list-footer";
import { javaneseDayInfo } from "@/lib/javanese-calendar";
import { CalendarDays } from "lucide-react";

const searchSchema = z.object({
  src: z.enum(["qr", "gps", "direct"]).optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/r/$slug")({
  validateSearch: searchSchema,
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData({
      queryKey: ["region", params.slug],
      queryFn: () => getRegionBySlug({ data: { slug: params.slug } }),
    });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const r = loaderData?.region;
    if (!r) return {};
    return {
      meta: [
        { title: `${r.name} — Rekomendify` },
        { name: "description", content: r.tagline || r.description || `Jelajahi ${r.name}` },
        { property: "og:title", content: r.name },
        { property: "og:description", content: r.tagline || r.description || "" },
        ...(r.cover_image_url
          ? [
              { property: "og:image", content: r.cover_image_url },
              { name: "twitter:image", content: r.cover_image_url },
            ]
          : []),
      ],
    };
  },
  component: RegionPage,
  errorComponent: ({ error }) => <div className="p-8 text-center text-sm">{error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center">Wilayah tidak ditemukan.</div>,
});

function RegionPage() {
  const { slug } = Route.useParams();
  const { src } = Route.useSearch();
  const initialData = Route.useLoaderData();
  const location = useLocation();
  const { data } = useQuery({
    queryKey: ["region", slug],
    queryFn: () => getRegionBySlug({ data: { slug } }),
    initialData,
  });

  const { data: ads } = useQuery({
    queryKey: ["region-ads", slug],
    queryFn: () => listRegionAds({ data: { regionSlug: slug } }),
  });

  // Urutan tempat biasa bervariasi per sesi, tetapi stabil selama halaman dibuka.
  const seed = useSessionSeed();
  const shuffledRest = useMemo(() => {
    const promoted = new Set<string>(
      (ads?.featured ?? []).map((a: any) => a.location_id).filter(Boolean),
    );
    const plain = (data?.locations ?? []).filter((l: any) => !l.is_featured && !promoted.has(l.id));
    return seededShuffle(plain, seed, `home:${slug}`);
  }, [data?.locations, ads?.featured, seed, slug]);

  // Render bertahap: hanya sebagian daftar yang masuk DOM saat initial load.
  const restPage = useIncrementalList(shuffledRest, `home:${slug}`, 10);

  // Hari pasaran dihitung di client agar mengikuti tanggal lokal pengguna.
  const [javaDay, setJavaDay] = useState<ReturnType<typeof javaneseDayInfo> | null>(null);
  useEffect(() => setJavaDay(javaneseDayInfo()), []);


  useEffect(() => {
    if (!data?.region) return;
    recordVisit({ data: { regionId: data.region.id, source: src ?? "direct" } }).catch(() => {});
    setLastRegion(data.region.slug);
  }, [data?.region?.id, data?.region?.slug, src]);

  if (!data) return null;
  const { region, categories, locations } = data;
  // Lokasi yang disorot berbayar diangkat ke depan daftar rekomendasi utama.
  const promotedIds = new Set<string>(
    (ads?.featured ?? []).map((a: any) => a.location_id).filter(Boolean),
  );
  // Featured tidak pernah diacak — urutannya mengikuti mekanisme bisnis.
  const featured = [
    ...locations.filter((l: any) => promotedIds.has(l.id)),
    ...locations.filter((l: any) => l.is_featured && !promotedIds.has(l.id)),
  ];
  const rest = shuffledRest;

  // Beranda hanya menampilkan sebagian ikon kategori agar tetap ringkas.
  const MAX_SHORTCUTS = 9;
  const hasOverflow = categories.length > MAX_SHORTCUTS + 1;
  const shortcuts = hasOverflow ? categories.slice(0, MAX_SHORTCUTS) : categories;

  return (
    <>
      <PageShell>
        <div className="batik-bg pb-6">
          <div className="mx-auto max-w-md px-5 pt-6">
            <div className="flex items-center justify-between gap-1.5 sm:gap-2">
              <Link
                to="/"
                onClick={() => clearLastRegion()}
                title="Keluar dari Wilayah"
                aria-label="Keluar dari Wilayah"
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-accent/10"
              >
                <ArrowLeft className="size-3.5 shrink-0" />
                <span className="text-xs">Keluar</span>
              </Link>
              <div className="flex items-center gap-1.5 shrink-0 sm:gap-2">
                <PushFollowButton regionSlug={region.slug} regionName={region.name} />
                <ShareButton
                  title={`${region.name} — Rekomendify`}
                  text={`Jelajahi ${region.name} lewat Rekomendify`}
                />
                <Link
                  to="/saved"
                  search={{ region: region.slug, regionName: region.name }}
                  title="Lokasi Tersimpan"
                  aria-label="Lokasi Tersimpan"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card p-1.5 text-xs font-semibold text-foreground transition hover:bg-accent/10 min-[380px]:px-2.5 min-[380px]:py-1.5"
                >
                  <Bookmark className="size-3.5" />
                  <span className="hidden min-[380px]:inline">Tersimpan</span>
                </Link>
              </div>
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-primary">
              Wilayah Wisata
            </p>
            <h1 className="mt-1 line-clamp-2 font-display text-3xl leading-tight">{region.name}</h1>
            {/* Tinggi dibatasi agar tagline panjang tidak mendorong konten di bawahnya. */}
            {region.tagline && (
              <p className="mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground">
                {region.tagline}
              </p>
            )}

            {javaDay && (
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground">
                <CalendarDays className="size-3.5 shrink-0 text-primary" aria-hidden />
                <span>
                  Hari ini • <span className="font-semibold text-foreground">{javaDay.short}</span>
                  <span className="hidden min-[380px]:inline">, {javaDay.dateLabel}</span>
                </span>
              </p>
            )}



            {/* Maskot & promosi berbagi satu ruang visual dengan rasio tetap. */}
            <HomeHero
              regionSlug={region.slug}
              mascotName={region.mascot_name || "Cak Mulyo & Jeng Sari"}
              welcomeMessage={
                region.welcome_message ||
                `Sugeng rawuh di ${region.name}! Yuk, saya temani jelajah wilayah ini.`
              }
              ads={ads?.banners ?? []}
            />
          </div>
        </div>

        <div className="mx-auto max-w-md px-5">
          {categories.length > 0 && (
            <>
              <div className="mt-6 flex items-baseline justify-between">
                <h2 className="font-display text-lg">Kategori</h2>
                <Link
                  to="/r/$slug/kategori"
                  params={{ slug: region.slug }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Lihat semua
                </Link>
              </div>
              <ul className="mt-3 grid grid-cols-5 gap-x-2 gap-y-3">
                {shortcuts.map((c: any) => (
                  <li key={c.id}>
                    <Link
                      to="/r/$slug/kategori/$cat"
                      params={{ slug: region.slug, cat: c.slug }}
                      preload="intent"
                      title={c.name}
                      className="group flex flex-col items-center gap-1.5"
                    >
                      <span className="grid size-12 place-items-center rounded-2xl border border-border bg-card text-xl transition group-hover:shadow-soft group-active:scale-95">
                        {c.icon ? (
                          <span aria-hidden>{c.icon}</span>
                        ) : (
                          <LayoutGrid className="size-5 text-primary" />
                        )}
                      </span>
                      <span className="line-clamp-2 w-full text-center text-[10px] font-medium leading-tight text-muted-foreground">
                        {c.name}
                      </span>
                    </Link>
                  </li>
                ))}
                {hasOverflow && (
                  <li>
                    <Link
                      to="/r/$slug/kategori"
                      params={{ slug: region.slug }}
                      preload="intent"
                      title="Kategori lainnya"
                      className="group flex flex-col items-center gap-1.5"
                    >
                      <span className="grid size-12 place-items-center rounded-2xl border border-dashed border-border bg-card text-muted-foreground transition group-hover:shadow-soft group-active:scale-95">
                        <MoreHorizontal className="size-5" />
                      </span>
                      <span className="w-full text-center text-[10px] font-medium leading-tight text-muted-foreground">
                        Lainnya
                      </span>
                    </Link>
                  </li>
                )}
              </ul>
            </>
          )}

          {featured.length > 0 && (
            <>
              <div className="mt-7 flex items-baseline justify-between">
                <h2 className="font-display text-lg">Rekomendasi utama</h2>
                <span className="text-xs text-muted-foreground">
                  {featured.length} tempat · geser →
                </span>
              </div>
              <div className="mt-3 -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2">
                {featured.map((l: any) => (
                  <Link
                    key={l.id}
                    to="/r/$slug/$loc"
                    params={{ slug: region.slug, loc: l.slug }}
                    search={{ from: location.href }}
                    className="group w-44 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card sm:w-56"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      {l.photo_url && (
                        <img
                          src={l.photo_url}
                          alt={l.name}
                          loading="lazy"
                          className="size-full object-cover transition group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-3">
                      {promotedIds.has(l.id) && <PromotedBadge />}
                      <h3 className="truncate font-display text-base">{l.name}</h3>
                      {l.price_range && (
                        <p className="truncate text-xs text-muted-foreground">{l.price_range}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          <h2 id="daftar-lokasi" className="mt-7 font-display text-lg scroll-mt-6">
            Tempat di wilayah ini
          </h2>
          <div className="mt-3 space-y-2.5">
            {rest.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Belum ada tempat yang cocok.
              </div>
            ) : (
              restPage.visible.map((l: any) => (
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
                />
              ))
            )}
          </div>
          <InfiniteListFooter
            hasMore={restPage.hasMore}
            total={restPage.total}
            sentinelRef={restPage.sentinelRef}
            onLoadMore={restPage.loadMore}
            emptyDoneLabel="Semua tempat sudah ditampilkan."
          />

        </div>
      </PageShell>
    </>
  );
}
