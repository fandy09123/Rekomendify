import { o as __toESM } from "../_runtime.mjs";
import { t as getSupabasePublicConfig } from "./config-Jd4haonG.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as supabase } from "./client-khLhW5dO.mjs";
import { N as redirect, _ as Link, b as useRouter, c as HeadContent, f as createRouter, g as createRootRouteWithContext, h as createFileRoute, l as useLocation, m as lazyRouteComponent, p as Outlet, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime, n as QueryClientProvider } from "../_libs/react+tanstack__react-query.mjs";
import { n as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Ct as LoaderCircle, P as MapPin, Z as Download, ht as Bell, lt as Camera, n as X, p as ShieldCheck, st as Check } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { l as recordVisit, u as resolveQrCode } from "./public.functions-Bx_rFy4n.mjs";
import { t as Route$20 } from "./explore-nrgXeUMw.mjs";
import { t as usePushSubscription } from "./use-push-subscription-BAogReUD.mjs";
import { a as markOnboardingSeen, i as isOnboardingBlockedPath, n as PrivacyPolicyModal, r as hasSeenOnboarding } from "./privacy-policy-modal-0lwoT88L.mjs";
import { t as Route$21 } from "./r._slug-BoYwak9-.mjs";
import { t as Route$22 } from "./r._slug_._loc-B0Rdo8EZ.mjs";
import { t as Route$23 } from "./r._slug_.jelajah-BftVmhH2.mjs";
import { t as Route$24 } from "./r._slug_.kategori._cat-Dfqjusqa.mjs";
import { t as Route$25 } from "./r._slug_.kategori.index-DPAZHl1C.mjs";
import { t as Route$26 } from "./r._slug_.messages-CFKHSURP.mjs";
import { t as Route$27 } from "./r._slug_.scan-DnSTOUDG.mjs";
import { n as InstallGuideSheet, r as usePwaInstall } from "./install-app-DOJPyrU5.mjs";
import { t as Route$28 } from "./r._slug_.settings-B_mYH7Ru.mjs";
import { t as Route$29 } from "./routes-DAt8bVG6.mjs";
import { t as Route$30 } from "./saved-_xYQVrpr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DvIwv-bs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-D4qca1pA.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var DISMISS_KEY = "rekomendify:pwa-banner-dismissed";
/**
* Banner instalasi PWA yang muncul di bagian bawah layar.
* Tampil jika app belum terpasang dan browser mendukung prompt native,
* atau pada iOS yang butuh panduan manual.
*/
function PwaInstallBanner() {
	const { canInstall, isInstalled, platform, install } = usePwaInstall();
	const [dismissed, setDismissed] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return false;
		return window.localStorage.getItem(DISMISS_KEY) === "1";
	});
	const [installing, setInstalling] = (0, import_react.useState)(false);
	const [guide, setGuide] = (0, import_react.useState)(false);
	if (!(!isInstalled && !dismissed && (canInstall || platform === "ios"))) return null;
	const handleInstall = async () => {
		if (!canInstall) return setGuide(true);
		setInstalling(true);
		const outcome = await install();
		setInstalling(false);
		if (outcome === "accepted") setDismissed(true);
		else if (outcome === "unavailable") setGuide(true);
	};
	const handleDismiss = () => {
		window.localStorage.setItem(DISMISS_KEY, "1");
		setDismissed(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
		initial: {
			y: 120,
			opacity: 0
		},
		animate: {
			y: 0,
			opacity: 1
		},
		exit: {
			y: 120,
			opacity: 0
		},
		transition: {
			type: "spring",
			stiffness: 300,
			damping: 30
		},
		className: "fixed bottom-[calc(4rem+env(safe-area-inset-bottom))] inset-x-0 z-50 flex justify-center px-4 pointer-events-none",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "pointer-events-auto w-full max-w-sm rounded-2xl border border-border bg-card/95 shadow-lift backdrop-blur p-3 flex items-center gap-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/icon-192.png",
						alt: "Rekomendify",
						className: "size-8 rounded-lg",
						onError: (e) => {
							e.currentTarget.style.display = "none";
						}
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold text-foreground leading-tight",
						children: "Pasang Aplikasi"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-0.5 leading-tight",
						children: canInstall ? "Akses lebih cepat seperti aplikasi" : "Lihat cara menambah ke Layar Utama"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 shrink-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: handleInstall,
						disabled: installing,
						className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90 disabled:opacity-60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), installing ? "Memuat…" : canInstall ? "Pasang" : "Cara"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: handleDismiss,
						"aria-label": "Tutup",
						className: "flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				})
			]
		})
	}, "pwa-banner") }), guide && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallGuideSheet, { onClose: () => setGuide(false) })] });
}
/**
* Onboarding izin — SATU layar, tampil sekali per perangkat.
*
* Prinsipnya: UI ini hanya MENJELASKAN. Prompt izin asli dari browser hanya
* muncul setelah pengguna menekan tombol (notifikasi). Lokasi & kamera tidak
* diminta di sini — keduanya just-in-time saat fiturnya dipakai.
*/
function OnboardingGate() {
	const loc = useLocation();
	const [show, setShow] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (hasSeenOnboarding()) return;
		if (isOnboardingBlockedPath(loc.pathname)) return;
		setShow(true);
	}, [loc.pathname]);
	if (!show) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingSheet, { onClose: () => {
		markOnboardingSeen();
		setShow(false);
	} });
}
function Item({ icon: Icon, title, desc, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex gap-3 rounded-2xl border border-border bg-card p-3.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "grid size-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-4" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-semibold",
					children: title
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-0.5 text-xs leading-relaxed text-muted-foreground",
					children: desc
				}),
				children
			]
		})]
	});
}
function OnboardingSheet({ onClose }) {
	const push = usePushSubscription();
	const [msg, setMsg] = (0, import_react.useState)(null);
	const [showPolicyModal, setShowPolicyModal] = (0, import_react.useState)(false);
	const perm = push.permission;
	const granted = perm === "granted";
	const denied = perm === "denied";
	const enable = async () => {
		setMsg(null);
		if (!await push.enable()) setMsg(push.error ?? "Notifikasi belum bisa diaktifkan di perangkat ini.");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			initial: {
				y: 40,
				opacity: 0
			},
			animate: {
				y: 0,
				opacity: 1
			},
			transition: {
				duration: .25,
				ease: "easeOut"
			},
			role: "dialog",
			"aria-modal": "true",
			"aria-label": "Selamat datang di Rekomendify",
			className: "max-h-[92svh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-background p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-lift sm:rounded-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl leading-snug",
							children: "Selamat datang di Rekomendify 👋"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1.5 text-sm text-muted-foreground",
							children: "Pemandu wisata digital untuk menemukan tempat dan informasi menarik di sekitar Anda."
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						"aria-label": "Tutup",
						className: "grid size-8 shrink-0 place-items-center rounded-full hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-xs text-muted-foreground",
					children: "Agar beberapa fitur bekerja baik, Rekomendify mungkin butuh izin berikut. Semuanya opsional."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 space-y-2.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Item, {
							icon: Bell,
							title: "Notifikasi",
							desc: "Agar Anda tidak ketinggalan informasi dari wilayah yang Anda ikuti.",
							children: [!push.ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: "Memeriksa…"
							}) : granted ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }), " Notifikasi aktif"]
							}) : denied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: "Izin notifikasi sedang dimatikan. Anda bisa menyalakannya lewat pengaturan situs di browser (ikon gembok di address bar → Notifikasi)."
							}) : !push.supported ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted-foreground",
								children: "Browser ini belum mendukung notifikasi. Fitur lain tetap bisa dipakai."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: enable,
								disabled: push.busy,
								className: "mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60",
								children: [push.busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }), "Aktifkan Notifikasi"]
							}), msg && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-destructive",
								children: msg
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							icon: MapPin,
							title: "Lokasi",
							desc: "Membantu mengurutkan tempat terdekat saat Anda memilih “Terdekat”. Diminta hanya saat Anda menekannya."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
							icon: Camera,
							title: "Kamera",
							desc: "Hanya digunakan ketika Anda memilih Scan QR. Tidak perlu diaktifkan sekarang."
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "mt-4 w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground",
					children: "Lanjutkan"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: onClose,
						className: "rounded-full px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground",
						children: "Lewati untuk sekarang"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setShowPolicyModal(true),
								className: "inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-primary hover:underline",
								children: "Dokumen Kebijakan"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground text-xs",
								children: "•"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/privasi",
								onClick: onClose,
								className: "inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "size-3.5" }), " Privasi & Izin"]
							})
						]
					})]
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PrivacyPolicyModal, {
		open: showPolicyModal,
		onOpenChange: setShowPolicyModal
	})] });
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center batik-bg px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-7xl text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold",
					children: "Wilayah tidak ditemukan"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Halaman yang Anda cari tidak ada atau belum tersedia."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90",
						children: "Kembali ke Beranda"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center batik-bg px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-2xl",
					children: "Halaman gagal dimuat"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Coba muat ulang halaman."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90",
						children: "Coba lagi"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-accent/10",
						children: "Beranda"
					})]
				})
			]
		})
	});
}
var Route$19 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, viewport-fit=cover"
			},
			{
				name: "theme-color",
				content: "#c2603a"
			},
			{ title: "Rekomendify — Pemandu Wisata Digital Lokal" },
			{
				name: "description",
				content: "Jelajahi wilayah wisata, UMKM, dan tempat menarik di sekitar Anda dengan pemandu digital Cak Mulyo & Jeng Sari."
			},
			{
				property: "og:title",
				content: "Rekomendify — Pemandu Wisata Digital"
			},
			{
				property: "og:description",
				content: "Buka, dituntun, jelajahi wilayah."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "default"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "Desa Mulyosari"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest",
				crossOrigin: "use-credentials"
			},
			{
				rel: "icon",
				href: "/favicon.ico"
			},
			{
				rel: "apple-touch-icon",
				href: "/icon-192.png"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "id",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", {
			suppressHydrationWarning: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			suppressHydrationWarning: true,
			children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})]
		})]
	});
}
function RootComponent() {
	const { queryClient } = Route$19.useRouteContext();
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		if (!("serviceWorker" in navigator)) return;
		let reg = null;
		let last = 0;
		let refreshing = false;
		const hadController = !!navigator.serviceWorker.controller;
		const onControllerChange = () => {
			if (refreshing) return;
			if (!hadController) return;
			refreshing = true;
			window.location.reload();
		};
		navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
		const check = () => {
			if (!reg || document.visibilityState !== "visible") return;
			const now = Date.now();
			if (now - last < 6e4) return;
			last = now;
			reg.update().catch(() => {});
		};
		navigator.serviceWorker.register("/sw.js", {
			scope: "/",
			updateViaCache: "none"
		}).then((r) => {
			reg = r;
			last = Date.now();
		}).catch((err) => console.warn("[SW] Registrasi gagal:", err));
		document.addEventListener("visibilitychange", check);
		return () => {
			document.removeEventListener("visibilitychange", check);
			navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const { data: sub } = supabase.auth.onAuthStateChange((event) => {
			if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
			router.invalidate();
			if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
		});
		return () => sub.subscription.unsubscribe();
	}, [router, queryClient]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PwaInstallBanner, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(OnboardingGate, {})
		]
	});
}
var $$splitComponentImporter$17 = () => import("./route-Di7iQBCH.mjs");
var Route$18 = createFileRoute("/_authenticated")({
	ssr: false,
	beforeLoad: async () => {
		const { data, error } = await supabase.auth.getUser();
		if (error || !data.user) throw redirect({ to: "/auth" });
		return { user: data.user };
	},
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
var $$splitComponentImporter$16 = () => import("./auth-YKLx2RAs.mjs");
var Route$17 = createFileRoute("/auth")({
	head: () => ({ meta: [{ title: "Masuk Admin Wilayah — Rekomendify" }] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./bantuan-BXjzKbLX.mjs");
var Route$16 = createFileRoute("/bantuan")({
	head: () => ({ meta: [
		{ title: "Pusat Bantuan — Rekomendify" },
		{
			name: "description",
			content: "Pertanyaan yang sering diajukan seputar Rekomendify: QR, wilayah, menyimpan tempat, dan cara menghubungi tim kami."
		},
		{
			property: "og:title",
			content: "Pusat Bantuan Rekomendify"
		},
		{
			property: "og:description",
			content: "FAQ dan kontak bantuan Rekomendify."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
var $$splitComponentImporter$14 = () => import("./messages-CElOCyaw.mjs");
var Route$15 = createFileRoute("/messages")({
	head: () => ({ meta: [{ title: "Pesan — Rekomendify" }, {
		name: "description",
		content: "Notifikasi dan pesan dari pengelola wilayah Rekomendify."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
var $$splitComponentImporter$13 = () => import("./notifikasi-CZnh4aRk.mjs");
var Route$14 = createFileRoute("/notifikasi")({
	head: () => ({ meta: [
		{ title: "Notifikasi — Rekomendify" },
		{
			name: "description",
			content: "Riwayat notifikasi Rekomendify yang tersimpan di perangkat Anda, tetap bisa dibuka saat offline."
		},
		{
			property: "og:title",
			content: "Notifikasi — Rekomendify"
		},
		{
			property: "og:description",
			content: "Riwayat notifikasi wilayah yang tersimpan lokal di perangkat Anda."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$13, "component")
});
var $$splitComponentImporter$12 = () => import("./privasi-CRE0S8VE.mjs");
var Route$13 = createFileRoute("/privasi")({
	head: () => ({ meta: [
		{ title: "Privasi & Izin — Rekomendify" },
		{
			name: "description",
			content: "Dokumen Kebijakan Privasi resmi & penjelasan transparansi izin Rekomendify: notifikasi, lokasi, kamera, penyimpanan, dan pengelolaan data."
		},
		{
			property: "og:title",
			content: "Privasi & Izin Rekomendify"
		},
		{
			property: "og:description",
			content: "Transparansi penggunaan data dan perizinan perangkat Rekomendify."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
var $$splitComponentImporter$11 = () => import("./reset-password-o_2CMy_1.mjs");
var Route$12 = createFileRoute("/reset-password")({
	head: () => ({ meta: [
		{ title: "Atur Ulang Password — Rekomendify" },
		{
			name: "description",
			content: "Buat password baru untuk akun Admin Wilayah Rekomendify."
		},
		{
			property: "og:title",
			content: "Atur Ulang Password — Rekomendify"
		},
		{
			property: "og:description",
			content: "Buat password baru untuk akun Admin Wilayah Rekomendify."
		},
		{
			name: "robots",
			content: "noindex"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
/** Terjemahan error yang dikirim Supabase pada hash URL. */
var $$splitComponentImporter$10 = () => import("./scan-CLBS43CW.mjs");
var Route$11 = createFileRoute("/scan")({
	head: () => ({ meta: [{ title: "Scan QR — Rekomendify" }, {
		name: "description",
		content: "Pindai QR resmi Rekomendify untuk membuka halaman wilayah atau lokasi."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
var $$splitComponentImporter$9 = () => import("./settings-IwiHe0jV.mjs");
var Route$10 = createFileRoute("/settings")({
	head: () => ({ meta: [
		{ title: "Pengaturan — Rekomendify" },
		{
			name: "description",
			content: "Informasi resmi Rekomendify: tentang aplikasi, pusat bantuan, kirim saran, daftarkan desa, pasang iklan, dan kerja sama."
		},
		{
			property: "og:title",
			content: "Pengaturan Rekomendify"
		},
		{
			property: "og:description",
			content: "Pusat informasi resmi Rekomendify."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
var BASE_URL = "";
var Route$9 = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async () => {
	const { url, publishableKey } = getSupabasePublicConfig();
	const sb = createClient(url, publishableKey, { auth: {
		storage: void 0,
		persistSession: false,
		autoRefreshToken: false
	} });
	const { data: regions } = await sb.from("regions").select("slug, updated_at").eq("is_published", true);
	const { data: locations } = await sb.from("locations").select("slug, updated_at, regions!inner(slug, is_published)").eq("is_published", true);
	const urls = [`  <url><loc>${BASE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`, `  <url><loc>${BASE_URL}/explore</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`];
	for (const r of regions ?? []) urls.push(`  <url><loc>${BASE_URL}/r/${r.slug}</loc><lastmod>${new Date(r.updated_at).toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`);
	for (const l of locations ?? []) {
		const rs = l.regions?.slug;
		if (!rs || !l.regions?.is_published) continue;
		urls.push(`  <url><loc>${BASE_URL}/r/${rs}/${l.slug}</loc><lastmod>${new Date(l.updated_at).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
	}
	const xml = [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
		...urls,
		`</urlset>`
	].join("\n");
	return new Response(xml, { headers: {
		"Content-Type": "application/xml",
		"Cache-Control": "public, max-age=3600"
	} });
} } } });
var $$splitComponentImporter$8 = () => import("./tentang-CcJD8wIi.mjs");
var Route$8 = createFileRoute("/tentang")({
	head: () => ({ meta: [
		{ title: "Tentang Rekomendify — Pemandu Wisata Digital Hyperlocal" },
		{
			name: "description",
			content: "Kenali Rekomendify: pemandu wisata digital hyperlocal berbasis QR yang membantu wisatawan menemukan informasi lokal secara cepat."
		},
		{
			property: "og:title",
			content: "Tentang Rekomendify"
		},
		{
			property: "og:description",
			content: "Pemandu wisata digital hyperlocal berbasis QR."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
var $$splitComponentImporter$7 = () => import("./admin-BrjtNkpt.mjs");
var Route$7 = createFileRoute("/_authenticated/admin")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
var $$splitComponentImporter$6 = () => import("./q._code-Dko6LVIf.mjs");
var Route$6 = createFileRoute("/q/$code")({
	loader: async ({ params }) => {
		const result = await resolveQrCode({ data: { code: params.code } });
		if (!result) throw redirect({
			to: "/",
			search: { qr: "not_found" }
		});
		const { assignment } = result;
		if (!assignment) throw redirect({
			to: "/",
			search: { qr: "inactive" }
		});
		const region = assignment.regions;
		const location = assignment.locations;
		recordVisit({ data: {
			regionId: assignment.region_id,
			locationId: assignment.location_id,
			qrAssignmentId: assignment.id,
			source: "qr"
		} }).catch(() => {});
		if (location?.slug && region?.slug) throw redirect({
			to: "/r/$slug/$loc",
			params: {
				slug: region.slug,
				loc: location.slug
			},
			search: { src: "qr" }
		});
		if (region?.slug) throw redirect({
			to: "/r/$slug",
			params: { slug: region.slug },
			search: { src: "qr" }
		});
		throw redirect({ to: "/" });
	},
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
var $$splitComponentImporter$5 = () => import("./admin.index-CC8Mw2i0.mjs");
var Route$5 = createFileRoute("/_authenticated/admin/")({ component: lazyRouteComponent($$splitComponentImporter$5, "component") });
var $$splitComponentImporter$4 = () => import("./admin.analytics-L8H0j9jV.mjs");
var Route$4 = createFileRoute("/_authenticated/admin/analytics")({ component: lazyRouteComponent($$splitComponentImporter$4, "component") });
var $$splitComponentImporter$3 = () => import("./admin.iklan-DTXsFc0R.mjs");
var Route$3 = createFileRoute("/_authenticated/admin/iklan")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
var $$splitComponentImporter$2 = () => import("./admin.info-hCzeqI8q.mjs");
var Route$2 = createFileRoute("/_authenticated/admin/info")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
var $$splitComponentImporter$1 = () => import("./admin.qr-BymubJOE.mjs");
var Route$1 = createFileRoute("/_authenticated/admin/qr")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
/**
* Quick Action Panel hasil scan: seluruh aksi siklus hidup satu keping akrilik
* tersedia di sini. Aksi utama selalu terlihat, aksi lanjutan disembunyikan
* di balik "Aksi lainnya" (progressive disclosure) agar popup tetap ringkas.
*/
var $$splitComponentImporter = () => import("./admin.region-BbQ_nMWF.mjs");
var Route = createFileRoute("/_authenticated/admin/region")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$29.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$19
});
var AuthenticatedRouteRoute = Route$18.update({
	id: "/_authenticated",
	getParentRoute: () => Route$19
});
var AuthRoute = Route$17.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$19
});
var BantuanRoute = Route$16.update({
	id: "/bantuan",
	path: "/bantuan",
	getParentRoute: () => Route$19
});
var ExploreRoute = Route$20.update({
	id: "/explore",
	path: "/explore",
	getParentRoute: () => Route$19
});
var MessagesRoute = Route$15.update({
	id: "/messages",
	path: "/messages",
	getParentRoute: () => Route$19
});
var NotifikasiRoute = Route$14.update({
	id: "/notifikasi",
	path: "/notifikasi",
	getParentRoute: () => Route$19
});
var PrivasiRoute = Route$13.update({
	id: "/privasi",
	path: "/privasi",
	getParentRoute: () => Route$19
});
var ResetPasswordRoute = Route$12.update({
	id: "/reset-password",
	path: "/reset-password",
	getParentRoute: () => Route$19
});
var SavedRoute = Route$30.update({
	id: "/saved",
	path: "/saved",
	getParentRoute: () => Route$19
});
var ScanRoute = Route$11.update({
	id: "/scan",
	path: "/scan",
	getParentRoute: () => Route$19
});
var SettingsRoute = Route$10.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => Route$19
});
var SitemapDotxmlRoute = Route$9.update({
	id: "/sitemap.xml",
	path: "/sitemap.xml",
	getParentRoute: () => Route$19
});
var TentangRoute = Route$8.update({
	id: "/tentang",
	path: "/tentang",
	getParentRoute: () => Route$19
});
var AuthenticatedAdminRoute = Route$7.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => AuthenticatedRouteRoute
});
var QCodeRoute = Route$6.update({
	id: "/q/$code",
	path: "/q/$code",
	getParentRoute: () => Route$19
});
var RSlugRoute = Route$21.update({
	id: "/r/$slug",
	path: "/r/$slug",
	getParentRoute: () => Route$19
});
var AuthenticatedAdminIndexRoute = Route$5.update({
	id: "/",
	path: "/",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminAnalyticsRoute = Route$4.update({
	id: "/analytics",
	path: "/analytics",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminIklanRoute = Route$3.update({
	id: "/iklan",
	path: "/iklan",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminInfoRoute = Route$2.update({
	id: "/info",
	path: "/info",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminQrRoute = Route$1.update({
	id: "/qr",
	path: "/qr",
	getParentRoute: () => AuthenticatedAdminRoute
});
var AuthenticatedAdminRegionRoute = Route.update({
	id: "/region",
	path: "/region",
	getParentRoute: () => AuthenticatedAdminRoute
});
var RSlugLocRoute = Route$22.update({
	id: "/r/$slug_/$loc",
	path: "/r/$slug/$loc",
	getParentRoute: () => Route$19
});
var RSlugJelajahRoute = Route$23.update({
	id: "/r/$slug_/jelajah",
	path: "/r/$slug/jelajah",
	getParentRoute: () => Route$19
});
var RSlugMessagesRoute = Route$26.update({
	id: "/r/$slug_/messages",
	path: "/r/$slug/messages",
	getParentRoute: () => Route$19
});
var RSlugScanRoute = Route$27.update({
	id: "/r/$slug_/scan",
	path: "/r/$slug/scan",
	getParentRoute: () => Route$19
});
var RSlugSettingsRoute = Route$28.update({
	id: "/r/$slug_/settings",
	path: "/r/$slug/settings",
	getParentRoute: () => Route$19
});
var RSlugKategoriIndexRoute = Route$25.update({
	id: "/r/$slug_/kategori/",
	path: "/r/$slug/kategori/",
	getParentRoute: () => Route$19
});
var RSlugKategoriCatRoute = Route$24.update({
	id: "/r/$slug_/kategori/$cat",
	path: "/r/$slug/kategori/$cat",
	getParentRoute: () => Route$19
});
var AuthenticatedAdminRouteChildren = {
	AuthenticatedAdminAnalyticsRoute,
	AuthenticatedAdminIklanRoute,
	AuthenticatedAdminInfoRoute,
	AuthenticatedAdminQrRoute,
	AuthenticatedAdminRegionRoute,
	AuthenticatedAdminIndexRoute
};
var AuthenticatedRouteRouteChildren = { AuthenticatedAdminRoute: AuthenticatedAdminRoute._addFileChildren(AuthenticatedAdminRouteChildren) };
var rootRouteChildren = {
	IndexRoute,
	AuthenticatedRouteRoute: AuthenticatedRouteRoute._addFileChildren(AuthenticatedRouteRouteChildren),
	AuthRoute,
	BantuanRoute,
	ExploreRoute,
	MessagesRoute,
	NotifikasiRoute,
	PrivasiRoute,
	ResetPasswordRoute,
	SavedRoute,
	ScanRoute,
	SettingsRoute,
	SitemapDotxmlRoute,
	TentangRoute,
	QCodeRoute,
	RSlugRoute,
	RSlugLocRoute,
	RSlugJelajahRoute,
	RSlugMessagesRoute,
	RSlugScanRoute,
	RSlugSettingsRoute,
	RSlugKategoriCatRoute,
	RSlugKategoriIndexRoute
};
var routeTree = Route$19._addFileChildren(rootRouteChildren)._addFileTypes();
var clientQueryClient;
var getRouter = () => {
	return createRouter({
		routeTree,
		context: { queryClient: typeof window !== "undefined" ? clientQueryClient ??= new QueryClient({ defaultOptions: { queries: {
			staleTime: 1e3 * 60 * 5,
			gcTime: 1e3 * 60 * 30,
			refetchOnWindowFocus: false,
			retry: 1
		} } }) : new QueryClient({ defaultOptions: { queries: {
			staleTime: 1e3 * 60 * 5,
			gcTime: 1e3 * 60 * 30,
			refetchOnWindowFocus: false,
			retry: 1
		} } }) },
		scrollRestoration: true,
		defaultPreload: "intent",
		defaultPreloadDelay: 50,
		defaultPreloadStaleTime: 1e3 * 60 * 5,
		defaultPendingMs: 150
	});
};
//#endregion
export { getRouter };
