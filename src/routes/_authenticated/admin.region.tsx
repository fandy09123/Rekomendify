import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { myRegion, updateMyRegion } from "@/lib/admin.functions";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { ImageUploader } from "@/components/image-uploader";
import { commitUrl, deleteRemovedImages } from "@/lib/upload-client";
import { CoordinateField } from "@/components/coordinate-field";

export const Route = createFileRoute("/_authenticated/admin/region")({
  component: RegionSettingsPage,
});

function RegionSettingsPage() {
  const { data, refetch } = useQuery({ queryKey: ["my-region"], queryFn: () => myRegion() });
  const [form, setForm] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (data?.region) setForm(data.region); }, [data?.region?.id]);

  if (!data) return <p className="text-sm text-muted-foreground">Memuat…</p>;
  if (!data.region) return <p className="text-sm text-muted-foreground">Wilayah belum terhubung ke akun Anda.</p>;
  if (!form) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const cover_image_url = await commitUrl(form.cover_image_url);
      await updateMyRegion({ data: {
        name: form.name,
        slug: form.slug,
        tagline: form.tagline || null,
        description: form.description || null,
        cover_image_url,
        welcome_message: form.welcome_message || null,
        mascot_name: form.mascot_name || null,
        coordinates: form.coordinates || null,
        admin_whatsapp: form.admin_whatsapp || null,
        is_published: !!form.is_published,
      } });
      void deleteRemovedImages([data.region?.cover_image_url], [cover_image_url]);
      toast.success("Wilayah tersimpan");
      refetch();
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Kembali ke Dashboard</Link>
      <h1 className="mt-2 font-display text-3xl">Pengaturan Wilayah</h1>
      <p className="text-sm text-muted-foreground">Detail wilayah yang Anda kelola. Slug menentukan URL publik.</p>

      <form onSubmit={submit} className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nama wilayah"><input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" /></Field>
          <Field label="Slug URL"><input value={form.slug ?? ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input" /></Field>
        </div>
        <Field label="Tagline"><input value={form.tagline ?? ""} onChange={(e) => setForm({ ...form, tagline: e.target.value })} className="input" placeholder="Surga kecil di kaki Wilis" /></Field>
        <Field label="Deskripsi"><textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-24" /></Field>
        <Field label="Welcome message (sapaan maskot)"><textarea value={form.welcome_message ?? ""} onChange={(e) => setForm({ ...form, welcome_message: e.target.value })} className="input min-h-20" placeholder="Sugeng rawuh di Desa Mulyosari!" /></Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Nama maskot"><input value={form.mascot_name ?? ""} onChange={(e) => setForm({ ...form, mascot_name: e.target.value })} className="input" placeholder="Cak Mulyo & Jeng Sari" /></Field>
        </div>
        <CoordinateField
          label="Koordinat wilayah (lat,lng)"
          value={form.coordinates}
          onChange={(v) => setForm({ ...form, coordinates: v })}
          hint="Titik pusat wilayah. Isi manual atau pilih di peta."
        />
        <Field label="WhatsApp Admin Wilayah"><input value={form.admin_whatsapp ?? ""} onChange={(e) => setForm({ ...form, admin_whatsapp: e.target.value })} className="input" placeholder="08123456789" /></Field>
        <p className="-mt-2 text-xs text-muted-foreground">Dipakai wisatawan untuk layanan resmi wilayah: daftarkan usaha, lapor kesalahan data, dan bantuan.</p>
        <ImageUploader label="Cover wilayah" value={form.cover_image_url} onChange={(url) => setForm({ ...form, cover_image_url: url })} defaultAspect={16 / 9} hint="Direkomendasikan rasio 16:9" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} />
          Publikasikan wilayah (terlihat publik)
        </label>
        <button disabled={saving} className="w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {saving ? "Menyimpan…" : "Simpan perubahan"}
        </button>
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
