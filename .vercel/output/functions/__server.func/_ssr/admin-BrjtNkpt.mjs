import { t as supabase } from "./client-khLhW5dO.mjs";
import { _ as Link, p as Outlet, u as useRouterState, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { f as myProfile, p as myRegion } from "./admin.functions-zLuOZcAW.mjs";
import { i as require_jsx_runtime, r as useQueryClient, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { At as ChartColumn, I as LogOut, L as Lock, N as Megaphone, P as MapPin, S as QrCode, V as LayoutDashboard, _ as Settings, nt as Coins, xt as Sparkles } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-BrjtNkpt.js
var import_jsx_runtime = require_jsx_runtime();
function AdminShell({ children }) {
	const navigate = useNavigate();
	const qc = useQueryClient();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { data: profile } = useQuery({
		queryKey: ["my-profile"],
		queryFn: () => myProfile()
	});
	const { data: region } = useQuery({
		queryKey: ["my-region-name"],
		queryFn: async () => (await myRegion()).region,
		enabled: !!profile?.is_active
	});
	const items = [
		{
			to: "/admin",
			label: "Dashboard",
			icon: LayoutDashboard
		},
		{
			to: "/admin/info",
			label: "Info Lokal",
			icon: Megaphone
		},
		{
			to: "/admin/region",
			label: "Pengaturan Wilayah",
			icon: Settings
		},
		{
			to: "/admin/iklan",
			label: "Iklan & Promosi",
			icon: Coins
		},
		{
			to: "/admin/qr",
			label: "QR Codes",
			icon: QrCode
		},
		{
			to: "/admin/analytics",
			label: "Analytics",
			icon: ChartColumn
		}
	];
	const logout = async () => {
		await qc.cancelQueries();
		qc.clear();
		await supabase.auth.signOut();
		navigate({
			to: "/auth",
			replace: true
		});
	};
	if (profile && !profile.is_active) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center batik-bg px-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-lift",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mx-auto grid size-14 place-items-center rounded-2xl bg-mustard/30 text-ink",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-6" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 font-display text-2xl",
					children: "Akun belum aktif"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: [
						"Pendaftaran Anda sudah kami terima. Tim Rekomendify akan memverifikasi & mengaktifkan akun",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold",
							children: [" ", profile.email]
						}),
						" secara manual. Anda akan diberitahu setelah aktif."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: logout,
					className: "mt-6 inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Keluar"]
				})
			]
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen lg:grid lg:grid-cols-[260px_1fr]",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "hidden border-r border-border bg-sidebar p-5 lg:block",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2 text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-xl",
							children: "Rekomendify"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: "Admin Wilayah"
					}),
					region && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex items-start gap-2 rounded-xl bg-card p-3 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "mt-0.5 size-4 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-semibold text-foreground",
								children: region.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-muted-foreground",
								children: ["/", region.slug]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "mt-6 space-y-1",
						children: items.map(({ to, label, icon: Icon }) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to,
								className: `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${pathname === to || to !== "/admin" && pathname.startsWith(to) ? "bg-primary text-primary-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), label]
							}, to);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: logout,
						className: "mt-8 flex w-full items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" }), " Keluar"]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "sticky top-0 z-30 flex items-center justify-between border-b border-border bg-card px-4 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						className: "flex items-center gap-2 text-primary",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-base",
							children: "Rekomendify"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: logout,
						className: "text-sm text-muted-foreground",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-4" })
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "flex overflow-x-auto border-b border-border bg-card px-2",
					children: items.map(({ to, label, icon: Icon }) => {
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to,
							className: `flex shrink-0 items-center gap-1.5 px-3 py-2.5 text-sm font-medium ${pathname === to || to !== "/admin" && pathname.startsWith(to) ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" }), label]
						}, to);
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: "min-w-0 bg-background p-5 lg:p-8",
				children
			})
		]
	});
}
function AdminLayout() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
var SplitComponent = AdminLayout;
//#endregion
export { SplitComponent as component };
