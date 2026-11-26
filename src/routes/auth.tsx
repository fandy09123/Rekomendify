import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, ArrowLeft, KeyRound, Mail, ShieldCheck, UserCheck } from "lucide-react";
import { PasswordInput } from "@/components/password-input";
import { TurnstileWidget, type TurnstileWidgetRef } from "@/components/turnstile-widget";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Autentikasi Admin Wilayah — Rekomendify" },
      {
        property: "og:description",
        content: "Masuk atau daftar sebagai admin wilayah Rekomendify.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Autentikasi Admin Wilayah — Rekomendify" },
      { name: "description", content: "Masuk atau daftar sebagai admin wilayah Rekomendify." },
    ],
  }),
  component: AuthPage,
});

type AuthMode = "signin-password" | "signin-otp" | "verify-otp" | "signup" | "forgot";

function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("signin-password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);

  // Field Pendaftaran Wilayah
  const [fullName, setFullName] = useState("");
  const [regionName, setRegionName] = useState("");
  const [regionTagline, setRegionTagline] = useState("");
  const [regionCoords, setRegionCoords] = useState("");

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const navigate = useNavigate();

  const handleVerifyCaptcha = useCallback((token: string) => {
    setCaptchaToken(token);
  }, []);

  const handleExpireCaptcha = useCallback(() => {
    setCaptchaToken(null);
  }, []);

  const resetCaptchaState = () => {
    setCaptchaToken(null);
    turnstileRef.current?.reset();
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    setMode(newMode);
    resetCaptchaState();
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mode verify-otp tidak membutuhkan captcha token
    if (mode !== "verify-otp" && !captchaToken) {
      toast.error("Harap selesaikan verifikasi keamanan (Captcha) terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signin-password") {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
          options: {
            captchaToken: captchaToken || undefined,
          },
        });
        if (error) throw error;
        toast.success("Selamat datang kembali!");
        navigate({ to: "/admin", replace: true });
      } else if (mode === "signin-otp") {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            shouldCreateUser: false,
            captchaToken: captchaToken || undefined,
          },
        });
        if (error) {
          if (error.message.includes("Signups not allowed")) {
            throw new Error(
              "Email belum terdaftar sebagai admin wilayah. Silakan daftar terlebih dahulu.",
            );
          }
          throw error;
        }
        setSentTo(email.trim().toLowerCase());
        setMode("verify-otp");
        toast.success("Kode OTP 6 digit telah dikirim ke email Anda.");
      } else if (mode === "verify-otp") {
        const { error } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: otpCode.trim(),
          type: "email",
        });
        if (error) throw error;
        toast.success("Verifikasi berhasil! Mengalihkan ke dashboard...");
        navigate({ to: "/admin", replace: true });
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}/reset-password`,
          captchaToken: captchaToken || undefined,
        });
        if (error) throw error;
        setSentTo(email.trim().toLowerCase());
        toast.success("Tautan pemulihan kata sandi telah dikirim ke email Anda.");
      } else if (mode === "signup") {
        if (!regionName.trim()) throw new Error("Nama wilayah wajib diisi.");
        if (password.length < 8) throw new Error("Password minimal 8 karakter demi keamanan.");

        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/admin`,
            data: {
              full_name: fullName.trim(),
              region_name: regionName.trim(),
              region_tagline: regionTagline.trim() || null,
              region_coordinates: regionCoords.trim() || null,
            },
            captchaToken: captchaToken || undefined,
          },
        });
        if (error) throw error;
        toast.success(
          "Pendaftaran berhasil! Akun Anda akan diverifikasi dan diaktifkan oleh pengelola pusat.",
        );
        handleSwitchMode("signin-password");
      }
    } catch (err: any) {
      // Reset captcha karena token Cloudflare bersifat sekali pakai
      resetCaptchaState();

      const errMsg = err?.message || "";
      if (errMsg.toLowerCase().includes("captcha")) {
        toast.error("Verifikasi keamanan gagal atau kedaluwarsa. Silakan ulangi centang Captcha.");
      } else {
        toast.error(errMsg || "Terjadi kesalahan saat memproses permintaan.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center batik-bg px-5 py-10">
      <div className="w-full max-w-md">
        {/* Navigasi Atas */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            aria-label="Kembali ke beranda"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent/10 transition-colors"
          >
            <ArrowLeft className="size-4" /> Kembali
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-primary">
            <Sparkles className="size-5" />{" "}
            <span className="font-display text-lg">Rekomendify</span>
          </Link>
        </div>

        {/* Kartu Autentikasi */}
        <div className="rounded-3xl border border-border bg-card p-6 md:p-8 shadow-lift">
          <div className="flex items-center gap-2 text-primary mb-2">
            <ShieldCheck className="size-5" />
            <span className="text-xs font-bold uppercase tracking-wider">Portal Administrator</span>
          </div>

          <h1 className="font-display text-2xl text-foreground">
            {mode === "signin-password" && "Masuk dengan Kata Sandi"}
            {mode === "signin-otp" && "Masuk dengan Kode OTP"}
            {mode === "verify-otp" && "Masukkan Kode OTP"}
            {mode === "signup" && "Pendaftaran Admin Wilayah"}
            {mode === "forgot" && "Atur Ulang Sandi"}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin-password" && "Gunakan email dan kata sandi admin wilayah Anda."}
            {mode === "signin-otp" && "Kami akan mengirim kode 6 digit ke kotak masuk email Anda."}
            {mode === "verify-otp" && `Periksa kotak masuk ${sentTo}. Masukkan kode 6 digit.`}
            {mode === "signup" &&
              "Satu Admin = Satu Wilayah. Akun berstatus non-aktif hingga diverifikasi."}
            {mode === "forgot" &&
              "Tautan untuk mengubah kata sandi baru akan dikirimkan ke email Anda."}
          </p>

          {/* Tab Pemilih Mode Masuk */}
          {(mode === "signin-password" || mode === "signin-otp") && (
            <div className="mt-4 grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => handleSwitchMode("signin-password")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                  mode === "signin-password"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <KeyRound className="size-3.5" /> Kata Sandi
              </button>
              <button
                type="button"
                onClick={() => handleSwitchMode("signin-otp")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 transition-all ${
                  mode === "signin-otp"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Mail className="size-3.5" /> Kode OTP Email
              </button>
            </div>
          )}

          {/* Info Notifikasi */}
          {mode === "forgot" && sentTo && (
            <div className="mt-4 rounded-xl bg-primary/10 p-3 text-sm text-foreground">
              Tautan pemulihan telah dikirim ke <span className="font-semibold">{sentTo}</span>.
              Periksa juga folder spam jika belum muncul.
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="mt-5 space-y-3">
            {/* Field Tambahan Khusus Signup */}
            {mode === "signup" && (
              <>
                <input
                  required
                  placeholder="Nama Lengkap Penanggung Jawab"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                />
                <div className="rounded-2xl border border-border/80 bg-muted/40 p-3.5 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <UserCheck className="size-3.5" /> Identitas Wilayah
                  </p>
                  <input
                    required
                    placeholder="Nama Wilayah (mis. Desa Wisata Nglanggeran)"
                    value={regionName}
                    onChange={(e) => setRegionName(e.target.value)}
                    className="input bg-card"
                  />
                  <input
                    placeholder="Tagline Wilayah (opsional)"
                    value={regionTagline}
                    onChange={(e) => setRegionTagline(e.target.value)}
                    className="input bg-card"
                  />
                  <input
                    placeholder="Koordinat Wilayah, mis. -7.8711,110.5401 (opsional)"
                    value={regionCoords}
                    onChange={(e) => setRegionCoords(e.target.value)}
                    className="input bg-card"
                  />
                </div>
              </>
            )}

            {/* Field Email */}
            {mode !== "verify-otp" && (
              <input
                type="email"
                required
                placeholder="Alamat Email Resmi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                autoComplete="email"
              />
            )}

            {/* Field Password */}
            {(mode === "signin-password" || mode === "signup") && (
              <PasswordInput
                value={password}
                onChange={setPassword}
                required
                minLength={mode === "signup" ? 8 : 6}
                autoComplete={mode === "signin-password" ? "current-password" : "new-password"}
                placeholder={mode === "signup" ? "Kata Sandi (minimal 8 karakter)" : "Kata Sandi"}
              />
            )}

            {/* Field Kode OTP 6 Digit */}
            {mode === "verify-otp" && (
              <div className="space-y-1">
                <input
                  type="text"
                  required
                  maxLength={8}
                  placeholder="Masukkan 6 Digit Kode OTP"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="input text-center text-lg tracking-widest font-mono"
                  autoFocus
                />
                <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
                  <span>Tidak menerima email?</span>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode("signin-otp")}
                    className="text-primary hover:underline font-semibold"
                  >
                    Kirim ulang
                  </button>
                </div>
              </div>
            )}

            {/* Link Lupa Password */}
            {mode === "signin-password" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSentTo(null);
                    handleSwitchMode("forgot");
                  }}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Lupa kata sandi?
                </button>
              </div>
            )}

            {/* Widget Cloudflare Turnstile Anti-Bot (Kecuali verify-otp) */}
            {mode !== "verify-otp" && (
              <TurnstileWidget
                ref={turnstileRef}
                onVerify={handleVerifyCaptcha}
                onExpire={handleExpireCaptcha}
              />
            )}

            {/* Tombol Aksi Utama */}
            <button
              disabled={loading || (mode !== "verify-otp" && !captchaToken)}
              type="submit"
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-60 transition-opacity"
            >
              {loading
                ? "Memproses..."
                : mode === "signin-password"
                  ? "Masuk Dashboard"
                  : mode === "signin-otp"
                    ? "Kirim Kode OTP"
                    : mode === "verify-otp"
                      ? "Verifikasi & Masuk"
                      : mode === "signup"
                        ? "Ajukan Pendaftaran Wilayah"
                        : "Kirim Tautan Pemulihan"}
            </button>
          </form>

          {/* Link Pergantian Mode */}
          <div className="mt-5 space-y-2 text-center text-sm">
            {mode !== "signin-password" && mode !== "signin-otp" ? (
              <button
                type="button"
                onClick={() => handleSwitchMode("signin-password")}
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                Sudah memiliki akun? Masuk di sini
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSwitchMode("signup")}
                className="text-muted-foreground hover:text-foreground hover:underline"
              >
                Belum mendaftarkan wilayah? Ajukan pendaftaran
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
