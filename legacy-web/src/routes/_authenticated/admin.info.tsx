import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { myRegion, listMyInfoPosts, saveInfoPost, deleteInfoPost } from "@/lib/admin.functions";
import { Plus, Pencil, Trash2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { ImageUploader, GalleryUploader } from "@/components/image-uploader";
import { commitUrl, commitUrls, deleteRemovedImages, removeImagesByUrl } from "@/lib/upload-client";
import { AdminPushField, dispatchPush, emptyPushDraft, type PushDraft } from "@/components/admin-push-field";


export const Route = createFileRoute("/_authenticated/admin/info")({
  component: AdminInfoPage,
});

function AdminInfoPage() {
  const { data: region } = useQuery({ queryKey: ["my-region"], queryFn: () => myRegion() });
  const { data: posts, refetch } = useQuery({ queryKey: ["my-info-posts"], queryFn: () => listMyInfoPosts() });
  const [editing, setEditing] = useState<any | null>(null);

  if (!region?.region) return <p className="text-sm text-muted-foreground">Wilayah belum terhubung ke akun Anda.</p>;
  const categories = region.categories ?? [];
  const list = posts ?? [];

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Info Lokal</h1>
          <p className="text-sm text-muted-foreground">Pengumuman & kabar untuk warga {region.region.name}.</p>
        </div>
        <button onClick={() => setEditing({ title: "", body: "", is_published: true })} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <Plus className="size-4" /> Info baru
        </button>
      </div>

      <div className="mt-5 space-y-2">
        {list.length === 0 && (
          <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center">
            <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Megaphone className="size-6" /></div>
            <p className="mt-3 font-display text-lg">Belum ada info</p>
            <p className="text-sm text-muted-foreground">Mulai posting pengumuman pertama Anda.</p>
          </div>
        )}
        {list.map((p: any) => (
          <div key={p.id} className="flex items-start gap-3 rounded-xl border border-border bg-card p-3">
            <div className="size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
              {p.cover_image_url ? <img src={p.cover_image_url} alt="" loading="lazy" decoding="async" className="size-full object-cover" /> : <div className="grid size-full place-items-center text-muted-foreground"><Megaphone className="size-5" /></div>}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{p.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {p.categories?.name ?? "Tanpa kategori"} • {new Date(p.published_at).toLocaleDateString("id-ID")} {!p.is_published && "• 📦 draft"}
              </p>
              {p.body && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.body}</p>}
            </div>
            <button onClick={() => setEditing(p)} className="rounded-md p-2 text-muted-foreground hover:bg-muted"><Pencil className="size-4" /></button>
            <button onClick={async () => { if (confirm("Hapus info ini?")) { await deleteInfoPost({ data: { id: p.id } }); void removeImagesByUrl([p.cover_image_url, ...(p.gallery_urls ?? [])]); toast.success("Terhapus"); refetch(); } }} className="rounded-md p-2 text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
          </div>
        ))}
      </div>

      {editing && (
        <InfoDialog
          initial={editing}
          regionSlug={region.region.slug}

          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); refetch(); }}
        />
      )}
    </div>
  );
}

function InfoDialog({ initial, categories, regionSlug, onClose, onSaved }: { initial: any; categories: any[]; regionSlug: string; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [push, setPush] = useState<PushDraft>(emptyPushDraft());
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Staged images are uploaded here, so cancelling the form leaves no orphans.
      const cover_image_url = await commitUrl(f.cover_image_url);
      const gallery_urls = await commitUrls(Array.isArray(f.gallery_urls) ? f.gallery_urls : []);
      const saved = await saveInfoPost({ data: {
        id: f.id,
        category_id: f.category_id || null,
        title: f.title,
        body: f.body ?? "",
        cover_image_url,
        gallery_urls,
        youtube_url: f.youtube_url || null,
        is_published: f.is_published !== false,
      } });
      void deleteRemovedImages(
        [initial.cover_image_url, ...(Array.isArray(initial.gallery_urls) ? initial.gallery_urls : [])],
        [cover_image_url, ...gallery_urls],
      );
      toast.success("Tersimpan");
      if (f.is_published !== false) {
        await dispatchPush({
          draft: push,
          entityType: "info_post",
          entityId: saved?.id ?? null,
          path: `/r/${regionSlug}/messages`,
          fallbackTitle: f.title,
          fallbackBody: (f.body ?? "").slice(0, 160) || "Ada kabar baru di wilayah Anda.",
        });
      }
      onSaved();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="my-8 w-full max-w-lg rounded-3xl bg-card p-6">
        <h2 className="font-display text-2xl">{f.id ? "Edit info" : "Info baru"}</h2>
        <div className="mt-4 space-y-3">
          <Field label="Judul"><input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className="input" placeholder="Pemadaman listrik 12 Juli…" /></Field>
          <Field label="Kategori (opsional)">
            <select value={f.category_id ?? ""} onChange={(e) => setF({ ...f, category_id: e.target.value || null })} className="input">
              <option value="">— tanpa kategori —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Isi info"><textarea required value={f.body ?? ""} onChange={(e) => setF({ ...f, body: e.target.value })} className="input min-h-32" placeholder="Detail pengumuman…" /></Field>
          <ImageUploader label="Gambar sampul" value={f.cover_image_url} onChange={(url) => setF({ ...f, cover_image_url: url })} />
          <GalleryUploader value={f.gallery_urls} onChange={(urls) => setF({ ...f, gallery_urls: urls })} />
          <Field label="Link YouTube (opsional)"><input value={f.youtube_url ?? ""} onChange={(e) => setF({ ...f, youtube_url: e.target.value })} className="input" placeholder="https://youtu.be/…" /></Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={f.is_published !== false} onChange={(e) => setF({ ...f, is_published: e.target.checked })} />
            Publikasikan (terlihat publik)
          </label>
          {f.is_published !== false && (
            <AdminPushField
              value={push}
              onChange={setPush}
              hint="Pengikut wilayah akan menerima notifikasi berisi tautan ke halaman Info Lokal."
              titlePlaceholder={f.title || "Judul notifikasi"}
              bodyPlaceholder="Ringkasan singkat pengumuman"
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
