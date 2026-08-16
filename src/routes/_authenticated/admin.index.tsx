import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { myRegion, saveLocation, deleteLocation, saveCategory, deleteCategory, saveCourier, deleteCourier } from "@/lib/admin.functions";
import { Plus, MapPin, Pencil, Trash2, Tag, ExternalLink, Bike, Search, X } from "lucide-react";
import { ImageUploader, GalleryUploader } from "@/components/image-uploader";
import { commitUrl, commitUrls, deleteRemovedImages, removeImagesByUrl } from "@/lib/upload-client";
import { CoordinateField } from "@/components/coordinate-field";
import { AdminPushField, dispatchPush, emptyPushDraft, type PushDraft } from "@/components/admin-push-field";
import { slugify } from "@/lib/slugify";


import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data, refetch } = useQuery({ queryKey: ["my-region"], queryFn: () => myRegion() });
  const [tab, setTab] = useState<"locations" | "categories" | "couriers">("locations");

  if (!data) return <p className="text-sm text-muted-foreground">Memuat…</p>;
  if (!data.region) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-dashed border-border p-8 text-center">
        <h1 className="font-display text-2xl">Wilayah belum terhubung</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Akun Anda belum dikaitkan ke wilayah mana pun. Hubungi tim Rekomendify untuk bantuan.
        </p>
      </div>
    );
  }
  const { region, categories, locations } = data;
  const couriers: any[] = (data as any).couriers ?? [];
  const published = locations.filter((l: any) => l.is_published).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl border border-border bg-card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Wilayah Anda</p>
            <h1 className="mt-1 font-display text-3xl">{region.name}</h1>
            <p className="text-sm text-muted-foreground">/{region.slug}</p>
            {region.tagline && <p className="mt-2 text-sm">{region.tagline}</p>}
          </div>
          <div className="flex gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${region.is_published ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`}>
              {region.is_published ? "PUBLISHED" : "DRAFT"}
            </span>
            {region.is_published && (
              <a href={`/r/${region.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs">
                Buka publik <ExternalLink className="size-3" />
              </a>
            )}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Lokasi" value={locations.length} />
          <Stat label="Terbit" value={published} />
          <Stat label="Kategori" value={categories.length} />
          <Stat label="Featured" value={locations.filter((l: any) => l.is_featured).length} />
        </div>
        <Link to="/admin/region" className="mt-4 inline-block text-sm text-primary hover:underline">Ubah detail wilayah →</Link>
      </div>

      <div className="flex gap-1 border-b border-border">
        {([["locations", `Lokasi (${locations.length})`], ["categories", `Kategori (${categories.length})`], ["couriers", `Kurir (${couriers.length})`]] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`px-4 py-2 text-sm font-medium ${tab === k ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>{l}</button>
        ))}
      </div>

      {tab === "locations" && <LocationsTab categories={categories} locations={locations} regionSlug={region.slug} onChanged={refetch} />}
      {tab === "categories" && <CategoriesTab categories={categories} onChanged={refetch} />}
      {tab === "couriers" && <CouriersTab couriers={couriers} onChanged={refetch} />}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-2xl">{value}</p>
    </div>
  );
}

function CategoriesTab({ categories, onChanged }: { categories: any[]; onChanged: () => void }) {
  const [editing, setEditing] = useState<any | null>(null);
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? categories.filter((c) => [c.name, c.slug].filter(Boolean).some((v: string) => String(v).toLowerCase().includes(needle)))
    : categories;
  return (
    <div>
      <button onClick={() => setEditing({ name: "", icon: "", sort_order: categories.length })} className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        <Plus className="size-4" /> Kategori baru
      </button>
      <SearchInput value={q} onChange={setQ} placeholder="Cari kategori…" />
      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="grid size-10 place-items-center rounded-lg bg-accent/15 text-xl">{c.icon || <Tag className="size-5 text-accent" />}</div>
            <div className="flex-1"><p className="font-medium">{c.name}</p><p className="text-xs text-muted-foreground">/{c.slug}</p></div>
            <button onClick={() => setEditing(c)} className="rounded-md p-2 hover:bg-muted"><Pencil className="size-4" /></button>
            <button onClick={async () => { if (confirm("Hapus kategori?")) { await deleteCategory({ data: { id: c.id } }); onChanged(); } }} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
          </div>
        ))}
        {categories.length === 0 && <p className="col-span-full rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Belum ada kategori.</p>}
        {categories.length > 0 && filtered.length === 0 && <p className="col-span-full rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Tidak ada kategori yang cocok.</p>}
      </div>
      {editing && <CategoryDialog initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChanged(); }} />}
    </div>
  );
}

function CategoryDialog({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState(initial);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await saveCategory({ data: { id: f.id, name: f.name, icon: f.icon || null, sort_order: Number(f.sort_order) || 0 } }); toast.success("Tersimpan"); onSaved(); } catch (err: any) { toast.error(err.message); }
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-card p-6">
        <h2 className="font-display text-2xl">{f.id ? "Edit kategori" : "Kategori baru"}</h2>
        <div className="mt-4 space-y-3">
          <Field label="Nama"><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input" placeholder="Kuliner, Hotel, Wisata…" /></Field>
          <Field label="Icon (emoji, opsional)"><input value={f.icon ?? ""} onChange={(e) => setF({ ...f, icon: e.target.value })} className="input" placeholder="🍜" /></Field>
        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold">Batal</button>
          <button className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">Simpan</button>
        </div>
      </form>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative mb-3 max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-9 text-sm outline-none focus:border-primary"
      />
      {value && (
        <button type="button" onClick={() => onChange("")} aria-label="Bersihkan pencarian"
          className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

function LocationsTab({ categories, locations, regionSlug, onChanged }: { categories: any[]; locations: any[]; regionSlug: string; onChanged: () => void }) {
  const [editing, setEditing] = useState<any | null>(null);
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? locations.filter((l) =>
        [l.name, l.slug, l.price_range, l.hours, categories.find((c) => c.id === l.category_id)?.name]
          .filter(Boolean)
          .some((v: string) => String(v).toLowerCase().includes(needle)),
      )
    : locations;
  return (
    <div>
      <button onClick={() => setEditing({ name: "", coordinates: "", is_published: true, is_featured: false, sort_order: locations.length })} className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        <Plus className="size-4" /> Lokasi baru
      </button>
      <SearchInput value={q} onChange={setQ} placeholder="Cari lokasi, kategori, harga…" />
      {needle && <p className="mb-2 text-xs text-muted-foreground">{filtered.length} dari {locations.length} lokasi</p>}
      <div className="space-y-2">
        {filtered.map((l) => (
          <div key={l.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
              {l.photo_url ? <img src={l.photo_url} alt="" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-muted-foreground"><MapPin className="size-5" /></div>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{l.name}</p>
              <p className="truncate text-xs text-muted-foreground">{categories.find((c) => c.id === l.category_id)?.name ?? "Tanpa kategori"} {l.is_featured && "• ⭐"} {!l.is_published && "• 📦 draft"}</p>
            </div>
            <button onClick={() => setEditing(l)} className="rounded-md p-2 text-muted-foreground hover:bg-muted"><Pencil className="size-4" /></button>
            <button onClick={async () => { if (confirm("Hapus lokasi?")) { await deleteLocation({ data: { id: l.id } }); void removeImagesByUrl([l.photo_url, ...(l.gallery_urls ?? [])]); onChanged(); } }} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
          </div>
        ))}
        {locations.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Belum ada lokasi. Klik "Lokasi baru" untuk menambah.</p>}
        {locations.length > 0 && filtered.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">Tidak ada lokasi yang cocok dengan "{q}".</p>}
      </div>
      {editing && <LocationDialog initial={editing} categories={categories} regionSlug={regionSlug} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChanged(); }} />}
    </div>
  );
}

function LocationDialog({ initial, categories, regionSlug, onClose, onSaved }: { initial: any; categories: any[]; regionSlug: string; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [push, setPush] = useState<PushDraft>(emptyPushDraft());
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Upload staged (already compressed) images only now, on save.
      const photo_url = await commitUrl(f.photo_url);
      const gallery_urls = await commitUrls(Array.isArray(f.gallery_urls) ? f.gallery_urls : []);
      const saved = await saveLocation({ data: {
        id: f.id, category_id: f.category_id || null,
        name: f.name, photo_url, coordinates: f.coordinates || null,
        gallery_urls,
        youtube_url: f.youtube_url || null,
        description: f.description || null, whatsapp: f.whatsapp || null, hours: f.hours || null, price_range: f.price_range || null,
        is_featured: !!f.is_featured, is_published: f.is_published !== false, sort_order: Number(f.sort_order) || 0,
      } });
      // Purge images that were replaced or removed during this edit.
      void deleteRemovedImages(
        [initial.photo_url, ...(Array.isArray(initial.gallery_urls) ? initial.gallery_urls : [])],
        [photo_url, ...gallery_urls],
      );
      toast.success("Tersimpan");
      // Notifikasi hanya relevan untuk lokasi yang benar-benar tayang.
      if (f.is_published !== false) {
        await dispatchPush({
          draft: push,
          entityType: "location",
          entityId: saved?.id ?? null,
          path: `/r/${regionSlug}/${slugify(f.name)}`,
          fallbackTitle: f.name,
          fallbackBody: (f.description ?? "").slice(0, 160) || `Tempat baru di wilayah: ${f.name}`,
        });
      }
      onSaved();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };


  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 overflow-y-auto" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="my-8 w-full max-w-lg rounded-3xl bg-card p-6">
        <h2 className="font-display text-2xl">{f.id ? "Edit lokasi" : "Lokasi baru"}</h2>
        <div className="mt-4 space-y-3">
          <Field label="Nama lokasi"><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input" placeholder="Cafe Senja, Hotel Wilis…" /></Field>
          <Field label="Kategori">
            <select value={f.category_id ?? ""} onChange={(e) => setF({ ...f, category_id: e.target.value || null })} className="input">
              <option value="">— tanpa kategori —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <ImageUploader label="Foto utama" value={f.photo_url} onChange={(url) => setF({ ...f, photo_url: url })} hint="Digunakan sebagai thumbnail & sampul." />
          <GalleryUploader value={f.gallery_urls} onChange={(urls) => setF({ ...f, gallery_urls: urls })} />
          <CoordinateField
            label="Koordinat lokasi (lat,lng) — opsional"
            value={f.coordinates}
            onChange={(v: string) => setF({ ...f, coordinates: v })}
            hint="Kosongkan untuk entri non-fisik seperti lowongan kerja atau pengumuman."
          />
          <Field label="Link YouTube (opsional)"><input value={f.youtube_url ?? ""} onChange={(e) => setF({ ...f, youtube_url: e.target.value })} className="input" placeholder="https://youtu.be/…" /></Field>
          <Field label="Deskripsi"><textarea value={f.description ?? ""} onChange={(e) => setF({ ...f, description: e.target.value })} className="input min-h-20" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="WhatsApp"><input value={f.whatsapp ?? ""} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} className="input" placeholder="+6281…" /></Field>
            <Field label="Harga"><input value={f.price_range ?? ""} onChange={(e) => setF({ ...f, price_range: e.target.value })} className="input" placeholder="Rp 10rb–25rb" /></Field>
          </div>
          <Field label="Jam buka"><input value={f.hours ?? ""} onChange={(e) => setF({ ...f, hours: e.target.value })} className="input" placeholder="08.00–22.00" /></Field>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!f.is_featured} onChange={(e) => setF({ ...f, is_featured: e.target.checked })} /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_published !== false} onChange={(e) => setF({ ...f, is_published: e.target.checked })} /> Published</label>
          </div>
          {f.is_published !== false && (
            <AdminPushField
              value={push}
              onChange={setPush}
              hint="Pengikut wilayah akan menerima notifikasi berisi tautan langsung ke lokasi ini."
              titlePlaceholder={f.name || "Judul notifikasi"}
              bodyPlaceholder="Tempat baru siap dikunjungi!"
            />
          )}

        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold">Batal</button>
          <button disabled={saving} className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving ? "Mengunggah…" : "Simpan"}</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function CouriersTab({ couriers, onChanged }: { couriers: any[]; onChanged: () => void }) {
  const [editing, setEditing] = useState<any | null>(null);
  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        Kurir / ojek lokal ditawarkan ke wisatawan di halaman detail lokasi sebagai alternatif menghubungi pemilik.
      </p>
      <button onClick={() => setEditing({ name: "", whatsapp: "", coordinates: "", is_active: true, sort_order: couriers.length })} className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
        <Plus className="size-4" /> Kurir baru
      </button>
      <div className="grid gap-2 sm:grid-cols-2">
        {couriers.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="grid size-10 place-items-center rounded-lg bg-accent/15 text-accent"><Bike className="size-5" /></div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{c.name}</p>
              <p className="truncate text-xs text-muted-foreground">{c.whatsapp} {!c.is_active && "• nonaktif"}</p>
            </div>
            <button onClick={() => setEditing(c)} className="rounded-md p-2 text-muted-foreground hover:bg-muted"><Pencil className="size-4" /></button>
            <button onClick={async () => { if (confirm("Hapus kurir?")) { await deleteCourier({ data: { id: c.id } }); onChanged(); } }} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
          </div>
        ))}
        {couriers.length === 0 && <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground sm:col-span-2">Belum ada kurir terdaftar.</p>}
      </div>
      {editing && <CourierDialog initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); onChanged(); }} />}
    </div>
  );
}

