import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, ArrowLeft } from "lucide-react";
import { PasswordInput } from "@/components/password-input";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Masuk Admin Wilayah — Rekomendify" }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [regionName, setRegionName] = useState("");
  const [regionTagline, setRegionTagline] = useState("");
  const [regionCoords, setRegionCoords] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) throw error;
        setSentTo(email);
        toast.success("Tautan pemulihan dikirim ke email Anda.");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Selamat datang!");
        navigate({ to: "/admin", replace: true });
      } else {
        if (!regionName.trim()) throw new Error("Nama wilayah wajib diisi.");
        const { error } = await supabase.auth.signUp({
          email, password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: {
              full_name: fullName,
              region_name: regionName,
              region_tagline: regionTagline || null,
              region_coordinates: regionCoords || null,
            },
          },
        });
        if (error) throw error;
        toast.success("Pendaftaran diterima. Akun Anda akan diaktifkan oleh tim Rekomendify.");
        setMode("signin");
      }
    } catch (err: any) {
      toast.error(err.message ?? "Gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center batik-bg px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            aria-label="Kembali ke beranda"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent/10"
          >
            <ArrowLeft className="size-4" /> Kembali
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-primary">
            <Sparkles className="size-5" /> <span className="font-display text-lg">Rekomendify</span>
          </Link>
        </div>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-lift">
          <h1 className="font-display text-2xl">
            {mode === "signin" ? "Masuk Admin" : mode === "signup" ? "Daftar Admin Wilayah" : "Lupa Password"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Khusus pengelola wilayah."
              : mode === "signup"
                ? "Satu admin = satu wilayah. Akun akan diaktifkan manual setelah verifikasi."
                : "Masukkan email akun Anda. Kami kirim tautan untuk membuat password baru."}
          </p>

          {mode === "forgot" && sentTo && (
            <p className="mt-4 rounded-xl bg-primary/10 p-3 text-sm text-foreground">
              Tautan pemulihan sudah dikirim ke <span className="font-semibold">{sentTo}</span>. Cek juga folder spam.
            </p>
          )}

          <form onSubmit={submit} className="mt-5 space-y-3">
            {mode === "signup" && (
              <>
                <input required placeholder="Nama lengkap Anda" value={fullName} onChange={(e) => setFullName(e.target.value)} className="input" />
                <div className="rounded-xl bg-muted/40 p-3 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Wilayah yang akan dikelola</p>
                  <input required placeholder="Nama wilayah (mis. Desa Wisata Mulyosari)" value={regionName} onChange={(e) => setRegionName(e.target.value)} className="input" />
                  <input placeholder="Tagline / sapaan singkat (opsional)" value={regionTagline} onChange={(e) => setRegionTagline(e.target.value)} className="input" />
                  <input placeholder="Koordinat wilayah, mis. -8.002344,111.817618 (opsional)" value={regionCoords} onChange={(e) => setRegionCoords(e.target.value)} className="input" />
                </div>
              </>
            )}
            <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" autoComplete="email" />
            {mode !== "forgot" && (
              <PasswordInput
                value={password}
                onChange={setPassword}
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
              />
            )}
            {mode === "signin" && (
              <div className="flex justify-end">
                <button type="button" onClick={() => { setSentTo(null); setMode("forgot"); }} className="text-xs font-semibold text-primary hover:underline">
                  Lupa password?
                </button>
              </div>
            )}
            <button disabled={loading} type="submit" className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-60">
              {loading ? "Memproses…" : mode === "signin" ? "Masuk" : mode === "signup" ? "Daftar Wilayah Saya" : "Kirim tautan pemulihan"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground"
          >
            {mode === "signin" ? "Belum punya wilayah? Daftar di sini" : "Sudah punya akun? Masuk"}
          </button>
        </div>
      </div>
    </div>
  );
}
