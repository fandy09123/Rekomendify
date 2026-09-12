import { I as notFound, h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as getRegionBySlug } from "./public.functions-Bx_rFy4n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._slug_.kategori.index-DPAZHl1C.js
var $$splitNotFoundComponentImporter = () => import("./r._slug_.kategori.index-H_6M3a5j.mjs");
var $$splitErrorComponentImporter = () => import("./r._slug_.kategori.index-713B1zxi.mjs");
var $$splitComponentImporter = () => import("./r._slug_.kategori.index-DCOpIi4e.mjs");
var Route = createFileRoute("/r/$slug_/kategori/")({
	loader: async ({ context, params }) => {
		const data = await context.queryClient.ensureQueryData({
			queryKey: ["region", params.slug],
			queryFn: () => getRegionBySlug({ data: { slug: params.slug } })
		});
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData }) => {
		const title = `Semua Kategori ${loaderData?.region?.name ?? ""} — Rekomendify`;
		const desc = `Jelajahi seluruh kategori tempat di ${loaderData?.region?.name ?? "wilayah"}.`;
		return { meta: [
			{ title },
			{
				name: "description",
				content: desc
			},
			{
				property: "og:title",
				content: title
			},
			{
				property: "og:description",
				content: desc
			}
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };
