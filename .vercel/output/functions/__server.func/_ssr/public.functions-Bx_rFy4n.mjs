import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { t as createSsrRpc } from "./createSsrRpc-JmkAOqFF.mjs";
import { a as objectType, r as enumType, s as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/public.functions-Bx_rFy4n.js
var listPublishedRegions = createServerFn({ method: "GET" }).handler(createSsrRpc("d104ad4f80e40e46e5b84481bb0e28e55b7468e3a6fac677d80fdd9b47502235"));
/** Kontak resmi admin wilayah — dipakai menu "Hubungi Admin Wilayah". */
var getRegionContact = createServerFn({ method: "GET" }).validator((data) => objectType({ slug: stringType().min(1) }).parse(data)).handler(createSsrRpc("c37c3f949403e79705b4f61f31f6c67111169019eb048a0b80ea0f7773c0a832"));
var getRegionBySlug = createServerFn({ method: "GET" }).validator((data) => objectType({ slug: stringType().min(1) }).parse(data)).handler(createSsrRpc("e9dcf588fb14c209b5364487184ba5afe1229d7f32d2e5f0a4e23357096699b5"));
var getLocationBySlug = createServerFn({ method: "GET" }).validator((data) => objectType({
	regionSlug: stringType(),
	locationSlug: stringType()
}).parse(data)).handler(createSsrRpc("d54b86b921284c4386702d5269ead90bb4922c787e8cde9a570400fe29c5a0e7"));
var resolveQrCode = createServerFn({ method: "GET" }).validator((data) => objectType({ code: stringType().min(1) }).parse(data)).handler(createSsrRpc("8bc0c93ab60bcaae4873808905d8d6076a5242fcac6a5761906091667addb7be"));
var recordVisit = createServerFn({ method: "POST" }).validator((data) => objectType({
	regionId: stringType().uuid().nullable().optional(),
	locationId: stringType().uuid().nullable().optional(),
	qrAssignmentId: stringType().uuid().nullable().optional(),
	source: enumType([
		"qr",
		"gps",
		"direct"
	]).default("direct")
}).parse(data)).handler(createSsrRpc("fd067e91ea855fc246cb1a9047f0ba2c3faf9a8fece248deb6d4689fbf0ef97e"));
/**
* Records a tourist action (WhatsApp / Maps / save / share) on a location.
* These are the real conversion signals for a hyperlocal guide — a visit only
* means "seen", an engagement means "acted on".
*/
var recordEngagement = createServerFn({ method: "POST" }).validator((data) => objectType({
	regionId: stringType().uuid(),
	locationId: stringType().uuid().nullable().optional(),
	kind: enumType([
		"whatsapp",
		"gmaps",
		"save",
		"share"
	])
}).parse(data)).handler(createSsrRpc("ac212eb8e710af9b9edb7eb7795e6518a75cc104c3e561e3176d8cf51680c4fe"));
var listRegionInfoPosts = createServerFn({ method: "GET" }).validator((data) => objectType({ regionSlug: stringType().min(1) }).parse(data)).handler(createSsrRpc("6c07d2031751dc9e16a3d848a29da44e2fd6ebc61818f6f13dda0ef7b079ce8e"));
/**
* Iklan wilayah untuk beranda: banner carousel + daftar id lokasi yang sedang
* disorot (featured berbayar). RLS hanya meloloskan iklan aktif dalam masa tayang.
*/
var listRegionAds = createServerFn({ method: "GET" }).validator((data) => objectType({ regionSlug: stringType().min(1) }).parse(data)).handler(createSsrRpc("621d99c653bc59f1dfaa5c13829d915c5d43bda70529efc70c798f22a8385e6d"));
/** Promosi kontekstual yang tayang pada satu halaman detail lokasi (host). */
var listContextualAds = createServerFn({ method: "GET" }).validator((data) => objectType({ hostLocationId: stringType().uuid() }).parse(data)).handler(createSsrRpc("a4512c9513d3520f3419714407b3902a2b678d7d39eeae474f2753640491ec1a"));
//#endregion
export { listPublishedRegions as a, recordEngagement as c, listContextualAds as i, recordVisit as l, getRegionBySlug as n, listRegionAds as o, getRegionContact as r, listRegionInfoPosts as s, getLocationBySlug as t, resolveQrCode as u };
