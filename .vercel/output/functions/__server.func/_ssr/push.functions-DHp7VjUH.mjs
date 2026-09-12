import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { a as objectType, n as booleanType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-BbGffMfs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/push.functions-DHp7VjUH.js
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
var SubscriptionInput = objectType({
	endpoint: stringType().url().max(2e3),
	p256dh: stringType().min(1).max(255),
	auth: stringType().min(1).max(255),
	userAgent: stringType().max(400).nullable().optional()
});
/** Public VAPID key — memang dirancang untuk dipakai di browser. */
var getPushConfig_createServerFn_handler = createServerRpc({
	id: "0e96b490fee478b9ea7a32f0c3d96709008fe304659f4cc6a467eb5b76f2af9e",
	name: "getPushConfig",
	filename: "src/lib/push.functions.ts"
}, (opts) => getPushConfig.__executeServer(opts));
var getPushConfig = createServerFn({ method: "GET" }).handler(getPushConfig_createServerFn_handler, async () => {
	const { DEFAULT_VAPID_PUBLIC_KEY } = await import("./push-config-C-oifwOM.mjs").then((n) => n.t).then((n) => n.n);
	const publicKey = process.env["VAPID_PUBLIC_KEY"] ?? process.env["VITE_VAPID_PUBLIC_KEY"] ?? void 0 ?? DEFAULT_VAPID_PUBLIC_KEY;
	return {
		publicKey,
		enabled: Boolean(publicKey)
	};
});
async function admin() {
	const { supabaseAdmin } = await import("./client.server-BmP6sNtS.mjs");
	return supabaseAdmin;
}
async function upsertSubscription(sb, input) {
	const { data, error } = await sb.from("push_subscriptions").upsert({
		endpoint: input.endpoint,
		p256dh: input.p256dh,
		auth: input.auth,
		user_agent: input.userAgent ?? null,
		is_active: true,
		last_seen_at: (/* @__PURE__ */ new Date()).toISOString()
	}, { onConflict: "endpoint" }).select("id").single();
	if (error) throw new Error(error.message);
	return data.id;
}
async function followedSlugs(sb, subscriptionId) {
	const { data } = await sb.from("push_region_follows").select("regions(slug)").eq("subscription_id", subscriptionId);
	return (data ?? []).map((r) => r.regions?.slug).filter(Boolean);
}
/**
* Menyimpan/menyegarkan langganan perangkat dan mengembalikan daftar wilayah
* yang diikuti perangkat tersebut. Idempoten: satu endpoint = satu baris.
*/
var syncPushSubscription_createServerFn_handler = createServerRpc({
	id: "703ade5153ecdd88b502d1b84c7fd5dd56759e16dcbe0ab463fc4aa4fb53531a",
	name: "syncPushSubscription",
	filename: "src/lib/push.functions.ts"
}, (opts) => syncPushSubscription.__executeServer(opts));
var syncPushSubscription = createServerFn({ method: "POST" }).validator((data) => SubscriptionInput.parse(data)).handler(syncPushSubscription_createServerFn_handler, async ({ data }) => {
	const sb = await admin();
	return { regionSlugs: await followedSlugs(sb, await upsertSubscription(sb, data)) };
});
var setRegionFollow_createServerFn_handler = createServerRpc({
	id: "516717dd6b7b0c5dc561a3e8617902a47dabb75da269db02d29fb6b39460b96f",
	name: "setRegionFollow",
	filename: "src/lib/push.functions.ts"
}, (opts) => setRegionFollow.__executeServer(opts));
var setRegionFollow = createServerFn({ method: "POST" }).validator((data) => SubscriptionInput.extend({
	regionSlug: stringType().min(1).max(120),
	follow: booleanType()
}).parse(data)).handler(setRegionFollow_createServerFn_handler, async ({ data }) => {
	const sb = await admin();
	const { data: region } = await sb.from("regions").select("id").eq("slug", data.regionSlug).eq("is_published", true).maybeSingle();
	if (!region) throw new Error("Wilayah tidak ditemukan.");
	const subscriptionId = await upsertSubscription(sb, data);
	if (data.follow) {
		const { error } = await sb.from("push_region_follows").upsert({
			subscription_id: subscriptionId,
			region_id: region.id
		}, { onConflict: "subscription_id,region_id" });
		if (error) throw new Error(error.message);
	} else {
		const { error } = await sb.from("push_region_follows").delete().eq("subscription_id", subscriptionId).eq("region_id", region.id);
		if (error) throw new Error(error.message);
	}
	return { regionSlugs: await followedSlugs(sb, subscriptionId) };
});
var deactivatePushSubscription_createServerFn_handler = createServerRpc({
	id: "a3a18ff37e05f99c9749839fb44240e8df3cec673a61a8d74803e90e4d108cc0",
	name: "deactivatePushSubscription",
	filename: "src/lib/push.functions.ts"
}, (opts) => deactivatePushSubscription.__executeServer(opts));
var deactivatePushSubscription = createServerFn({ method: "POST" }).validator((data) => objectType({ endpoint: stringType().url().max(2e3) }).parse(data)).handler(deactivatePushSubscription_createServerFn_handler, async ({ data }) => {
	await (await admin()).from("push_subscriptions").update({ is_active: false }).eq("endpoint", data.endpoint);
	return { ok: true };
});
//#endregion
export { deactivatePushSubscription_createServerFn_handler, getPushConfig_createServerFn_handler, setRegionFollow_createServerFn_handler, syncPushSubscription_createServerFn_handler };
