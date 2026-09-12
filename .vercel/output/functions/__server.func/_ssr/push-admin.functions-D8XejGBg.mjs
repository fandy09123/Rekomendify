import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-LwaZmRsQ.mjs";
import { a as objectType, r as enumType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-BbGffMfs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/push-admin.functions-D8XejGBg.js
/**
* Pengiriman Web Push oleh Admin Wilayah.
*
* Kewenangan tidak pernah diambil dari request: region target selalu dibaca
* dari `profiles` milik user yang login (dan harus `is_active`). Admin karena
* itu mustahil menembak wilayah lain dengan memanipulasi payload.
*/
var SendInput = objectType({
	entityType: enumType([
		"info_post",
		"location",
		"ad"
	]),
	entityId: stringType().max(80).nullable().optional(),
	title: stringType().trim().min(1).max(80),
	body: stringType().trim().min(1).max(180),
	/** Path relatif di dalam aplikasi, mis. `/r/mulyosari/warung-bu-tin`. */
	path: stringType().trim().max(300).nullable().optional()
});
var sendRegionPush_createServerFn_handler = createServerRpc({
	id: "33d1b0b39e48a5b8a4f31b4504bfdde56464e4b4139de5bbbc8d7f44c40ce667",
	name: "sendRegionPush",
	filename: "src/lib/push-admin.functions.ts"
}, (opts) => sendRegionPush.__executeServer(opts));
var sendRegionPush = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => SendInput.parse(data)).handler(sendRegionPush_createServerFn_handler, async ({ data, context }) => {
	const { data: profile } = await context.supabase.from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
	const regionId = profile.region_id;
	const { readVapidConfig, sendWebPush } = await import("./webpush.server-CQNy3Aiq.mjs");
	const cfg = readVapidConfig();
	if (!cfg) throw new Error("Notifikasi belum dikonfigurasi di server.");
	const { supabaseAdmin } = await import("./client.server-BmP6sNtS.mjs");
	const { data: region } = await supabaseAdmin.from("regions").select("slug, name").eq("id", regionId).maybeSingle();
	const safePath = data.path && /^\/[\w\-/%.]*$/.test(data.path) ? data.path : region ? `/r/${region.slug}` : "/";
	const bucket = Math.floor(Date.now() / 6e4);
	const dedupeKey = `${data.entityType}:${data.entityId ?? "none"}:${regionId}:${bucket}`;
	const { data: dispatch, error: dispatchError } = await supabaseAdmin.from("push_dispatches").insert({
		region_id: regionId,
		actor_id: context.userId,
		entity_type: data.entityType,
		entity_id: data.entityId ?? null,
		dedupe_key: dedupeKey,
		title: data.title,
		body: data.body,
		url: safePath
	}).select("id").maybeSingle();
	if (dispatchError) {
		if (dispatchError.code === "23505") return {
			ok: true,
			duplicated: true,
			sent: 0,
			failed: 0
		};
		throw new Error(dispatchError.message);
	}
	const { data: rows } = await supabaseAdmin.from("push_region_follows").select("push_subscriptions!inner(id, endpoint, p256dh, auth, is_active)").eq("region_id", regionId);
	const subs = (rows ?? []).map((r) => r.push_subscriptions).filter((s) => s && s.is_active);
	const payload = {
		title: data.title,
		body: data.body,
		url: safePath,
		tag: `${data.entityType}:${data.entityId ?? dispatch?.id ?? "region"}`,
		regionSlug: region?.slug ?? null
	};
	let sent = 0;
	let failed = 0;
	const gone = [];
	for (let i = 0; i < subs.length; i += 25) {
		const results = await Promise.all(subs.slice(i, i + 25).map((s) => sendWebPush({
			endpoint: s.endpoint,
			p256dh: s.p256dh,
			auth: s.auth
		}, payload, cfg)));
		for (const r of results) if (r.ok) sent++;
		else {
			failed++;
			if (r.gone) gone.push(r.endpoint);
		}
	}
	if (gone.length) await supabaseAdmin.from("push_subscriptions").update({ is_active: false }).in("endpoint", gone);
	if (dispatch?.id) await supabaseAdmin.from("push_dispatches").update({
		sent_count: sent,
		failed_count: failed
	}).eq("id", dispatch.id);
	return {
		ok: true,
		duplicated: false,
		sent,
		failed,
		audience: subs.length
	};
});
var listPushDispatches_createServerFn_handler = createServerRpc({
	id: "58798a6fcc6f8503dc8cf3f10a4c3bbc1dcacd040852ca222a06e4ad87365e1b",
	name: "listPushDispatches",
	filename: "src/lib/push-admin.functions.ts"
}, (opts) => listPushDispatches.__executeServer(opts));
var listPushDispatches = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listPushDispatches_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("push_dispatches").select("id, title, body, url, entity_type, sent_count, failed_count, created_at").order("created_at", { ascending: false }).limit(30);
	if (error) throw new Error(error.message);
	return data ?? [];
});
var getPushAudience_createServerFn_handler = createServerRpc({
	id: "13127f242376a56cf61eab9676fcf2c341e7e4967c22891a9583f8c0feab64c8",
	name: "getPushAudience",
	filename: "src/lib/push-admin.functions.ts"
}, (opts) => getPushAudience.__executeServer(opts));
var getPushAudience = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getPushAudience_createServerFn_handler, async ({ context }) => {
	const { data: profile } = await context.supabase.from("profiles").select("region_id").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id) return { count: 0 };
	const { supabaseAdmin } = await import("./client.server-BmP6sNtS.mjs");
	const { data } = await supabaseAdmin.from("push_region_follows").select("push_subscriptions!inner(is_active)").eq("region_id", profile.region_id);
	return { count: (data ?? []).filter((r) => r.push_subscriptions?.is_active).length };
});
//#endregion
export { getPushAudience_createServerFn_handler, listPushDispatches_createServerFn_handler, sendRegionPush_createServerFn_handler };
