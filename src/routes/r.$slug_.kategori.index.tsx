import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getRegionBySlug } from "@/lib/public.functions";
import { PageShell } from "@/components/rekomendify";
import { ArrowLeft, LayoutGrid } from "lucide-react";

export const Route = createFileRoute("/r/$slug_/kategori/")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData({
      queryKey: ["region", params.slug],
      queryFn: () => getRegionBySlug({ data: { slug: params.slug } }),
    });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    const title = `Semua Kategori ${loaderData?.region?.name ?? ""} — Rekomendify`;
    const desc = `Jelajahi seluruh kategori tempat di ${loaderData?.region?.name ?? "wilayah"}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  component: SemuaKategori,
  errorComponent: ({ error }) => <div className="p-8 text-center text-sm">{error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center">Wilayah tidak ditemukan.</div>,
});

function SemuaKategori() {
  const { slug } = Route.useParams();
  const initialData = Route.useLoaderData();
  const { data } = useQuery({
    queryKey: ["region", slug],
    queryFn: () => getRegionBySlug({ data: { slug } }),
    initialData,
  });

  if (!data) return null;
  const { region, categories, locations } = data;

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
          <h1 className="mt-2 font-display text-3xl leading-tight">Semua Kategori</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pilih kategori untuk melihat tempatnya.</p>
        </div>
      </div>

      <div className="mx-auto max-w-md px-5 pt-4">
        {categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Belum ada kategori.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((c: any) => {
              const count = locations.filter((l: any) => l.category_id === c.id).length;
              return (
                <Link
                  key={c.id}
                  to="/r/$slug/kategori/$cat"
                  params={{ slug: region.slug, cat: c.slug ?? c.id }}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:shadow-soft active:scale-[0.99]"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-xl">
                    {c.icon || <LayoutGrid className="size-5 text-primary" />}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{c.name}</span>
                    <span className="block text-xs text-muted-foreground">{count} tempat</span>
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PageShell>
  );
}
