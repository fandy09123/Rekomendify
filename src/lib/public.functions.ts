import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { getSupabasePublicConfig } from "@/integrations/supabase/config";

function pub() {
  const { url, publishableKey } = getSupabasePublicConfig();
  return createClient<Database>(url, publishableKey, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Cache CDN untuk data publik.
 *
 * Seluruh data di fungsi-fungsi ini bersifat publik (hanya baris yang sudah
 * `is_published`) dan identik untuk setiap pengunjung, sehingga aman disimpan
 * di shared cache. Ini memutus rantai "satu kunjungan/crawler = beberapa query
 * Postgres + satu invocation" yang menjadi penyumbang biaya terbesar:
 * permintaan berikutnya dilayani dari edge tanpa menyentuh database.
 *
 * `stale-while-revalidate` menjaga halaman tetap terasa hidup — konten basi
 * hanya tersaji sesaat sementara versi baru diambil di latar belakang.
 */
function publicCache(maxAgeSeconds = 300) {
  try {
    setResponseHeader(
      "cache-control",
      `public, max-age=0, s-maxage=${maxAgeSeconds}, stale-while-revalidate=86400`,
    );
  } catch {
    // Di luar konteks request (mis. saat prerender) header tidak tersedia.
  }
}

export const listPublishedRegions = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await pub()
    publicCache();
    .from("regions")
    .select("id, slug, name, tagline, description, cover_image_url, coordinates")
    .eq("is_published", true)
    .order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

/** Kontak resmi admin wilayah — dipakai menu "Hubungi Admin Wilayah". */
export const getRegionContact = createServerFn({ method: "GET" })
  .validator((data: any) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    publicCache(600);
    const { data: region } = await pub()
      .from("regions")
      .select("id, slug, name, admin_whatsapp")
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    return region ?? null;
  });

/** Kolom kartu lokasi — cukup untuk daftar, pencarian, filter, dan jarak. */
const LOCATION_CARD_COLUMNS =
  "id, slug, name, photo_url, description, coordinates, hours, price_range, is_featured, category_id, sort_order";

const REGION_PUBLIC_COLUMNS =
  "id, slug, name, tagline, description, cover_image_url, welcome_message, mascot_name, coordinates, admin_whatsapp";

const CATEGORY_COLUMNS = "id, region_id, slug, name, icon, color, sort_order";

export const getRegionBySlug = createServerFn({ method: "GET" })
  .validator((data: any) => z.object({ slug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    publicCache(300);
    const sb = pub();
    const { data: region, error } = await sb
      .from("regions")
      .select(REGION_PUBLIC_COLUMNS)
      .eq("slug", data.slug)
      .eq("is_published", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!region) return null;
    const [{ data: categories }, { data: locations }] = await Promise.all([
      sb.from("categories").select(CATEGORY_COLUMNS).or(`region_id.eq.${region.id},region_id.is.null`).order("sort_order"),
      sb
        .from("locations")
        .select(LOCATION_CARD_COLUMNS)
        .eq("region_id", region.id)
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("sort_order")
        .limit(300),
    ]);
    return { region, categories: categories ?? [], locations: locations ?? [] };
  });

export const getLocationBySlug = createServerFn({ method: "GET" })
  .validator((data: any) => z.object({ regionSlug: z.string(), locationSlug: z.string() }).parse(data))
  .handler(async ({ data }) => {
    publicCache(300);
    const sb = pub();
    const { data: region } = await sb.from("regions").select("id, slug, name, admin_whatsapp").eq("slug", data.regionSlug).eq("is_published", true).maybeSingle();
    if (!region) return null;

    // Kategori tidak lagi di-query terpisah: nama kategori sudah ikut pada
    // relasi `categories(...)` di setiap kartu rekomendasi.
    const [{ data: location, error }, { data: otherLocations }, { data: couriers }] = await Promise.all([
      sb
        .from("locations")
        .select("*, categories(id, name, slug, icon, color)")
        .eq("region_id", region.id)
        .eq("slug", data.locationSlug)
        .eq("is_published", true)
        .maybeSingle(),
      // Hanya sebagian yang benar-benar dirender sebagai rekomendasi.
      sb
        .from("locations")
        .select("id, slug, name, photo_url, hours, price_range, is_featured, category_id, categories(id, name, slug, icon, color)")
        .eq("region_id", region.id)
        .eq("is_published", true)
        .neq("slug", data.locationSlug)
        .order("is_featured", { ascending: false })
        .limit(12),
      sb
        .from("couriers")
        .select("id, name, whatsapp, coordinates")
        .eq("region_id", region.id)
        .eq("is_active", true)
        .order("sort_order"),
    ]);

    if (error) throw new Error(error.message);
    if (!location) return null;

    return { region, location, otherLocations: otherLocations ?? [], categories: [], couriers: couriers ?? [] };
  });

export const resolveQrCode = createServerFn({ method: "GET" })
  .validator((data: any) => z.object({ code: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    const sb = pub();
    // anon has column-scoped SELECT on qr_assets (id, code, status only),
    // so internal fields (notes, batch_label, created_by) never leak.
    const { data: qrRow } = await sb
      .from("qr_assets")
      .select("id, code, status")
      .eq("code", data.code)
      .maybeSingle();
    if (!qrRow) return null;
    const qr = { id: qrRow.id, code: qrRow.code, status: qrRow.status };
    const { data: assignment } = await sb
      .from("qr_assignments")
      .select("id, location_id, region_id, locations(slug), regions(slug)")
      .eq("qr_id", qr.id)
      .is("released_at", null)
      .maybeSingle();
    return { qr, assignment };
  });

export const recordVisit = createServerFn({ method: "POST" })
  .validator((data: any) =>
    z
      .object({
        regionId: z.string().uuid().nullable().optional(),
        locationId: z.string().uuid().nullable().optional(),
        qrAssignmentId: z.string().uuid().nullable().optional(),
        source: z.enum(["qr", "gps", "direct"]).default("direct"),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { error } = await pub().from("visits").insert({
      region_id: data.regionId ?? null,
      location_id: data.locationId ?? null,
      qr_assignment_id: data.qrAssignmentId ?? null,
      source: data.source,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Records a tourist action (WhatsApp / Maps / save / share) on a location.
 * These are the real conversion signals for a hyperlocal guide — a visit only
 * means "seen", an engagement means "acted on".
 */
export const recordEngagement = createServerFn({ method: "POST" })
  .validator((data: any) =>
    z
      .object({
        regionId: z.string().uuid(),
        locationId: z.string().uuid().nullable().optional(),
        kind: z.enum(["whatsapp", "gmaps", "save", "share"]),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const { error } = await pub().from("engagement_events").insert({
      region_id: data.regionId,
      location_id: data.locationId ?? null,
      kind: data.kind,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });



// ============ INFO LOKAL ============
export const listRegionInfoPosts = createServerFn({ method: "GET" })
  .validator((data: any) => z.object({ regionSlug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    publicCache(300);
    const sb = pub();
    const { data: region } = await sb
      .from("regions")
      .select("id, slug, name")
      .eq("slug", data.regionSlug)
      .eq("is_published", true)
      .maybeSingle();
    if (!region) return { region: null, posts: [] };
    const { data: posts, error } = await sb
      .from("info_posts")
      .select("id, title, body, cover_image_url, gallery_urls, youtube_url, published_at, category_id, categories(id, name, icon, color)")
      .eq("region_id", region.id)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return { region, posts: posts ?? [] };
  });


// ============ IKLAN (PUBLIK) ============
/**
 * Iklan wilayah untuk beranda: banner carousel + daftar id lokasi yang sedang
 * disorot (featured berbayar). RLS hanya meloloskan iklan aktif dalam masa tayang.
 */
export const listRegionAds = createServerFn({ method: "GET" })
  .validator((data: any) => z.object({ regionSlug: z.string().min(1) }).parse(data))
  .handler(async ({ data }) => {
    publicCache(120);
    const sb = pub();
    const { data: region } = await sb
      .from("regions").select("id").eq("slug", data.regionSlug).eq("is_published", true).maybeSingle();
    if (!region) return { banners: [], featured: [] };
    const { data: ads, error } = await sb
      .from("ads")
      .select("id, placement, title, description, image_url, location_id, category_id, sort_order, ad_targets(location_id, sort_order), locations!ads_location_id_fkey(id, slug, name, photo_url, price_range, hours, category_id)")
      .eq("region_id", region.id)
      .in("placement", ["banner", "featured"])
      .order("sort_order")
      .limit(50);
    if (error) throw new Error(error.message);
    const rows = ads ?? [];
    return {
      banners: rows.filter((a: any) => a.placement === "banner"),
      featured: rows.filter((a: any) => a.placement === "featured"),
    };
  });

/** Promosi kontekstual yang tayang pada satu halaman detail lokasi (host). */
export const listContextualAds = createServerFn({ method: "GET" })
  .validator((data: any) => z.object({ hostLocationId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    publicCache(120);
    const { data: ads, error } = await pub()
      .from("ads")
      .select("id, title, description, image_url, location_id, locations!ads_location_id_fkey(id, slug, name, photo_url, price_range)")
      .eq("placement", "contextual")
      .eq("host_location_id", data.hostLocationId)
      .order("sort_order")
      .limit(5);
    if (error) throw new Error(error.message);
    return ads ?? [];
  });
