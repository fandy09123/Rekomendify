import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { myRegion } from "@/lib/admin.functions";
import { listAds, myCredits, saveAd, deleteAd, activateAd, setAdPaused } from "@/lib/ads.functions";
import { Plus, Pencil, Trash2, Megaphone, Coins, Play, Pause, Sparkles, Target } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader } from "@/components/image-uploader";
import { commitUrl, removeImagesByUrl } from "@/lib/upload-client";
import { LocationCombobox, LocationMultiSelect, type LocationOption } from "@/components/location-selector";
import { AdminModal } from "@/components/admin-modal";


export const Route = createFileRoute("/_authenticated/admin/iklan")({
  component: AdminAdsPage,
});

const PLACEMENT_LABEL: Record<string, string> = {
  banner: "Banner Beranda",
  featured: "Sorotan Kategori",
  contextual: "Promosi Kontekstual",
};

function statusLabel(ad: any) {
  if (ad.end_at && new Date(ad.end_at) <= new Date()) return { text: "Kedaluwarsa", cls: "bg-muted text-muted-foreground" };
  if (ad.status === "active") return { text: "Tayang", cls: "bg-primary/12 text-primary" };
  if (ad.status === "paused") return { text: "Dijeda", cls: "bg-mustard/40 text-ink" };
  return { text: "Draf", cls: "bg-muted text-muted-foreground" };
}

