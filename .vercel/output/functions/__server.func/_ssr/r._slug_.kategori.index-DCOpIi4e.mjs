import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { B as LayoutGrid, vt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { r as PageShell } from "./rekomendify-O7_GABh0.mjs";
import { n as getRegionBySlug } from "./public.functions-Bx_rFy4n.mjs";
import { t as Route } from "./r._slug_.kategori.index-DPAZHl1C.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._slug_.kategori.index-DCOpIi4e.js
var import_jsx_runtime = require_jsx_runtime();
function SemuaKategori() {
	const { slug } = Route.useParams();
	const initialData = Route.useLoaderData();
	const { data } = useQuery({
		queryKey: ["region", slug],
		queryFn: () => getRegionBySlug({ data: { slug } }),
		initialData
	});
	if (!data) return null;
	const { region, categories, locations } = data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "batik-bg pb-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-md px-5 pt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/r/$slug",
					params: { slug: region.slug },
					className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }),
						" ",
						region.name
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl leading-tight",
					children: "Semua Kategori"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Pilih kategori untuk melihat tempatnya."
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mx-auto max-w-md px-5 pt-4",
		children: categories.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground",
			children: "Belum ada kategori."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "grid grid-cols-2 gap-3",
			children: categories.map((c) => {
				const count = locations.filter((l) => l.category_id === c.id).length;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/r/$slug/kategori/$cat",
					params: {
						slug: region.slug,
						cat: c.slug ?? c.id
					},
					className: "flex items-center gap-3 rounded-2xl border border-border bg-card p-3 transition hover:shadow-soft active:scale-[0.99]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-xl",
						children: c.icon || /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-5 text-primary" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm font-semibold",
							children: c.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block text-xs text-muted-foreground",
							children: [count, " tempat"]
						})]
					})]
				}, c.id);
			})
		})
	})] });
}
//#endregion
export { SemuaKategori as component };
