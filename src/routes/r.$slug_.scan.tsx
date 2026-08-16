import { createFileRoute, useNavigate, Link, notFound } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageShell } from "@/components/rekomendify";
import { QrCode, AlertTriangle, X, ArrowLeft } from "lucide-react";
import { getRegionBySlug } from "@/lib/public.functions";

export const Route = createFileRoute("/r/$slug_/scan")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData({
      queryKey: ["region", params.slug],
      queryFn: () => getRegionBySlug({ data: { slug: params.slug } }),
    });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `Scan QR — ${loaderData?.region?.name ?? "Rekomendify"}` },
      { name: "description", content: "Pindai QR resmi Rekomendify untuk membuka halaman lokasi." },
    ],
  }),
  component: RegionScanPage,
  errorComponent: ({ error }) => <div className="p-8 text-center text-sm">{error.message}</div>,
  notFoundComponent: () => <div className="p-8 text-center">Wilayah tidak ditemukan.</div>,
});

function RegionScanPage() {
  const { slug } = Route.useParams();
  const data = Route.useLoaderData();
  const navigate = useNavigate();
  const containerId = "qr-reader";
  const scannerRef = useRef<any>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "scanning" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rejected, setRejected] = useState<null | { url: string; reason: string }>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
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
  }, []);

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
    if (rejected) return;
    let url: URL | null = null;
    try {
      url = new URL(text);
    } catch {
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
    await stopScanner();
    const internalPath = url.pathname + url.search + url.hash;
    navigate({ to: internalPath || "/", replace: true });
  }

  function retry() {
    setRejected(null);
    setErrorMsg(null);
    window.location.reload();
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-md px-5 pt-6">
        <Link to="/r/$slug" params={{ slug }} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {data?.region?.name ?? "Kembali"}
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <QrCode className="size-5 text-primary" />
          <h1 className="font-display text-2xl">Scan QR</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Arahkan kamera ke QR resmi Rekomendify. Anda tetap di dalam wilayah ini.
        </p>

        <div className="mt-5 overflow-hidden rounded-3xl border border-border bg-black">
          <div id={containerId} className="aspect-square w-full" />
        </div>

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
            <p className="mt-2 text-xs text-muted-foreground">
              Pastikan Anda mengizinkan akses kamera pada browser dan membuka situs via HTTPS.
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
