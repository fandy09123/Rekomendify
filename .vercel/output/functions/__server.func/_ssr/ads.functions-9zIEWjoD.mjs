import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-LwaZmRsQ.mjs";
import { a as objectType, i as numberType, n as booleanType, o as preprocessType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-BbGffMfs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ads.functions-9zIEWjoD.js
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
async function requireRegion(context) {
	const { data: profile } = await context.supabase.from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
	return profile.region_id;
}
var nullableUrl = preprocessType((v) => v === "" || v == null ? null : v, stringType().trim().url().refine((u) => /^https?:\/\//i.test(u), "URL harus http(s)").nullable());
var nullableUuid = preprocessType((v) => v === "" || v == null ? null : v, stringType().uuid().nullable());
var AdInput = objectType({
	id: stringType().uuid().optional(),
	placement: enumType([
		"banner",
		"featured",
		"contextual"
	]),
	title: stringType().trim().min(1).max(120),
	description: stringType().trim().max(500).nullable().optional(),
	image_url: nullableUrl.optional(),
	location_id: nullableUuid.optional(),
	category_id: nullableUuid.optional(),
	host_location_id: nullableUuid.optional(),
	sort_order: numberType().int().default(0),
	target_ids: arrayType(stringType().uuid()).max(5).default([])
});
var listAds_createServerFn_handler = createServerRpc({
	id: "366da62c569d5cf4ed507bbee6d54fa3f8cbe22d555f04c3ce6799883bb552e9",
	name: "listAds",
	filename: "src/lib/ads.functions.ts"
}, (opts) => listAds.__executeServer(opts));
var listAds = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listAds_createServerFn_handler, async ({ context }) => {
	const { data: profile } = await context.supabase.from("profiles").select("region_id").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id) return [];
	const { data, error } = await context.supabase.from("ads").select("*, ad_targets(id, location_id, sort_order), locations!ads_location_id_fkey(id, name, slug), categories(id, name)").eq("region_id", profile.region_id).order("created_at", { ascending: false }).limit(200);
	if (error) throw new Error(error.message);
	return data ?? [];
});
var myCredits_createServerFn_handler = createServerRpc({
	id: "331cb9ec76a322ffb8a44e87bc6bb46b56cfd42967a2229a22a3eb706025893f",
	name: "myCredits",
	filename: "src/lib/ads.functions.ts"
}, (opts) => myCredits.__executeServer(opts));
var myCredits = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(myCredits_createServerFn_handler, async ({ context }) => {
	const sb = context.supabase;
	const { data: profile } = await sb.from("profiles").select("region_id").eq("id", context.userId).maybeSingle();
	const [{ data: prices }, credits, ledger] = await Promise.all([
		sb.from("promo_prices").select("placement, duration_days, credits").eq("is_active", true).order("duration_days"),
		profile?.region_id ? sb.from("region_credits").select("balance").eq("region_id", profile.region_id).maybeSingle() : Promise.resolve({ data: null }),
		profile?.region_id ? sb.from("credit_ledger").select("*").eq("region_id", profile.region_id).order("created_at", { ascending: false }).limit(50) : Promise.resolve({ data: [] })
	]);
	return {
		balance: credits?.data?.balance ?? 0,
		prices: prices ?? [],
		ledger: ledger?.data ?? []
	};
});
var saveAd_createServerFn_handler = createServerRpc({
	id: "0999d7cb4ae96f2e6ecb28ef58a0b4a0b9af2baa2e0a0629e2fe6fabe45b163d",
	name: "saveAd",
	filename: "src/lib/ads.functions.ts"
}, (opts) => saveAd.__executeServer(opts));
var saveAd = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => AdInput.parse(data)).handler(saveAd_createServerFn_handler, async ({ data, context }) => {
	const regionId = await requireRegion(context);
	const sb = context.supabase;
	const locIds = [
		data.location_id,
		data.host_location_id,
		...data.target_ids
	].filter(Boolean);
	if (locIds.length) {
		const { data: locs, error } = await sb.from("locations").select("id").eq("region_id", regionId).in("id", locIds);
		if (error) throw new Error(error.message);
		if ((locs ?? []).length !== new Set(locIds).size) throw new Error("Lokasi tidak berada di wilayah Anda.");
	}
	if (data.category_id) {
		const { data: cat } = await sb.from("categories").select("id, region_id").eq("id", data.category_id).maybeSingle();
		if (!cat || cat.region_id && cat.region_id !== regionId) throw new Error("Kategori tidak berada di wilayah Anda.");
	}
	if (data.placement === "featured" && !data.location_id) throw new Error("Iklan sorotan wajib memilih lokasi.");
	if (data.placement === "contextual" && (!data.location_id || !data.host_location_id)) throw new Error("Promosi kontekstual wajib memilih lokasi yang dipromosikan dan lokasi tempat tayang.");
	const payload = {
		region_id: regionId,
		placement: data.placement,
		title: data.title,
		description: data.description ?? null,
		image_url: data.image_url ?? null,
		location_id: data.location_id ?? null,
		category_id: data.category_id ?? null,
		host_location_id: data.host_location_id ?? null,
		sort_order: data.sort_order
	};
	let adId = data.id;
	if (adId) {
		const { error } = await sb.from("ads").update(payload).eq("id", adId).eq("region_id", regionId);
		if (error) throw new Error(error.message);
	} else {
		const { data: row, error } = await sb.from("ads").insert({
			...payload,
			created_by: context.userId
		}).select("id").single();
		if (error) throw new Error(error.message);
		adId = row.id;
	}
	if (data.placement === "banner") {
		await sb.from("ad_targets").delete().eq("ad_id", adId).eq("region_id", regionId);
		if (data.target_ids.length) {
			const { error } = await sb.from("ad_targets").insert(data.target_ids.slice(0, 5).map((lid, i) => ({
				ad_id: adId,
				region_id: regionId,
				location_id: lid,
				sort_order: i
			})));
			if (error) throw new Error(error.message);
		}
	}
	return { id: adId };
});
var deleteAd_createServerFn_handler = createServerRpc({
	id: "165f6b5098b795c7472c0550a57f60e43dd18da3ce1c2f9509a61dff5b5b1836",
	name: "deleteAd",
	filename: "src/lib/ads.functions.ts"
}, (opts) => deleteAd.__executeServer(opts));
var deleteAd = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(deleteAd_createServerFn_handler, async ({ data, context }) => {
	const regionId = await requireRegion(context);
	const { error } = await context.supabase.from("ads").delete().eq("id", data.id).eq("region_id", regionId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var activateAd_createServerFn_handler = createServerRpc({
	id: "007cf165f8ad46c0998041fe0c4bd9676d64fff431594ac50e9b61ca5cda98ae",
	name: "activateAd",
	filename: "src/lib/ads.functions.ts"
}, (opts) => activateAd.__executeServer(opts));
var activateAd = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({
	id: stringType().uuid(),
	duration_days: numberType().int().min(1).max(365)
}).parse(data)).handler(activateAd_createServerFn_handler, async ({ data, context }) => {
	const { data: res, error } = await context.supabase.rpc("activate_ad", {
		_ad_id: data.id,
		_duration_days: data.duration_days
	});
	if (error) throw new Error(error.message);
	return res;
});
var setAdPaused_createServerFn_handler = createServerRpc({
	id: "412f3a1b4557ffc9c13bf0898a5879185bdc51a5e886b5ba7a375338b8f4e085",
	name: "setAdPaused",
	filename: "src/lib/ads.functions.ts"
}, (opts) => setAdPaused.__executeServer(opts));
var setAdPaused = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({
	id: stringType().uuid(),
	paused: booleanType()
}).parse(data)).handler(setAdPaused_createServerFn_handler, async ({ data, context }) => {
	const regionId = await requireRegion(context);
	const { data: ad } = await context.supabase.from("ads").select("id, status, end_at").eq("id", data.id).eq("region_id", regionId).maybeSingle();
	if (!ad) throw new Error("Iklan tidak ditemukan.");
	if (!ad.end_at) throw new Error("Iklan belum pernah diaktifkan.");
	const { error } = await context.supabase.from("ads").update({ status: data.paused ? "paused" : "active" }).eq("id", data.id).eq("region_id", regionId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
//#endregion
export { activateAd_createServerFn_handler, deleteAd_createServerFn_handler, listAds_createServerFn_handler, myCredits_createServerFn_handler, saveAd_createServerFn_handler, setAdPaused_createServerFn_handler };
