import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/rekomendify";
import { ArrowLeft, Bell, MapPin, Camera, HardDrive, BarChart3, Check, Loader2 } from "lucide-react";
import { usePushSubscription } from "@/hooks/use-push-subscription";
import { useDevicePermission, type PermState } from "@/components/permission-status";
import { resetOnboarding } from "@/lib/onboarding";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/privasi")({
  head: () => ({
    meta: [
      { title: "Privasi & Izin — Rekomendify" },
      { name: "description", content: "Penjelasan sederhana tentang izin perangkat yang digunakan Rekomendify: notifikasi, lokasi, kamera, dan penyimpanan di perangkat." },
      { property: "og:title", content: "Privasi & Izin Rekomendify" },
      { property: "og:description", content: "Izin apa yang dipakai Rekomendify dan kenapa." },
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
  return <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${s.cls}`}>{s.label}</span>;
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
      <div className="mx-auto max-w-md px-5 pt-6">
        <Link to="/settings" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Pengaturan
        </Link>
        <h1 className="mt-2 font-display text-3xl">Privasi & Izin</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Rekomendify hanya menggunakan beberapa informasi yang diperlukan untuk menjalankan fitur tertentu.
          Semua izin di bawah bersifat opsional — aplikasi tetap bisa dipakai tanpa mengaktifkannya.
        </p>

        <div className="mt-5 space-y-3">
          <Card icon={Bell} title="Notifikasi" state={push.ready ? notifState : "unknown"}>
            <p>Digunakan agar Anda menerima informasi dari wilayah yang Anda ikuti.</p>
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
                Izin sedang dimatikan. Buka pengaturan situs di browser (ikon gembok di address bar → Notifikasi),
                lalu izinkan. Di Android, bisa juga lewat Setelan → Aplikasi → Notifikasi.
              </p>
            )}
          </Card>

          <Card icon={MapPin} title="Lokasi" state={geo}>
            <p>
              Digunakan untuk mengurutkan tempat terdekat ketika Anda memilih “Terdekat” di halaman Jelajah
              atau kategori. Posisi Anda diproses di perangkat untuk menghitung jarak dan tidak dikirim ke server.
            </p>
            <p className="text-xs">Izin diminta hanya saat Anda menekan tombol tersebut.</p>
          </Card>

          <Card icon={Camera} title="Kamera" state={cam}>
            <p>
              Digunakan hanya ketika Anda membuka fitur Scan QR. Gambar kamera diproses di perangkat untuk
              membaca kode QR dan tidak diunggah ke mana pun.
            </p>
          </Card>

          <Card icon={HardDrive} title="Penyimpanan di perangkat">
            <p>Beberapa hal disimpan di perangkat Anda agar aplikasi bekerja lebih baik:</p>
            <ul className="list-disc space-y-1 pl-5 text-xs">
              <li>wilayah terakhir yang dikunjungi;</li>
              <li>tempat yang Anda simpan (favorit);</li>
              <li>riwayat notifikasi yang pernah masuk, agar bisa dibuka offline;</li>
              <li>status onboarding & banner pemasangan aplikasi;</li>
              <li>sesi masuk, khusus untuk pengelola wilayah yang login.</li>
            </ul>
            <p className="text-xs">Menghapus data situs di browser akan menghapus semuanya.</p>
          </Card>

          <Card icon={BarChart3} title="Statistik kunjungan">
            <p>
              Agar pengelola wilayah tahu seberapa ramai halamannya, kami mencatat kejadian sederhana:
              halaman wilayah/lokasi yang dibuka, sumbernya (QR atau langsung), dan tindakan seperti membuka
              WhatsApp, peta, menyimpan, atau membagikan. Catatan ini tidak berisi nama, nomor, atau titik
              lokasi Anda.
            </p>
            <p className="text-xs">
              Saat Anda mengaktifkan notifikasi, perangkat ini terdaftar di server lewat alamat langganan
              notifikasi dari browser (beserta jenis browser/perangkat) supaya pesan bisa dikirim ke sini.
              Mematikan notifikasi menghentikannya.
            </p>
          </Card>
        </div>

        <button
          onClick={() => {
            resetOnboarding();
            toast.success("Panduan izin akan muncul lagi saat halaman dimuat ulang.");
          }}
          className="mt-5 w-full rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold"
        >
          Tampilkan lagi panduan izin
        </button>

        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Pengaturan izin sepenuhnya ada di browser/perangkat Anda dan bisa diubah kapan saja. Rekomendify
          tidak dapat mengaktifkan izin tanpa persetujuan Anda.
        </p>
      </div>
    </PageShell>
  );
}
