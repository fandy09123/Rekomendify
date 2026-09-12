import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-LwaZmRsQ.mjs";
import { a as objectType, i as numberType, n as booleanType, o as preprocessType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { t as createServerRpc } from "./createServerRpc-BbGffMfs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-fCPH7WUt.js
var slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
var myProfile_createServerFn_handler = createServerRpc({
	id: "b2206f360075ed21d45a5e1471a278d928158f1469e02e22bbcd32340d392c5e",
	name: "myProfile",
	filename: "src/lib/admin.functions.ts"
}, (opts) => myProfile.__executeServer(opts));
var myProfile = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(myProfile_createServerFn_handler, async ({ context }) => {
	const { data, error } = await context.supabase.from("profiles").select("id, email, full_name, is_active, region_id").eq("id", context.userId).maybeSingle();
	if (error) throw new Error(error.message);
	return data;
});
var myRegion_createServerFn_handler = createServerRpc({
	id: "205ac07a6686306e6225bac6bee09634d14e29e3606db66050377e5eb3f33727",
	name: "myRegion",
	filename: "src/lib/admin.functions.ts"
}, (opts) => myRegion.__executeServer(opts));
var myRegion = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(myRegion_createServerFn_handler, async ({ context }) => {
	const sb = context.supabase;
	const { data: profile } = await sb.from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id) return {
		profile,
		region: null,
		categories: [],
		locations: [],
		couriers: []
	};
	const [{ data: region }, { data: cats }, { data: locs }, { data: couriers }] = await Promise.all([
		sb.from("regions").select("*").eq("id", profile.region_id).maybeSingle(),
		sb.from("categories").select("*").eq("region_id", profile.region_id).order("sort_order"),
		sb.from("locations").select("*").eq("region_id", profile.region_id).order("sort_order"),
		sb.from("couriers").select("*").eq("region_id", profile.region_id).order("sort_order")
	]);
	return {
		profile,
		region,
		categories: cats ?? [],
		locations: locs ?? [],
		couriers: couriers ?? []
	};
});
var nullableUrl = preprocessType((v) => v === "" || v == null ? null : v, stringType().url().nullable());
preprocessType((v) => v === "" || v == null ? null : v, stringType().trim().url().refine((u) => /^https?:\/\//i.test(u), { message: "URL harus diawali http:// atau https://" }).nullable());
var nullableCoords = preprocessType((v) => {
	if (v === "" || v == null) return null;
	return String(v).replace(/\s+/g, "");
}, stringType().regex(/^-?\d{1,2}(\.\d+)?,-?\d{1,3}(\.\d+)?$/, "Format koordinat harus seperti -8.002344,111.817618").refine((s) => {
	const [lat, lng] = s.split(",").map(Number);
	return Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}, "Koordinat di luar jangkauan yang wajar.").nullable());
var nullableWhatsapp = preprocessType((v) => {
	if (v === "" || v == null) return null;
	let d = String(v).replace(/\D/g, "");
	if (d.startsWith("0")) d = `62${d.slice(1)}`;
	return d || null;
}, stringType().regex(/^\d{8,20}$/, "Nomor WhatsApp tidak valid.").nullable());
var RegionUpdate = objectType({
	name: stringType().min(1),
	slug: stringType().min(1).optional(),
	tagline: stringType().nullable().optional(),
	description: stringType().nullable().optional(),
	cover_image_url: nullableUrl.optional(),
	welcome_message: stringType().nullable().optional(),
	mascot_name: stringType().nullable().optional(),
	coordinates: nullableCoords.optional(),
	admin_whatsapp: nullableWhatsapp.optional(),
	is_published: booleanType().default(false)
});
var updateMyRegion_createServerFn_handler = createServerRpc({
	id: "adefe38b06352a5425b722ad88ee8e7198fa13ed01dd070265ea6d2355aa76f2",
	name: "updateMyRegion",
	filename: "src/lib/admin.functions.ts"
}, (opts) => updateMyRegion.__executeServer(opts));
var updateMyRegion = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => RegionUpdate.parse(data)).handler(updateMyRegion_createServerFn_handler, async ({ data, context }) => {
	const { data: profile } = await context.supabase.from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id) throw new Error("Akun Anda belum terhubung ke wilayah.");
	if (!profile.is_active) throw new Error("Akun belum diaktifkan.");
	const slug = data.slug || slugify(data.name);
	const { error } = await context.supabase.from("regions").update({
		...data,
		slug
	}).eq("id", profile.region_id);
	if (error) throw new Error(error.message);
	return { id: profile.region_id };
});
var CategoryInput = objectType({
	id: stringType().uuid().optional(),
	name: stringType().min(1),
	icon: stringType().nullable().optional(),
	sort_order: numberType().int().default(0)
});
var saveCategory_createServerFn_handler = createServerRpc({
	id: "d55046ba33898196eca5650d70b9240e9ea3d10d5d71b6dd00eddef9ea1312c1",
	name: "saveCategory",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveCategory.__executeServer(opts));
var saveCategory = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => CategoryInput.parse(data)).handler(saveCategory_createServerFn_handler, async ({ data, context }) => {
	const { data: profile } = await context.supabase.from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
	const slug = slugify(data.name);
	const payload = {
		...data,
		slug,
		region_id: profile.region_id
	};
	if (data.id) {
		const { error } = await context.supabase.from("categories").update(payload).eq("id", data.id).eq("region_id", profile.region_id);
		if (error) throw new Error(error.message);
		return { id: data.id };
	}
	const { data: row, error } = await context.supabase.from("categories").insert(payload).select("id").single();
	if (error) throw new Error(error.message);
	return { id: row.id };
});
var deleteCategory_createServerFn_handler = createServerRpc({
	id: "f474bf6273f5a18c6cc5ab7a1e03dbbd6091e0cc20a15e2ec3f36e561a6d03af",
	name: "deleteCategory",
	filename: "src/lib/admin.functions.ts"
}, (opts) => deleteCategory.__executeServer(opts));
var deleteCategory = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(deleteCategory_createServerFn_handler, async ({ data, context }) => {
	const { data: profile } = await context.supabase.from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
	const { error } = await context.supabase.from("categories").delete().eq("id", data.id).eq("region_id", profile.region_id);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var youtubeUrl = preprocessType((v) => v === "" || v == null ? null : v, stringType().url().refine((u) => /(youtube\.com|youtu\.be)/i.test(u), { message: "URL harus berasal dari YouTube." }).nullable());
var LocationInput = objectType({
	id: stringType().uuid().optional(),
	category_id: stringType().uuid().nullable().optional(),
	name: stringType().min(1),
	photo_url: nullableUrl.optional(),
	gallery_urls: arrayType(stringType().url()).max(5).default([]),
	youtube_url: youtubeUrl.optional(),
	coordinates: nullableCoords.optional(),
	whatsapp: nullableWhatsapp.optional(),
	description: stringType().nullable().optional(),
	hours: stringType().nullable().optional(),
	price_range: stringType().nullable().optional(),
	is_featured: booleanType().default(false),
	is_published: booleanType().default(true),
	sort_order: numberType().int().default(0)
});
var saveLocation_createServerFn_handler = createServerRpc({
	id: "18ec98b7f0b172efe32139ef73d377cfcc18b993d9fbdb4d2286b38837d49077",
	name: "saveLocation",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveLocation.__executeServer(opts));
var saveLocation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => LocationInput.parse(data)).handler(saveLocation_createServerFn_handler, async ({ data, context }) => {
	const { data: profile } = await context.supabase.from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
	const slug = slugify(data.name);
	const payload = {
		...data,
		slug,
		region_id: profile.region_id
	};
	if (data.id) {
		const { error } = await context.supabase.from("locations").update(payload).eq("id", data.id).eq("region_id", profile.region_id);
		if (error) throw new Error(error.message);
		return { id: data.id };
	}
	const { data: row, error } = await context.supabase.from("locations").insert(payload).select("id").single();
	if (error) throw new Error(error.message);
	return { id: row.id };
});
var deleteLocation_createServerFn_handler = createServerRpc({
	id: "1f21b8cb1189b42e5376c239a814b6d519aad5bc8544506424d480344d953f76",
	name: "deleteLocation",
	filename: "src/lib/admin.functions.ts"
}, (opts) => deleteLocation.__executeServer(opts));
var deleteLocation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(deleteLocation_createServerFn_handler, async ({ data, context }) => {
	const { data: profile } = await context.supabase.from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
	const { error } = await context.supabase.from("locations").delete().eq("id", data.id).eq("region_id", profile.region_id);
	if (error) throw new Error(error.message);
	return { ok: true };
});
/** Resolves the caller's region, rejecting inactive accounts. */
async function requireRegion(context) {
	const { data: profile } = await context.supabase.from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
	return profile.region_id;
}
var listQr_createServerFn_handler = createServerRpc({
	id: "ce82ac5ec68ab544cd787f85f929946dfecb0296c0fc867f48735c6b8cbfa6d3",
	name: "listQr",
	filename: "src/lib/admin.functions.ts"
}, (opts) => listQr.__executeServer(opts));
var listQr = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listQr_createServerFn_handler, async ({ context }) => {
	const { data: profile } = await context.supabase.from("profiles").select("region_id").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id) return [];
	const { data, error } = await context.supabase.from("qr_assets").select("*, qr_assignments!left(id, location_id, region_id, assigned_at, released_at, placement_note, locations(id, name, slug))").eq("region_id", profile.region_id).order("created_at", { ascending: false }).limit(500);
	if (error) throw new Error(error.message);
	return data ?? [];
});
var generateQrBatch_createServerFn_handler = createServerRpc({
	id: "02043ecb043000bd0e9c18e142292d1be18cc78e02fb1b9cceb1942139ca81a9",
	name: "generateQrBatch",
	filename: "src/lib/admin.functions.ts"
}, (opts) => generateQrBatch.__executeServer(opts));
var generateQrBatch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({
	count: numberType().int().min(1).max(200),
	label: stringType().min(1)
}).parse(data)).handler(generateQrBatch_createServerFn_handler, async ({ data, context }) => {
	const regionId = await requireRegion(context);
	const rows = Array.from({ length: data.count }).map(() => ({
		code: `RKM-${Math.random().toString(36).slice(2, 8).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`,
		status: "draft",
		batch_label: data.label,
		created_by: context.userId,
		region_id: regionId
	}));
	const { data: inserted, error } = await context.supabase.from("qr_assets").insert(rows).select("id, code");
	if (error) throw new Error(error.message);
	return inserted ?? [];
});
var assignQr_createServerFn_handler = createServerRpc({
	id: "c67393dbc15a72c5e577763037c33bc642311ea7d781f28ff5eed89740e14da1",
	name: "assignQr",
	filename: "src/lib/admin.functions.ts"
}, (opts) => assignQr.__executeServer(opts));
var assignQr = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({
	qr_id: stringType().uuid(),
	location_id: stringType().uuid(),
	placement_note: stringType().nullable().optional()
}).parse(data)).handler(assignQr_createServerFn_handler, async ({ data, context }) => {
	const regionId = await requireRegion(context);
	const { data: loc, error: locErr } = await context.supabase.from("locations").select("id, region_id").eq("id", data.location_id).maybeSingle();
	if (locErr) throw new Error(locErr.message);
	if (!loc || loc.region_id !== regionId) throw new Error("Lokasi tidak berada di wilayah Anda.");
	const { error } = await context.supabase.from("qr_assignments").insert({
		qr_id: data.qr_id,
		location_id: data.location_id,
		region_id: regionId,
		placement_note: data.placement_note ?? null,
		assigned_by: context.userId
	});
	if (error) throw new Error(error.message);
	return { ok: true };
});
var releaseQr_createServerFn_handler = createServerRpc({
	id: "dd1fb4258896e1fcf6570744a1710f821cdf822522fb207737649d17a64a1868",
	name: "releaseQr",
	filename: "src/lib/admin.functions.ts"
}, (opts) => releaseQr.__executeServer(opts));
var releaseQr = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ assignment_id: stringType().uuid() }).parse(data)).handler(releaseQr_createServerFn_handler, async ({ data, context }) => {
	const regionId = await requireRegion(context);
	const { error } = await context.supabase.from("qr_assignments").update({
		released_at: (/* @__PURE__ */ new Date()).toISOString(),
		released_by: context.userId
	}).eq("id", data.assignment_id).eq("region_id", regionId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var markQrPrinted_createServerFn_handler = createServerRpc({
	id: "c96e9835d5c02d620f2690ad88c51b6e4b43134bd93f967f6e76d72ef882a5a2",
	name: "markQrPrinted",
	filename: "src/lib/admin.functions.ts"
}, (opts) => markQrPrinted.__executeServer(opts));
var markQrPrinted = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({
	ids: arrayType(stringType().uuid()).min(1).max(200),
	printed: booleanType()
}).parse(data)).handler(markQrPrinted_createServerFn_handler, async ({ data, context }) => {
	const regionId = await requireRegion(context);
	const { error } = await context.supabase.from("qr_assets").update({ printed_at: data.printed ? (/* @__PURE__ */ new Date()).toISOString() : null }).in("id", data.ids).eq("region_id", regionId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var retireQr_createServerFn_handler = createServerRpc({
	id: "403b1774e794dc5005e8e04226a754c11f7c3f6d7273bd50bca7fea07a1d3e7f",
	name: "retireQr",
	filename: "src/lib/admin.functions.ts"
}, (opts) => retireQr.__executeServer(opts));
var retireQr = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({
	id: stringType().uuid(),
	retired: booleanType()
}).parse(data)).handler(retireQr_createServerFn_handler, async ({ data, context }) => {
	const regionId = await requireRegion(context);
	const { error } = await context.supabase.from("qr_assets").update({ status: data.retired ? "retired" : "draft" }).eq("id", data.id).eq("region_id", regionId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var deleteQr_createServerFn_handler = createServerRpc({
	id: "a36c7371f6cef0a30946eb7395724ed0e716dd72772d1db1f44be80ddb795f81",
	name: "deleteQr",
	filename: "src/lib/admin.functions.ts"
}, (opts) => deleteQr.__executeServer(opts));
var deleteQr = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(deleteQr_createServerFn_handler, async ({ data, context }) => {
	const regionId = await requireRegion(context);
	const { error } = await context.supabase.from("qr_assets").delete().eq("id", data.id).eq("region_id", regionId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var myAnalytics_createServerFn_handler = createServerRpc({
	id: "c886d99329a939ca5c85851001c2968e3596045457e967c45a4a8acb12b88422",
	name: "myAnalytics",
	filename: "src/lib/admin.functions.ts"
}, (opts) => myAnalytics.__executeServer(opts));
var myAnalytics = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ days: numberType().int().min(1).max(365).default(30) }).parse(data ?? {})).handler(myAnalytics_createServerFn_handler, async ({ data, context }) => {
	const { data: summary, error } = await context.supabase.rpc("admin_analytics_summary", { _days: data.days });
	if (error) throw new Error(error.message);
	return summary;
});
var InfoPostInput = objectType({
	id: stringType().uuid().optional(),
	category_id: stringType().uuid().nullable().optional(),
	title: stringType().min(1),
	body: stringType().default(""),
	cover_image_url: nullableUrl.optional(),
	gallery_urls: arrayType(stringType().url()).max(5).default([]),
	youtube_url: youtubeUrl.optional(),
	is_published: booleanType().default(true)
});
var listMyInfoPosts_createServerFn_handler = createServerRpc({
	id: "c65ddfe974ab7b923a2a7ab64341cea9eb9b9b52364c7b419636421958e87317",
	name: "listMyInfoPosts",
	filename: "src/lib/admin.functions.ts"
}, (opts) => listMyInfoPosts.__executeServer(opts));
var listMyInfoPosts = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(listMyInfoPosts_createServerFn_handler, async ({ context }) => {
	const { data: profile } = await context.supabase.from("profiles").select("region_id").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id) return [];
	const { data, error } = await context.supabase.from("info_posts").select("*, categories(id, name, icon)").eq("region_id", profile.region_id).order("published_at", { ascending: false }).limit(200);
	if (error) throw new Error(error.message);
	return data ?? [];
});
var saveInfoPost_createServerFn_handler = createServerRpc({
	id: "d44584a2fcfe17afbe60e8180548c452409def832a72a02822741edace3cbf66",
	name: "saveInfoPost",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveInfoPost.__executeServer(opts));
var saveInfoPost = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => InfoPostInput.parse(data)).handler(saveInfoPost_createServerFn_handler, async ({ data, context }) => {
	const { data: profile } = await context.supabase.from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
	const payload = {
		category_id: data.category_id ?? null,
		title: data.title,
		body: data.body ?? "",
		cover_image_url: data.cover_image_url ?? null,
		gallery_urls: data.gallery_urls ?? [],
		youtube_url: data.youtube_url ?? null,
		is_published: data.is_published,
		region_id: profile.region_id
	};
	if (data.id) {
		const { error } = await context.supabase.from("info_posts").update(payload).eq("id", data.id).eq("region_id", profile.region_id);
		if (error) throw new Error(error.message);
		return { id: data.id };
	}
	const { data: row, error } = await context.supabase.from("info_posts").insert({
		...payload,
		published_at: (/* @__PURE__ */ new Date()).toISOString()
	}).select("id").single();
	if (error) throw new Error(error.message);
	return { id: row.id };
});
var deleteInfoPost_createServerFn_handler = createServerRpc({
	id: "52fe97ed6b045afe9e514f8e8bedc6c7e07510b94b82a2fd7f42fc2d45a5836a",
	name: "deleteInfoPost",
	filename: "src/lib/admin.functions.ts"
}, (opts) => deleteInfoPost.__executeServer(opts));
var deleteInfoPost = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(deleteInfoPost_createServerFn_handler, async ({ data, context }) => {
	const { data: profile } = await context.supabase.from("profiles").select("region_id, is_active").eq("id", context.userId).maybeSingle();
	if (!profile?.region_id || !profile.is_active) throw new Error("Akun belum diaktifkan.");
	const { error } = await context.supabase.from("info_posts").delete().eq("id", data.id).eq("region_id", profile.region_id);
	if (error) throw new Error(error.message);
	return { ok: true };
});
var CourierInput = objectType({
	id: stringType().uuid().optional(),
	name: stringType().trim().min(1).max(80),
	whatsapp: preprocessType((v) => {
		let d = String(v ?? "").replace(/\D/g, "");
		if (d.startsWith("0")) d = `62${d.slice(1)}`;
		return d;
	}, stringType().regex(/^\d{8,20}$/, "Nomor WhatsApp kurir tidak valid.")),
	coordinates: nullableCoords.optional(),
	is_active: booleanType().default(true),
	sort_order: numberType().int().default(0)
});
var saveCourier_createServerFn_handler = createServerRpc({
	id: "eb852837213d0cbf724c1eaf29c490bf76034b9680a9d6b7d8e4d1907615b5ea",
	name: "saveCourier",
	filename: "src/lib/admin.functions.ts"
}, (opts) => saveCourier.__executeServer(opts));
var saveCourier = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => CourierInput.parse(data)).handler(saveCourier_createServerFn_handler, async ({ data, context }) => {
	const regionId = await requireRegion(context);
	const payload = {
		...data,
		region_id: regionId
	};
	if (data.id) {
		const { error } = await context.supabase.from("couriers").update(payload).eq("id", data.id).eq("region_id", regionId);
		if (error) throw new Error(error.message);
		return { id: data.id };
	}
	const { data: row, error } = await context.supabase.from("couriers").insert(payload).select("id").single();
	if (error) throw new Error(error.message);
	return { id: row.id };
});
var deleteCourier_createServerFn_handler = createServerRpc({
	id: "e3007ce2d1027017ccd8b5dea8e703d78a65f2f4e3c05b9fb3961b972751d2e2",
	name: "deleteCourier",
	filename: "src/lib/admin.functions.ts"
}, (opts) => deleteCourier.__executeServer(opts));
var deleteCourier = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(deleteCourier_createServerFn_handler, async ({ data, context }) => {
	const regionId = await requireRegion(context);
	const { error } = await context.supabase.from("couriers").delete().eq("id", data.id).eq("region_id", regionId);
	if (error) throw new Error(error.message);
	return { ok: true };
});
//#endregion
export { assignQr_createServerFn_handler, deleteCategory_createServerFn_handler, deleteCourier_createServerFn_handler, deleteInfoPost_createServerFn_handler, deleteLocation_createServerFn_handler, deleteQr_createServerFn_handler, generateQrBatch_createServerFn_handler, listMyInfoPosts_createServerFn_handler, listQr_createServerFn_handler, markQrPrinted_createServerFn_handler, myAnalytics_createServerFn_handler, myProfile_createServerFn_handler, myRegion_createServerFn_handler, releaseQr_createServerFn_handler, retireQr_createServerFn_handler, saveCategory_createServerFn_handler, saveCourier_createServerFn_handler, saveInfoPost_createServerFn_handler, saveLocation_createServerFn_handler, updateMyRegion_createServerFn_handler };
