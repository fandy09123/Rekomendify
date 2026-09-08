import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useState } from "react";
import { BarChart3 } from "lucide-react";

// Laporan statistik dimuat on-demand: query berat & komponennya baru diambil
// setelah admin menekan tombol, bukan hanya karena halaman terbuka.
const AnalyticsReport = lazy(() => import("@/components/admin-analytics-report"));

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: AnalyticsPage,
});

const RANGES = [7, 14, 30, 90] as const;

function AnalyticsPage() {
  const [days, setDays] = useState<number>(30);
  const [show, setShow] = useState(false);

  return (
    <div className="mx-auto max-w-5xl pb-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Analytics</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Angka nyata dari wilayah Anda, dihitung langsung di database. Kunjungan mengikuti lokasi & penempatan QR — memindah QR tidak mencampur data.
          </p>
        </div>
        {show && (
          <div className="flex gap-1 rounded-full border border-border bg-card p-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${days === r ? "bg-foreground text-background" : "hover:bg-muted"}`}
              >
                {r} hari
              </button>
            ))}
          </div>
        )}
      </div>

      {!show ? (
        <div className="mt-8 rounded-3xl border border-dashed border-border bg-card p-8 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-accent/15 text-accent">
            <BarChart3 className="size-6" />
          </div>
          <h2 className="mt-3 font-display text-xl">Statistik siap dihitung</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            Perhitungan statistik cukup berat, jadi hanya dijalankan saat Anda memintanya.
          </p>
          <button
            onClick={() => setShow(true)}
            className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
          >
            Tampilkan statistik
          </button>
        </div>
      ) : (
        <Suspense fallback={<p className="mt-6 text-sm text-muted-foreground">Menyiapkan laporan…</p>}>
          <AnalyticsReport days={days} />
        </Suspense>
      )}
    </div>
  );
}
