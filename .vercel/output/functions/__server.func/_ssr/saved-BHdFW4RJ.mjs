import { o as __toESM } from "../_runtime.mjs";
import { _ as Link, l as useLocation, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { P as MapPin, c as Trash2, dt as Bookmark, vt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { r as PageShell } from "./rekomendify-O7_GABh0.mjs";
import { n as listSaved, r as removeSaved } from "./saved-locations-DDQGcli2.mjs";
import { t as Route } from "./saved-_xYQVrpr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/saved-BHdFW4RJ.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function SavedPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { region, regionName } = Route.useSearch();
	const [items, setItems] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		const refresh = () => setItems(listSaved());
		refresh();
		window.addEventListener("rekomendify:saved-changed", refresh);
		window.addEventListener("storage", refresh);
		return () => {
			window.removeEventListener("rekomendify:saved-changed", refresh);
			window.removeEventListener("storage", refresh);
		};
	}, []);
	const handleBack = () => {
		if (region) {
			navigate({
				to: "/r/$slug",
				params: { slug: region },
				replace: true
			});
			return;
		}
		navigate({ to: "/" });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-5 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: handleBack,
				className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }),
					" ",
					regionName ?? "Kembali"
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Location Tersimpan"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Disimpan di perangkat ini. Tidak dikirim ke server."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 space-y-2.5",
				children: [items.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground",
					children: "Belum ada lokasi yang disimpan. Buka detail lokasi lalu tekan tombol Simpan."
				}), items.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 rounded-2xl border border-border bg-card p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/r/$slug/$loc",
						params: {
							slug: l.regionSlug,
							loc: l.slug
						},
						search: {
							from: location.href,
							fromLabel: "Tersimpan"
						},
						className: "group flex min-w-0 flex-1 items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-16 shrink-0 overflow-hidden rounded-xl bg-muted",
							children: l.photo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: l.photo_url,
								alt: l.name,
								loading: "lazy",
								className: "size-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex size-full items-center justify-center text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-5" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								l.category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] font-semibold uppercase tracking-wide text-accent",
									children: l.category
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "truncate font-display text-base",
									children: l.name
								}),
								l.regionName && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: l.regionName
								})
							]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => removeSaved(l.id),
						"aria-label": "Hapus",
						className: "grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})]
				}, l.id))]
			})
		]
	}) });
}
//#endregion
export { SavedPage as component };
