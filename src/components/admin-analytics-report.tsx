// Laporan statistik admin — dimuat lewat dynamic import hanya ketika admin
// menekan "Tampilkan statistik", sehingga query berat & bundle chart tidak
// ikut pada initial render dashboard.
import { useQuery } from "@tanstack/react-query";
import { myAnalytics } from "@/lib/admin.functions";
import { MessageCircle, Navigation, Bookmark, Share2, TrendingUp, TrendingDown, Minus } from "lucide-react";


const RANGES = [7, 14, 30, 90] as const;

type Summary = {
  region_id: string | null;
  days?: number;
  totals?: { total: number; today: number; yesterday: number; d7: number; prev7: number; d30: number; prev30: number };
  by_source?: Record<string, number>;
  trend?: { day: string; visits: number }[];
  top_locations?: { id: string; name: string; visits: number; whatsapp: number; gmaps: number; saves: number }[];
  top_categories?: { name: string; visits: number }[];
  engagement?: { whatsapp: number; gmaps: number; save: number; share: number };
  qr?: { total: number; printed: number; active: number; draft: number; retired: number };
  content?: { locations: number; published_locations: number; categories: number; info_posts: number };
};

export default function AnalyticsReport({ days }: { days: number }) {
  const { data, isLoading } = useQuery<Summary>({
    queryKey: ["admin-analytics", days],
    queryFn: () => myAnalytics({ data: { days } }),
    // Statistik jarang berubah dalam hitungan menit; hindari refetch berulang
    // saat admin bolak-balik antar tab/rentang.
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
  });

  if (isLoading) return <ReportSkeleton />;
  if (!data?.region_id) {
    return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">Akun Anda belum terhubung ke wilayah aktif.</p>;
  }

  const totals = data.totals ?? { total: 0, today: 0, yesterday: 0, d7: 0, prev7: 0, d30: 0, prev30: 0 };
  const trend = data.trend ?? [];
  const peak = Math.max(1, ...trend.map((t) => t.visits));
  const src = data.by_source ?? {};
  const eng = data.engagement ?? { whatsapp: 0, gmaps: 0, save: 0, share: 0 };
  const topLocations = data.top_locations ?? [];
  const topCategories = (data.top_categories ?? []).filter((c) => c.visits > 0);
  const qr = data.qr;
  const content = data.content;
  const rangeVisits = trend.reduce((a, b) => a + b.visits, 0);
  const conversion = rangeVisits > 0 ? Math.round(((eng.whatsapp + eng.gmaps) / rangeVisits) * 100) : 0;

  return (
    <div>
      <div className="mt-6 grid gap-3 sm:grid-cols-4">

        <Stat label="Hari ini" value={totals.today} delta={delta(totals.today, totals.yesterday)} deltaLabel="vs kemarin" />
        <Stat label="7 hari" value={totals.d7} delta={delta(totals.d7, totals.prev7)} deltaLabel="vs 7 hari sebelumnya" />
        <Stat label="30 hari" value={totals.d30} delta={delta(totals.d30, totals.prev30)} deltaLabel="vs 30 hari sebelumnya" />
        <Stat label="Total sepanjang waktu" value={totals.total} />
      </div>

      <h2 className="mt-8 font-display text-xl">Tren {days} hari terakhir</h2>
      <div className="mt-3 rounded-2xl border border-border bg-card p-4">
        <div className="flex h-40 items-end gap-1">
          {trend.map((b) => (
            <div key={b.day} className="group flex flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[10px] tabular-nums text-muted-foreground opacity-0 transition group-hover:opacity-100">{b.visits}</span>
              <div
                className="w-full rounded-t bg-primary/80 transition group-hover:bg-primary"
                style={{ height: `${Math.max(2, (b.visits / peak) * 100)}%` }}
                title={`${b.day}: ${b.visits} kunjungan`}
              />
            </div>
          ))}
          {trend.length === 0 && <p className="w-full text-center text-sm text-muted-foreground">Belum ada kunjungan pada rentang ini.</p>}
        </div>
        {trend.length > 0 && (
          <div className="mt-2 flex gap-1">
            {trend.map((b, i) => (
              <span key={b.day} className="flex-1 text-center text-[9px] tabular-nums text-muted-foreground">
                {i % Math.ceil(trend.length / 10) === 0 ? new Date(b.day).getDate() : ""}
              </span>
            ))}
          </div>
        )}
      </div>

      <h2 className="mt-8 font-display text-xl">Sumber kunjungan</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        <Stat label="Scan QR" value={src.qr ?? 0} />
        <Stat label="GPS / wilayah" value={src.gps ?? 0} />
        <Stat label="Langsung" value={src.direct ?? 0} />
      </div>

      <h2 className="mt-8 font-display text-xl">Aksi wisatawan</h2>
      <p className="text-sm text-muted-foreground">Sinyal konversi nyata: {conversion}% kunjungan berlanjut ke WhatsApp atau rute Google Maps.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <Stat label="Chat WhatsApp" value={eng.whatsapp} icon={<MessageCircle className="size-4" />} />
        <Stat label="Buka rute Maps" value={eng.gmaps} icon={<Navigation className="size-4" />} />
        <Stat label="Disimpan" value={eng.save} icon={<Bookmark className="size-4" />} />
        <Stat label="Dibagikan" value={eng.share} icon={<Share2 className="size-4" />} />
      </div>

      <h2 className="mt-8 font-display text-xl">Lokasi teratas</h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
        <ul className="divide-y divide-border">
          {topLocations.map((l, i) => (
            <li key={l.id} className="flex items-center gap-3 p-3">
              <span className="w-6 shrink-0 text-center font-display text-lg text-muted-foreground">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{l.name}</p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((l.visits / Math.max(1, topLocations[0]?.visits ?? 1)) * 100)}%` }} />
                </div>
              </div>
              <div className="shrink-0 text-right text-xs text-muted-foreground">
                <p className="font-display text-lg tabular-nums text-foreground">{l.visits}</p>
                <p className="tabular-nums">{l.whatsapp} WA · {l.gmaps} rute · {l.saves} simpan</p>
              </div>
            </li>
          ))}
        </ul>
        {topLocations.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Belum ada lokasi di wilayah Anda.</p>}
      </div>

      {topCategories.length > 0 && (
        <>
          <h2 className="mt-8 font-display text-xl">Kategori teratas</h2>
          <div className="mt-3 space-y-2">
            {topCategories.map((c) => (
              <div key={c.name} className="flex items-center justify-between rounded-xl border border-border bg-card p-3">
                <span className="font-medium">{c.name}</span>
                <span className="text-sm tabular-nums text-muted-foreground">{c.visits} kunjungan</span>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="mt-8 font-display text-xl">Kondisi wilayah</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-4">
        <Stat label="Lokasi tayang" value={content?.published_locations ?? 0} sub={`dari ${content?.locations ?? 0} lokasi`} />
        <Stat label="Kategori" value={content?.categories ?? 0} />
        <Stat label="Info lokal" value={content?.info_posts ?? 0} />
        <Stat label="QR terpasang" value={qr?.active ?? 0} sub={`${qr?.draft ?? 0} belum dipasang · ${qr?.printed ?? 0} dicetak`} />
      </div>
    </div>
  );
}

function delta(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function Stat({
  label, value, sub, delta: d, deltaLabel, icon,
}: { label: string; value: number; sub?: string; delta?: number | null; deltaLabel?: string; icon?: React.ReactNode }) {
  const Trend = d == null ? Minus : d > 0 ? TrendingUp : d < 0 ? TrendingDown : Minus;
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-1 font-display text-3xl tabular-nums">{value}</p>
      {d != null && (
        <p className={`mt-0.5 inline-flex items-center gap-1 text-[11px] font-semibold ${d > 0 ? "text-accent" : d < 0 ? "text-destructive" : "text-muted-foreground"}`}>
          <Trend className="size-3" /> {d > 0 ? "+" : ""}{d}% <span className="font-normal text-muted-foreground">{deltaLabel}</span>
        </p>
      )}
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
