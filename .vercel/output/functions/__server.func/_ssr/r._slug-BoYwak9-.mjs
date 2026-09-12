import { I as notFound, h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as objectType, r as enumType, s as stringType } from "../_libs/zod.mjs";
import { n as getRegionBySlug } from "./public.functions-Bx_rFy4n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._slug-BoYwak9-.js
var $$splitNotFoundComponentImporter = () => import("./r._slug-D5ZUW9Gx.mjs");
var $$splitErrorComponentImporter = () => import("./r._slug-D-m2lXMo.mjs");
var $$splitComponentImporter = () => import("./r._slug-DUKIrJcr.mjs");
var searchSchema = objectType({
	src: enumType([
		"qr",
		"gps",
		"direct"
	]).optional(),
	q: stringType().optional()
});
var Route = createFileRoute("/r/$slug")({
	validateSearch: searchSchema,
	loader: async ({ context, params }) => {
		const data = await context.queryClient.ensureQueryData({
			queryKey: ["region", params.slug],
			queryFn: () => getRegionBySlug({ data: { slug: params.slug } })
		});
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData }) => {
		const r = loaderData?.region;
		if (!r) return {};
		return { meta: [
			{ title: `${r.name} — Rekomendify` },
			{
				name: "description",
				content: r.tagline || r.description || `Jelajahi ${r.name}`
			},
			{
				property: "og:title",
				content: r.name
			},
			{
				property: "og:description",
				content: r.tagline || r.description || ""
			},
			...r.cover_image_url ? [{
				property: "og:image",
				content: r.cover_image_url
			}, {
				name: "twitter:image",
				content: r.cover_image_url
			}] : []
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };
