import { t as getSupabasePublicConfig } from "./config-Jd4haonG.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { a as objectType, r as enumType, s as stringType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-BbGffMfs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/public.functions-D7PBADue.js
function pub() {
	const { url, publishableKey } = getSupabasePublicConfig();
	return createClient(url, publishableKey, { auth: {
		storage: void 0,
		persistSession: false,
		autoRefreshToken: false
	} });
}
var listPublishedRegions_createServerFn_handler = createServerRpc({
	id: "d104ad4f80e40e46e5b84481bb0e28e55b7468e3a6fac677d80fdd9b47502235",
	name: "listPublishedRegions",
	filename: "src/lib/public.functions.ts"
}, (opts) => listPublishedRegions.__executeServer(opts));
var listPublishedRegions = createServerFn({ method: "GET" }).handler(listPublishedRegions_createServerFn_handler, async () => {
	const { data, error } = await pub().from("regions").select("id, slug, name, tagline, description, cover_image_url, coordinates").eq("is_published", true).order("name");
	if (error) throw new Error(error.message);
	return data ?? [];
});
var getRegionContact_createServerFn_handler = createServerRpc({
	id: "c37c3f949403e79705b4f61f31f6c67111169019eb048a0b80ea0f7773c0a832",
	name: "getRegionContact",
	filename: "src/lib/public.functions.ts"
}, (opts) => getRegionContact.__executeServer(opts));
var getRegionContact = createServerFn({ method: "GET" }).validator((data) => objectType({ slug: stringType().min(1) }).parse(data)).handler(getRegionContact_createServerFn_handler, async ({ data }) => {
	const { data: region } = await pub().from("regions").select("id, slug, name, admin_whatsapp").eq("slug", data.slug).eq("is_published", true).maybeSingle();
	return region ?? null;
});
var getRegionBySlug_createServerFn_handler = createServerRpc({
	id: "e9dcf588fb14c209b5364487184ba5afe1229d7f32d2e5f0a4e23357096699b5",
	name: "getRegionBySlug",
	filename: "src/lib/public.functions.ts"
}, (opts) => getRegionBySlug.__executeServer(opts));
var getRegionBySlug = createServerFn({ method: "GET" }).validator((data) => objectType({ slug: stringType().min(1) }).parse(data)).handler(getRegionBySlug_createServerFn_handler, async ({ data }) => {
	const sb = pub();
	const { data: region, error } = await sb.from("regions").select("*").eq("slug", data.slug).eq("is_published", true).maybeSingle();
	if (error) throw new Error(error.message);
	if (!region) return null;
	const [{ data: categories }, { data: locations }] = await Promise.all([sb.from("categories").select("*").or(`region_id.eq.${region.id},region_id.is.null`).order("sort_order"), sb.from("locations").select("*").eq("region_id", region.id).eq("is_published", true).order("is_featured", { ascending: false }).order("sort_order")]);
	return {
		region,
		categories: categories ?? [],
		locations: locations ?? []
	};
});
var getLocationBySlug_createServerFn_handler = createServerRpc({
	id: "d54b86b921284c4386702d5269ead90bb4922c787e8cde9a570400fe29c5a0e7",
	name: "getLocationBySlug",
	filename: "src/lib/public.functions.ts"
}, (opts) => getLocationBySlug.__executeServer(opts));
var getLocationBySlug = createServerFn({ method: "GET" }).validator((data) => objectType({
	regionSlug: stringType(),
	locationSlug: stringType()
}).parse(data)).handler(getLocationBySlug_createServerFn_handler, async ({ data }) => {
	const sb = pub();
	const { data: region } = await sb.from("regions").select("id, slug, name, admin_whatsapp").eq("slug", data.regionSlug).eq("is_published", true).maybeSingle();
	if (!region) return null;
	const [{ data: location, error }, { data: otherLocations }, { data: categories }, { data: couriers }] = await Promise.all([
		sb.from("locations").select("*, categories(id, name, slug, icon, color)").eq("region_id", region.id).eq("slug", data.locationSlug).eq("is_published", true).maybeSingle(),
		sb.from("locations").select("id, slug, name, photo_url, hours, price_range, is_featured, category_id, categories(id, name, slug, icon, color)").eq("region_id", region.id).eq("is_published", true).neq("slug", data.locationSlug).order("is_featured", { ascending: false }),
		sb.from("categories").select("*").or(`region_id.eq.${region.id},region_id.is.null`).order("sort_order"),
		sb.from("couriers").select("id, name, whatsapp, coordinates").eq("region_id", region.id).eq("is_active", true).order("sort_order")
	]);
	if (error) throw new Error(error.message);
	if (!location) return null;
	return {
		region,
		location,
		otherLocations: otherLocations ?? [],
		categories: categories ?? [],
		couriers: couriers ?? []
	};
});
var resolveQrCode_createServerFn_handler = createServerRpc({
	id: "8bc0c93ab60bcaae4873808905d8d6076a5242fcac6a5761906091667addb7be",
	name: "resolveQrCode",
	filename: "src/lib/public.functions.ts"
}, (opts) => resolveQrCode.__executeServer(opts));
var resolveQrCode = createServerFn({ method: "GET" }).validator((data) => objectType({ code: stringType().min(1) }).parse(data)).handler(resolveQrCode_createServerFn_handler, async ({ data }) => {
	const sb = pub();
	const { data: qrRow } = await sb.from("qr_assets").select("id, code, status").eq("code", data.code).maybeSingle();
	if (!qrRow) return null;
	const qr = {
		id: qrRow.id,
		code: qrRow.code,
		status: qrRow.status
	};
	const { data: assignment } = await sb.from("qr_assignments").select("id, location_id, region_id, locations(slug), regions(slug)").eq("qr_id", qr.id).is("released_at", null).maybeSingle();
	return {
		qr,
		assignment
	};
});
var recordVisit_createServerFn_handler = createServerRpc({
	id: "fd067e91ea855fc246cb1a9047f0ba2c3faf9a8fece248deb6d4689fbf0ef97e",
	name: "recordVisit",
	filename: "src/lib/public.functions.ts"
}, (opts) => recordVisit.__executeServer(opts));
var recordVisit = createServerFn({ method: "POST" }).validator((data) => objectType({
	regionId: stringType().uuid().nullable().optional(),
	locationId: stringType().uuid().nullable().optional(),
	qrAssignmentId: stringType().uuid().nullable().optional(),
	source: enumType([
		"qr",
		"gps",
		"direct"
	]).default("direct")
}).parse(data)).handler(recordVisit_createServerFn_handler, async ({ data }) => {
	const { error } = await pub().from("visits").insert({
		region_id: data.regionId ?? null,
		location_id: data.locationId ?? null,
		qr_assignment_id: data.qrAssignmentId ?? null,
		source: data.source
	});
	if (error) throw new Error(error.message);
	return { ok: true };
});
var recordEngagement_createServerFn_handler = createServerRpc({
	id: "ac212eb8e710af9b9edb7eb7795e6518a75cc104c3e561e3176d8cf51680c4fe",
	name: "recordEngagement",
	filename: "src/lib/public.functions.ts"
}, (opts) => recordEngagement.__executeServer(opts));
var recordEngagement = createServerFn({ method: "POST" }).validator((data) => objectType({
	regionId: stringType().uuid(),
	locationId: stringType().uuid().nullable().optional(),
	kind: enumType([
		"whatsapp",
		"gmaps",
		"save",
		"share"
	])
}).parse(data)).handler(recordEngagement_createServerFn_handler, async ({ data }) => {
	const { error } = await pub().from("engagement_events").insert({
		region_id: data.regionId,
		location_id: data.locationId ?? null,
		kind: data.kind
	});
	if (error) throw new Error(error.message);
	return { ok: true };
});
var listRegionInfoPosts_createServerFn_handler = createServerRpc({
	id: "6c07d2031751dc9e16a3d848a29da44e2fd6ebc61818f6f13dda0ef7b079ce8e",
	name: "listRegionInfoPosts",
	filename: "src/lib/public.functions.ts"
}, (opts) => listRegionInfoPosts.__executeServer(opts));
var listRegionInfoPosts = createServerFn({ method: "GET" }).validator((data) => objectType({ regionSlug: stringType().min(1) }).parse(data)).handler(listRegionInfoPosts_createServerFn_handler, async ({ data }) => {
	const sb = pub();
	const { data: region } = await sb.from("regions").select("id, slug, name").eq("slug", data.regionSlug).eq("is_published", true).maybeSingle();
	if (!region) return {
		region: null,
		posts: []
	};
	const { data: posts, error } = await sb.from("info_posts").select("id, title, body, cover_image_url, gallery_urls, youtube_url, published_at, category_id, categories(id, name, icon, color)").eq("region_id", region.id).eq("is_published", true).order("published_at", { ascending: false }).limit(100);
	if (error) throw new Error(error.message);
	return {
		region,
		posts: posts ?? []
	};
});
var listRegionAds_createServerFn_handler = createServerRpc({
	id: "621d99c653bc59f1dfaa5c13829d915c5d43bda70529efc70c798f22a8385e6d",
	name: "listRegionAds",
	filename: "src/lib/public.functions.ts"
}, (opts) => listRegionAds.__executeServer(opts));
var listRegionAds = createServerFn({ method: "GET" }).validator((data) => objectType({ regionSlug: stringType().min(1) }).parse(data)).handler(listRegionAds_createServerFn_handler, async ({ data }) => {
	const sb = pub();
	const { data: region } = await sb.from("regions").select("id").eq("slug", data.regionSlug).eq("is_published", true).maybeSingle();
	if (!region) return {
		banners: [],
		featured: []
	};
	const { data: ads, error } = await sb.from("ads").select("id, placement, title, description, image_url, location_id, category_id, sort_order, ad_targets(location_id, sort_order), locations!ads_location_id_fkey(id, slug, name, photo_url, price_range, hours, category_id)").eq("region_id", region.id).in("placement", ["banner", "featured"]).order("sort_order").limit(50);
	if (error) throw new Error(error.message);
	const rows = ads ?? [];
	return {
		banners: rows.filter((a) => a.placement === "banner"),
		featured: rows.filter((a) => a.placement === "featured")
	};
});
var listContextualAds_createServerFn_handler = createServerRpc({
	id: "a4512c9513d3520f3419714407b3902a2b678d7d39eeae474f2753640491ec1a",
	name: "listContextualAds",
	filename: "src/lib/public.functions.ts"
}, (opts) => listContextualAds.__executeServer(opts));
var listContextualAds = createServerFn({ method: "GET" }).validator((data) => objectType({ hostLocationId: stringType().uuid() }).parse(data)).handler(listContextualAds_createServerFn_handler, async ({ data }) => {
	const { data: ads, error } = await pub().from("ads").select("id, title, description, image_url, location_id, locations!ads_location_id_fkey(id, slug, name, photo_url, price_range)").eq("placement", "contextual").eq("host_location_id", data.hostLocationId).order("sort_order").limit(5);
	if (error) throw new Error(error.message);
	return ads ?? [];
});
//#endregion
export { getLocationBySlug_createServerFn_handler, getRegionBySlug_createServerFn_handler, getRegionContact_createServerFn_handler, listContextualAds_createServerFn_handler, listPublishedRegions_createServerFn_handler, listRegionAds_createServerFn_handler, listRegionInfoPosts_createServerFn_handler, recordEngagement_createServerFn_handler, recordVisit_createServerFn_handler, resolveQrCode_createServerFn_handler };
