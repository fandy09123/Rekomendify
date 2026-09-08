import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { MapPin, Sparkles, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import { z } from "zod";
import { listPublishedRegions } from "@/lib/public.functions";
import { PageShell, MascotWelcome } from "@/components/rekomendify";
import { toast } from "sonner";
import { isStandalone, consumeLaunchRedirect } from "@/lib/last-region";
import { ShareButton } from "@/components/share-button";


const homeSearch = z.object({ qr: z.enum(["not_found", "inactive"]).optional() });

export const Route = createFileRoute("/")({
  validateSearch: homeSearch,
  head: () => ({
    meta: [
      { title: "Rekomendify — Pemandu Wisata Digital" },
      { name: "description", content: "Pemandu wisata digital hyperlocal. Scan QR atau pilih wilayah, dipandu Cak Mulyo & Jeng Sari." },
      { property: "og:title", content: "Rekomendify" },
      { property: "og:description", content: "Pemandu wisata digital hyperlocal." },
    ],
  }),
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["regions"],
      queryFn: () => listPublishedRegions(),
    }),
  component: Home,
});

function Home() {
  const initialData = Route.useLoaderData();
  const { data: regions = [] } = useQuery({
    queryKey: ["regions"],
    queryFn: () => listPublishedRegions(),
    initialData,
  });
  const { qr } = Route.useSearch();

  const navigate = useNavigate();
  useEffect(() => {
    if (qr === "not_found") toast.error("QR tidak dikenali. Pastikan kode benar.");
    if (qr === "inactive") toast.info("QR ini belum dipasang ke lokasi mana pun.");
  }, [qr]);

  // Tautan pemulihan password kadang mendarat di "/" dengan hash dari Supabase.
  // Teruskan ke halaman reset agar pengguna tidak melihat beranda kosong.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash) return;
    const p = new URLSearchParams(hash);
    if (p.get("type") === "recovery" || p.get("error") || p.get("access_token")) {
      window.location.replace(`/reset-password#${hash}`);
    }
  }, []);

  // PWA: hanya pada cold start, lanjutkan ke wilayah TERAKHIR yang dikunjungi.
  // Setelah itu pengguna bebas kembali ke beranda global / wilayah lain.
  useEffect(() => {
    if (!isStandalone() || qr) return;
    if (typeof window !== "undefined" && window.location.hash) return;
    const last = consumeLaunchRedirect();
    if (last) navigate({ to: "/r/$slug", params: { slug: last }, replace: true });
  }, [navigate, qr]);




  return (
    <PageShell>
      <div className="batik-bg">
        <div className="mx-auto max-w-md px-5 pt-10">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <Sparkles className="size-5 shrink-0 text-primary" />
              <span className="truncate font-display text-xl text-primary">Rekomendify</span>
            </div>
            <ShareButton />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl leading-tight text-ink"
          >
            Halo, mau jelajah <span className="text-primary">ke mana</span> hari ini?
          </motion.h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Pemandu wisata digital. Scan QR di tempat wisata, atau pilih wilayah di bawah.
          </p>

          <div className="mt-6">
            <MascotWelcome
              name="Cak Mulyo & Jeng Sari"
              message="Monggo, pilih wilayah yang ingin Anda jelajahi. Saya temani sampai tujuan!"
            />
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wilayah tersedia</p>
          <div className="mt-3 space-y-3">
            {regions.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                Belum ada wilayah yang dipublikasikan.
              </div>
            )}
            {regions.map((r: any) => (
              <Link key={r.id} to="/r/$slug" params={{ slug: r.slug }} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition hover:shadow-soft">
                <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
                  <MapPin className="size-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg leading-snug">{r.name}</h3>
                  {r.tagline && <p className="text-sm text-muted-foreground">{r.tagline}</p>}
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-2xl bg-card p-4">
            <div className="flex items-center gap-3">
              <QrCode className="size-6 text-primary" />
              <div>
                <p className="text-sm font-semibold">Punya QR Rekomendify?</p>
                <p className="text-xs text-muted-foreground">Pindai dengan kamera HP — langsung masuk ke halaman wilayah.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
