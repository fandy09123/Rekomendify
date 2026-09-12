import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-LwaZmRsQ.mjs";
import { t as createSsrRpc } from "./createSsrRpc-JmkAOqFF.mjs";
import { a as objectType, i as numberType, n as booleanType, o as preprocessType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.functions-zLuOZcAW.js
var myProfile = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("b2206f360075ed21d45a5e1471a278d928158f1469e02e22bbcd32340d392c5e"));
var myRegion = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("205ac07a6686306e6225bac6bee09634d14e29e3606db66050377e5eb3f33727"));
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
var updateMyRegion = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => RegionUpdate.parse(data)).handler(createSsrRpc("adefe38b06352a5425b722ad88ee8e7198fa13ed01dd070265ea6d2355aa76f2"));
var CategoryInput = objectType({
	id: stringType().uuid().optional(),
	name: stringType().min(1),
	icon: stringType().nullable().optional(),
	sort_order: numberType().int().default(0)
});
var saveCategory = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => CategoryInput.parse(data)).handler(createSsrRpc("d55046ba33898196eca5650d70b9240e9ea3d10d5d71b6dd00eddef9ea1312c1"));
var deleteCategory = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(createSsrRpc("f474bf6273f5a18c6cc5ab7a1e03dbbd6091e0cc20a15e2ec3f36e561a6d03af"));
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
var saveLocation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => LocationInput.parse(data)).handler(createSsrRpc("18ec98b7f0b172efe32139ef73d377cfcc18b993d9fbdb4d2286b38837d49077"));
var deleteLocation = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(createSsrRpc("1f21b8cb1189b42e5376c239a814b6d519aad5bc8544506424d480344d953f76"));
/** Resolves the caller's region, rejecting inactive accounts. */
var listQr = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("ce82ac5ec68ab544cd787f85f929946dfecb0296c0fc867f48735c6b8cbfa6d3"));
var generateQrBatch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({
	count: numberType().int().min(1).max(200),
	label: stringType().min(1)
}).parse(data)).handler(createSsrRpc("02043ecb043000bd0e9c18e142292d1be18cc78e02fb1b9cceb1942139ca81a9"));
var assignQr = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({
	qr_id: stringType().uuid(),
	location_id: stringType().uuid(),
	placement_note: stringType().nullable().optional()
}).parse(data)).handler(createSsrRpc("c67393dbc15a72c5e577763037c33bc642311ea7d781f28ff5eed89740e14da1"));
var releaseQr = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ assignment_id: stringType().uuid() }).parse(data)).handler(createSsrRpc("dd1fb4258896e1fcf6570744a1710f821cdf822522fb207737649d17a64a1868"));
/** Marks physical acrylic production state so admins know what is already printed. */
var markQrPrinted = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({
	ids: arrayType(stringType().uuid()).min(1).max(200),
	printed: booleanType()
}).parse(data)).handler(createSsrRpc("c96e9835d5c02d620f2690ad88c51b6e4b43134bd93f967f6e76d72ef882a5a2"));
var retireQr = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({
	id: stringType().uuid(),
	retired: booleanType()
}).parse(data)).handler(createSsrRpc("403b1774e794dc5005e8e04226a754c11f7c3f6d7273bd50bca7fea07a1d3e7f"));
var deleteQr = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(createSsrRpc("a36c7371f6cef0a30946eb7395724ed0e716dd72772d1db1f44be80ddb795f81"));
/**
* Aggregated entirely in Postgres (admin_analytics_summary), so numbers are
* exact instead of being capped by the 1000-row PostgREST page limit.
*/
var myAnalytics = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ days: numberType().int().min(1).max(365).default(30) }).parse(data ?? {})).handler(createSsrRpc("c886d99329a939ca5c85851001c2968e3596045457e967c45a4a8acb12b88422"));
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
var listMyInfoPosts = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("c65ddfe974ab7b923a2a7ab64341cea9eb9b9b52364c7b419636421958e87317"));
var saveInfoPost = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => InfoPostInput.parse(data)).handler(createSsrRpc("d44584a2fcfe17afbe60e8180548c452409def832a72a02822741edace3cbf66"));
var deleteInfoPost = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(createSsrRpc("52fe97ed6b045afe9e514f8e8bedc6c7e07510b94b82a2fd7f42fc2d45a5836a"));
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
var saveCourier = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => CourierInput.parse(data)).handler(createSsrRpc("eb852837213d0cbf724c1eaf29c490bf76034b9680a9d6b7d8e4d1907615b5ea"));
var deleteCourier = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(createSsrRpc("e3007ce2d1027017ccd8b5dea8e703d78a65f2f4e3c05b9fb3961b972751d2e2"));
//#endregion
export { saveCourier as _, deleteLocation as a, updateMyRegion as b, listMyInfoPosts as c, myAnalytics as d, myProfile as f, saveCategory as g, retireQr as h, deleteInfoPost as i, listQr as l, releaseQr as m, deleteCategory as n, deleteQr as o, myRegion as p, deleteCourier as r, generateQrBatch as s, assignQr as t, markQrPrinted as u, saveInfoPost as v, saveLocation as y };
