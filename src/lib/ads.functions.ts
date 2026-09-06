import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Sistem Iklan Rekomendify (sisi admin wilayah).
 *
 * Tiga penempatan:
 * - `banner`      → carousel promosi di beranda wilayah (maks. 5 lokasi tujuan)
 * - `featured`    → sorotan sebuah lokasi di dalam satu kategori
 * - `contextual`  → promosi yang muncul di halaman detail lokasi lain (host)
 *
 * Aktivasi memotong kredit lewat RPC `activate_ad` yang atomik di Postgres,
 * sehingga tidak mungkin terjadi saldo minus atau double-spend.
 */

async function requireRegion(context: any) {
  const { data: profile } = await context.supabase
    .from("profiles")
    .select("region_id, is_active")
    .eq("id", context.userId)
    .maybeSingle();
  if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
  return profile.region_id as string;
}

const nullableUrl = z.preprocess(
  (v) => (v === "" || v == null ? null : v),
  z.string().trim().url().refine((u) => /^https?:\/\//i.test(u), "URL harus http(s)").nullable(),
);
const nullableUuid = z.preprocess((v) => (v === "" || v == null ? null : v), z.string().uuid().nullable());

const AdInput = z.object({
  id: z.string().uuid().optional(),
  placement: z.enum(["banner", "featured", "contextual"]),
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  image_url: nullableUrl.optional(),
  location_id: nullableUuid.optional(),
  category_id: nullableUuid.optional(),
  host_location_id: nullableUuid.optional(),
  sort_order: z.number().int().default(0),
  target_ids: z.array(z.string().uuid()).max(5).default([]),
});

export const listAds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("profiles").select("region_id").eq("id", context.userId).maybeSingle();
    if (!profile?.region_id) return [];
    const { data, error } = await context.supabase
      .from("ads")
      .select("*, ad_targets(id, location_id, sort_order), locations!ads_location_id_fkey(id, name, slug), categories(id, name)")
      .eq("region_id", profile.region_id)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Saldo kredit, daftar harga paket, dan riwayat mutasi kredit wilayah. */
export const myCredits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const sb = context.supabase;
    const { data: profile } = await sb
      .from("profiles").select("region_id").eq("id", context.userId).maybeSingle();
    const [{ data: prices }, credits, ledger] = await Promise.all([
      sb.from("promo_prices").select("placement, duration_days, credits").eq("is_active", true).order("duration_days"),
      profile?.region_id
        ? sb.from("region_credits").select("balance").eq("region_id", profile.region_id).maybeSingle()
        : Promise.resolve({ data: null } as any),
      profile?.region_id
        ? sb.from("credit_ledger").select("*").eq("region_id", profile.region_id).order("created_at", { ascending: false }).limit(50)
        : Promise.resolve({ data: [] } as any),
    ]);
    return {
      balance: (credits as any)?.data?.balance ?? 0,
      prices: prices ?? [],
      ledger: (ledger as any)?.data ?? [],
    };
  });

export const saveAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => AdInput.parse(data))
  .handler(async ({ data, context }) => {
    const regionId = await requireRegion(context);
    const sb = context.supabase;

    // Semua lokasi/kategori yang dirujuk wajib berada di wilayah admin ini.
    const locIds = [data.location_id, data.host_location_id, ...data.target_ids].filter(Boolean) as string[];
    if (locIds.length) {
      const { data: locs, error } = await sb.from("locations").select("id").eq("region_id", regionId).in("id", locIds);
      if (error) throw new Error(error.message);
      if ((locs ?? []).length !== new Set(locIds).size) throw new Error("Lokasi tidak berada di wilayah Anda.");
    }
    if (data.category_id) {
      const { data: cat } = await sb.from("categories").select("id, region_id").eq("id", data.category_id).maybeSingle();
      if (!cat || (cat.region_id && cat.region_id !== regionId)) throw new Error("Kategori tidak berada di wilayah Anda.");
    }
    if (data.placement === "featured" && !data.location_id) throw new Error("Iklan sorotan wajib memilih lokasi.");
    if (data.placement === "contextual" && (!data.location_id || !data.host_location_id)) {
      throw new Error("Promosi kontekstual wajib memilih lokasi yang dipromosikan dan lokasi tempat tayang.");
    }

    const payload = {
      region_id: regionId,
      placement: data.placement,
      title: data.title,
      description: data.description ?? null,
      image_url: data.image_url ?? null,
      location_id: data.location_id ?? null,
      category_id: data.category_id ?? null,
      host_location_id: data.host_location_id ?? null,
      sort_order: data.sort_order,
    };

    let adId = data.id;
    if (adId) {
      const { error } = await sb.from("ads").update(payload).eq("id", adId).eq("region_id", regionId);
      if (error) throw new Error(error.message);
    } else {
      const { data: row, error } = await sb.from("ads").insert({ ...payload, created_by: context.userId }).select("id").single();
      if (error) throw new Error(error.message);
      adId = row.id;
    }

    if (data.placement === "banner") {
      await sb.from("ad_targets").delete().eq("ad_id", adId!).eq("region_id", regionId);
      if (data.target_ids.length) {
        const { error } = await sb.from("ad_targets").insert(
          data.target_ids.slice(0, 5).map((lid: string, i: number) => ({
            ad_id: adId!, region_id: regionId, location_id: lid, sort_order: i,
          })),
        );
        if (error) throw new Error(error.message);
      }
    }
    return { id: adId };
  });

export const deleteAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const regionId = await requireRegion(context);
    const { error } = await context.supabase.from("ads").delete().eq("id", data.id).eq("region_id", regionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Aktivasi berbayar — pemotongan kredit dilakukan atomik di dalam Postgres. */
export const activateAd = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) =>
    z.object({ id: z.string().uuid(), duration_days: z.number().int().min(1).max(365) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: res, error } = await context.supabase.rpc("activate_ad", {
      _ad_id: data.id,
      _duration_days: data.duration_days,
    });
    if (error) throw new Error(error.message);
    return res as any;
  });

/** Jeda / lanjutkan tayang tanpa mengubah kredit maupun masa berlaku. */
export const setAdPaused = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => z.object({ id: z.string().uuid(), paused: z.boolean() }).parse(data))
  .handler(async ({ data, context }) => {
    const regionId = await requireRegion(context);
    const { data: ad } = await context.supabase
      .from("ads").select("id, status, end_at").eq("id", data.id).eq("region_id", regionId).maybeSingle();
    if (!ad) throw new Error("Iklan tidak ditemukan.");
    if (!ad.end_at) throw new Error("Iklan belum pernah diaktifkan.");
    const { error } = await context.supabase
      .from("ads")
      .update({ status: data.paused ? "paused" : "active" })
      .eq("id", data.id)
      .eq("region_id", regionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
