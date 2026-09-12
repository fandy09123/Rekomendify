import { I as notFound, h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as getRegionBySlug } from "./public.functions-Bx_rFy4n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._slug_.kategori._cat-Dfqjusqa.js
var $$splitNotFoundComponentImporter = () => import("./r._slug_.kategori._cat-BhoJ6xDr.mjs");
var $$splitErrorComponentImporter = () => import("./r._slug_.kategori._cat-gfrKmB7W.mjs");
var $$splitComponentImporter = () => import("./r._slug_.kategori._cat-BLQZ8NGt.mjs");
var Route = createFileRoute("/r/$slug_/kategori/$cat")({
	loader: async ({ context, params }) => {
		const data = await context.queryClient.ensureQueryData({
			queryKey: ["region", params.slug],
			queryFn: () => getRegionBySlug({ data: { slug: params.slug } })
		});
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData, params }) => {
		const cat = loaderData?.categories?.find((c) => c.slug === params.cat || c.id === params.cat);
		const title = `${cat?.name ?? "Kategori"} di ${loaderData?.region?.name ?? "wilayah"} — Rekomendify`;
		const desc = `Daftar tempat kategori ${cat?.name ?? ""} di ${loaderData?.region?.name ?? "wilayah"}.`;
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
