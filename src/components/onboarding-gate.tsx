import { useEffect, useState } from "react";
import { useLocation, Link } from "@tanstack/react-router";
import { Bell, MapPin, Camera, Check, Loader2, ShieldCheck, X } from "lucide-react";
import { motion } from "framer-motion";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import { hasSeenOnboarding, markOnboardingSeen, isOnboardingBlockedPath } from "@/lib/onboarding";
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal";

/**
 * Onboarding izin — SATU layar, tampil sekali per perangkat.
 *
 * Prinsipnya: UI ini hanya MENJELASKAN. Prompt izin asli dari browser hanya
 * muncul setelah pengguna menekan tombol (notifikasi). Lokasi & kamera tidak
 * diminta di sini — keduanya just-in-time saat fiturnya dipakai.
 */
export function OnboardingGate() {
  const loc = useLocation();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (hasSeenOnboarding()) return;
    if (isOnboardingBlockedPath(loc.pathname)) return;
    setShow(true);
  }, [loc.pathname]);

  if (!show) return null;
  return <OnboardingSheet onClose={() => { markOnboardingSeen(); setShow(false); }} />;
}

function Item({
  icon: Icon,
  title,
  desc,
  children,
}: {
  icon: any;
  title: string;
  desc: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-3.5">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
        {children}
      </div>
    </div>
  );
}

function OnboardingSheet({ onClose }: { onClose: () => void }) {
  const push = usePushSubscription();
  const [msg, setMsg] = useState<string | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  const perm = push.permission;
  const granted = perm === "granted";
  const denied = perm === "denied";

  const enable = async () => {
    setMsg(null);
    const ok = await push.enable();
    if (!ok) setMsg(push.error ?? "Notifikasi belum bisa diaktifkan di perangkat ini.");
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-label="Selamat datang di Rekomendify"
          className="max-h-[92svh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-lift sm:rounded-3xl"
        >
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-2xl leading-snug">Selamat datang di Rekomendify 👋</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Pemandu wisata digital untuk menemukan tempat dan informasi menarik di sekitar Anda.
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="grid size-8 shrink-0 place-items-center rounded-full hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Agar beberapa fitur bekerja baik, Rekomendify mungkin butuh izin berikut. Semuanya opsional.
          </p>

          <div className="mt-3 space-y-2.5">
            <Item
              icon={Bell}
              title="Notifikasi"
              desc="Agar Anda tidak ketinggalan informasi dari wilayah yang Anda ikuti."
            >
              {!push.ready ? (
                <p className="mt-2 text-xs text-muted-foreground">Memeriksa…</p>
              ) : granted ? (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  <Check className="size-3.5" /> Notifikasi aktif
                </p>
              ) : denied ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Izin notifikasi sedang dimatikan. Anda bisa menyalakannya lewat pengaturan situs di browser
                  (ikon gembok di address bar → Notifikasi).
                </p>
              ) : !push.supported ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Browser ini belum mendukung notifikasi. Fitur lain tetap bisa dipakai.
                </p>
              ) : (
                <button
                  onClick={enable}
                  disabled={push.busy}
                  className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                >
                  {push.busy ? <Loader2 className="size-3.5 animate-spin" /> : <Bell className="size-3.5" />}
                  Aktifkan Notifikasi
                </button>
              )}
              {msg && <p className="mt-2 text-xs text-destructive">{msg}</p>}
            </Item>

            <Item
              icon={MapPin}
              title="Lokasi"
              desc="Membantu mengurutkan tempat terdekat saat Anda memilih “Terdekat”. Diminta hanya saat Anda menekannya."
            />

            <Item
              icon={Camera}
              title="Kamera"
              desc="Hanya digunakan ketika Anda memilih Scan QR. Tidak perlu diaktifkan sekarang."
            />
          </div>

          <button
            onClick={onClose}
            className="mt-4 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            Lanjutkan
          </button>

          <div className="mt-2 flex items-center justify-between">
            <button onClick={onClose} className="rounded-full px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
              Lewati untuk sekarang
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowPolicyModal(true)}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-primary hover:underline"
              >
                Dokumen Kebijakan
              </button>
              <span className="text-muted-foreground text-xs">•</span>
              <Link
                to="/privasi"
                onClick={onClose}
                className="inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ShieldCheck className="size-3.5" /> Privasi & Izin
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <PrivacyPolicyModal open={showPolicyModal} onOpenChange={setShowPolicyModal} />
    </>
  );
}
