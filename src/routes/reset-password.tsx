import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, ArrowLeft, CheckCircle2, ShieldAlert, Loader2 } from "lucide-react";
import { PasswordInput } from "@/components/password-input";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Atur Ulang Password — Rekomendify" },
      { name: "description", content: "Buat password baru untuk akun Admin Wilayah Rekomendify." },
      { property: "og:title", content: "Atur Ulang Password — Rekomendify" },
      { property: "og:description", content: "Buat password baru untuk akun Admin Wilayah Rekomendify." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

type Status = "checking" | "ready" | "invalid" | "done";

/** Terjemahan error yang dikirim Supabase pada hash URL. */
function readHashError(): string | null {
  if (typeof window === "undefined") return null;
  const parts = [window.location.hash.replace(/^#/, ""), window.location.search.replace(/^\?/, "")];
  for (const raw of parts) {
    if (!raw) continue;
    const p = new URLSearchParams(raw);
    const code = p.get("error_code");
    const err = p.get("error");
    if (!code && !err) continue;
    if (code === "otp_expired") return "Tautan pemulihan sudah kedaluwarsa. Minta tautan baru dari halaman masuk.";
    if (err === "access_denied") return "Tautan pemulihan sudah pernah dipakai atau tidak berlaku lagi.";
    return p.get("error_description")?.replace(/\+/g, " ") ?? "Tautan pemulihan tidak berlaku.";
  }
  return null;
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [reason, setReason] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);

  // Supabase memproses token recovery dari URL di sisi browser.
  useEffect(() => {
    let active = true;

    const hashError = readHashError();
    if (hashError) {
      setReason(hashError);
      setStatus("invalid");
      return;
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setStatus("ready");
    });

    // Beri jeda agar Supabase sempat menukar token dari URL sebelum divonis invalid.
    const settle = setTimeout(() => {
      supabase.auth.getSession().then(({ data }) => {
        if (!active) return;
        setStatus((s) => {
          if (s === "ready") return s;
          if (data.session) return "ready";
          setReason("Tautan pemulihan tidak ditemukan atau sudah kedaluwarsa.");
          return "invalid";
        });
      });
    }, 1200);

    return () => {
      active = false;
      clearTimeout(settle);
      sub.subscription.unsubscribe();
    };
  }, []);


  const tooShort = password.length > 0 && password.length < 8;
  const mismatch = confirm.length > 0 && confirm !== password;
  const canSubmit = password.length >= 8 && password === confirm && !saving;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setStatus("done");
      toast.success("Password berhasil diperbarui.");
    } catch (err: any) {
      toast.error(err?.message ?? "Gagal memperbarui password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center batik-bg px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/auth"
            aria-label="Kembali ke halaman masuk"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent/10"
          >
            <ArrowLeft className="size-4" /> Masuk
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-primary">
            <Sparkles className="size-5" /> <span className="font-display text-lg">Rekomendify</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-lift">
          {status === "checking" && (
            <div className="flex items-center gap-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-primary" /> Memeriksa tautan pemulihan…
            </div>
          )}

          {status === "invalid" && (
            <div className="text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive">
                <ShieldAlert className="size-6" />
              </div>
              <h1 className="mt-3 font-display text-2xl">Tautan tidak berlaku</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {reason ?? "Tautan pemulihan sudah kedaluwarsa atau pernah dipakai. Minta tautan baru dari halaman masuk."}
              </p>

              <Link to="/auth" className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground">
                Kembali ke halaman masuk
              </Link>
            </div>
          )}

          {status === "done" && (
            <div className="text-center">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <CheckCircle2 className="size-6" />
              </div>
              <h1 className="mt-3 font-display text-2xl">Password diperbarui</h1>
              <p className="mt-2 text-sm text-muted-foreground">Silakan lanjut ke dashboard Admin Wilayah Anda.</p>
              <button
                onClick={() => navigate({ to: "/admin", replace: true })}
                className="mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
              >
                Buka Dashboard
              </button>
            </div>
          )}

          {status === "ready" && (
            <>
              <h1 className="font-display text-2xl">Buat password baru</h1>
              <p className="mt-1 text-sm text-muted-foreground">Minimal 8 karakter. Gunakan kombinasi huruf dan angka.</p>

              <form onSubmit={submit} className="mt-5 space-y-3">
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder="Password baru"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                {tooShort && <p className="text-xs text-destructive">Password minimal 8 karakter.</p>}
                <PasswordInput
                  value={confirm}
                  onChange={setConfirm}
                  placeholder="Ulangi password baru"
                  autoComplete="new-password"
                  required
                  minLength={8}
                />
                {mismatch && <p className="text-xs text-destructive">Konfirmasi password belum sama.</p>}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-60"
                >
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  {saving ? "Menyimpan…" : "Simpan password baru"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
