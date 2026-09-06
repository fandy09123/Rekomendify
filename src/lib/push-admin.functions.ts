import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Pengiriman Web Push oleh Admin Wilayah.
 *
 * Kewenangan tidak pernah diambil dari request: region target selalu dibaca
 * dari `profiles` milik user yang login (dan harus `is_active`). Admin karena
 * itu mustahil menembak wilayah lain dengan memanipulasi payload.
 */

const SendInput = z.object({
  entityType: z.enum(["info_post", "location", "ad"]),
  entityId: z.string().max(80).nullable().optional(),
  title: z.string().trim().min(1).max(80),
  body: z.string().trim().min(1).max(180),
  /** Path relatif di dalam aplikasi, mis. `/r/mulyosari/warung-bu-tin`. */
  path: z.string().trim().max(300).nullable().optional(),
});

export const sendRegionPush = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data: any) => SendInput.parse(data))
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("region_id, is_active")
      .eq("id", context.userId)
      .maybeSingle();
    if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
    const regionId = profile.region_id as string;

    const { readVapidConfig, sendWebPush } = await import("./webpush.server");
    const cfg = readVapidConfig();
    if (!cfg) throw new Error("Notifikasi belum dikonfigurasi di server.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: region } = await supabaseAdmin
      .from("regions")
      .select("slug, name")
      .eq("id", regionId)
      .maybeSingle();

    // Hanya path internal yang diizinkan — mencegah notifikasi mengarah keluar.
    const safePath = data.path && /^\/[\w\-/%.]*$/.test(data.path) ? data.path : region ? `/r/${region.slug}` : "/";

    // Idempotensi: satu aksi admin dalam jendela 1 menit hanya menghasilkan
    // satu pengiriman, sehingga retry/double-click tidak menggandakan push.
    const bucket = Math.floor(Date.now() / 60000);
    const dedupeKey = `${data.entityType}:${data.entityId ?? "none"}:${regionId}:${bucket}`;

    const { data: dispatch, error: dispatchError } = await supabaseAdmin
      .from("push_dispatches")
      .insert({
        region_id: regionId,
        actor_id: context.userId,
        entity_type: data.entityType,
        entity_id: data.entityId ?? null,
        dedupe_key: dedupeKey,
        title: data.title,
        body: data.body,
        url: safePath,
      })
      .select("id")
      .maybeSingle();

    if (dispatchError) {
      // 23505 = duplikat dedupe_key → pengiriman yang sama sudah berjalan.
      if ((dispatchError as any).code === "23505") return { ok: true, duplicated: true, sent: 0, failed: 0 };
      throw new Error(dispatchError.message);
    }

    const { data: rows } = await supabaseAdmin
      .from("push_region_follows")
      .select("push_subscriptions!inner(id, endpoint, p256dh, auth, is_active)")
      .eq("region_id", regionId);

    const subs = (rows ?? [])
      .map((r: any) => r.push_subscriptions)
      .filter((s: any) => s && s.is_active);

    const payload = {
      title: data.title,
      body: data.body,
      url: safePath,
      tag: `${data.entityType}:${data.entityId ?? dispatch?.id ?? "region"}`,
      regionSlug: region?.slug ?? null,
    };

    let sent = 0;
    let failed = 0;
    const gone: string[] = [];

    // Batching kecil agar tidak menahan worker terlalu lama pada wilayah besar.
    for (let i = 0; i < subs.length; i += 25) {
      const results = await Promise.all(
        subs.slice(i, i + 25).map((s: any) => sendWebPush({ endpoint: s.endpoint, p256dh: s.p256dh, auth: s.auth }, payload, cfg)),
      );
      for (const r of results) {
        if (r.ok) sent++;
        else {
          failed++;
          if (r.gone) gone.push(r.endpoint);
        }
      }
    }

    // Endpoint yang sudah mati dinonaktifkan agar tidak dikirimi terus-menerus.
    if (gone.length) {
      await supabaseAdmin.from("push_subscriptions").update({ is_active: false }).in("endpoint", gone);
    }

    if (dispatch?.id) {
      await supabaseAdmin.from("push_dispatches").update({ sent_count: sent, failed_count: failed }).eq("id", dispatch.id);
    }

    return { ok: true, duplicated: false, sent, failed, audience: subs.length };
  });

/** Riwayat pengiriman push wilayah (untuk transparansi di dashboard admin). */
export const listPushDispatches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("push_dispatches")
      .select("id, title, body, url, entity_type, sent_count, failed_count, created_at")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Jumlah pengikut notifikasi wilayah — dipakai sebagai konteks di dashboard. */
export const getPushAudience = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("region_id")
      .eq("id", context.userId)
      .maybeSingle();
    if (!profile?.region_id) return { count: 0 };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("push_region_follows")
      .select("push_subscriptions!inner(is_active)")
      .eq("region_id", profile.region_id);
    return { count: (data ?? []).filter((r: any) => r.push_subscriptions?.is_active).length };
  });
