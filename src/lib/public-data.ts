/**
 * LAPISAN DATA PUBLIK — SATU API, DUA JALUR EKSEKUSI.
 *
 * Web / PWA  : memanggil server function website (`src/lib/public.functions.ts`)
 *              seperti sebelumnya, sehingga cache CDN, SSR, dan SEO tetap utuh.
 * APK (Capacitor):
 *              UI dimuat dari aset lokal (`https://localhost`), jadi setiap
 *              panggilan server function bersifat LINTAS ORIGIN ke website dan
 *              baru berhasil bila deployment website terbaru sudah mengizinkan
 *              origin WebView (CORS + CSRF). Ketika website masih memakai versi
 *              lama, seluruh permintaan dijawab 403 → loader gagal → aplikasi
 *              berhenti di "Halaman gagal dimuat".
 *
 *              Karena itu di dalam APK data publik diambil LANGSUNG dari
 *              Supabase memakai publishable key yang memang dirancang untuk
 *              klien. Kueri, kolom, filter, dan limitnya identik dengan server
 *              function, sehingga RLS dan hasilnya persis sama — hanya
 *              perantaranya yang dilewati. Tidak ada secret di sini.
 */
import { supabase } from "@/integrations/supabase/client";
import { isNativeApp } from "@/native/capabilities";
import * as fn from "@/lib/public.functions";

const LOCATION_CARD_COLUMNS =
  "id, slug, name, photo_url, description, coordinates, hours, price_range, is_featured, category_id, sort_order";
const REGION_PUBLIC_COLUMNS =
  "id, slug, name, tagline, description, cover_image_url, welcome_message, mascot_name, coordinates, admin_whatsapp";
const CATEGORY_COLUMNS = "id, region_id, slug, name, icon, color, sort_order";

const sb = () => supabase as any;
const native = () => isNativeApp();

export async function listPublishedRegions() {
  if (!native()) return fn.listPublishedRegions();
  const { data, error } = await sb()
    .from("regions")
    .select("id, slug, name, tagline, description, cover_image_url, coordinates")
    .eq("is_published", true)
    .order("name")
    .limit(100);
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getRegionContact(args: { data: { slug: string } }) {
  if (!native()) return fn.getRegionContact(args);
  const { data } = await sb()
    .from("regions")
    .select("id, slug, name, admin_whatsapp")
    .eq("slug", args.data.slug)
    .eq("is_published", true)
    .maybeSingle();
  return data ?? null;
}

export async function getRegionBySlug(args: { data: { slug: string } }) {
  if (!native()) return fn.getRegionBySlug(args);
  const client = sb();
  const { data: region, error } = await client
    .from("regions")
    .select(REGION_PUBLIC_COLUMNS)
    .eq("slug", args.data.slug)
    .eq("is_published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!region) return null;
  const [{ data: categories }, { data: locations }] = await Promise.all([
    client
      .from("categories")
      .select(CATEGORY_COLUMNS)
      .or(`region_id.eq.${region.id},region_id.is.null`)
      .order("sort_order"),
    client
      .from("locations")
      .select(LOCATION_CARD_COLUMNS)
      .eq("region_id", region.id)
      .eq("is_published", true)
      .order("is_featured", { ascending: false })
      .order("sort_order")
      .limit(300),
  ]);
  return { region, categories: categories ?? [], locations: locations ?? [] };
}

export async function getLocationBySlug(args: {
  data: { regionSlug: string; locationSlug: string };
}) {
  if (!native()) return fn.getLocationBySlug(args);
  const client = sb();
  const { data: region } = await client
    .from("regions")
    .select("id, slug, name, admin_whatsapp")
    .eq("slug", args.data.regionSlug)
    .eq("is_published", true)
    .maybeSingle();
  if (!region) return null;

  const [{ data: location, error }, { data: otherLocations }, { data: couriers }] =
    await Promise.all([
      client
        .from("locations")
        .select(
          "id, region_id, slug, name, description, photo_url, gallery_urls, youtube_url, coordinates, hours, price_range, whatsapp, category_id, is_featured, categories(id, name, slug, icon, color)",
        )
        .eq("region_id", region.id)
        .eq("slug", args.data.locationSlug)
        .eq("is_published", true)
        .maybeSingle(),
      client
        .from("locations")
        .select(
          "id, slug, name, photo_url, hours, price_range, is_featured, category_id, categories(id, name, slug, icon, color)",
        )
        .eq("region_id", region.id)
        .eq("is_published", true)
        .neq("slug", args.data.locationSlug)
        .order("is_featured", { ascending: false })
        .limit(12),
      client
        .from("couriers")
        .select("id, name, whatsapp, coordinates")
        .eq("region_id", region.id)
        .eq("is_active", true)
        .order("sort_order"),
    ]);

  if (error) throw new Error(error.message);
  if (!location) return null;
  return {
    region,
    location,
    otherLocations: otherLocations ?? [],
    categories: [],
    couriers: couriers ?? [],
  };
}

export async function resolveQrCode(args: { data: { code: string } }) {
  if (!native()) return fn.resolveQrCode(args);
  const client = sb();
  const { data: qrRow } = await client
    .from("qr_assets")
    .select("id, code, status")
    .eq("code", args.data.code)
    .maybeSingle();
  if (!qrRow) return null;
  const qr = { id: qrRow.id, code: qrRow.code, status: qrRow.status };
  const { data: assignment } = await client
    .from("qr_assignments")
    .select("id, location_id, region_id, locations(slug), regions(slug)")
    .eq("qr_id", qr.id)
    .is("released_at", null)
    .maybeSingle();
  return { qr, assignment };
}

export async function recordVisit(args: {
  data: {
    regionId?: string | null;
    locationId?: string | null;
    qrAssignmentId?: string | null;
    source?: "qr" | "gps" | "direct";
  };
}) {
  if (!native()) return fn.recordVisit(args);
  const { error } = await sb().from("visits").insert({
    region_id: args.data.regionId ?? null,
    location_id: args.data.locationId ?? null,
    qr_assignment_id: args.data.qrAssignmentId ?? null,
    source: args.data.source ?? "direct",
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function recordEngagement(args: {
  data: { regionId: string; locationId?: string | null; kind: "whatsapp" | "gmaps" | "save" | "share" };
}) {
  if (!native()) return fn.recordEngagement(args);
  const { error } = await sb().from("engagement_events").insert({
    region_id: args.data.regionId,
    location_id: args.data.locationId ?? null,
    kind: args.data.kind,
  });
  if (error) throw new Error(error.message);
  return { ok: true };
}

export async function listRegionInfoPosts(args: { data: { regionSlug: string } }) {
  if (!native()) return fn.listRegionInfoPosts(args);
  const client = sb();
  const { data: region } = await client
    .from("regions")
    .select("id, slug, name")
    .eq("slug", args.data.regionSlug)
    .eq("is_published", true)
    .maybeSingle();
  if (!region) return { region: null, posts: [] };
  const { data: posts, error } = await client
    .from("info_posts")
    .select(
      "id, title, body, cover_image_url, gallery_urls, youtube_url, published_at, category_id, categories(id, name, icon, color)",
    )
    .eq("region_id", region.id)
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return { region, posts: posts ?? [] };
}

export async function listRegionAds(args: { data: { regionSlug: string } }) {
  if (!native()) return fn.listRegionAds(args);
  const client = sb();
  const { data: region } = await client
    .from("regions")
    .select("id")
    .eq("slug", args.data.regionSlug)
    .eq("is_published", true)
    .maybeSingle();
  if (!region) return { banners: [], featured: [] };
  const { data: ads, error } = await client
    .from("ads")
    .select(
      "id, placement, title, description, image_url, location_id, category_id, sort_order, ad_targets(location_id, sort_order), locations!ads_location_id_fkey(id, slug, name, photo_url, price_range, hours, category_id)",
    )
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
}

export async function listContextualAds(args: { data: { hostLocationId: string } }) {
  if (!native()) return fn.listContextualAds(args);
  const { data: ads, error } = await sb()
    .from("ads")
    .select(
      "id, title, description, image_url, location_id, locations!ads_location_id_fkey(id, slug, name, photo_url, price_range)",
    )
    .eq("placement", "contextual")
    .eq("host_location_id", args.data.hostLocationId)
    .order("sort_order")
    .limit(5);
  if (error) throw new Error(error.message);
  return ads ?? [];
}
