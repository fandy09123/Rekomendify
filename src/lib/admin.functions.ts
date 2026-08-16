import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);

// ============ PROFILE / MY REGION ============
export const myProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("id, email, full_name, is_active, region_id")
      .eq("id", context.userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return data;
  });

export const myRegion = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { data: profile } = await sb
      .from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
    if (!profile?.region_id) return { profile, region: null, categories: [], locations: [], couriers: [] };
    const [{ data: region }, { data: cats }, { data: locs }, { data: couriers }] = await Promise.all([
      sb.from("regions").select("*").eq("id", profile.region_id).maybeSingle(),
      sb.from("categories").select("*").eq("region_id", profile.region_id).order("sort_order"),
      sb.from("locations").select("*").eq("region_id", profile.region_id).order("sort_order"),
      sb.from("couriers").select("*").eq("region_id", profile.region_id).order("sort_order"),
    ]);
    return { profile, region, categories: cats ?? [], locations: locs ?? [], couriers: couriers ?? [] };
  });

const nullableUrl = z.preprocess(
  (v) => (v === "" || v == null ? null : v),
  z.string().url().nullable(),
);

const httpUrl = z.string().trim().url().refine(
  (u) => /^https?:\/\//i.test(u),
  { message: "URL harus diawali http:// atau https://" },
);
const nullableHttpUrl = z.preprocess(
  (v) => (v === "" || v == null ? null : v),
  httpUrl.nullable(),
);

// Koordinat "lat,lng" — satu kolom teks, URL Maps dibangun di frontend.
const nullableCoords = z.preprocess(
  (v) => {
    if (v === "" || v == null) return null;
    return String(v).replace(/\s+/g, "");
  },
  z
    .string()
    .regex(/^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$/, "Format koordinat harus seperti -8.002344,111.817618")
    .refine((s) => {
      const [lat, lng] = s.split(",").map(Number);
      return Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
    }, "Koordinat di luar jangkauan yang wajar.")
    .nullable(),
);

const nullableWhatsapp = z.preprocess(
  (v) => {
    if (v === "" || v == null) return null;
    let d = String(v).replace(/\D/g, "");
    if (d.startsWith("0")) d = `62${d.slice(1)}`;
    return d || null;
  },
  z.string().regex(/^\d{8,20}$/, "Nomor WhatsApp tidak valid.").nullable(),
);

const RegionUpdate = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  tagline: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  cover_image_url: nullableUrl.optional(),
  welcome_message: z.string().nullable().optional(),
  mascot_name: z.string().nullable().optional(),
  coordinates: nullableCoords.optional(),
  admin_whatsapp: nullableWhatsapp.optional(),
  is_published: z.boolean().default(false),
});

export const updateMyRegion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => RegionUpdate.parse(data))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
    if (!profile?.region_id) throw new Error("Akun Anda belum terhubung ke wilayah.");
    if (!profile.is_active) throw new Error("Akun belum diaktifkan.");
    const slug = data.slug || slugify(data.name);
    const { error } = await context.supabase.from("regions").update({ ...data, slug }).eq("id", profile.region_id);
    if (error) throw new Error(error.message);
    return { id: profile.region_id };
  });

// ============ CATEGORIES ============
const CategoryInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  icon: z.string().nullable().optional(),
  sort_order: z.number().int().default(0),
});

