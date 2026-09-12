import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { xt as Sparkles } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ads-DXjqdEwr.js
var import_jsx_runtime = require_jsx_runtime();
/** Kartu promosi kontekstual di halaman detail lokasi. */
function ContextualAdCard({ regionSlug, ad }) {
	const loc = ad.locations;
	if (!loc) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/r/$slug/$loc",
		params: {
			slug: regionSlug,
			loc: loc.slug
		},
		className: "flex gap-3 rounded-2xl border border-accent/30 bg-accent/5 p-3 transition active:scale-[0.99]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "size-16 shrink-0 overflow-hidden rounded-xl bg-muted",
			children: (ad.image_url || loc.photo_url) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: ad.image_url || loc.photo_url,
				alt: ad.title,
				className: "size-full object-cover",
				loading: "lazy"
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[10px] font-bold uppercase tracking-wider text-accent",
					children: "Promosi"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm font-semibold",
					children: ad.title
				}),
				ad.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "line-clamp-2 text-xs text-muted-foreground",
					children: ad.description
				})
			]
		})]
	});
}
/** Badge kecil untuk lokasi yang sedang disorot berbayar. */
function PromotedBadge() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "inline-flex items-center gap-1 rounded-full bg-mustard/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3" }), " Promosi"]
	});
}
//#endregion
export { PromotedBadge as n, ContextualAdCard as t };
