import { t as supabase } from "./client-khLhW5dO.mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { Dt as CircleQuestionMark, G as Handshake, H as Info, I as LogOut, N as Megaphone, at as ChevronRight, p as ShieldCheck, wt as House, z as Lightbulb } from "../_libs/lucide-react.mjs";
import { r as PageShell } from "./rekomendify-O7_GABh0.mjs";
import { n as WA_MESSAGES, r as waLink, t as APP_VERSION } from "./contact-B6lJdI5d.mjs";
import { t as InstallAppCard } from "./install-app-DOJPyrU5.mjs";
import { n as useAdminSession, t as UpdateAppCard } from "./update-app-D-c3c0-E.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/settings-IwiHe0jV.js
var import_jsx_runtime = require_jsx_runtime();
function Row({ icon: Icon, label, desc }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex w-full items-center gap-3 px-4 py-3.5 text-left",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid size-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block text-sm font-semibold",
					children: label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "block truncate text-xs text-muted-foreground",
					children: desc
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 shrink-0 text-muted-foreground" })
		]
	});
}
function Settings() {
	const { email, isAdmin } = useAdminSession();
	const navigate = useNavigate();
	const logout = async () => {
		await supabase.auth.signOut();
		navigate({
			to: "/",
			replace: true
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-5 pt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-3xl",
				children: "Pengaturan"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: "Informasi resmi & bantuan Rekomendify."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: "Aplikasi"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallAppCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UpdateAppCard, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: "Informasi"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/tentang",
						className: "block hover:bg-muted/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: Info,
							label: "Tentang Rekomendify",
							desc: "Apa itu Rekomendify, cara kerja, visi & misi"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/bantuan",
						className: "block hover:bg-muted/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: CircleQuestionMark,
							label: "Pusat Bantuan",
							desc: "FAQ dan kontak bantuan"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/privasi",
						className: "block hover:bg-muted/50",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
							icon: ShieldCheck,
							label: "Privasi & Izin",
							desc: "Izin yang dipakai Rekomendify dan alasannya"
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: "Hubungi kami"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-2 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card",
				children: [
					{
						icon: Lightbulb,
						label: "Kirim Saran",
						desc: "Ide untuk pengembangan aplikasi",
						msg: WA_MESSAGES.saran
					},
					{
						icon: House,
						label: "Daftarkan Desa Anda",
						desc: "Bawa wilayah Anda ke Rekomendify",
						msg: WA_MESSAGES.daftarDesa
					},
					{
						icon: Megaphone,
						label: "Pasang Iklan",
						desc: "Promosikan usaha Anda",
						msg: WA_MESSAGES.iklan
					},
					{
						icon: Handshake,
						label: "Kerja Sama",
						desc: "Peluang kemitraan",
						msg: WA_MESSAGES.kerjaSama
					}
				].map((it) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: waLink(it.msg),
					target: "_blank",
					rel: "noopener noreferrer",
					className: "block hover:bg-muted/50",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
						icon: it.icon,
						label: it.label,
						desc: it.desc
					})
				}, it.label))
			}),
			isAdmin && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: "Panel Admin"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 rounded-2xl border border-border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-wider text-muted-foreground",
						children: "Masuk sebagai"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 truncate font-semibold",
						children: email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin",
							className: "flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-4" }), " Dashboard Admin"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: logout,
							className: "flex items-center justify-center gap-1.5 rounded-full border border-border bg-card px-4 py-2.5 text-sm font-semibold",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Keluar"]
						})]
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-8 text-center text-xs text-muted-foreground",
				children: ["Rekomendify versi ", APP_VERSION]
			})
		]
	}) });
}
//#endregion
export { Settings as component };
