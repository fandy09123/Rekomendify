import { I as notFound, h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { s as listRegionInfoPosts } from "./public.functions-Bx_rFy4n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._slug_.messages-CFKHSURP.js
var $$splitNotFoundComponentImporter = () => import("./r._slug_.messages-BE9LCpD-.mjs");
var $$splitErrorComponentImporter = () => import("./r._slug_.messages-CBBm2MPs.mjs");
var $$splitComponentImporter = () => import("./r._slug_.messages-CB4MGd_b.mjs");
var Route = createFileRoute("/r/$slug_/messages")({
	loader: async ({ context, params }) => {
		const data = await context.queryClient.ensureQueryData({
			queryKey: ["region-info", params.slug],
			queryFn: () => listRegionInfoPosts({ data: { regionSlug: params.slug } })
		});
		if (!data.region) throw notFound();
		return data;
	},
	head: ({ loaderData }) => ({ meta: [{ title: `Info Lokal ${loaderData?.region?.name ?? ""} — Rekomendify` }, {
		name: "description",
		content: `Pengumuman & info terbaru dari ${loaderData?.region?.name ?? "wilayah"}.`
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };
