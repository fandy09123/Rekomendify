import { I as notFound, h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as getRegionBySlug } from "./public.functions-Bx_rFy4n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._slug_.jelajah-BftVmhH2.js
var $$splitNotFoundComponentImporter = () => import("./r._slug_.jelajah-DnWNaZXR.mjs");
var $$splitErrorComponentImporter = () => import("./r._slug_.jelajah-CKtnm-7F.mjs");
var $$splitComponentImporter = () => import("./r._slug_.jelajah-JhJLKZTd.mjs");
var Route = createFileRoute("/r/$slug_/jelajah")({
	loader: async ({ context, params }) => {
		const data = await context.queryClient.ensureQueryData({
			queryKey: ["region", params.slug],
			queryFn: () => getRegionBySlug({ data: { slug: params.slug } })
		});
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData }) => ({ meta: [{ title: `Jelajah ${loaderData?.region?.name ?? ""} — Rekomendify` }, {
		name: "description",
		content: `Cari tempat, kuliner, dan wisata di ${loaderData?.region?.name ?? "wilayah"}.`
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };
