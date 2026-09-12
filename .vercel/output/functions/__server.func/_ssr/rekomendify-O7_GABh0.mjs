import { o as __toESM } from "../_runtime.mjs";
import { _ as Link, l as useLocation } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { P as MapPin, S as QrCode, _ as Settings, j as MessageSquare, tt as Compass, wt as House } from "../_libs/lucide-react.mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rekomendify-O7_GABh0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var mascots_default = "/assets/mascots-CaII3z5g.png";
function useRegionContext() {
	const loc = useLocation();
	return (0, import_react.useMemo)(() => {
		const m = loc.pathname.match(/^\/r\/([^\/]+)/);
		return m ? decodeURIComponent(m[1]) : null;
	}, [loc.pathname]);
}
var BottomNav = (0, import_react.memo)(function BottomNav() {
	const region = useRegionContext();
	const loc = useLocation();
	const berandaTo = region ? `/r/${region}` : "/";
	const jelajahTo = region ? `/r/${region}/jelajah` : "/explore";
	const scanTo = region ? `/r/${region}/scan` : "/scan";
	const pesanTo = region ? `/r/${region}/messages` : "/messages";
	const pengaturanTo = region ? `/r/${region}/settings` : "/settings";
	const isActive = (target) => {
		if (target === "/") return loc.pathname === "/";
		return loc.pathname === target;
	};
	const item = (to, label, Icon, active) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
		className: "flex-1",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
			to,
			preload: "intent",
			className: `flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${active ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"}`,
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" }), label]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
		className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "relative mx-auto flex max-w-md items-end justify-around",
			children: [
				item(berandaTo, "Beranda", House, isActive(berandaTo)),
				item(jelajahTo, "Jelajah", Compass, isActive(jelajahTo)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: scanTo,
						preload: "intent",
						className: "mx-auto -mt-6 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lift ring-4 ring-background transition hover:scale-105 active:scale-95",
						"aria-label": "Scan QR",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QrCode, { className: "size-6" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `mt-1 text-center text-[11px] font-medium ${loc.pathname.endsWith("/scan") ? "text-primary font-semibold" : "text-muted-foreground"}`,
						children: "Scan QR"
					})]
				}),
				item(pesanTo, "Pesan", MessageSquare, isActive(pesanTo)),
				item(pengaturanTo, "Pengaturan", Settings, isActive(pengaturanTo))
			]
		})
	});
});
function PageShell({ children, noNav }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-28",
		children: [children, !noNav && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BottomNav, {})]
	});
}
var MascotWelcome = (0, import_react.memo)(function MascotWelcome({ name, message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
		initial: {
			opacity: 0,
			y: 12
		},
		animate: {
			opacity: 1,
			y: 0
		},
		transition: {
			duration: .35,
			ease: "easeOut"
		},
		className: "flex min-h-[7.5rem] items-center gap-4 rounded-3xl border border-border bg-card/80 p-4 shadow-soft backdrop-blur",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.img, {
			src: mascots_default,
			alt: "Cak Mulyo & Jeng Sari",
			width: 80,
			height: 80,
			decoding: "async",
			className: "size-20 shrink-0",
			animate: { rotate: [
				0,
				-3,
				3,
				0
			] },
			transition: {
				duration: 3,
				repeat: Infinity,
				ease: "easeInOut"
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-xs font-semibold uppercase tracking-wider text-primary",
				children: name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 line-clamp-3 text-sm leading-relaxed text-foreground",
				children: message
			})]
		})]
	});
});
var LocationCard = (0, import_react.memo)(function LocationCard({ regionSlug, locSlug, name, photo, category, hours, price, featured, distance }) {
	const location = useLocation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/r/$slug/$loc",
		params: {
			slug: regionSlug,
			loc: locSlug
		},
		search: { from: location.href },
		preload: "intent",
		className: "group flex w-full gap-3 rounded-2xl border border-border bg-card p-3 text-left transition duration-200 hover:shadow-lift active:scale-[0.99]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted",
			children: [photo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: photo,
				alt: name,
				loading: "lazy",
				decoding: "async",
				className: "size-full object-cover transition duration-300 group-hover:scale-105"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex size-full items-center justify-center text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-6" })
			}), featured && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "absolute left-1 top-1 rounded-full bg-mustard px-1.5 py-0.5 text-[10px] font-bold text-ink",
				children: "★"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2",
					children: [category && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[11px] font-semibold uppercase tracking-wide text-accent",
						children: category
					}), distance && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "ml-auto shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary",
						children: distance
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "mt-0.5 truncate font-display text-base text-foreground",
					children: name
				}),
				hours && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 truncate text-xs text-muted-foreground",
					children: hours
				}),
				price && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs text-muted-foreground",
					children: price
				})
			]
		})]
	});
});
//#endregion
export { mascots_default as i, MascotWelcome as n, PageShell as r, LocationCard as t };
