import { h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as objectType, r as enumType } from "../_libs/zod.mjs";
import { a as listPublishedRegions } from "./public.functions-Bx_rFy4n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DAt8bVG6.js
var $$splitComponentImporter = () => import("./routes-CMyklXQt.mjs");
var homeSearch = objectType({ qr: enumType(["not_found", "inactive"]).optional() });
var Route = createFileRoute("/")({
	validateSearch: homeSearch,
	head: () => ({ meta: [
		{ title: "Rekomendify — Pemandu Wisata Digital" },
		{
			name: "description",
			content: "Pemandu wisata digital hyperlocal. Scan QR atau pilih wilayah, dipandu Cak Mulyo & Jeng Sari."
		},
		{
			property: "og:title",
			content: "Rekomendify"
		},
		{
			property: "og:description",
			content: "Pemandu wisata digital hyperlocal."
		}
	] }),
	loader: ({ context }) => context.queryClient.ensureQueryData({
		queryKey: ["regions"],
		queryFn: () => listPublishedRegions()
	}),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
//#endregion
export { Route as t };
