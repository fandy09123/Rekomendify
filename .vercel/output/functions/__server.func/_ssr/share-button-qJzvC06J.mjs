import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { M as MessageCircle, et as Copy, g as Share2, n as X, q as Facebook, st as Check, v as Send } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/share-button-qJzvC06J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SHARE_TEXT = "Rekomendify — pemandu wisata digital hyperlocal. Scan QR atau pilih wilayah, langsung dapat info lokal.";
function targets(url, text) {
	const u = encodeURIComponent(url);
	const t = encodeURIComponent(text);
	return [
		{
			label: "WhatsApp",
			href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
			Icon: MessageCircle
		},
		{
			label: "Telegram",
			href: `https://t.me/share/url?url=${u}&text=${t}`,
			Icon: Send
		},
		{
			label: "Facebook",
			href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
			Icon: Facebook
		},
		{
			label: "X",
			href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
			Icon: X
		}
	];
}
function ShareButton({ title = "Rekomendify", text = SHARE_TEXT, url, className, label = "Bagikan" }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [copied, setCopied] = (0, import_react.useState)(false);
	const [shareUrl, setShareUrl] = (0, import_react.useState)(url ?? "");
	(0, import_react.useEffect)(() => {
		setShareUrl(url ?? window.location.href);
	}, [url]);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (e) => e.key === "Escape" && setOpen(false);
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open]);
	const share = async () => {
		const link = shareUrl || window.location.href;
		if (typeof navigator !== "undefined" && navigator.share) try {
			await navigator.share({
				title,
				text,
				url: link
			});
			return;
		} catch {
			return;
		}
		setOpen(true);
	};
	const copy = async () => {
		try {
			await navigator.clipboard.writeText(shareUrl || window.location.href);
			setCopied(true);
			toast.success("Tautan disalin");
			setTimeout(() => setCopied(false), 1800);
		} catch {
			toast.error("Gagal menyalin tautan");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: share,
		"aria-label": "Bagikan Rekomendify",
		title: "Bagikan",
		className: className ?? "inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card p-1.5 text-xs font-semibold text-foreground transition hover:bg-accent/10 active:scale-95 min-[380px]:px-2.5 min-[380px]:py-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "hidden min-[380px]:inline",
			children: label
		})]
	}), open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		role: "dialog",
		"aria-modal": "true",
		"aria-label": "Bagikan Rekomendify",
		className: "fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm",
		onClick: () => setOpen(false),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: (e) => e.stopPropagation(),
			className: "w-full max-w-md rounded-t-3xl border border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-lift",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mb-4 h-1 w-10 rounded-full bg-border" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg",
							children: "Bagikan Rekomendify"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: shareUrl
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setOpen(false),
						"aria-label": "Tutup",
						className: "grid size-8 shrink-0 place-items-center rounded-full border border-border",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 grid grid-cols-4 gap-3",
					children: targets(shareUrl, text).map(({ label: l, href, Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href,
						target: "_blank",
						rel: "noopener noreferrer",
						className: "flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-background p-3 text-[11px] font-medium transition hover:bg-accent/10 active:scale-95",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5 text-primary" }), l]
					}) }, l))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: copy,
					className: "mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground active:scale-[0.99]",
					children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "size-4" }), copied ? "Tautan disalin" : "Salin tautan"]
				})
			]
		})
	})] });
}
//#endregion
export { ShareButton as t };
