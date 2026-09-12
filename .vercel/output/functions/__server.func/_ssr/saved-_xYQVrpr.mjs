import { h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as objectType, s as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/saved-_xYQVrpr.js
var $$splitComponentImporter = () => import("./saved-BHdFW4RJ.mjs");
var Route = createFileRoute("/saved")({
	validateSearch: objectType({
		region: stringType().optional(),
		regionName: stringType().optional()
	}),
	head: () => ({ meta: [{ title: "Location Tersimpan — Rekomendify" }, {
		name: "description",
		content: "Daftar lokasi yang Anda simpan di perangkat ini."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