function AdminAdsPage() {
  const { data: region } = useQuery({ queryKey: ["my-region"], queryFn: () => myRegion() });
  const { data: ads, refetch } = useQuery({ queryKey: ["my-ads"], queryFn: () => listAds() });
  const { data: credits, refetch: refetchCredits } = useQuery({ queryKey: ["my-credits"], queryFn: () => myCredits() });
  const [editing, setEditing] = useState<any | null>(null);
  const [activating, setActivating] = useState<any | null>(null);

  if (!region?.region) return <p className="text-sm text-muted-foreground">Wilayah belum terhubung ke akun Anda.</p>;
  const list = ads ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl">Iklan & Promosi</h1>
          <p className="text-sm text-muted-foreground">Kelola promosi berbayar di {region.region.name}.</p>
        </div>
        <button
          onClick={() => setEditing({ placement: "banner", title: "", target_ids: [] })}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> Iklan baru
        </button>
      </div>

      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
        <span className="grid size-11 place-items-center rounded-xl bg-mustard/40 text-ink"><Coins className="size-5" /></span>
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Kredit promosi</p>
          <p className="font-display text-2xl leading-tight">{credits?.balance ?? 0}</p>
        </div>
        <p className="max-w-[16rem] text-right text-xs text-muted-foreground">
          Penambahan kredit dilakukan oleh operator Rekomendify setelah pembayaran diverifikasi.
        </p>
      </div>

      <div className="mt-5 space-y-2">
        {list.length === 0 && (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Megaphone className="size-6" /></div>
            <p className="mt-3 font-display text-lg">Belum ada iklan</p>
            <p className="text-sm text-muted-foreground">Buat promosi pertama untuk mitra usaha wilayah Anda.</p>
          </div>
        )}
        {list.map((ad: any) => {
          const st = statusLabel(ad);
          return (
            <div key={ad.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
              <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                {ad.image_url ? <img src={ad.image_url} alt="" loading="lazy" decoding="async" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-muted-foreground"><Megaphone className="size-5" /></div>}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-medium">{ad.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${st.cls}`}>{st.text}</span>
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {PLACEMENT_LABEL[ad.placement]}
                  {ad.locations?.name ? ` • ${ad.locations.name}` : ""}
                  {ad.end_at ? ` • s/d ${new Date(ad.end_at).toLocaleDateString("id-ID")}` : ""}
                  {ad.credits_spent ? ` • ${ad.credits_spent} kredit` : ""}
                </p>
              </div>
              {ad.status === "active" || ad.status === "paused" ? (
                <button
                  title={ad.status === "active" ? "Jeda" : "Lanjutkan"}
                  onClick={async () => {
                    try {
                      await setAdPaused({ data: { id: ad.id, paused: ad.status === "active" } });
                      toast.success(ad.status === "active" ? "Iklan dijeda." : "Iklan tayang kembali.");
                      refetch();
                    } catch (e: any) { toast.error(e.message); }
                  }}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted"
                >
                  {ad.status === "active" ? <Pause className="size-4" /> : <Play className="size-4" />}
                </button>
              ) : null}
              <button title="Aktifkan" onClick={() => setActivating(ad)} className="rounded-md p-2 text-primary hover:bg-primary/10"><Sparkles className="size-4" /></button>
              <button onClick={() => setEditing({ ...ad, target_ids: (ad.ad_targets ?? []).map((t: any) => t.location_id) })} className="rounded-md p-2 text-muted-foreground hover:bg-muted"><Pencil className="size-4" /></button>
              <button
                onClick={async () => {
                  if (!confirm("Hapus iklan ini? Kredit yang sudah dipakai tidak dikembalikan.")) return;
                  await deleteAd({ data: { id: ad.id } });
                  void removeImagesByUrl([ad.image_url]);
                  toast.success("Terhapus");
                  refetch();
                }}
                className="rounded-md p-2 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          );
        })}
      </div>

      {(credits?.ledger?.length ?? 0) > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl">Riwayat kredit</h2>
          <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-card">
            {credits!.ledger.map((l: any) => (
              <div key={l.id} className="flex items-center gap-3 p-3 text-sm">
                <span className={`font-semibold ${l.delta < 0 ? "text-destructive" : "text-primary"}`}>{l.delta > 0 ? `+${l.delta}` : l.delta}</span>
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{l.reason}</span>
                <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleDateString("id-ID")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {editing && (
        <AdDialog
          initial={editing}
          region={region}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refetch(); }}
        />
      )}

      {activating && (
        <ActivateDialog
          ad={activating}
          prices={credits?.prices ?? []}
          balance={credits?.balance ?? 0}
          onClose={() => setActivating(null)}
          onDone={() => { setActivating(null); refetch(); refetchCredits(); }}
        />
      )}
    </div>
  );
}

function AdDialog({ initial, region, onClose, onSaved }: { initial: any; region: any; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState<any>({ description: "", image_url: null, ...initial });
  const [saving, setSaving] = useState(false);
  const rawLocations: any[] = region.locations ?? [];
  const categories = region.categories ?? [];
  const targets: string[] = f.target_ids ?? [];

  // Siapkan LocationOption agar combobox bisa menampilkan nama kategori
  const locationOptions: LocationOption[] = useMemo(
    () =>
      rawLocations.map((l) => ({
        id: l.id,
        name: l.name,
        category: l.categories?.name ?? null,
      })),
    [rawLocations],
  );

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const image_url = await commitUrl(f.image_url ?? null);
      await saveAd({
        data: {
          id: f.id,
          placement: f.placement,
          title: f.title,
          description: f.description || null,
          image_url,
          location_id: f.location_id || null,
          category_id: f.category_id || null,
          host_location_id: f.host_location_id || null,
          sort_order: Number(f.sort_order ?? 0),
          target_ids: f.placement === "banner" ? targets : [],
        },
      });
      toast.success("Iklan tersimpan. Aktifkan untuk mulai tayang.");
      onSaved();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminModal
      title={f.id ? "Ubah iklan" : "Iklan baru"}
      size="lg"
      onClose={onClose}
      onSubmit={save}
      footer={
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold">Batal</button>
          <button disabled={saving} className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">{saving ? "Menyimpan…" : "Simpan"}</button>
        </div>
      }
    >
      <div className="space-y-4">


        <label className="block text-sm">Penempatan
          <select value={f.placement} onChange={(e) => setF({ ...f, placement: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2">
            <option value="banner">Banner Beranda</option>
            <option value="featured">Sorotan Kategori</option>
            <option value="contextual">Promosi Kontekstual</option>
          </select>
        </label>

        <label className="block text-sm">Judul
          <input required maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" />
        </label>

        <label className="block text-sm">Deskripsi singkat
          <textarea maxLength={500} rows={2} value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2" />
        </label>

        <ImageUploader value={f.image_url} onChange={(url) => setF({ ...f, image_url: url })} label="Gambar promosi" lockAspect={16 / 9} hint="Rasio dikunci 16:9 agar banner beranda tampil konsisten." />

        {/* ── Lokasi yang dipromosikan — searchable single select ── */}
        <div className="text-sm">
          <p className="mb-1 font-medium">Lokasi yang dipromosikan{f.placement === "banner" ? " (opsional)" : ""}</p>
          <LocationCombobox
            locations={locationOptions}
            value={f.location_id ?? ""}
            onChange={(id) => setF((s: any) => ({ ...s, location_id: id }))}
          />
        </div>

        {f.placement === "featured" && (
          <label className="block text-sm">Kategori tempat disorot (opsional)
            <select value={f.category_id ?? ""} onChange={(e) => setF({ ...f, category_id: e.target.value })} className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2">
              <option value="">Semua kategori</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
        )}

        {/* ── Contextual: host location — searchable single select ── */}
        {f.placement === "contextual" && (
          <div className="text-sm">
            <p className="mb-1 font-medium">Tayang di halaman lokasi</p>
            <LocationCombobox
              locations={locationOptions}
              value={f.host_location_id ?? ""}
              onChange={(id) => setF((s: any) => ({ ...s, host_location_id: id }))}
              required
            />
          </div>
        )}

        {/* ── Banner: target locations — searchable multi-select ── */}
        {f.placement === "banner" && (
          <div className="text-sm">
            <p className="mb-1.5 flex items-center gap-1.5 font-medium">
              <Target className="size-4 text-accent" />
              Lokasi tujuan tambahan
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                {targets.length}/5
              </span>
            </p>
            <LocationMultiSelect
              locations={locationOptions}
              selectedIds={targets}
              onChange={(ids) => {
                if (ids.length > 5) { toast.error("Maksimal 5 lokasi tujuan."); return; }
                setF((s: any) => ({ ...s, target_ids: ids }));
              }}
              max={5}
            />
          </div>
        )}
      </div>
    </AdminModal>

  );
}

function ActivateDialog({ ad, prices, balance, onClose, onDone }: { ad: any; prices: any[]; balance: number; onClose: () => void; onDone: () => void }) {
  const options = useMemo(
    () => prices.filter((p) => p.placement === ad.placement).sort((a, b) => a.duration_days - b.duration_days),
    [prices, ad.placement],
  );
  const [days, setDays] = useState<number>(options[0]?.duration_days ?? 7);
  const [busy, setBusy] = useState(false);
  const cost = options.find((o) => o.duration_days === days)?.credits ?? 0;

  return (
    <AdminModal
      title="Aktifkan iklan"
      subtitle={`${ad.title} — ${PLACEMENT_LABEL[ad.placement]}`}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold">Batal</button>
          <button
            disabled={busy || options.length === 0 || balance < cost}
            onClick={async () => {
              setBusy(true);
              try {
                await activateAd({ data: { id: ad.id, duration_days: days } });
                toast.success(`Iklan tayang ${days} hari. ${cost} kredit terpakai.`);
                onDone();
              } catch (e: any) { toast.error(e.message); } finally { setBusy(false); }
            }}
            className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Memproses…" : "Aktifkan"}
          </button>
        </div>
      }
    >
      <div className="space-y-2">
        {options.map((o) => (
          <button
            key={o.duration_days}
            onClick={() => setDays(o.duration_days)}
            className={`flex min-h-12 w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm ${days === o.duration_days ? "border-primary bg-primary/5" : "border-border"}`}
          >
            <span className="font-semibold">{o.duration_days} hari</span>
            <span className="text-muted-foreground">{o.credits} kredit</span>
          </button>
        ))}
        {options.length === 0 && <p className="text-sm text-muted-foreground">Paket harga belum tersedia.</p>}
      </div>

      <p className="mt-4 text-sm">
        Saldo: <span className="font-semibold">{balance}</span> kredit → sisa setelah aktivasi:{" "}
        <span className={`font-semibold ${balance - cost < 0 ? "text-destructive" : ""}`}>{balance - cost}</span>
      </p>
    </AdminModal>
  );

}
