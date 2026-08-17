import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/rekomendify";
import { QrCode, AlertTriangle, X, Camera } from "lucide-react";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan QR — Rekomendify" },
      { name: "description", content: "Pindai QR resmi Rekomendify untuk membuka halaman wilayah atau lokasi." },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const containerId = "qr-reader";
  const scannerRef = useRef<any>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "scanning" | "error">("idle");
  // Kamera baru dinyalakan setelah pengguna menekan tombol (just-in-time permission).
  const [armed, setArmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rejected, setRejected] = useState<null | { url: string; reason: string }>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!armed) return;
    let cancelled = false;
    stoppedRef.current = false;

    (async () => {
      try {
        setStatus("starting");
        const mod = await import("html5-qrcode");
        if (cancelled) return;
        const { Html5Qrcode } = mod;
        const scanner = new Html5Qrcode(containerId, { verbose: false });
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText: string) => handleDecoded(decodedText),
          () => {},
        );
        if (!cancelled) setStatus("scanning");
      } catch (e: any) {
        console.error(e);
        if (!cancelled) {
          setErrorMsg(e?.message || "Tidak dapat mengakses kamera.");
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [armed]);

  async function stopScanner() {
    if (stoppedRef.current) return;
    stoppedRef.current = true;
    const s = scannerRef.current;
    if (!s) return;
    try {
      await s.stop();
      await s.clear();
    } catch {}
  }

  async function handleDecoded(text: string) {
    if (rejected) return; // waiting for user
    // Only accept URLs whose host matches the current site host.
    let url: URL | null = null;
    try {
      url = new URL(text);
    } catch {
      // Not a URL — reject
      await stopScanner();
      setRejected({ url: text, reason: "QR ini bukan tautan Rekomendify." });
      return;
    }
    const currentHost = window.location.hostname.replace(/^www\./, "").toLowerCase();
    const qrHost = url.hostname.replace(/^www\./, "").toLowerCase();
    if (qrHost !== currentHost) {
      await stopScanner();
      setRejected({
        url: text,
        reason: `QR berasal dari domain "${url.hostname}", bukan dari website Rekomendify resmi.`,
      });
      return;
    }
    // Same domain → navigate internally (client-side).
    await stopScanner();
    const internalPath = url.pathname + url.search + url.hash;
    navigate({ to: internalPath || "/", replace: true });
  }

  async function retry() {
    setRejected(null);
    setErrorMsg(null);
    stoppedRef.current = false;
    scannerRef.current = null;
    setStatus("idle");
    // Re-mount by toggling — simpler: reload the effect via key trick
    // Force re-init:
    setTimeout(() => {
      const evt = new Event("scan-restart");
      window.dispatchEvent(evt);
    }, 50);
    // Simpler: reload the whole route
    window.location.reload();
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-5 pt-8">
        <div className="flex items-center gap-2">
          <QrCode className="size-5 text-primary" />
          <h1 className="font-display text-2xl">Scan QR</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Arahkan kamera ke QR resmi Rekomendify. QR dari domain lain akan ditolak.
        </p>

        {!armed ? (
          <div className="mt-5 rounded-3xl border border-border bg-card p-5">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-accent/12 text-accent">
                <Camera className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">Rekomendify membutuhkan kamera untuk memindai QR Code.</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Kamera hanya aktif di halaman ini dan gambarnya diproses langsung di perangkat Anda —
                  tidak diunggah ke mana pun. Setelah menekan tombol, browser akan menanyakan izin.
                </p>
              </div>
            </div>
            <button
              onClick={() => setArmed(true)}
              className="mt-4 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Buka Kamera
            </button>
          </div>
        ) : (
          <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-black">
            <div id={containerId} className="aspect-square w-full" />
          </div>
        )}

        {status === "starting" && (
          <p className="mt-3 text-center text-sm text-muted-foreground">Menyiapkan kamera…</p>
        )}
        {status === "scanning" && (
          <p className="mt-3 text-center text-sm text-muted-foreground">Menunggu QR…</p>
        )}
        {status === "error" && (
          <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <p className="font-semibold text-destructive">Kamera tidak dapat diakses</p>
            <p className="mt-1 text-muted-foreground">{errorMsg}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Izin kamera mungkin sedang ditolak. Buka pengaturan situs di browser (ikon gembok pada address
              bar → Kamera) lalu izinkan, dan pastikan situs dibuka lewat HTTPS. Anda tetap bisa membuka
              wilayah tanpa memindai QR.
            </p>
          </div>
        )}
      </div>

      {rejected && (
        <div className="fixed inset-0 z-50 grid place-items-end bg-black/50 sm:place-items-center" onClick={retry}>
          <div className="w-full max-w-md rounded-t-3xl bg-card p-6 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
                <AlertTriangle className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-lg">QR tidak valid</h3>
                <p className="mt-1 text-sm text-muted-foreground">{rejected.reason}</p>
                <p className="mt-2 break-all rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">{rejected.url}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Anda tetap berada di dalam Rekomendify. Kami tidak membuka tautan eksternal.
                </p>
              </div>
              <button onClick={retry} aria-label="Tutup" className="grid size-8 place-items-center rounded-full hover:bg-muted">
                <X className="size-4" />
              </button>
            </div>
            <button
              onClick={retry}
              className="mt-5 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
            >
              Coba pindai lagi
            </button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
