import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rekomendify";
import { ArrowLeft, Compass, Eye, Target, Sparkles } from "lucide-react";
import { APP_VERSION } from "@/lib/contact";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang Rekomendify — Pemandu Wisata Digital Hyperlocal" },
      { name: "description", content: "Kenali Rekomendify: pemandu wisata digital hyperlocal berbasis QR yang membantu wisatawan menemukan informasi lokal secara cepat." },
      { property: "og:title", content: "Tentang Rekomendify" },
      { property: "og:description", content: "Pemandu wisata digital hyperlocal berbasis QR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <PageShell>
      <div className="mx-auto max-w-md px-5 pt-6">
        <Link to="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Pengaturan
        </Link>
        <h1 className="mt-2 font-display text-3xl">Tentang Rekomendify</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Rekomendify adalah pemandu wisata digital <em>hyperlocal</em>. Kami menghubungkan QR fisik di
          lokasi wisata dengan halaman informasi yang dikelola langsung oleh pengelola wilayah setempat —
          bukan marketplace, bukan aplikasi pemesanan.
        </p>

        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-primary" />
            <h2 className="font-display text-lg">Cara kerja</h2>
          </div>
          <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><span className="font-semibold text-foreground">1.</span> Pindai QR Rekomendify di lokasi, atau pilih wilayah dari beranda.</li>
            <li><span className="font-semibold text-foreground">2.</span> Lihat rekomendasi tempat, jam buka, kisaran harga, dan info lokal terbaru.</li>
            <li><span className="font-semibold text-foreground">3.</span> Simpan tempat favorit dan lanjutkan menjelajah wilayah lain kapan saja.</li>
          </ol>
        </section>

        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Eye className="size-4 text-primary" />
            <h2 className="font-display text-lg">Visi</h2>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Menjadikan setiap wilayah wisata mudah dipahami wisatawan hanya dalam beberapa detik.
          </p>
        </section>

        <section className="mt-4 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2">
            <Target className="size-4 text-primary" />
            <h2 className="font-display text-lg">Misi</h2>
          </div>
          <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            <li>Menyajikan informasi lokal yang akurat dan selalu diperbarui pengelola wilayah.</li>
            <li>Memberi pengalaman ringan, cepat, dan nyaman di perangkat apa pun.</li>
            <li>Memberdayakan desa & pengelola wisata untuk mengelola kontennya sendiri.</li>
          </ul>
        </section>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="size-3.5" /> Rekomendify versi {APP_VERSION}
        </p>
      </div>
    </PageShell>
  );
}
