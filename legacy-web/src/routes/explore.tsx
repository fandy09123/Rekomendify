import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listPublishedRegions } from "@/lib/public.functions";
import { PageShell } from "@/components/rekomendify";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: "Jelajah Wilayah — Rekomendify" },
      { name: "description", content: "Daftar semua wilayah wisata di Rekomendify." },
      { property: "og:title", content: "Jelajah Wilayah — Rekomendify" },
      { property: "og:description", content: "Pilih wilayah wisata yang ingin kamu kunjungi." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData({ queryKey: ["regions"], queryFn: () => listPublishedRegions() }),
  component: Explore,
});

function Explore() {
  const initialData = Route.useLoaderData();
  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: () => listPublishedRegions(),
    initialData,
  });
  return (
    <PageShell>
      <div className="mx-auto max-w-md px-5 pt-10">
        <h1 className="font-display text-3xl">Jelajah</h1>
        <p className="mt-1 text-sm text-muted-foreground">Semua wilayah yang aktif di Rekomendify.</p>
        <div className="mt-6 space-y-3">
          {regions.map((r: any) => (
            <Link key={r.id} to="/r/$slug" params={{ slug: r.slug }} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 hover:shadow-soft">
              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent"><MapPin className="size-6" /></div>
              <div>
                <h3 className="font-display text-lg">{r.name}</h3>
                {r.tagline && <p className="text-sm text-muted-foreground">{r.tagline}</p>}
              </div>
            </Link>
          ))}
          {regions.length === 0 && <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Belum ada wilayah.</p>}
        </div>
      </div>
    </PageShell>
  );
}
