import { supabase } from "@/integrations/supabase/client";
import { compressImage, type CompressResult } from "@/lib/image-compress";

const BUCKET = "IMAGE";
const MAX_BYTES = 12 * 1024 * 1024; // pre-compression guard

/* ------------------------------------------------------------------ *
 * Staging registry
 *
 * Selected images are compressed and held in memory as object URLs.
 * Nothing touches Supabase Storage until the admin presses "Simpan",
 * so abandoned forms never leave orphan files behind.
 * ------------------------------------------------------------------ */

type Staged = { result: CompressResult; objectUrl: string };
const staged = new Map<string, Staged>();

export const isStagedUrl = (url: string | null | undefined): boolean =>
  !!url && staged.has(url);

export type StagedMeta = { originalBytes: number; bytes: number; width: number; height: number };

/** Compresses locally and returns a preview URL. Not uploaded yet. */
export async function stageImage(file: File): Promise<{ url: string; meta: StagedMeta }> {
  if (file.size === 0) throw new Error("File kosong.");
  if (file.size > MAX_BYTES) throw new Error("Ukuran maksimum 12MB.");
  const result = await compressImage(file);
  const objectUrl = URL.createObjectURL(result.blob);
  staged.set(objectUrl, { result, objectUrl });
  return {
    url: objectUrl,
    meta: { originalBytes: result.originalBytes, bytes: result.bytes, width: result.width, height: result.height },
  };
}

export function getStagedMeta(url: string): StagedMeta | null {
  const s = staged.get(url);
  if (!s) return null;
  return { originalBytes: s.result.originalBytes, bytes: s.result.bytes, width: s.result.width, height: s.result.height };
}

/** Drops a staged image that will never be saved. */
export function discardStaged(url: string | null | undefined): void {
  if (!url) return;
  const s = staged.get(url);
  if (!s) return;
  staged.delete(url);
  URL.revokeObjectURL(url);
}

/* ------------------------------------------------------------------ *
 * Upload / delete
 * ------------------------------------------------------------------ */

let cachedRegionId: string | null = null;

async function getMyRegionId(): Promise<string> {
  if (cachedRegionId) return cachedRegionId;
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Sesi berakhir. Silakan masuk kembali.");
  const { data, error } = await supabase
    .from("profiles")
    .select("region_id, is_active")
    .eq("id", auth.user.id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data?.is_active) throw new Error("Akun Anda belum diaktifkan, jadi belum bisa mengunggah gambar.");
  if (!data.region_id) throw new Error("Akun Anda belum terhubung ke wilayah mana pun.");
  cachedRegionId = data.region_id;
  return data.region_id;
}

/**
 * Uploads with the admin's own session so `owner = auth.uid()` and the
 * owner-scoped storage policies keep working. Storage RLS enforces:
 * active admin + own region prefix + image extension.
 */
async function uploadBlob(blob: Blob, ext: string, contentType: string): Promise<string> {
  const regionId = await getMyRegionId();
  const key = `regions/${regionId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(key, blob, {
    cacheControl: "31536000",
    upsert: false,
    contentType,
  });
  if (error) {
    if (/row-level security|policy/i.test(error.message)) {
      throw new Error("Upload ditolak: pastikan akun Anda sudah aktif dan terhubung ke wilayah.");
    }
    throw new Error(error.message);
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(key);
  return data.publicUrl;
}

/** Uploads one staged image (or passes a real URL through untouched). */
export async function commitUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  const s = staged.get(url);
  if (!s) return url;
  const publicUrl = await uploadBlob(s.result.blob, s.result.ext, s.result.contentType);
  discardStaged(url);
  return publicUrl;
}

/** Uploads every staged image in a list, preserving order. */
export async function commitUrls(urls: (string | null | undefined)[]): Promise<string[]> {
  const out: string[] = [];
  for (const u of urls) {
    const committed = await commitUrl(u);
    if (committed) out.push(committed);
  }
  return out;
}

const storageKeyFromUrl = (url: string): string | null => {
  const marker = `/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
};

/** Best-effort removal of uploaded objects (owner-scoped by storage RLS). */
export async function removeImagesByUrl(urls: (string | null | undefined)[]): Promise<void> {
  const keys = urls
    .filter((u): u is string => !!u && !staged.has(u))
    .map(storageKeyFromUrl)
    .filter((k): k is string => !!k);
  if (keys.length === 0) return;
  await supabase.storage.from(BUCKET).remove(keys);
}

export const removeImageByUrl = (url: string | null | undefined) => removeImagesByUrl([url]);

/**
 * Deletes storage files that were dropped or replaced during an edit,
 * keeping the free-plan bucket free of orphans.
 */
export async function deleteRemovedImages(
  before: (string | null | undefined)[],
  after: (string | null | undefined)[],
): Promise<void> {
  const keep = new Set(after.filter(Boolean) as string[]);
  const gone = before.filter((u): u is string => !!u && !keep.has(u));
  if (gone.length === 0) return;
  await removeImagesByUrl(gone);
}
