import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef, useMemo } from "react";
import QRCode from "qrcode";
import { listQr, generateQrBatch, assignQr, releaseQr, myRegion, markQrPrinted, retireQr, deleteQr } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Plus, Link2, Unlink, Download, QrCode, X, AlertTriangle, RotateCcw, Printer, MapPin, Trash2, CheckCircle2, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/qr")({
  component: QrPage,
});

type Tab = "placed" | "draft" | "released";

/** Derived lifecycle state of one physical acrylic. */
function qrState(q: any) {
  const assignments = (q.qr_assignments ?? []) as any[];
  const active = assignments.find((a) => !a.released_at) ?? null;
  const history = assignments.filter((a) => a.released_at);
  const retired = q.status === "retired";
  return { active, history, retired, printed: !!q.printed_at };
}

function QrPage() {
  const { data: qrs = [], refetch } = useQuery({ queryKey: ["admin-qrs"], queryFn: () => listQr() });
  const [tab, setTab] = useState<Tab>("placed");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showGen, setShowGen] = useState(false);
  const [assigning, setAssigning] = useState<any | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedQr, setScannedQr] = useState<any | null>(null);
  const [scannedError, setScannedError] = useState(false);
  const [scannedCodeText, setScannedCodeText] = useState("");

  useEffect(() => {
    if (scannedError) {
      const timer = setTimeout(() => {
        setScannedError(false);
        setScannedCodeText("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [scannedError]);

  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  /** Pencarian menyisir kode, batch, lokasi, dan catatan pemasangan. */
  const filteredQrs = useMemo(() => {
    if (!needle) return qrs as any[];
    return (qrs as any[]).filter((q) => {
      const s = qrState(q);
      const haystack = [
        q.code,
        q.batch_label,
        s.active?.placement_note,
        s.active?.locations?.name,
        ...s.history.map((h: any) => h?.locations?.name),
      ];
      return haystack.filter(Boolean).some((v: any) => String(v).toLowerCase().includes(needle));
    });
  }, [qrs, needle]);

  const buckets = useMemo(() => {
    const placed: any[] = [];
    const draft: any[] = [];
    const released: any[] = [];
    for (const q of filteredQrs) {
      const s = qrState(q);
      if (s.active) placed.push(q);
      else if (s.retired || s.history.length > 0) released.push(q);
      else draft.push(q);
    }
    // Group placed QRs per location — an acrylic is meaningless without its place.
    type Group = { name: string; slug: string | null; items: any[] };
    const groups = new Map<string, Group>();
    for (const q of placed) {
      const a = qrState(q).active;
      const key = a.location_id ?? "unknown";
      const g: Group = groups.get(key) ?? { name: a.locations?.name ?? "Lokasi tidak diketahui", slug: a.locations?.slug ?? null, items: [] };
      g.items.push(q);
      groups.set(key, g);
    }
    return {
      placed,
      draft,
      released,
      groups: [...groups.values()].sort((a, b) => a.name.localeCompare(b.name)),
      printed: filteredQrs.filter((q) => q.printed_at).length,
    };
  }, [filteredQrs]);

  const visible: any[] = tab === "placed" ? buckets.placed : tab === "draft" ? buckets.draft : buckets.released;
  const selectedRows = (qrs as any[]).filter((q) => selected.has(q.id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleRelease = async (qr: any) => {
    const active = qrState(qr).active;
    if (!active) return;
    if (!confirm("Lepas QR dari lokasi ini? Data analytics lokasi tetap tersimpan.")) return;
    try {
      await releaseQr({ data: { assignment_id: active.id } });
      refetch();
      toast.success("QR dilepas");
      setScannedQr(null);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleScan = (decodedText: string) => {
    const code = extractQrCode(decodedText);
    const found = (qrs as any[]).find((q: any) => q.code.toUpperCase() === code.toUpperCase());
    if (found) {
      setScannedQr(found);
      setShowScanner(false);
      setScannedError(false);
      setScannedCodeText("");
    } else {
      setScannedCodeText(code);
      setScannedError(true);
    }
  };

  const printRows = (rows: any[]) =>
    printQrSheet(
      rows.map((q: any) => ({
        code: q.code,
        label: q.batch_label,
        place: qrState(q).active?.locations?.name ?? null,
      })),
    );

  const markPrinted = async (rows: any[], printed: boolean) => {
    if (rows.length === 0) return;
    try {
      await markQrPrinted({ data: { ids: rows.map((r) => r.id), printed } });
      setSelected(new Set());
      refetch();
      toast.success(printed ? "Ditandai sudah dicetak" : "Tanda cetak dihapus");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl pb-24">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">QR Akrilik</h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            Satu QR = satu akrilik fisik. QR adalah jembatan menuju halaman lokasi — bisa dilepas dan dipindah kapan saja, analytics tetap mengikuti lokasinya.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setShowGen(true)} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"><Plus className="size-4" /> Generate batch</button>
          <button onClick={() => setShowScanner(true)} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted"><QrCode className="size-4" /> Scanner</button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStat label="Total keping" value={qrs.length} />
        <MiniStat label="Terpasang" value={buckets.placed.length} tone="accent" />
        <MiniStat label="Belum dipasang" value={buckets.draft.length} tone="mustard" />
        <MiniStat label="Sudah dicetak" value={buckets.printed} />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {([
          ["placed", `Terpasang (${buckets.placed.length})`],
          ["draft", `Belum dipasang (${buckets.draft.length})`],
          ["released", `Dilepas & pensiun (${buckets.released.length})`],
        ] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSelected(new Set()); }}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              tab === key ? "bg-foreground text-background" : "border border-border bg-card hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="relative mt-4 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari kode QR, batch, atau lokasi…"
          className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-9 text-sm outline-none focus:border-primary"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} aria-label="Bersihkan pencarian"
            className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted">
            <X className="size-3.5" />
          </button>
        )}
      </div>
      {needle && <p className="mt-2 text-xs text-muted-foreground">{filteredQrs.length} dari {qrs.length} keping cocok.</p>}



      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card p-3">
        <button
          onClick={() => setSelected(new Set(visible.map((q) => q.id)))}
          disabled={visible.length === 0}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
        >
          Pilih semua ({visible.length})
        </button>
        <button onClick={() => setSelected(new Set())} disabled={selected.size === 0} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-50">
          Batal pilih
        </button>
        <span className="text-xs text-muted-foreground">{selected.size} dipilih</span>
        <div className="ml-auto flex flex-wrap gap-2">
          <button onClick={() => printRows(selectedRows.length ? selectedRows : visible)} disabled={visible.length === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50">
            <Printer className="size-3.5" /> Cetak lembar
          </button>
          <button onClick={() => markPrinted(selectedRows, true)} disabled={selected.size === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50">
            <CheckCircle2 className="size-3.5" /> Tandai sudah dicetak
          </button>
          <button onClick={() => markPrinted(selectedRows, false)} disabled={selected.size === 0}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted disabled:opacity-50">
            <RotateCcw className="size-3.5" /> Batalkan tanda cetak
          </button>
        </div>
      </div>

      {tab === "placed" ? (
        <div className="mt-4 space-y-4">
          {buckets.groups.map((g: { name: string; slug: string | null; items: any[] }) => (
            <section key={g.name} className="overflow-hidden rounded-2xl border border-border bg-card">
              <header className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-3">
                <MapPin className="size-4 text-primary" />
                <h2 className="font-display text-lg">{g.name}</h2>
                <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold text-accent">{g.items.length} QR</span>
              </header>
              <ul className="divide-y divide-border">
                {g.items.map((q: any) => (
                  <QrRow key={q.id} qr={q} checked={selected.has(q.id)} onToggle={() => toggle(q.id)} onAssign={() => setAssigning(q)} onRelease={() => handleRelease(q)} onRefetch={refetch} />
                ))}
              </ul>
            </section>
          ))}
          {buckets.groups.length === 0 && <EmptyState text="Belum ada QR yang terpasang di lokasi. Buka tab “Belum dipasang” lalu tekan Pasang." />}
        </div>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {visible.map((q: any) => (
              <QrRow key={q.id} qr={q} checked={selected.has(q.id)} onToggle={() => toggle(q.id)} onAssign={() => setAssigning(q)} onRelease={() => handleRelease(q)} onRefetch={refetch} />
            ))}
          </ul>
          {visible.length === 0 && (
            <EmptyState text={tab === "draft" ? "Semua QR sudah terpasang. Generate batch baru bila butuh akrilik tambahan." : "Belum ada QR yang pernah dilepas."} />
          )}
        </div>
      )}

      {showGen && <GenerateDialog onClose={() => setShowGen(false)} onDone={() => { setShowGen(false); refetch(); }} />}
      {assigning && <AssignDialog qr={assigning} onClose={() => setAssigning(null)} onDone={() => { setAssigning(null); refetch(); }} />}
      {showScanner && (
        <AdminQrScannerDialog
          onClose={() => {
            setShowScanner(false);
            setScannedError(false);
            setScannedCodeText("");
          }}
          onScanSuccess={handleScan}
          scannedError={scannedError}
          scannedCodeText={scannedCodeText}
          onDismissError={() => {
            setScannedError(false);
            setScannedCodeText("");
          }}
        />
      )}
      {scannedQr && (
        <QrActionPopup
          // Selalu pakai data terbaru dari daftar agar status di popup ikut ter-update.
          qr={(qrs as any[]).find((q) => q.id === scannedQr.id) ?? scannedQr}
          onClose={() => setScannedQr(null)}
          onDownloadPng={downloadQr}
          onPrintSheet={() => printRows([scannedQr])}
          onTogglePrinted={async (printed) => {
            await markPrinted([scannedQr], printed);
          }}
          onAssign={() => {
            setAssigning(scannedQr);
            setScannedQr(null);
          }}
          onRelease={() => handleRelease(scannedQr)}
          onRetire={async () => {
            const retired = qrState(scannedQr).retired;
            try {
              await retireQr({ data: { id: scannedQr.id, retired: !retired } });
              await refetch();
              toast.success(retired ? "QR diaktifkan kembali" : "QR dipensiunkan");
            } catch (err: any) { toast.error(err.message); }
          }}
          onDelete={async () => {
            if (!confirm(`Hapus QR ${scannedQr.code}? Hanya untuk keping yang belum pernah dipasang.`)) return;
            try {
              await deleteQr({ data: { id: scannedQr.id } });
              setScannedQr(null);
              await refetch();
              toast.success("QR dihapus");
            } catch (err: any) { toast.error(err.message); }
          }}
          onScanAgain={() => {
            setScannedQr(null);
            setShowScanner(true);
          }}
        />
      )}

    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return <p className="p-8 text-center text-sm text-muted-foreground">{text}</p>;
}

function MiniStat({ label, value, tone }: { label: string; value: number; tone?: "accent" | "mustard" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-3xl tabular-nums ${tone === "accent" ? "text-accent" : ""}`}>{value}</p>
    </div>
  );
}

function QrRow({
  qr, checked, onToggle, onAssign, onRelease, onRefetch,
}: { qr: any; checked: boolean; onToggle: () => void; onAssign: () => void; onRelease: () => void; onRefetch: () => void }) {
  const s = qrState(qr);
  return (
    <li className="flex flex-wrap items-center gap-3 p-3">
      <input type="checkbox" checked={checked} onChange={onToggle} className="size-4 shrink-0" aria-label={`Pilih ${qr.code}`} />
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm font-semibold">{qr.code}</p>
        <p className="truncate text-xs text-muted-foreground">
          {qr.batch_label || "Tanpa batch"}
          {s.active?.placement_note ? ` • ${s.active.placement_note}` : ""}
          {!s.active && s.history.length > 0 ? ` • terakhir di ${s.history[s.history.length - 1]?.locations?.name ?? "—"}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {s.retired && <Badge tone="muted">Pensiun</Badge>}
        {s.active ? <Badge tone="accent">Aktif</Badge> : !s.retired && <Badge tone="mustard">Belum dipasang</Badge>}
        {s.printed ? <Badge tone="muted">Sudah dicetak</Badge> : <Badge tone="outline">Belum dicetak</Badge>}
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => downloadQr(qr.code)} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"><Download className="size-3" /> PNG</button>
        {s.active ? (
          <button onClick={onRelease} className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"><Unlink className="size-3" /> Lepas</button>
        ) : (
          <button onClick={onAssign} className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-xs text-primary-foreground"><Link2 className="size-3" /> Pasang</button>
        )}
        {!s.active && (
          <button
            onClick={async () => {
              try { await retireQr({ data: { id: qr.id, retired: !s.retired } }); onRefetch(); toast.success(s.retired ? "QR diaktifkan kembali" : "QR dipensiunkan"); }
              catch (err: any) { toast.error(err.message); }
            }}
            className="rounded-md border border-border px-2 py-1 text-xs hover:bg-muted"
          >
            {s.retired ? "Aktifkan" : "Pensiunkan"}
          </button>
        )}
        {!s.active && s.history.length === 0 && (
          <button
            onClick={async () => {
              if (!confirm(`Hapus QR ${qr.code}? Hanya untuk keping yang belum pernah dipasang.`)) return;
              try { await deleteQr({ data: { id: qr.id } }); onRefetch(); toast.success("QR dihapus"); }
              catch (err: any) { toast.error(err.message); }
            }}
            className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
            aria-label="Hapus QR"
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </li>
  );
}

function Badge({ children, tone }: { children: React.ReactNode; tone: "accent" | "mustard" | "muted" | "outline" }) {
  const cls =
    tone === "accent" ? "bg-accent/15 text-accent"
    : tone === "mustard" ? "bg-mustard/30 text-ink"
    : tone === "muted" ? "bg-muted text-muted-foreground"
    : "border border-border text-muted-foreground";
  return <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${cls}`}>{children}</span>;
}


async function downloadQr(code: string) {
  const url = `${window.location.origin}/q/${code}`;
  const dataUrl = await QRCode.toDataURL(url, { width: 600, margin: 2 });
  const a = document.createElement("a"); a.href = dataUrl; a.download = `${code}.png`; a.click();
}

/** Opens a printable A4 sheet of QR cards, ready for acrylic production. */
async function printQrSheet(rows: { code: string; label?: string | null; place?: string | null }[]) {
  if (rows.length === 0) return;
  const cards = await Promise.all(
    rows.map(async (r) => {
      const target = `${window.location.origin}/q/${r.code}`;
      const img = await QRCode.toDataURL(target, { width: 512, margin: 1 });
      return `<figure class="card">
        <img src="${img}" alt="QR ${r.code}" />
        <figcaption>
          <strong>${r.place ? escapeHtml(r.place) : "Belum ditempatkan"}</strong>
          <span>${escapeHtml(r.code)}</span>
          ${r.label ? `<em>${escapeHtml(r.label)}</em>` : ""}
        </figcaption>
      </figure>`;
    }),
  );
  const w = window.open("", "_blank", "width=900,height=1200");
  if (!w) { toast.error("Popup diblokir browser. Izinkan popup untuk mencetak."); return; }
  w.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8" />
    <title>Lembar Cetak QR Rekomendify</title>
    <style>
      @page { size: A4; margin: 12mm; }
      body { font-family: ui-sans-serif, system-ui, sans-serif; margin: 0; color: #17140f; }
      h1 { font-size: 16px; margin: 0 0 10px; }
      .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10mm; }
      .card { margin: 0; border: 1px dashed #bbb; border-radius: 8px; padding: 6mm; text-align: center; break-inside: avoid; }
      .card img { width: 100%; height: auto; display: block; }
      figcaption { margin-top: 4mm; display: flex; flex-direction: column; gap: 2px; }
      figcaption strong { font-size: 12px; }
      figcaption span { font-family: ui-monospace, monospace; font-size: 10px; color: #555; }
      figcaption em { font-size: 9px; color: #888; font-style: normal; }
      @media print { .noprint { display: none; } }
    </style></head><body>
    <h1>Lembar Cetak QR Rekomendify — ${rows.length} keping</h1>
    <div class="grid">${cards.join("")}</div>
    <script>window.onload=function(){window.print()}<\/script>
    </body></html>`);
  w.document.close();
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}

function GenerateDialog({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [count, setCount] = useState(10);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { const res = await generateQrBatch({ data: { count, label } }); toast.success(`${res.length} QR dibuat`); onDone(); }
    catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };
  return (
    <AdminModal
      title="Generate QR batch"
      subtitle="QR dibuat dalam status draft, aktif otomatis setelah di-assign."
      onClose={onClose}
      onSubmit={submit}
      footer={
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold">Batal</button>
          <button disabled={saving} className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving ? "Membuat…" : "Generate"}</button>
        </div>
      }
    >
      <div className="space-y-3">
        <label className="block"><span className="text-xs font-semibold uppercase text-muted-foreground">Jumlah</span><input type="number" min={1} max={200} value={count} onChange={(e) => setCount(Number(e.target.value))} className="input mt-1" /></label>
        <label className="block"><span className="text-xs font-semibold uppercase text-muted-foreground">Label batch</span><input required value={label} onChange={(e) => setLabel(e.target.value)} className="input mt-1" placeholder="Batch Jan-2026" /></label>
      </div>
    </AdminModal>
  );
}

function AssignDialog({ qr, onClose, onDone }: { qr: any; onClose: () => void; onDone: () => void }) {
  const { data: my } = useQuery({ queryKey: ["my-region"], queryFn: () => myRegion() });
  const [locationId, setLocationId] = useState<string>("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const locations: any[] = my?.locations ?? [];

  // Sama persis dengan panel Promosi: pencarian lokasi di sisi klien.
  const locationOptions: LocationOption[] = useMemo(
    () => locations.map((l) => ({ id: l.id, name: l.name, category: l.categories?.name ?? null })),
    [locations],
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationId) { toast.error("Pilih lokasi terlebih dahulu."); return; }
    setSaving(true);
    try { await assignQr({ data: { qr_id: qr.id, location_id: locationId, placement_note: note || null } }); toast.success("QR ter-assign"); onDone(); }
    catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };
  return (
    <AdminModal
      title="Assign QR ke lokasi"
      subtitle={<span className="font-mono">{qr.code} · {my?.region?.name ?? "—"}</span>}
      onClose={onClose}
      onSubmit={submit}
      footer={
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold">Batal</button>
          <button disabled={saving || !locationId} className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving ? "Menyimpan…" : "Assign"}</button>
        </div>
      }
    >
      <div className="space-y-3">
        <div>
          <span className="text-xs font-semibold uppercase text-muted-foreground">Lokasi</span>
          <div className="mt-1">
            <LocationCombobox
              locations={locationOptions}
              value={locationId}
              onChange={setLocationId}
              required
              placeholder="Cari nama lokasi…"
            />
          </div>
        </div>
        <label className="block"><span className="text-xs font-semibold uppercase text-muted-foreground">Catatan penempatan (opsional)</span><input value={note} onChange={(e) => setNote(e.target.value)} className="input mt-1" placeholder="Di kasir, dekat pintu masuk…" /></label>
      </div>
    </AdminModal>
  );
}


function extractQrCode(text: string): string {
  const trimmed = text.trim();
  try {
    const url = new URL(trimmed);
    const match = url.pathname.match(/\/q\/([^/]+)/);
    if (match && match[1]) {
      return match[1];
    }
  } catch {}

  const pathMatch = trimmed.match(/\/q\/([^/]+)/);
  if (pathMatch && pathMatch[1]) {
    return pathMatch[1];
  }
  return trimmed;
}

interface ScannerDialogProps {
  onClose: () => void;
  onScanSuccess: (code: string) => void;
  scannedError: boolean;
  scannedCodeText: string;
  onDismissError: () => void;
}

function AdminQrScannerDialog({ 
  onClose, 
  onScanSuccess, 
  scannedError, 
  scannedCodeText, 
  onDismissError 
}: ScannerDialogProps) {
  const containerId = "admin-qr-reader";
  const scannerRef = useRef<any>(null);
  const stoppedRef = useRef(false);
  const [status, setStatus] = useState<"starting" | "scanning" | "error">("starting");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
          (decodedText: string) => {
            if (!cancelled) {
              onScanSuccess(decodedText);
            }
          },
          () => {}
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
      if (scannerRef.current && !stoppedRef.current) {
        stoppedRef.current = true;
        const s = scannerRef.current;
        s.stop().then(() => s.clear()).catch(() => {});
      }
    };
  }, [onScanSuccess]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div className="relative w-full max-w-md rounded-3xl bg-card p-6 border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose} 
          aria-label="Tutup" 
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full hover:bg-muted z-20"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-2">
          <QrCode className="size-5 text-primary" />
          <h2 className="font-display text-2xl">Scanner QR Admin</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Arahkan kamera ke QR fisik Rekomendify.
        </p>

        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-black relative">
          <div id={containerId} className="aspect-square w-full" />
          
          {scannedError && (
            <div className="absolute inset-x-4 bottom-4 z-10 rounded-2xl border border-destructive/40 bg-card/95 p-4 text-sm shadow-xl animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-start gap-3">
                <div className="grid size-8 shrink-0 place-items-center rounded-full bg-destructive/15 text-destructive">
                  <AlertTriangle className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-destructive text-xs">QR tidak ditemukan</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground leading-snug">
                    Pastikan QR berasal dari sistem Rekomendify.
                  </p>
                  {scannedCodeText && (
                    <p className="mt-1.5 font-mono text-[9px] break-all bg-muted/80 p-1 rounded border border-border text-muted-foreground max-h-12 overflow-y-auto">
                      {scannedCodeText}
                    </p>
                  )}
                </div>
                <button 
                  onClick={onDismissError} 
                  aria-label="Tutup" 
                  className="grid size-6 place-items-center rounded-full hover:bg-muted text-muted-foreground"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {status === "starting" && (
          <p className="mt-3 text-center text-sm text-muted-foreground animate-pulse">Menyiapkan kamera…</p>
        )}
        {status === "scanning" && (
          <p className="mt-3 text-center text-sm text-muted-foreground">Menunggu QR fisik terdeteksi…</p>
        )}
        {status === "error" && (
          <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm">
            <p className="font-semibold text-destructive">Kamera tidak dapat diakses</p>
            <p className="mt-1 text-muted-foreground text-xs">{errorMsg}</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface ActionPopupProps {
  qr: any;
  onClose: () => void;
  onDownloadPng: (code: string) => void;
  onPrintSheet: () => void;
  onTogglePrinted: (printed: boolean) => void;
  onAssign: () => void;
  onRelease: () => void;
  onRetire: () => void;
  onDelete: () => void;
  onScanAgain: () => void;
}

/**
 * Quick Action Panel hasil scan: seluruh aksi siklus hidup satu keping akrilik
 * tersedia di sini. Aksi utama selalu terlihat, aksi lanjutan disembunyikan
 * di balik "Aksi lainnya" (progressive disclosure) agar popup tetap ringkas.
 */
function QrActionPopup({
  qr, onClose, onDownloadPng, onPrintSheet, onTogglePrinted,
  onAssign, onRelease, onRetire, onDelete, onScanAgain,
}: ActionPopupProps) {
  const s = qrState(qr);
  const active = s.active;
  const last = s.history[s.history.length - 1];
  const [more, setMore] = useState(false);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl border border-border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} aria-label="Tutup" className="absolute right-4 top-4 grid size-8 place-items-center rounded-full hover:bg-muted">
          <X className="size-4" />
        </button>

        <div className="mt-2 flex flex-col items-center text-center">
          <div className="mb-3 grid size-12 place-items-center rounded-full bg-accent/10 text-accent">
            <QrCode className="size-6" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">QR Ditemukan</span>
          <h2 className="mt-1 font-mono text-xl font-bold tracking-tight">{qr.code}</h2>

          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {s.retired && <Badge tone="muted">Pensiun</Badge>}
            {active ? <Badge tone="accent">Terpasang</Badge> : !s.retired && <Badge tone="mustard">Belum dipasang</Badge>}
            {s.printed ? <Badge tone="muted">Sudah dicetak</Badge> : <Badge tone="outline">Belum dicetak</Badge>}
            {qr.batch_label && <Badge tone="outline">{qr.batch_label}</Badge>}
          </div>

          <div className="mt-4 w-full rounded-2xl border border-border bg-muted/30 p-4 text-left text-sm">
            {active ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Terhubung ke lokasi</p>
                <p className="text-sm font-semibold text-foreground">{active.locations?.name || "—"}</p>
                {active.placement_note && (
                  <p className="text-xs text-muted-foreground">Penempatan: {active.placement_note}</p>
                )}
                {active.assigned_at && (
                  <p className="text-[11px] text-muted-foreground">
                    Sejak {new Date(active.assigned_at).toLocaleDateString("id-ID")}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">
                  {s.retired ? "Keping ini sudah dipensiunkan." : "Belum terhubung ke lokasi mana pun."}
                </p>
                {last && (
                  <p className="text-xs text-muted-foreground">
                    Terakhir di <span className="font-semibold text-foreground">{last.locations?.name ?? "—"}</span>
                  </p>
                )}
                <p className="text-[11px] text-muted-foreground">Riwayat penempatan: {s.history.length}×</p>
              </div>
            )}
          </div>
        </div>

        {/* Aksi utama */}
        <div className="mt-5 flex flex-col gap-2">
          {active ? (
            <>
              <button onClick={onAssign} className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
                <MapPin className="size-4" /> Pindahkan ke lokasi lain
              </button>
              <button onClick={onRelease} className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-destructive/40 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/10">
                <Unlink className="size-4" /> Lepas dari lokasi
              </button>
            </>
          ) : (
            <button onClick={onAssign} className="inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              <Link2 className="size-4" /> Pasang ke lokasi
            </button>
          )}
        </div>

        {/* Aksi lanjutan — progressive disclosure */}
        <button
          onClick={() => setMore((v) => !v)}
          aria-expanded={more}
          className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted"
        >
          {more ? "Sembunyikan aksi lainnya" : "Aksi lainnya"}
        </button>

        {more && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <PopupAction icon={Download} label="Unduh PNG" onClick={() => onDownloadPng(qr.code)} />
            <PopupAction icon={Printer} label="Cetak lembar" onClick={onPrintSheet} />
            <PopupAction
              icon={s.printed ? RotateCcw : CheckCircle2}
              label={s.printed ? "Batalkan tanda cetak" : "Tandai sudah dicetak"}
              onClick={() => onTogglePrinted(!s.printed)}
            />
            {active ? (
              <a
                href={`/q/${qr.code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-xs font-semibold hover:bg-muted"
              >
                <MapPin className="size-3.5" /> Buka halaman QR
              </a>
            ) : (
              <PopupAction
                icon={s.retired ? RotateCcw : AlertTriangle}
                label={s.retired ? "Aktifkan kembali" : "Pensiunkan"}
                onClick={onRetire}
              />
            )}
            {!active && s.history.length === 0 && (
              <PopupAction icon={Trash2} label="Hapus keping" onClick={onDelete} destructive />
            )}
          </div>
        )}

        <button
          onClick={onScanAgain}
          className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:border-foreground/40 hover:text-foreground"
        >
          <RotateCcw className="size-3.5" /> Scan QR berikutnya
        </button>
      </div>
    </div>
  );
}

function PopupAction({ icon: Icon, label, onClick, destructive }: { icon: any; label: string; onClick: () => void; destructive?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold ${
        destructive ? "border-destructive/40 text-destructive hover:bg-destructive/10" : "border-border hover:bg-muted"
      }`}
    >
      <Icon className="size-3.5" /> {label}
    </button>
  );
}

