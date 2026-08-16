import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listRegionInfoPosts } from "@/lib/public.functions";
import { PageShell } from "@/components/rekomendify";
import { MediaGallery } from "@/components/media-gallery";
import { MessageSquare, ArrowLeft, Bell } from "lucide-react";

export const Route = createFileRoute("/r/$slug_/messages")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData({
      queryKey: ["region-info", params.slug],
      queryFn: () => listRegionInfoPosts({ data: { regionSlug: params.slug } }),
    });
    if (!data.region) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Info Lokal ${loaderData?.region?.name ?? ""} — Rekomendify` },
      { name: "description", content: `Pengumuman & info terbaru dari ${loaderData?.region?.name ?? "wilayah"}.` },
    ],
  }),
  component: RegionMessagesPage,
  errorComponent: ({ error }) => <div className="p-8 text-center text-sm">{error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center">Wilayah tidak ditemukan.</div>,
});

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
  } catch { return ""; }
}

function RegionMessagesPage() {
  const { slug } = Route.useParams();
  const initialData = Route.useLoaderData();
  const { data } = useQuery({
    queryKey: ["region-info", slug],
    queryFn: () => listRegionInfoPosts({ data: { regionSlug: slug } }),
    initialData,
  });

  const posts = data?.posts ?? [];

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-5 pt-6">
        <Link to="/r/$slug" params={{ slug }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Kembali ke wilayah
        </Link>
        <h1 className="mt-2 font-display text-3xl">Info Lokal</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pengumuman & kabar terbaru dari {data?.region?.name}.</p>

        <Link
          to="/notifikasi"
          className="mt-4 flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-sm transition hover:bg-accent/10"
        >
          <Bell className="size-4 text-primary" />
          <span className="font-medium">Riwayat Notifikasi</span>
          <span className="ml-auto text-xs text-muted-foreground">tersimpan di perangkat</span>
        </Link>


        {posts.length === 0 ? (
          <div className="mt-8 grid place-items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <MessageSquare className="size-7" />
            </div>
            <h2 className="mt-4 font-display text-xl">Belum ada info</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pengelola wilayah belum memposting info. Cek lagi nanti ya.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {posts.map((p: any) => (
              <article key={p.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                {(p.cover_image_url || p.gallery_urls?.length || p.youtube_url) && (
                  <MediaGallery
                    photo={p.cover_image_url}
                    gallery={p.gallery_urls}
                    youtube={p.youtube_url}
                    alt={p.title}
                  />
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {p.categories?.name && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                        {p.categories.icon ? `${p.categories.icon} ` : ""}{p.categories.name}
                      </span>
                    )}
                    <span>{formatDate(p.published_at)}</span>
                  </div>
                  <h2 className="mt-2 font-display text-lg leading-tight">{p.title}</h2>
                  {p.body && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/85">{p.body}</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </PageShell>
  );
}
