import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/rekomendify";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/use-admin-session";
import { clearLastRegion } from "@/lib/last-region";
import { waLink, WA_MESSAGES, APP_VERSION } from "@/lib/contact";
import {
  ArrowLeft, DoorOpen, Info, HelpCircle, Lightbulb, Megaphone, Handshake,
  ChevronRight, ShieldCheck, LogOut, Store, AlertTriangle, MessageCircle,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRegionContact } from "@/lib/public.functions";
import { waChatUrl } from "@/lib/geo";
import { InstallAppCard } from "@/components/install-app";
import { UpdateAppCard } from "@/components/update-app";

export const Route = createFileRoute("/r/$slug_/settings")({
  head: () => ({
    meta: [
      { title: "Pengaturan Wilayah — Rekomendify" },
      { name: "description", content: "Pengaturan wilayah aktif, informasi Rekomendify, dan kontak bantuan." },
      { property: "og:title", content: "Pengaturan Wilayah — Rekomendify" },
      { property: "og:description", content: "Kelola wilayah aktif dan temukan bantuan Rekomendify." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RegionSettings,
});

function Row({ icon: Icon, label, desc, badge }: { icon: any; label: string; desc: string; badge?: string }) {
  return (
    <span className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold">{label}</span>
          {badge && (
            <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-accent">
              {badge}
            </span>
          )}
        </span>
        <span className="block truncate text-xs text-muted-foreground">{desc}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </span>
  );
}

function RegionSettings() {
  const { slug } = Route.useParams();
  const { email, isAdmin } = useAdminSession();
  const navigate = useNavigate();
  // Bila pengguna datang dari beranda wilayah, data wilayah (termasuk WhatsApp
  // admin) sudah ada di cache — tidak perlu request tambahan.
  const queryClient = useQueryClient();
  const cachedRegion = queryClient.getQueryData<any>(["region", slug])?.region;
  const { data: regionContact } = useQuery({
    queryKey: ["region-contact", slug],
    queryFn: () => getRegionContact({ data: { slug } }),
    initialData: cachedRegion
      ? {
          id: cachedRegion.id,
          slug: cachedRegion.slug,
          name: cachedRegion.name,
          admin_whatsapp: cachedRegion.admin_whatsapp ?? null,
        }
      : undefined,
    staleTime: 15 * 60 * 1000,
  });
  const adminWa = regionContact?.admin_whatsapp ?? null;
  const regionName = regionContact?.name ?? slug;
  const regionServices = [
    { icon: Store, label: "Daftarkan Usaha Saya", desc: "Ajukan tempat/usaha Anda ke wilayah ini", badge: "Gratis", msg: `Halo Admin ${regionName}, saya ingin mendaftarkan usaha saya di Rekomendify.` },
    { icon: Megaphone, label: "Pasang Iklan di Wilayah Ini", desc: "Tampil lebih menonjol di wilayah ini", msg: `Halo Admin ${regionName}, saya tertarik memasang iklan di wilayah ini pada Rekomendify.` },
    { icon: AlertTriangle, label: "Lapor Kesalahan Data", desc: "Informasi tidak sesuai atau sudah tutup", msg: `Halo Admin ${regionName}, saya ingin melaporkan kesalahan data pada Rekomendify.` },
    { icon: MessageCircle, label: "Bantuan Wilayah", desc: "Tanya langsung ke admin wilayah", msg: `Halo Admin ${regionName}, saya butuh bantuan terkait wilayah ini.` },
  ];

  const exitRegion = () => {
    clearLastRegion();
    navigate({ to: "/" });
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-5 pt-6">
        <Link to="/r/$slug" params={{ slug }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Kembali ke wilayah
        </Link>
        <h1 className="mt-2 font-display text-3xl">Pengaturan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Konteks wilayah aktif.</p>

        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Wilayah aktif</p>
          <p className="mt-1 font-semibold">/{slug}</p>
          <button
            onClick={exitRegion}
            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold"
          >
            <DoorOpen className="size-4" /> Keluar dari Wilayah
          </button>
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aplikasi</p>
        <InstallAppCard />
        <UpdateAppCard />

        {adminWa && (
          <>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Layanan wilayah</p>
            <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
              {regionServices.map((it) => {
                const url = waChatUrl(adminWa, it.msg);
                if (!url) return null;
                return (
                  <a key={it.label} href={url} target="_blank" rel="noopener noreferrer" className="block hover:bg-muted/50">
                    <Row icon={it.icon} label={it.label} desc={it.desc} badge={(it as any).badge} />
                  </a>
                );
              })}
            </div>
          </>
        )}


        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informasi</p>
        <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          <Link to="/tentang" className="block hover:bg-muted/50">
            <Row icon={Info} label="Tentang Rekomendify" desc="Apa itu Rekomendify, cara kerja, visi & misi" />
          </Link>
          <Link to="/bantuan" className="block hover:bg-muted/50">
            <Row icon={HelpCircle} label="Pusat Bantuan" desc="FAQ dan kontak bantuan" />
          </Link>
          <Link to="/privasi" className="block hover:bg-muted/50">
            <Row icon={ShieldCheck} label="Privasi & Izin" desc="Izin yang dipakai Rekomendify dan alasannya" />
          </Link>
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hubungi kami</p>
        <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {[
            { icon: Lightbulb, label: "Kirim Saran", desc: "Ide untuk pengembangan aplikasi", msg: WA_MESSAGES.saran },
            { icon: Megaphone, label: "Pasang Iklan", desc: "Promosikan usaha Anda", msg: WA_MESSAGES.iklan },
            { icon: Handshake, label: "Kerja Sama", desc: "Peluang kemitraan", msg: WA_MESSAGES.kerjaSama },
          ].map((it) => (
            <a key={it.label} href={waLink(it.msg)} target="_blank" rel="noopener noreferrer" className="block hover:bg-muted/50">
              <Row icon={it.icon} label={it.label} desc={it.desc} />
            </a>
          ))}
        </div>

        {isAdmin && (
          <>
            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Panel Admin</p>
            <div className="mt-2 rounded-2xl border border-border bg-card p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Masuk sebagai</p>
              <p className="mt-1 truncate font-semibold">{email}</p>
              <div className="mt-4 flex gap-2">
                <Link to="/admin" className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                  <ShieldCheck className="size-4" /> Dashboard Admin
                </Link>
                <button
                  onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/r/$slug", params: { slug } }); }}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold"
                >
                  <LogOut className="size-4" /> Keluar
                </button>
              </div>
            </div>
          </>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">Rekomendify versi {APP_VERSION}</p>
      </div>
    </PageShell>
  );
}
