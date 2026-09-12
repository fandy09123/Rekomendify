import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { Et as EllipsisVertical, Z as Download, bt as SquarePlus, h as Share } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/install-app-DOJPyrU5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function detectPlatform() {
	if (typeof navigator === "undefined") return "unknown";
	const ua = navigator.userAgent;
	if (/iPad|iPhone|iPod/.test(ua) || /Macintosh/.test(ua) && navigator.maxTouchPoints > 1) return "ios";
	if (/Android/.test(ua)) return "android";
	return "desktop";
}
/**
* Hook untuk menangkap dan menggunakan beforeinstallprompt event.
* Bila browser tidak mendukung prompt (mis. iOS Safari), hook tetap
* melaporkan platform sehingga UI bisa menampilkan panduan manual.
*/
function usePwaInstall() {
	const [prompt, setPrompt] = (0, import_react.useState)(null);
	const [isInstalled, setIsInstalled] = (0, import_react.useState)(false);
	const [platform, setPlatform] = (0, import_react.useState)("unknown");
	(0, import_react.useEffect)(() => {
		if (typeof window === "undefined") return;
		setPlatform(detectPlatform());
		const mq = window.matchMedia("(display-mode: standalone)");
		const checkInstalled = () => {
			setIsInstalled(mq.matches || window.navigator.standalone === true);
		};
		checkInstalled();
		mq.addEventListener("change", checkInstalled);
		const handler = (e) => {
			e.preventDefault();
			setPrompt(e);
		};
		window.addEventListener("beforeinstallprompt", handler);
		const installedHandler = () => {
			setPrompt(null);
			setIsInstalled(true);
		};
		window.addEventListener("appinstalled", installedHandler);
		return () => {
			window.removeEventListener("beforeinstallprompt", handler);
			window.removeEventListener("appinstalled", installedHandler);
			mq.removeEventListener("change", checkInstalled);
		};
	}, []);
	const install = (0, import_react.useCallback)(async () => {
		if (!prompt) return "unavailable";
		await prompt.prompt();
		const { outcome } = await prompt.userChoice;
		setPrompt(null);
		return outcome;
	}, [prompt]);
	const canInstall = !!prompt && !isInstalled;
	return {
		canInstall,
		isInstalled,
		platform,
		needsManualGuide: !isInstalled && !canInstall && platform !== "unknown",
		install
	};
}
/** Panduan manual bila browser tidak menyediakan prompt install. */
function InstallGuideSheet({ onClose }) {
	const { platform } = usePwaInstall();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-[60] grid place-items-end bg-black/40 sm:place-items-center",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			onClick: (e) => e.stopPropagation(),
			className: "w-full max-w-md rounded-t-3xl bg-card p-6 sm:rounded-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-xl",
					children: "Pasang Rekomendify"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: "Browser Anda memasang aplikasi lewat menu berikut."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
					className: "mt-4 space-y-3",
					children: (platform === "ios" ? [
						{
							icon: Share,
							text: "Ketuk tombol Bagikan di bilah bawah Safari."
						},
						{
							icon: SquarePlus,
							text: "Pilih “Tambahkan ke Layar Utama”."
						},
						{
							icon: Download,
							text: "Ketuk “Tambah” — ikon Rekomendify muncul di layar utama."
						}
					] : [
						{
							icon: EllipsisVertical,
							text: "Buka menu titik tiga di pojok kanan atas browser."
						},
						{
							icon: SquarePlus,
							text: "Pilih “Instal aplikasi” atau “Tambahkan ke Layar Utama”."
						},
						{
							icon: Download,
							text: "Konfirmasi — Rekomendify terpasang seperti aplikasi biasa."
						}
					]).map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "grid size-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(s.icon, { className: "size-4" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "pt-1.5 text-sm",
							children: s.text
						})]
					}, i))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: onClose,
					className: "mt-5 w-full rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold",
					children: "Mengerti"
				})
			]
		})
	});
}
/**
* Kartu "Pasang Aplikasi" permanen untuk halaman Pengaturan.
* Selalu tersedia selama app belum terpasang — bila prompt native tidak ada,
* pengguna diarahkan ke panduan manual.
*/
function InstallAppCard() {
	const { canInstall, isInstalled, install } = usePwaInstall();
	const [guide, setGuide] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isInstalled) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 rounded-2xl border border-border bg-card p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm font-semibold",
			children: "Aplikasi sudah terpasang"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-0.5 text-xs text-muted-foreground",
			children: "Anda membuka Rekomendify dari layar utama perangkat ini."
		})]
	});
	const handle = async () => {
		if (!canInstall) return setGuide(true);
		setBusy(true);
		const outcome = await install();
		setBusy(false);
		if (outcome === "unavailable") setGuide(true);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-2 rounded-2xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: "Pasang Aplikasi"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted-foreground",
				children: "Akses lebih cepat, tampil layar penuh seperti aplikasi."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: handle,
				disabled: busy,
				className: "mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }),
					" ",
					busy ? "Memuat…" : canInstall ? "Pasang sekarang" : "Lihat cara pasang"
				]
			})
		]
	}), guide && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InstallGuideSheet, { onClose: () => setGuide(false) })] });
}
//#endregion
export { InstallGuideSheet as n, usePwaInstall as r, InstallAppCard as t };
