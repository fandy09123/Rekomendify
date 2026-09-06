// =====================================================
// HALAMAN PRIVASI & IZIN REKOMENDIFY (/privasi)
// 
// Developer Note:
// Teks Kebijakan Privasi disentralisasi pada file:
// -> src/content/privacy-policy.ts
// Cukup edit file tersebut untuk memperbarui isi kebijakan.
// =====================================================

import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rekomendify";
import {
  ArrowLeft, Bell, MapPin, Camera, HardDrive, BarChart3, Check, Loader2,
  ShieldCheck, FileText, ChevronDown, ChevronUp, Mail, MapPin as LocationIcon, ExternalLink
} from "lucide-react";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import { useDevicePermission, type PermState } from "@/components/permission-status";
import { resetOnboarding } from "@/lib/onboarding";
import { useState } from "react";
import { toast } from "sonner";
import { PRIVACY_POLICY } from "@/content/privacy-policy";
import { PrivacyPolicyModal } from "@/components/privacy-policy-modal";

export const Route = createFileRoute("/privasi")({
  head: () => ({
    meta: [
      { title: "Privasi & Izin — Rekomendify" },
      {
        name: "description",
        content:
          "Dokumen Kebijakan Privasi resmi & penjelasan transparansi izin Rekomendify: notifikasi, lokasi, kamera, penyimpanan, dan pengelolaan data.",
      },
      { property: "og:title", content: "Privasi & Izin Rekomendify" },
      { property: "og:description", content: "Transparansi penggunaan data dan perizinan perangkat Rekomendify." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function StatusPill({ state }: { state: PermState }) {
  const map: Record<PermState, { label: string; cls: string }> = {
    granted: { label: "Diizinkan", cls: "bg-primary/10 text-primary" },
    denied: { label: "Ditolak", cls: "bg-destructive/10 text-destructive" },
    prompt: { label: "Belum diminta", cls: "bg-muted text-muted-foreground" },
    unsupported: { label: "Tidak didukung", cls: "bg-muted text-muted-foreground" },
    unknown: { label: "Diminta saat dipakai", cls: "bg-muted text-muted-foreground" },
  };
  const s = map[state];
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.cls}`}>
      {s.label}
    </span>
  );
}

function Card({
  icon: Icon,
  title,
  state,
  children,
}: {
  icon: any;
  title: string;
  state?: PermState;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
          <Icon className="size-4" />
        </span>
        <h2 className="min-w-0 flex-1 truncate font-display text-base">{title}</h2>
        {state && <StatusPill state={state} />}
      </div>
      <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}

function Privacy() {
  const push = usePushSubscription();
  const geo = useDevicePermission("geolocation");
  const cam = useDevicePermission("camera");
  const [busy, setBusy] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showFullDocInline, setShowFullDocInline] = useState(false);

  const notifState: PermState =
    push.permission === "unsupported"
      ? "unsupported"
      : push.permission === "default"
        ? "prompt"
        : (push.permission as PermState);

  const enable = async () => {
    setBusy(true);
    const ok = await push.enable();
    setBusy(false);
    if (ok) toast.success("Notifikasi aktif di perangkat ini.");
    else toast.error(push.error ?? "Notifikasi belum bisa diaktifkan.");
  };

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-5 pt-6 pb-12">
        <Link to="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Pengaturan
        </Link>
        
        <div className="mt-2 flex items-center justify-between gap-2">
          <h1 className="font-display text-3xl">Privasi & Izin</h1>
          <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
            v{PRIVACY_POLICY.lastUpdated}
          </span>
        </div>

        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Rekomendify menjunjung tinggi transparansi dan minimisasi data. Semua izin bersifat opsional — aplikasi tetap dapat digunakan tanpa mengaktifkannya.
        </p>

        {/* Action Callout Banner for Full Privacy Policy Document */}
        <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <FileText className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-semibold text-foreground">
                Dokumen Kebijakan Privasi Lengkap
              </h3>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                Mencakup 31 pasal resmi untuk publikasi website, PWA, Android Capacitor, Supabase, & Google Play Console.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              onClick={() => setModalOpen(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <ShieldCheck className="size-4" />
              Buka Popup Kebijakan
            </button>
            <button
              onClick={() => setShowFullDocInline(!showFullDocInline)}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              {showFullDocInline ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
              {showFullDocInline ? "Sembunyikan Pasal" : "Baca di Sini"}
            </button>
          </div>
        </div>

        {/* Inline Full Document Reader (Collapsible) */}
        {showFullDocInline && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-4 space-y-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                31 Pasal Kebijakan Privasi
              </h2>
              <span className="text-xs text-muted-foreground">{PRIVACY_POLICY.lastUpdated}</span>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs leading-relaxed">
              {PRIVACY_POLICY.sections.map((sec) => (
                <div key={sec.id} className="space-y-1.5 border-b border-border/50 pb-3 last:border-b-0">
                  <p className="font-semibold text-foreground text-sm">
                    {sec.number}. {sec.title}
                  </p>
                  {sec.paragraphs.map((p, idx) => (
                    <p key={idx} className="text-muted-foreground">{p}</p>
                  ))}
                  {sec.bullets && (
                    <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                      {sec.bullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Status Izin Perangkat Saat Ini
        </h2>

        {/* Live Permission Cards */}
        <div className="mt-2 space-y-3">
          <Card icon={Bell} title="Notifikasi" state={push.ready ? notifState : "unknown"}>
            <p>Digunakan agar Anda menerima informasi dan pengumuman dari wilayah yang Anda ikuti.</p>
            {push.ready && notifState === "prompt" && push.supported && (
              <button
                onClick={enable}
                disabled={busy || push.busy}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                {busy || push.busy ? <Loader2 className="size-3.5 animate-spin" /> : <Bell className="size-3.5" />}
                Aktifkan Notifikasi
              </button>
            )}
            {notifState === "granted" && (
              <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <Check className="size-3.5" /> Notifikasi aktif
              </p>
            )}
            {notifState === "denied" && (
              <p className="text-xs">
                Izin sedang dimatikan. Buka pengaturan situs di browser (ikon gembok di address bar → Notifikasi), lalu izinkan. Di Android, bisa juga lewat Setelan → Aplikasi → Notifikasi.
              </p>
            )}
          </Card>

          <Card icon={MapPin} title="Lokasi" state={geo}>
            <p>
              Digunakan untuk mengurutkan tempat terdekat ketika Anda memilih “Terdekat” di halaman Jelajah atau kategori. Posisi Anda diproses secara lokal di perangkat untuk menghitung jarak dan tidak dikirim ke server.
            </p>
            <p className="text-xs">Izin diminta hanya saat Anda menekan tombol tersebut.</p>
          </Card>

          <Card icon={Camera} title="Kamera" state={cam}>
            <p>
              Digunakan hanya ketika Anda membuka fitur Scan QR. Gambar kamera diproses secara langsung pada perangkat Anda untuk membaca kode QR dan tidak diunggah ke server.
            </p>
          </Card>

          <Card icon={HardDrive} title="Penyimpanan di Perangkat">
            <p>Beberapa informasi teknis disimpan di perangkat Anda untuk mendukung performa offline dan PWA:</p>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              <li>Wilayah terakhir yang dikunjungi;</li>
              <li>Tempat yang Anda simpan (favorit);</li>
              <li>Riwayat notifikasi lokal agar dapat dibaca tanpa koneksi internet;</li>
              <li>Status onboarding & preferensi aplikasi;</li>
              <li>Sesi masuk khusus bagi pengelola wilayah (admin).</li>
            </ul>
            <p className="text-xs">Menghapus data situs pada browser akan menghapus data lokal ini.</p>
          </Card>

          <Card icon={BarChart3} title="Statistik Kunjungan & Agregasi">
            <p>
              Mencatat statistik anonim sederhana seperti jumlah kunjungan wilayah/tempat dan interaksi tombol (WhatsApp, Peta, atau Simpan) untuk evaluasi kualitas pemandu. Tidak mencatat nama, nomor HP, atau koordinat presisi pengguna.
            </p>
          </Card>
        </div>

        {/* Action Button: Reset Onboarding Guide */}
        <button
          onClick={() => {
            resetOnboarding();
            toast.success("Panduan izin akan muncul kembali saat halaman dimuat ulang.");
          }}
          className="mt-5 w-full rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
        >
          Tampilkan Lagi Panduan Izin (Onboarding)
        </button>

        {/* Pengelola & Contact Card */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-4 space-y-2 text-xs">
          <p className="font-semibold text-sm text-foreground">Kontak Pengelola Privasi</p>
          <p className="text-muted-foreground">
            <span className="font-medium text-foreground">{PRIVACY_POLICY.contact.managerName}</span> ({PRIVACY_POLICY.appName})
          </p>
          <div className="flex items-center gap-1.5 text-muted-foreground pt-1">
            <Mail className="size-3.5 shrink-0 text-primary" />
            <a href={`mailto:${PRIVACY_POLICY.contact.email}`} className="hover:underline text-foreground">
              {PRIVACY_POLICY.contact.email}
            </a>
          </div>
          <div className="flex items-start gap-1.5 text-muted-foreground">
            <LocationIcon className="size-3.5 shrink-0 text-primary mt-0.5" />
            <span>{PRIVACY_POLICY.contact.address}</span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
          Pengaturan izin sepenuhnya ada di perangkat Anda dan dapat diubah kapan saja.
        </p>

        {/* Privacy Policy Modal Component */}
        <PrivacyPolicyModal open={modalOpen} onOpenChange={setModalOpen} />
      </div>
    </PageShell>
  );
}
