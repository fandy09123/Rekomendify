import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { ht as Bell, j as MessageSquare } from "../_libs/lucide-react.mjs";
import { r as PageShell } from "./rekomendify-O7_GABh0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/messages-CElOCyaw.js
var import_jsx_runtime = require_jsx_runtime();
function MessagesPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-5 pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Pesan"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Kotak masuk pengumuman dan info."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/notifikasi",
				className: "mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition hover:bg-accent/10",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-10 place-items-center rounded-xl bg-primary/10 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block font-display text-base",
						children: "Riwayat Notifikasi"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "block text-xs text-muted-foreground",
						children: "Notifikasi yang pernah masuk ke perangkat ini, bisa dibuka offline."
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 grid place-items-center rounded-3xl border border-dashed border-border bg-card/60 px-6 py-14 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquare, { className: "size-7" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-4 font-display text-xl",
						children: "Belum ada pesan"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm text-muted-foreground",
						children: "Fitur pesan akan segera hadir. Pengumuman dari pengelola wilayah akan muncul di sini."
					})
				]
			})
		]
	}) });
}
//#endregion
export { MessagesPage as component };
