import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Push Notification — sisi pengunjung (tanpa login).
 *
 * Prinsip keamanan:
 * - Tabel `push_subscriptions` / `push_region_follows` TIDAK punya grant untuk
 *   anon/authenticated. Seluruh operasi hanya lewat server function ini
 *   memakai service role, sehingga tidak ada cara membaca langganan orang lain
 *   dari browser.
 * - Endpoint push adalah kapabilitas rahasia milik perangkat itu sendiri
 *   (acak & tidak bisa ditebak). Ia dipakai sebagai identitas perangkat,
 *   jadi user anonim tidak perlu login untuk mengelola langganannya.
 * - Private VAPID key tidak pernah keluar dari server.
 */

const SubscriptionInput = z.object({
  endpoint: z.string().url().max(2000),
  p256dh: z.string().min(1).max(255),
  auth: z.string().min(1).max(255),
  userAgent: z.string().max(400).nullable().optional(),
});

/** Public VAPID key — memang dirancang untuk dipakai di browser. */
export const getPushConfig = createServerFn({ method: "GET" }).handler(async () => {
  const publicKey =
    process.env["VAPID_PUBLIC_KEY"] ??
    process.env["VITE_VAPID_PUBLIC_KEY"] ??
    ((import.meta as any)?.env?.VITE_VAPID_PUBLIC_KEY as string | undefined) ??
    null;
  return { publicKey, enabled: Boolean(publicKey) };
});

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function upsertSubscription(sb: any, input: z.infer<typeof SubscriptionInput>) {
  const { data, error } = await sb
    .from("push_subscriptions")
    .upsert(
      {
        endpoint: input.endpoint,
        p256dh: input.p256dh,
        auth: input.auth,
        user_agent: input.userAgent ?? null,
        is_active: true,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "endpoint" },
    )
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return data.id as string;
}

async function followedSlugs(sb: any, subscriptionId: string) {
  const { data } = await sb
    .from("push_region_follows")
    .select("regions(slug)")
    .eq("subscription_id", subscriptionId);
  return (data ?? []).map((r: any) => r.regions?.slug).filter(Boolean) as string[];
}

/**
 * Menyimpan/menyegarkan langganan perangkat dan mengembalikan daftar wilayah
 * yang diikuti perangkat tersebut. Idempoten: satu endpoint = satu baris.
 */
export const syncPushSubscription = createServerFn({ method: "POST" })
  .validator((data: any) => SubscriptionInput.parse(data))
  .handler(async ({ data }) => {
    const sb = await admin();
    const id = await upsertSubscription(sb, data);
    return { regionSlugs: await followedSlugs(sb, id) };
  });

/** Mengikuti / berhenti mengikuti satu wilayah untuk perangkat ini. */
export const setRegionFollow = createServerFn({ method: "POST" })
  .validator((data: any) =>
    SubscriptionInput.extend({
      regionSlug: z.string().min(1).max(120),
      follow: z.boolean(),
    }).parse(data),
  )
  .handler(async ({ data }) => {
    const sb = await admin();
    const { data: region } = await sb
      .from("regions")
      .select("id")
      .eq("slug", data.regionSlug)
      .eq("is_published", true)
      .maybeSingle();
    if (!region) throw new Error("Wilayah tidak ditemukan.");

    const subscriptionId = await upsertSubscription(sb, data);

    if (data.follow) {
      const { error } = await sb
        .from("push_region_follows")
        .upsert({ subscription_id: subscriptionId, region_id: region.id }, { onConflict: "subscription_id,region_id" });
      if (error) throw new Error(error.message);
    } else {
      // Hanya melepas satu wilayah — langganan perangkat tetap hidup untuk
      // wilayah lain yang masih diikuti.
      const { error } = await sb
        .from("push_region_follows")
        .delete()
        .eq("subscription_id", subscriptionId)
        .eq("region_id", region.id);
      if (error) throw new Error(error.message);
    }

    return { regionSlugs: await followedSlugs(sb, subscriptionId) };
  });

/** Dipakai saat browser mencabut izin / user unsubscribe total. */
export const deactivatePushSubscription = createServerFn({ method: "POST" })
  .validator((data: any) => z.object({ endpoint: z.string().url().max(2000) }).parse(data))
  .handler(async ({ data }) => {
    const sb = await admin();
    await sb.from("push_subscriptions").update({ is_active: false }).eq("endpoint", data.endpoint);
    return { ok: true };
  });
