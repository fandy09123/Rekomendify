import { I as notFound, h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as getRegionBySlug } from "./public.functions-Bx_rFy4n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._slug_.scan-DnSTOUDG.js
var $$splitNotFoundComponentImporter = () => import("./r._slug_.scan-fP8_5Z3s.mjs");
var $$splitErrorComponentImporter = () => import("./r._slug_.scan-eD7m2-Tp.mjs");
var $$splitComponentImporter = () => import("./r._slug_.scan-B3FHaIt5.mjs");
var Route = createFileRoute("/r/$slug_/scan")({
	loader: async ({ context, params }) => {
		const data = await context.queryClient.ensureQueryData({
			queryKey: ["region", params.slug],
			queryFn: () => getRegionBySlug({ data: { slug: params.slug } })
		});
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData }) => ({ meta: [{ title: `Scan QR — ${loaderData?.region?.name ?? "Rekomendify"}` }, {
		name: "description",
		content: "Pindai QR resmi Rekomendify untuk membuka halaman lokasi."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };
