import { o as __toESM } from "../_runtime.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { M as MessageCircle, ot as ChevronDown, vt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { r as PageShell } from "./rekomendify-O7_GABh0.mjs";
import { n as WA_MESSAGES, r as waLink } from "./contact-B6lJdI5d.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/bantuan-BXjzKbLX.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var FAQ = [
	{
		q: "Apa itu Rekomendify?",
		a: "Pemandu wisata digital hyperlocal. Kami menampilkan informasi tempat, jam buka, dan kabar terbaru dari pengelola wilayah wisata — bukan aplikasi pemesanan."
	},
	{
		q: "Bagaimana cara memakai QR Rekomendify?",
		a: "Arahkan kamera ponsel ke QR yang terpasang di lokasi, atau gunakan tombol Scan QR di bagian bawah aplikasi. Anda akan langsung dibawa ke halaman tempat tersebut."
	},
	{
		q: "Bisakah saya berpindah wilayah?",
		a: "Bisa. Tekan “Keluar dari Wilayah” di halaman wilayah, lalu pilih wilayah lain di beranda. Aplikasi akan mengingat wilayah terakhir yang Anda kunjungi."
	},
	{
		q: "Apakah tempat tersimpan hilang jika aplikasi ditutup?",
		a: "Tidak. Daftar tersimpan disimpan di perangkat Anda dan tetap ada setelah aplikasi ditutup, selama data browser tidak dihapus."
	},
	{
		q: "Apakah Rekomendify bisa dipakai offline?",
		a: "Halaman yang pernah dibuka bisa tampil kembali dengan cepat, namun informasi terbaru tetap membutuhkan koneksi internet."
	},
	{
		q: "Bagaimana jika informasi tempat tidak akurat?",
		a: "Informasi dikelola pengelola wilayah masing-masing. Hubungi kami lewat WhatsApp agar kami teruskan ke pengelola terkait."
	}
];
function Help() {
	const [open, setOpen] = (0, import_react.useState)(0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-5 pt-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/settings",
				className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Pengaturan"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-3xl",
				children: "Pusat Bantuan"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Pertanyaan yang paling sering ditanyakan."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card",
				children: FAQ.map((item, i) => {
					const expanded = open === i;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setOpen(expanded ? null : i),
						"aria-expanded": expanded,
						className: "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold",
						children: [item.q, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `size-4 shrink-0 text-muted-foreground transition-transform ${expanded ? "rotate-180" : ""}` })]
					}), expanded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "px-4 pb-4 text-sm leading-relaxed text-muted-foreground",
						children: item.a
					})] }, item.q);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 rounded-2xl border border-border bg-card p-5 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold",
						children: "Butuh bantuan lebih lanjut?"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Tim Rekomendify siap membantu lewat WhatsApp."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: waLink(WA_MESSAGES.bantuan),
						target: "_blank",
						rel: "noopener noreferrer",
						className: "mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-4" }), " Hubungi lewat WhatsApp"]
					})
				]
			})
		]
	}) });
}
//#endregion
export { Help as component };
