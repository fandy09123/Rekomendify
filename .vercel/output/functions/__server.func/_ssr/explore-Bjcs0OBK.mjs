import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { P as MapPin } from "../_libs/lucide-react.mjs";
import { r as PageShell } from "./rekomendify-O7_GABh0.mjs";
import { a as listPublishedRegions } from "./public.functions-Bx_rFy4n.mjs";
import { t as Route } from "./explore-nrgXeUMw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/explore-Bjcs0OBK.js
var import_jsx_runtime = require_jsx_runtime();
function Explore() {
	const { data: regions = [] } = useQuery({
		queryKey: ["regions"],
		queryFn: () => listPublishedRegions(),
		initialData: Route.useLoaderData()
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-5 pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Jelajah"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Semua wilayah yang aktif di Rekomendify."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-3",
				children: [regions.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/r/$slug",
					params: { slug: r.slug },
					className: "flex items-start gap-3 rounded-2xl border border-border bg-card p-4 hover:shadow-soft",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-12 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-6" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-lg",
						children: r.name
					}), r.tagline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: r.tagline
					})] })]
				}, r.id)), regions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
					children: "Belum ada wilayah."
				})]
			})
		]
	}) });
}
//#endregion
export { Explore as component };