export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => CategoryInput.parse(data))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
    if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
    const slug = slugify(data.name);
    const payload = { ...data, slug, region_id: profile.region_id };
    if (data.id) {
      const { error } = await context.supabase.from("categories").update(payload).eq("id", data.id).eq("region_id", profile.region_id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase.from("categories").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
    if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
    const { error } = await context.supabase.from("categories").delete()
      .eq("id", data.id).eq("region_id", profile.region_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ LOCATIONS ============
const youtubeUrl = z.preprocess(
  (v) => (v === "" || v == null ? null : v),
  z.string().url().refine((u) => /(youtube\.com|youtu\.be)/i.test(u), {
    message: "URL harus berasal dari YouTube.",
  }).nullable(),
);

const LocationInput = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().min(1),
  photo_url: nullableUrl.optional(),
  gallery_urls: z.array(z.string().url()).max(5).default([]),
  youtube_url: youtubeUrl.optional(),
  coordinates: nullableCoords.optional(),
  whatsapp: nullableWhatsapp.optional(),
  description: z.string().nullable().optional(),
  
  hours: z.string().nullable().optional(),
  price_range: z.string().nullable().optional(),
  is_featured: z.boolean().default(false),
  is_published: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const saveLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => LocationInput.parse(data))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
    if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
    const slug = slugify(data.name);
    const payload = { ...data, slug, region_id: profile.region_id };
    if (data.id) {
      const { error } = await context.supabase.from("locations").update(payload).eq("id", data.id).eq("region_id", profile.region_id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase.from("locations").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
    if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
    const { error } = await context.supabase.from("locations").delete()
      .eq("id", data.id).eq("region_id", profile.region_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ QR ============
/** Resolves the caller's region, rejecting inactive accounts. */
async function requireRegion(context: any) {
  const { data: profile } = await context.supabase
    .from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
  if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
  return profile.region_id as string;
}

export const listQr = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("profiles").select("region_id").eq("id", context.userId).maybeSingle();
    if (!profile?.region_id) return [];
    // region_id lives on the QR itself so draft (never assigned) codes stay visible.
    const { data, error } = await context.supabase
      .from("qr_assets")
      .select("*, qr_assignments!left(id, location_id, region_id, assigned_at, released_at, placement_note, locations(id, name, slug))")
      .eq("region_id", profile.region_id)
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const generateQrBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({ count: z.number().int().min(1).max(200), label: z.string().min(1) }).parse(data))
  .handler(async ({ data, context }) => {
    const regionId = await requireRegion(context);
    const rows = Array.from({ length: data.count }).map(() => ({
      code: `RKM-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
      status: "draft" as const,
      batch_label: data.label,
      created_by: context.userId,
      region_id: regionId,
    }));
    const { data: inserted, error } = await context.supabase.from("qr_assets").insert(rows).select("id, code");
    if (error) throw new Error(error.message);
    return inserted ?? [];
  });

export const assignQr = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) =>
    z
      .object({
        qr_id: z.string().uuid(),
        location_id: z.string().uuid(),
        placement_note: z.string().nullable().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const regionId = await requireRegion(context);
    // Verify the target location belongs to this admin's region (tenant isolation)
    const { data: loc, error: locErr } = await context.supabase
      .from("locations").select("id, region_id").eq("id", data.location_id).maybeSingle();
    if (locErr) throw new Error(locErr.message);
    if (!loc || loc.region_id !== regionId) {
      throw new Error("Lokasi tidak berada di wilayah Anda.");
    }
    const { error } = await context.supabase.from("qr_assignments").insert({
      qr_id: data.qr_id,
      location_id: data.location_id,
      region_id: regionId,
      placement_note: data.placement_note ?? null,
      assigned_by: context.userId,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const releaseQr = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({ assignment_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const regionId = await requireRegion(context);
    const { error } = await context.supabase
      .from("qr_assignments")
      .update({ released_at: new Date().toISOString(), released_by: context.userId })
      .eq("id", data.assignment_id)
      .eq("region_id", regionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Marks physical acrylic production state so admins know what is already printed. */
export const markQrPrinted = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({ ids: z.array(z.string().uuid()).min(1).max(200), printed: z.boolean() }).parse(data))
  .handler(async ({ data, context }) => {
    const regionId = await requireRegion(context);
    const { error } = await context.supabase
      .from("qr_assets")
      .update({ printed_at: data.printed ? new Date().toISOString() : null })
      .in("id", data.ids)
      .eq("region_id", regionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const retireQr = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string().uuid(), retired: z.boolean() }).parse(data))
  .handler(async ({ data, context }) => {
    const regionId = await requireRegion(context);
    const { error } = await context.supabase
      .from("qr_assets")
      .update({ status: data.retired ? "retired" : "draft" })
      .eq("id", data.id)
      .eq("region_id", regionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteQr = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const regionId = await requireRegion(context);
    const { error } = await context.supabase
      .from("qr_assets").delete().eq("id", data.id).eq("region_id", regionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ============ ANALYTICS ============
/**
 * Aggregated entirely in Postgres (admin_analytics_summary), so numbers are
 * exact instead of being capped by the 1000-row PostgREST page limit.
 */
export const myAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({ days: z.number().int().min(1).max(365).default(30) }).parse(data ?? {}))
  .handler(async ({ data, context }) => {
    const { data: summary, error } = await context.supabase.rpc("admin_analytics_summary", { _days: data.days });
    if (error) throw new Error(error.message);
    return summary as any;
  });


// ============ INFO LOKAL ============
const InfoPostInput = z.object({
  id: z.string().uuid().optional(),
  category_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1),
  body: z.string().default(""),
  cover_image_url: nullableUrl.optional(),
  gallery_urls: z.array(z.string().url()).max(5).default([]),
  youtube_url: youtubeUrl.optional(),
  is_published: z.boolean().default(true),
});

export const listMyInfoPosts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("profiles").select("region_id").eq("id", context.userId).maybeSingle();
    if (!profile?.region_id) return [];
    const { data, error } = await context.supabase
      .from("info_posts")
      .select("*, categories(id, name, icon)")
      .eq("region_id", profile.region_id)
      .order("published_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const saveInfoPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => InfoPostInput.parse(data))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
    if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
    const payload = {
      category_id: data.category_id ?? null,
      title: data.title,
      body: data.body ?? "",
      cover_image_url: data.cover_image_url ?? null,
      gallery_urls: data.gallery_urls ?? [],
      youtube_url: data.youtube_url ?? null,
      is_published: data.is_published,
      region_id: profile.region_id,
    };
    if (data.id) {
      const { error } = await context.supabase.from("info_posts").update(payload).eq("id", data.id).eq("region_id", profile.region_id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("info_posts")
      .insert({ ...payload, published_at: new Date().toISOString() })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteInfoPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
    if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
    const { error } = await context.supabase.from("info_posts").delete()
      .eq("id", data.id).eq("region_id", profile.region_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });


// ============ KURIR / OJEK LOKAL ============
const CourierInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(80),
  whatsapp: z.preprocess((v) => {
    let d = String(v ?? "").replace(/\D/g, "");
    if (d.startsWith("0")) d = `62${d.slice(1)}`;
    return d;
  }, z.string().regex(/^\d{8,20}$/, "Nomor WhatsApp kurir tidak valid.")),
  coordinates: nullableCoords.optional(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const saveCourier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => CourierInput.parse(data))
  .handler(async ({ data, context }) => {
    const regionId = await requireRegion(context);
    const payload = { ...data, region_id: regionId };
    if (data.id) {
      const { error } = await context.supabase
        .from("couriers").update(payload).eq("id", data.id).eq("region_id", regionId);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase
      .from("couriers").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deleteCourier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const regionId = await requireRegion(context);
    const { error } = await context.supabase
      .from("couriers").delete().eq("id", data.id).eq("region_id", regionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
