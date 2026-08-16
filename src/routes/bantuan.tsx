import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell } from "@/components/rekomendify";
import { ArrowLeft, ChevronDown, MessageCircle } from "lucide-react";
import { waLink, WA_MESSAGES } from "@/lib/contact";

export const Route = createFileRoute("/bantuan")({
  head: () => ({
    meta: [
      { title: "Pusat Bantuan — Rekomendify" },
      { name: "description", content: "Pertanyaan yang sering diajukan seputar Rekomendify: QR, wilayah, menyimpan tempat, dan cara menghubungi tim kami." },
      { property: "og:title", content: "Pusat Bantuan Rekomendify" },
      { property: "og:description", content: "FAQ dan kontak bantuan Rekomendify." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Help,
});

const FAQ = [
  {
    q: "Apa itu Rekomendify?",
    a: "Pemandu wisata digital hyperlocal. Kami menampilkan informasi tempat, jam buka, dan kabar terbaru dari pengelola wilayah wisata — bukan aplikasi pemesanan.",
  },
  {
    q: "Bagaimana cara memakai QR Rekomendify?",
    a: "Arahkan kamera ponsel ke QR yang terpasang di lokasi, atau gunakan tombol Scan QR di bagian bawah aplikasi. Anda akan langsung dibawa ke halaman tempat tersebut.",
  },
  {
    q: "Bisakah saya berpindah wilayah?",
    a: "Bisa. Tekan “Keluar dari Wilayah” di halaman wilayah, lalu pilih wilayah lain di beranda. Aplikasi akan mengingat wilayah terakhir yang Anda kunjungi.",
  },
  {
    q: "Apakah tempat tersimpan hilang jika aplikasi ditutup?",
    a: "Tidak. Daftar tersimpan disimpan di perangkat Anda dan tetap ada setelah aplikasi ditutup, selama data browser tidak dihapus.",
  },
  {
    q: "Apakah Rekomendify bisa dipakai offline?",
    a: "Halaman yang pernah dibuka bisa tampil kembali dengan cepat, namun informasi terbaru tetap membutuhkan koneksi internet.",
  },
  {
    q: "Bagaimana jika informasi tempat tidak akurat?",
    a: "Informasi dikelola pengelola wilayah masing-masing. Hubungi kami lewat WhatsApp agar kami teruskan ke pengelola terkait.",
  },
];

function Help() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <PageShell>
      <div className="mx-auto max-w-md px-5 pt-6">
        <Link to="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Pengaturan
        </Link>
        <h1 className="mt-2 font-display text-3xl">Pusat Bantuan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pertanyaan yang paling sering ditanyakan.</p>

        <div className="mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {FAQ.map((item, i) => {
            const expanded = open === i;
            return (
              <div key={item.q}>
                <button
                  onClick={() => setOpen(expanded ? null : i)}
                  aria-expanded={expanded}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold"
                >
                  {item.q}
                  <ChevronDown className={`size-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
                {expanded && <p className="px-4 pb-4 text-sm leading-relaxed text-muted-foreground">{item.a}</p>}
              </div>
            );
          })}
        </div>

        <div className="mt-5 rounded-2xl border border-border bg-card p-5 text-center">
          <p className="text-sm font-semibold">Butuh bantuan lebih lanjut?</p>
          <p className="mt-1 text-xs text-muted-foreground">Tim Rekomendify siap membantu lewat WhatsApp.</p>
          <a
            href={waLink(WA_MESSAGES.bantuan)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            <MessageCircle className="size-4" /> Hubungi lewat WhatsApp
          </a>
        </div>
      </div>
    </PageShell>
  );
}
