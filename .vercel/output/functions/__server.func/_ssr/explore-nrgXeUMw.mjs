import { h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as listPublishedRegions } from "./public.functions-Bx_rFy4n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-nrgXeUMw.js
var $$splitComponentImporter = () => import("./explore-Bjcs0OBK.mjs");
var Route = createFileRoute("/explore")({
	head: () => ({ meta: [
		{ title: "Jelajah Wilayah — Rekomendify" },
		{
			name: "description",
			content: "Daftar semua wilayah wisata di Rekomendify."
		},
		{
			property: "og:title",
			content: "Jelajah Wilayah — Rekomendify"
		},
		{
			property: "og:description",
			content: "Pilih wilayah wisata yang ingin kamu kunjungi."
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
