import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { myProfile, myRegion } from "@/lib/admin.functions";
import { LayoutDashboard, MapPin, QrCode, BarChart3, LogOut, Sparkles, Lock, Settings, Megaphone, Coins } from "lucide-react";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { data: profile } = useQuery({ queryKey: ["my-profile"], queryFn: () => myProfile() });
  const { data: region } = useQuery({
    queryKey: ["my-region-name"],
    queryFn: async () => (await myRegion()).region,
    enabled: !!profile?.is_active,
  });

  const items = [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/info", label: "Info Lokal", icon: Megaphone },
    { to: "/admin/region", label: "Pengaturan Wilayah", icon: Settings },
    { to: "/admin/iklan", label: "Iklan & Promosi", icon: Coins },
    { to: "/admin/qr", label: "QR Codes", icon: QrCode },
    { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ] as const;

  const logout = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  // Account not yet activated → show locked screen
  if (profile && !profile.is_active) {
    return (
      <div className="grid min-h-screen place-items-center batik-bg px-5">
        <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-lift">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-mustard/30 text-ink">
            <Lock className="size-6" />
          </div>
          <h1 className="mt-4 font-display text-2xl">Akun belum aktif</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pendaftaran Anda sudah kami terima. Tim Rekomendify akan memverifikasi & mengaktifkan akun
            <span className="font-semibold"> {profile.email}</span> secara manual. Anda akan diberitahu setelah aktif.
          </p>
          <button onClick={logout} className="mt-6 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium">
            <LogOut className="size-4" /> Keluar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-border bg-sidebar p-5 lg:block">
        <Link to="/" className="flex items-center gap-2 text-primary">
          <Sparkles className="size-5" /><span className="font-display text-xl">Rekomendify</span>
        </Link>
        <p className="mt-1 text-xs text-muted-foreground">Admin Wilayah</p>
        {region && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-card p-3 text-xs">
            <MapPin className="mt-0.5 size-4 text-accent" />
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">{region.name}</p>
              <p className="text-muted-foreground">/{region.slug}</p>
            </div>
          </div>
        )}
        <nav className="mt-6 space-y-1">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/admin" && pathname.startsWith(to));
            return (
              <Link key={to} to={to} className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${active ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"}`}>
                <Icon className="size-4" />{label}
              </Link>
            );
          })}
        </nav>
        <button onClick={logout} className="mt-8 flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent/10">
          <LogOut className="size-4" /> Keluar
        </button>
      </aside>

      <div className="lg:hidden">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-primary"><Sparkles className="size-4" /><span className="font-display text-base">Rekomendify</span></Link>
          <button onClick={logout} className="text-sm text-muted-foreground"><LogOut className="size-4" /></button>
        </div>
        <nav className="flex overflow-x-auto border-b border-border bg-card px-2">
          {items.map(({ to, label, icon: Icon }) => {
            const active = pathname === to || (to !== "/admin" && pathname.startsWith(to));
            return (
              <Link key={to} to={to} className={`flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium ${active ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
                <Icon className="size-4" />{label}
              </Link>
            );
          })}
        </nav>
      </div>

      <main className="min-w-0 bg-background p-5 lg:p-8">{children}</main>
    </div>
  );
}

export function AdminLayout() {
  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
