import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { ShieldAlert, ShieldCheck, AlertCircle, RefreshCw } from "lucide-react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: (errorCode?: string) => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact" | "flexible";
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export interface TurnstileWidgetRef {
  reset: () => void;
}

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
  theme?: "light" | "dark" | "auto";
}

// Kunci Pengujian Resmi dari Cloudflare Docs:
// 3x00000000000000000000FF = Selalu memunculkan kotak centang "Verify you are human"
// 1x00000000000000000000AA = Selalu lolos otomatis (pass)
const CLOUDFLARE_TEST_INTERACTIVE_KEY = "3x00000000000000000000FF";

export const TurnstileWidget = forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(
  function TurnstileWidget({ onVerify, onExpire, className = "", theme = "auto" }, ref) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    // Ambil Site Key dari Vite env jika tersedia
    const envKey =
      (import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined) ||
      (import.meta.env.VITE_CAPTCHA_SITE_KEY as string | undefined);

    // Default ke kunci env, atau jika tidak ada fallback ke test interactive key agar widget tetap tampil
    const [activeKey, setActiveKey] = useState<string>(envKey || CLOUDFLARE_TEST_INTERACTIVE_KEY);
    const [isVerified, setIsVerified] = useState(false);
    const [errorCode, setErrorCode] = useState<string | null>(null);
    const [scriptReady, setScriptReady] = useState(false);

    // Ekspos fungsi reset untuk dipanggil saat form disubmit ulang atau mode berganti
    useImperativeHandle(ref, () => ({
      reset: () => {
        setIsVerified(false);
        setErrorCode(null);
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {
            // Abaikan jika widget belum siap
          }
        }
      },
    }));

    // Muat skrip Cloudflare Turnstile API sekali ke dalam DOM
    useEffect(() => {
      const scriptId = "cloudflare-turnstile-script";
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => setScriptReady(true);
        script.onerror = () => setErrorCode("network_blocked");
        document.head.appendChild(script);
      } else if (window.turnstile) {
        setScriptReady(true);
      } else {
        const interval = setInterval(() => {
          if (window.turnstile) {
            clearInterval(interval);
            setScriptReady(true);
          }
        }, 80);
        return () => clearInterval(interval);
      }
    }, []);

    // Render widget saat script dan container siap
    useEffect(() => {
      if (!scriptReady || !containerRef.current || !window.turnstile) return;

      // Bersihkan widget sebelumnya jika ada
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Abaikan
        }
        widgetIdRef.current = null;
      }

      setErrorCode(null);
      setIsVerified(false);

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: activeKey,
          theme,
          size: "normal",
          callback: (token: string) => {
            setIsVerified(true);
            setErrorCode(null);
            onVerify(token);
          },
          "expired-callback": () => {
            setIsVerified(false);
            if (onExpire) onExpire();
          },
          "error-callback": (err) => {
            setIsVerified(false);
            setErrorCode(err || "110200");
            if (onExpire) onExpire();
          },
        });
        widgetIdRef.current = id;
      } catch (e: any) {
        console.warn("Turnstile render error:", e);
        setErrorCode(e?.message || "render_failed");
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // Abaikan
          }
          widgetIdRef.current = null;
        }
      };
    }, [scriptReady, activeKey, theme, onVerify, onExpire]);

    return (
      <div className={`my-3 flex flex-col items-center justify-center min-h-[75px] ${className}`}>
        {/* Kontainer iframe Turnstile Cloudflare */}
        <div ref={containerRef} className={isVerified ? "hidden" : "block"} />

        {/* Notifikasi Sukses Centang */}
        {isVerified && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-4" />
            <span>Pemeriksaan Keamanan Berhasil</span>
          </div>
        )}

        {/* Bantuan Visual jika Cloudflare Mengembalikan Error Domain / Key */}
        {errorCode && (
          <div className="mt-2 w-full rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-600 dark:text-rose-400">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="size-4" />
              <span>Gagal Memuat Turnstile ({errorCode})</span>
            </div>
            <p className="mt-1 text-[11px] leading-relaxed opacity-90">
              {errorCode === "110200"
                ? "Domain Anda belum didaftarkan di Cloudflare Dashboard > Turnstile > Settings > Domains (tambahkan 'localhost')."
                : errorCode === "network_blocked"
                  ? "Skrip Cloudflare diblokir oleh Ad-Blocker atau koneksi internet."
                  : "Kunci Site Key Cloudflare tidak valid atau belum sesuai."}
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveKey(CLOUDFLARE_TEST_INTERACTIVE_KEY);
                setErrorCode(null);
              }}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold underline hover:opacity-80"
            >
              <RefreshCw className="size-3" /> Coba Gunakan Test Site Key Interaktif
            </button>
          </div>
        )}

        {/* Info Mode Pengujian jika menggunakan test key */}
        {activeKey === CLOUDFLARE_TEST_INTERACTIVE_KEY && !errorCode && !isVerified && (
          <span className="mt-1 text-[10px] text-muted-foreground">
            Mode Uji Interaktif Cloudflare Aktif
          </span>
        )}
      </div>
    );
  },
);
