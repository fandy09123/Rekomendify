import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { ht as Bell, j as MessageSquare, vt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { r as PageShell } from "./rekomendify-O7_GABh0.mjs";
import { s as listRegionInfoPosts } from "./public.functions-Bx_rFy4n.mjs";
import { t as MediaGallery } from "./media-gallery-GKgkj6xZ.mjs";
import { t as Route } from "./r._slug_.messages-CFKHSURP.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._slug_.messages-CB4MGd_b.js
var import_jsx_runtime = require_jsx_runtime();
function formatDate(iso) {
	try {
		return new Intl.DateTimeFormat("id-ID", {
			day: "numeric",
			month: "long",
			year: "numeric"
		}).format(new Date(iso));
	} catch {
		return "";
	}
}
function RegionMessagesPage() {
	const { slug } = Route.useParams();
	const initialData = Route.useLoaderData();
	const { data } = useQuery({
		queryKey: ["region-info", slug],
		queryFn: () => listRegionInfoPosts({ data: { regionSlug: slug } }),
		initialData
	});
	const posts = data?.posts ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-5 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/r/$slug",
				params: { slug },
				className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Kembali ke wilayah"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-3xl",
				children: "Info Lokal"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: [
					"Pengumuman & kabar terbaru dari ",
					data?.region?.name,
					"."
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/notifikasi",
				className: "mt-4 flex items-center gap-2.5 rounded-2xl border border-border bg-card px-4 py-3 text-sm transition hover:bg-accent/10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4 text-primary" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-medium",
						children: "Riwayat Notifikasi"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto text-xs text-muted-foreground",
						children: "tersimpan di perangkat"
					})
				]
			}),
			posts.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid place-items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 font-display text-xl",
						children: "Belum ada info"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Pengelola wilayah belum memposting info. Cek lagi nanti ya."
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 space-y-3",
				children: posts.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: "overflow-hidden rounded-2xl border border-border bg-card",
					children: [(p.cover_image_url || p.gallery_urls?.length || p.youtube_url) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaGallery, {
						photo: p.cover_image_url,
						gallery: p.gallery_urls,
						youtube: p.youtube_url,
						alt: p.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground",
								children: [p.categories?.name && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "rounded-full bg-primary/10 px-2 py-0.5 text-primary",
									children: [p.categories.icon ? `${p.categories.icon} ` : "", p.categories.name]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: formatDate(p.published_at) })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 font-display text-lg leading-tight",
								children: p.title
							}),
							p.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/85",
								children: p.body
							})
						]
					})]
				}, p.id))
			})
		]
	}) });
}
//#endregion
export { RegionMessagesPage as component };
