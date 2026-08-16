import { createFileRoute, notFound, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Tag,
  Share2,
  MessageCircle,
  Bookmark,
  BookmarkCheck,
  Navigation,
  Bike,
  Store,
  ShieldQuestion,
} from "lucide-react";
import {
  getLocationBySlug,
  recordVisit,
  recordEngagement,
  getRegionContact,
  listContextualAds,
} from "@/lib/public.functions";
import { ContextualAdCard } from "@/components/ads";
import { mapsDirUrl, waChatUrl } from "@/lib/geo";
import { motion, AnimatePresence } from "framer-motion";
import { isSaved, saveLocation, removeSaved } from "@/lib/saved-locations";
import { toast } from "sonner";
import { MediaGallery } from "@/components/media-gallery";
import { LocationCard, MascotWelcome } from "@/components/rekomendify";
import { ExpandableText } from "@/components/expandable-text";
import { buildLocationShareText, shareOrCopy } from "@/lib/share";

export const Route = createFileRoute("/r/$slug_/$loc")({
  validateSearch: z.object({ from: z.string().optional(), fromLabel: z.string().optional() }),
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData({
      queryKey: ["location", params.slug, params.loc],
      queryFn: () =>
        getLocationBySlug({ data: { regionSlug: params.slug, locationSlug: params.loc } }),
    });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const l = loaderData?.location;
    if (!l) return {};
    return {
      meta: [
        { title: `${l.name} — Rekomendify` },
        { name: "description", content: l.description?.slice(0, 155) || `Kunjungi ${l.name}` },
        { property: "og:title", content: l.name },
        { property: "og:description", content: l.description?.slice(0, 155) || "" },
        ...(l.photo_url
          ? [
              { property: "og:image", content: l.photo_url },
              { name: "twitter:image", content: l.photo_url },
            ]
          : []),
      ],
    };
  },
  component: LocationPage,
  errorComponent: ({ error }) => <div className="p-8 text-center text-sm">{error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center">Tempat tidak ditemukan.</div>,
});

type ConfirmKind = null | "chat" | "save" | "gmaps";

