import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { PageShell } from "@/components/rekomendify";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/hooks/use-admin-session";
import { waLink, WA_MESSAGES, APP_VERSION } from "@/lib/contact";
import { InstallAppCard } from "@/components/install-app";
import {
  Info, HelpCircle, Lightbulb, Home as HomeIcon, Megaphone, Handshake,
  ChevronRight, ShieldCheck, LogOut,
} from "lucide-react";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Pengaturan — Rekomendify" },
      { name: "description", content: "Informasi resmi Rekomendify: tentang aplikasi, pusat bantuan, kirim saran, daftarkan desa, pasang iklan, dan kerja sama." },
      { property: "og:title", content: "Pengaturan Rekomendify" },
      { property: "og:description", content: "Pusat informasi resmi Rekomendify." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Settings,
});

function Row({ icon: Icon, label, desc }: { icon: any; label: string; desc: string }) {
  return (
    <span className="flex w-full items-center gap-3 px-4 py-3.5 text-left">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block truncate text-xs text-muted-foreground">{desc}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </span>
  );
}

function Settings() {
  const { email, isAdmin } = useAdminSession();
  const navigate = useNavigate();

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-5 pt-10">
        <h1 className="font-display text-3xl">Pengaturan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Informasi resmi & bantuan Rekomendify.</p>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Aplikasi</p>
        <InstallAppCard />


        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Informasi</p>
        <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          <Link to="/tentang" className="block hover:bg-muted/50">
            <Row icon={Info} label="Tentang Rekomendify" desc="Apa itu Rekomendify, cara kerja, visi & misi" />
          </Link>
          <Link to="/bantuan" className="block hover:bg-muted/50">
            <Row icon={HelpCircle} label="Pusat Bantuan" desc="FAQ dan kontak bantuan" />
          </Link>
        </div>

        <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hubungi kami</p>
        <div className="mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {[
            { icon: Lightbulb, label: "Kirim Saran", desc: "Ide untuk pengembangan aplikasi", msg: WA_MESSAGES.saran },
            { icon: HomeIcon, label: "Daftarkan Desa Anda", desc: "Bawa wilayah Anda ke Rekomendify", msg: WA_MESSAGES.daftarDesa },
            { icon: Megaphone, label: "Pasang Iklan", desc: "Promosikan usaha Anda", msg: WA_MESSAGES.iklan },
            { icon: Handshake, label: "Kerja Sama", desc: "Peluang kemitraan", msg: WA_MESSAGES.kerjaSama },
          ].map((it) => (
            <a key={it.label} href={waLink(it.msg)} target="_blank" rel="noopener noreferrer" className="block hover:bg-muted/50">
              <Row icon={it.icon} label={it.label} desc={it.desc} />
            </a>
          ))}
        </div>

        {/* Panel admin hanya muncul bila sesi admin benar-benar aktif. */}
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
                <button onClick={logout} className="flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold">
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
