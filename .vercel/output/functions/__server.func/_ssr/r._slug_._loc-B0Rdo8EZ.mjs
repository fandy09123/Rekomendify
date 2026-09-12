import { I as notFound, h as createFileRoute, m as lazyRouteComponent } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as objectType, s as stringType } from "../_libs/zod.mjs";
import { t as getLocationBySlug } from "./public.functions-Bx_rFy4n.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._slug_._loc-B0Rdo8EZ.js
var $$splitNotFoundComponentImporter = () => import("./r._slug_._loc-CyY1o1Pb.mjs");
var $$splitErrorComponentImporter = () => import("./r._slug_._loc-DBe2YSjf.mjs");
var $$splitComponentImporter = () => import("./r._slug_._loc-DNbJyaV0.mjs");
var Route = createFileRoute("/r/$slug_/$loc")({
	validateSearch: objectType({
		from: stringType().optional(),
		fromLabel: stringType().optional()
	}),
	loader: async ({ context, params }) => {
		const data = await context.queryClient.ensureQueryData({
			queryKey: [
				"location",
				params.slug,
				params.loc
			],
			queryFn: () => getLocationBySlug({ data: {
				regionSlug: params.slug,
				locationSlug: params.loc
			} })
		});
		if (!data) throw notFound();
		return data;
	},
	head: ({ loaderData }) => {
		const l = loaderData?.location;
		if (!l) return {};
		return { meta: [
			{ title: `${l.name} — Rekomendify` },
			{
				name: "description",
				content: l.description?.slice(0, 155) || `Kunjungi ${l.name}`
			},
			{
				property: "og:title",
				content: l.name
			},
			{
				property: "og:description",
				content: l.description?.slice(0, 155) || ""
			},
			...l.photo_url ? [{
				property: "og:image",
				content: l.photo_url
			}, {
				name: "twitter:image",
				content: l.photo_url
			}] : []
		] };
	},
	component: lazyRouteComponent($$splitComponentImporter, "component"),
	errorComponent: lazyRouteComponent($$splitErrorComponentImporter, "errorComponent"),
	notFoundComponent: lazyRouteComponent($$splitNotFoundComponentImporter, "notFoundComponent")
});
//#endregion
export { Route as t };
