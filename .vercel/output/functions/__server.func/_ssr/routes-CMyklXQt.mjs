import { o as __toESM } from "../_runtime.mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { P as MapPin, S as QrCode, xt as Sparkles } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
import { n as MascotWelcome, r as PageShell } from "./rekomendify-O7_GABh0.mjs";
import { a as listPublishedRegions } from "./public.functions-Bx_rFy4n.mjs";
import { n as consumeLaunchRedirect, r as isStandalone } from "./last-region-BMZzkStA.mjs";
import { t as ShareButton } from "./share-button-qJzvC06J.mjs";
import { t as Route } from "./routes-DAt8bVG6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CMyklXQt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { data: regions = [] } = useQuery({
		queryKey: ["regions"],
		queryFn: () => listPublishedRegions(),
		initialData: Route.useLoaderData()
	});
	const { qr } = Route.useSearch();
	const navigate = useNavigate();
	(0, import_react.useEffect)(() => {
		if (qr === "not_found") toast.error("QR tidak dikenali. Pastikan kode benar.");
		if (qr === "inactive") toast.info("QR ini belum dipasang ke lokasi mana pun.");
	}, [qr]);
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		const hash = window.location.hash.replace(/^#/, "");
		if (!hash) return;
		const p = new URLSearchParams(hash);
		if (p.get("type") === "recovery" || p.get("error") || p.get("access_token")) window.location.replace(`/reset-password#${hash}`);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!isStandalone() || qr) return;
		if (typeof window !== "undefined" && window.location.hash) return;
		const last = consumeLaunchRedirect();
		if (last) navigate({
			to: "/r/$slug",
			params: { slug: last },
			replace: true
		});
	}, [navigate, qr]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "batik-bg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-md px-5 pt-10",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex min-w-0 items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate font-display text-xl text-primary",
							children: "Rekomendify"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareButton, {})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.h1, {
					initial: {
						opacity: 0,
						y: 10
					},
					animate: {
						opacity: 1,
						y: 0
					},
					className: "font-display text-4xl leading-tight text-ink",
					children: [
						"Halo, mau jelajah ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-primary",
							children: "ke mana"
						}),
						" hari ini?"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-sm text-muted-foreground",
					children: "Pemandu wisata digital. Scan QR di tempat wisata, atau pilih wilayah di bawah."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MascotWelcome, {
						name: "Cak Mulyo & Jeng Sari",
						message: "Monggo, pilih wilayah yang ingin Anda jelajahi. Saya temani sampai tujuan!"
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
					children: "Wilayah tersedia"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-3",
					children: [regions.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground",
						children: "Belum ada wilayah yang dipublikasikan."
					}), regions.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/r/$slug",
						params: { slug: r.slug },
						className: "flex items-start gap-3 rounded-2xl border border-border bg-card p-4 transition hover:shadow-soft",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-12 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-6" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-lg leading-snug",
								children: r.name
							}), r.tagline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: r.tagline
							})]
						})]
					}, r.id))]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-10 rounded-2xl bg-card p-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-6 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm font-semibold",
							children: "Punya QR Rekomendify?"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Pindai dengan kamera HP — langsung masuk ke halaman wilayah."
						})] })]
					})
				})
			]
		})
	}) });
}
//#endregion
export { Home as component };
