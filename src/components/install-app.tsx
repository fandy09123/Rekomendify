import { useState } from "react";
import { Download, Share, PlusSquare, MoreVertical } from "lucide-react";
import { usePwaInstall } from "@/hooks/use-pwa-install";

/** Panduan manual bila browser tidak menyediakan prompt install. */
export function InstallGuideSheet({ onClose }: { onClose: () => void }) {
  const { platform } = usePwaInstall();
  const steps =
    platform === "ios"
      ? [
          { icon: Share, text: "Ketuk tombol Bagikan di bilah bawah Safari." },
          { icon: PlusSquare, text: "Pilih “Tambahkan ke Layar Utama”." },
          { icon: Download, text: "Ketuk “Tambah” — ikon Rekomendify muncul di layar utama." },
        ]
      : [
          { icon: MoreVertical, text: "Buka menu titik tiga di pojok kanan atas browser." },
          { icon: PlusSquare, text: "Pilih “Instal aplikasi” atau “Tambahkan ke Layar Utama”." },
          { icon: Download, text: "Konfirmasi — Rekomendify terpasang seperti aplikasi biasa." },
        ];

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-black/40 sm:place-items-center" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-card p-6 sm:rounded-3xl">
        <h3 className="font-display text-xl">Pasang Rekomendify</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Browser Anda memasang aplikasi lewat menu berikut.
        </p>
        <ol className="mt-4 space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent">
                <s.icon className="size-4" />
              </span>
              <span className="pt-1.5 text-sm">{s.text}</span>
            </li>
          ))}
        </ol>
        <button onClick={onClose} className="mt-5 w-full rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold">
          Mengerti
        </button>
      </div>
    </div>
  );
}

/**
 * Kartu "Pasang Aplikasi" permanen untuk halaman Pengaturan.
 * Selalu tersedia selama app belum terpasang — bila prompt native tidak ada,
 * pengguna diarahkan ke panduan manual.
 */
export function InstallAppCard() {
  const { canInstall, isInstalled, install } = usePwaInstall();
  const [guide, setGuide] = useState(false);
  const [busy, setBusy] = useState(false);

  if (isInstalled) {
    return (
      <div className="mt-2 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">Aplikasi sudah terpasang</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Anda membuka Rekomendify dari layar utama perangkat ini.
        </p>
      </div>
    );
  }

  const handle = async () => {
    if (!canInstall) return setGuide(true);
    setBusy(true);
    const outcome = await install();
    setBusy(false);
    if (outcome === "unavailable") setGuide(true);
  };

  return (
    <>
      <div className="mt-2 rounded-2xl border border-border bg-card p-4">
        <p className="text-sm font-semibold">Pasang Aplikasi</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Akses lebih cepat, tampil layar penuh seperti aplikasi.
        </p>
        <button
          onClick={handle}
          disabled={busy}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          <Download className="size-4" /> {busy ? "Memuat…" : canInstall ? "Pasang sekarang" : "Lihat cara pasang"}
        </button>
      </div>
      {guide && <InstallGuideSheet onClose={() => setGuide(false)} />}
    </>
  );
}