function CourierDialog({ initial, onClose, onSaved }: { initial: any; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveCourier({ data: {
        id: f.id,
        name: f.name,
        whatsapp: f.whatsapp,
        coordinates: f.coordinates || null,
        is_active: f.is_active !== false,
        sort_order: Number(f.sort_order) || 0,
      } });
      toast.success("Tersimpan"); onSaved();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-card p-6">
        <h2 className="font-display text-2xl">{f.id ? "Edit kurir" : "Kurir baru"}</h2>
        <div className="mt-4 space-y-3">
          <Field label="Nama kurir / ojek"><input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input" placeholder="Ojek Pak Karno" /></Field>
          <Field label="WhatsApp"><input required value={f.whatsapp ?? ""} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} className="input" placeholder="08123456789" /></Field>
          <CoordinateField label="Koordinat pangkalan (opsional)" value={f.coordinates} onChange={(v: string) => setF({ ...f, coordinates: v })} hint="Titik mangkal kurir. Isi manual atau pilih di peta." />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Urutan"><input type="number" value={f.sort_order ?? 0} onChange={(e) => setF({ ...f, sort_order: e.target.value })} className="input" /></Field>
            <label className="mt-6 flex items-center gap-2 text-sm"><input type="checkbox" checked={f.is_active !== false} onChange={(e) => setF({ ...f, is_active: e.target.checked })} /> Aktif</label>
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold">Batal</button>
          <button disabled={saving} className="flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">{saving ? "Menyimpan…" : "Simpan"}</button>
        </div>
      </form>
    </div>
  );
}