function getSafeInternalHref(value?: string) {
  if (!value) return null;
  try {
    const base =
      typeof window === "undefined" ? "https://rekomendify.local" : window.location.origin;
    const url = new URL(value, base);
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch {
    return null;
  }
}

function LocationPage() {
  const router = useRouter();
  const { slug, loc } = Route.useParams();
  const { from, fromLabel } = Route.useSearch();
  const initialData = Route.useLoaderData();
  const { data } = useQuery({
    queryKey: ["location", slug, loc],
    queryFn: () => getLocationBySlug({ data: { regionSlug: slug, locationSlug: loc } }),
    initialData,
  });
  const [confirm, setConfirm] = useState<ConfirmKind>(null);
  const [saved, setSaved] = useState(false);
  const { data: regionContact } = useQuery({
    queryKey: ["region-contact", slug],
    queryFn: () => getRegionContact({ data: { slug } }),
  });

  const { data: contextualAds } = useQuery({
    queryKey: ["contextual-ads", data?.location?.id],
    queryFn: () => listContextualAds({ data: { hostLocationId: data!.location.id } }),
    enabled: !!data?.location?.id,
  });

  useEffect(() => {
    if (!data?.location) return;
    setSaved(isSaved(data.location.id));
    recordVisit({
      data: { regionId: data.region.id, locationId: data.location.id, source: "direct" },
    }).catch(() => {});
  }, [data?.location?.id]);

  if (!data) return null;
  const { region, location, otherLocations = [], categories = [], couriers = [] } = data as any;
  const cat = (location as any).categories;
  const coords = (location as any).coordinates as string | null;
  const mapsUrl = mapsDirUrl(coords);
  const ownerWaUrl = waChatUrl(
    location.whatsapp,
    `Halo, saya menemukan ${location.name} melalui Rekomendify.`,
  );
  const activeCouriers = (couriers as any[]).filter((c) => c?.whatsapp);
  const canContact = Boolean(ownerWaUrl) || activeCouriers.length > 0;
  const regionAdminWaUrl = waChatUrl(
    regionContact?.admin_whatsapp,
    `Halo Admin ${region.name}, saya ingin bertanya/melaporkan tentang ${location.name} di Rekomendify.`,
  );
  const parentHref = getSafeInternalHref(from);
  const handleBack = () => {
    if (parentHref) {
      router.navigate({ href: parentHref, replace: true });
      return;
    }
    router.navigate({ to: "/r/$slug", params: { slug: region.slug } });
  };

  // Smart ordering of recommended locations: same category first, then featured, then rest
  const sortedRecommendations = [...otherLocations].sort((a: any, b: any) => {
    const aSameCat = location.category_id && a.category_id === location.category_id ? 1 : 0;
    const bSameCat = location.category_id && b.category_id === location.category_id ? 1 : 0;
    if (aSameCat !== bSameCat) return bSameCat - aSameCat;
    const aFeat = a.is_featured ? 1 : 0;
    const bFeat = b.is_featured ? 1 : 0;
    return bFeat - aFeat;
  });

  const track = (kind: "whatsapp" | "gmaps" | "save" | "share") => {
    recordEngagement({ data: { regionId: region.id, locationId: location.id, kind } }).catch(
      () => {},
    );
  };

  const handleConfirmYes = () => {
    if (confirm === "save") {
      if (saved) {
        removeSaved(location.id);
        setSaved(false);
        toast.success("Dihapus dari tersimpan.");
      } else {
        saveLocation({
          id: location.id,
          slug: location.slug,
          name: location.name,
          regionSlug: region.slug,
          regionName: region.name,
          photo_url: location.photo_url,
          category: cat?.name ?? null,
          hours: location.hours,
          savedAt: Date.now(),
        });
        setSaved(true);
        track("save");
        toast.success("Disimpan di perangkat ini.");
      }
    } else if (confirm === "gmaps") {
      if (mapsUrl) {
        track("gmaps");
        window.open(mapsUrl, "_blank", "noopener,noreferrer");
      } else toast.error("Koordinat lokasi belum tersedia.");
    }
    setConfirm(null);
  };

  const confirmCopy: Record<"save" | "gmaps", { title: string; body: string }> = {
    save: saved
      ? {
          title: "Hapus dari tersimpan?",
          body: "Lokasi ini akan dihapus dari daftar tersimpan pada perangkat ini.",
        }
      : {
          title: "Simpan lokasi?",
          body: "Lokasi ini akan disimpan pada cache browser perangkat Anda.",
        },
    gmaps: {
      title: "Buka Google Maps?",
      body: `Anda akan diarahkan ke Google Maps untuk menuju ${location.name}.`,
    },
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="relative">
        {(location as any).gallery_urls?.length ||
        (location as any).youtube_url ||
        location.photo_url ? (
          <MediaGallery
            photo={location.photo_url}
            gallery={(location as any).gallery_urls}
            youtube={(location as any).youtube_url}
            alt={location.name}
          />
        ) : (
          <div className="grid aspect-[4/3] w-full place-items-center bg-muted text-muted-foreground sm:aspect-[16/9]">
            <MapPin className="size-12" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-4">
          <button
            onClick={handleBack}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-card active:scale-95"
            aria-label="Kembali"
          >
            <ArrowLeft className="size-3.5" /> {fromLabel ?? region.name}
          </button>
          <button
            onClick={async () => {
              // Deskripsi panjang dipangkas agar share payload tetap ringkas.
              const text = buildLocationShareText({
                name: location.name,
                regionName: region.name,
                description: location.description,
                category: cat?.name,
              });
              track("share");
              const result = await shareOrCopy({
                title: `${location.name} — Rekomendify`,
                text,
                url: window.location.href,
              });
              if (result === "copied") toast.success("Tautan & ringkasan disalin.");
              if (result === "failed") toast.error("Gagal membagikan tautan.");
            }}
            aria-label="Bagikan"
            className="pointer-events-auto grid size-9 place-items-center rounded-full bg-card/90 backdrop-blur transition hover:bg-card active:scale-95"
          >
            <Share2 className="size-4" />
          </button>
        </div>
      </div>

      <div className="mx-auto -mt-6 max-w-md rounded-t-3xl bg-background px-5 pt-6">
        {cat && (
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">{cat.name}</p>
        )}
        <h1 className="mt-1 font-display text-3xl leading-tight">{location.name}</h1>

        {location.description && <ExpandableText className="mt-3" text={location.description} />}

        {(location.hours || location.price_range || location.whatsapp || mapsUrl) && (
          <dl className="mt-6 space-y-3 rounded-2xl border border-border bg-card p-4 text-sm">
            {location.hours && (
              <Row
                icon={<Clock className="size-4" />}
                label="Jam operasional"
                value={location.hours}
              />
            )}
            {location.price_range && (
              <Row
                icon={<Tag className="size-4" />}
                label="Kisaran harga"
                value={location.price_range}
              />
            )}
            {location.whatsapp && (
              <Row icon={<Phone className="size-4" />} label="WhatsApp" value={location.whatsapp} />
            )}
            {mapsUrl && (
              <Row
                icon={<MapPin className="size-4" />}
                label="Lokasi"
                value={<span className="text-muted-foreground">Tersedia di Google Maps</span>}
              />
            )}
          </dl>
        )}

        {/* Bantuan kontekstual: hubungi admin wilayah langsung dari halaman tempat ini. */}
        {regionAdminWaUrl && (
          <div className="mt-6 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
                <ShieldQuestion className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">Ada yang tidak sesuai?</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Laporkan data keliru atau tanya langsung ke admin {region.name}.
                </p>
                <a
                  href={regionAdminWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-accent/10"
                >
                  <MessageCircle className="size-3.5 text-primary" /> Hubungi Admin Wilayah
                </a>
              </div>
            </div>
          </div>
        )}

        {(contextualAds?.length ?? 0) > 0 && (
          <div className="mt-6 space-y-2">
            <h2 className="font-display text-lg leading-tight">Promosi di sekitar</h2>
            {contextualAds!.map((ad: any) => (
              <ContextualAdCard key={ad.id} regionSlug={region.slug} ad={ad} />
            ))}
          </div>
        )}

        {/* Section Rekomendasi Lokasi Lainnya */}
        {sortedRecommendations.length > 0 && (
          <div className="mt-8 border-t border-border pt-6 pb-2">
            <div className="mb-4">
              <MascotWelcome
                name="Cak Mulyo & Jeng Sari"
                message={`Masih keliling ${region.name}? Yuk lanjut lihat tempat menarik lainnya di sekitar sini!`}
              />
            </div>

            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl leading-tight text-foreground">
                Rekomendasi Tempat Lain
              </h2>
              <span className="text-xs font-medium text-muted-foreground">
                {sortedRecommendations.length} pilihan
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Langsung klik untuk menjelajah tanpa perlu kembali ke menu beranda.
            </p>

            <div className="mt-4 space-y-3">
              {sortedRecommendations.map((l: any) => {
                const itemCategoryName =
                  l.categories?.name ??
                  categories.find((c: any) => c.id === l.category_id)?.name ??
                  null;

                return (
                  <LocationCard
                    key={l.id}
                    regionSlug={region.slug}
                    locSlug={l.slug}
                    name={l.name}
                    photo={l.photo_url}
                    category={itemCategoryName}
                    hours={l.hours}
                    price={l.price_range}
                    featured={l.is_featured}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar — replaces global nav on this page */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2 px-4 py-3">
          <button
            onClick={() => setConfirm("chat")}
            disabled={!canContact}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground transition active:scale-95 disabled:opacity-40"
          >
            <MessageCircle className="size-5 text-primary" /> Hubungi
          </button>
          <button
            onClick={() => setConfirm("save")}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground transition active:scale-95"
          >
            {saved ? (
              <BookmarkCheck className="size-5 text-primary" />
            ) : (
              <Bookmark className="size-5 text-primary" />
            )}
            {saved ? "Tersimpan" : "Simpan"}
          </button>
          <button
            onClick={() => setConfirm("gmaps")}
            disabled={!mapsUrl}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-lift transition active:scale-95 disabled:opacity-40"
          >
            <Navigation className="size-5" /> Google Maps
          </button>
        </div>
      </div>

      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-end bg-black/40 sm:place-items-center"
            onClick={() => setConfirm(null)}
          >
            <motion.div
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              exit={{ y: 60 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-card p-6 sm:rounded-3xl"
            >
              {confirm === "chat" ? (
                <>
                  <h3 className="font-display text-xl">Hubungi siapa?</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Pilih kontak yang ingin Anda hubungi lewat WhatsApp.
                  </p>
                  <div className="mt-5 space-y-2">
                    {ownerWaUrl && (
                      <button
                        onClick={() => {
                          track("whatsapp");
                          setConfirm(null);
                          window.location.href = ownerWaUrl;
                        }}
                        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition active:scale-[0.98]"
                      >
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                          <Store className="size-4" />
                        </span>
                        <span className="flex-1">
                          <span className="block text-sm font-semibold">Hubungi pemilik</span>
                          <span className="block text-xs text-muted-foreground">
                            {location.name}
                          </span>
                        </span>
                      </button>
                    )}
                    {activeCouriers.map((c: any) => {
                      const url = waChatUrl(
                        c.whatsapp,
                        `Halo ${c.name}, saya butuh bantuan kurir/ojek menuju ${location.name} (via Rekomendify).`,
                      );
                      if (!url) return null;
                      return (
                        <button
                          key={c.id}
                          onClick={() => {
                            track("whatsapp");
                            setConfirm(null);
                            window.location.href = url;
                          }}
                          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition active:scale-[0.98]"
                        >
                          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
                            <Bike className="size-4" />
                          </span>
                          <span className="flex-1">
                            <span className="block text-sm font-semibold">{c.name}</span>
                            <span className="block text-xs text-muted-foreground">
                              Kurir / ojek lokal
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setConfirm(null)}
                    className="mt-5 w-full rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold"
                  >
                    Tutup
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-display text-xl">{confirmCopy[confirm].title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{confirmCopy[confirm].body}</p>
                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => setConfirm(null)}
                      className="flex-1 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold"
                    >
                      Tidak
                    </button>
                    <button
                      onClick={handleConfirmYes}
                      className="flex-1 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
                    >
                      Ya
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="flex-1">
        <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-foreground">{value}</dd>
      </div>
    </div>
  );
}
