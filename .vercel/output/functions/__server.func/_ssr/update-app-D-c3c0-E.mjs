import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-khLhW5dO.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { Ct as LoaderCircle, Ot as CircleCheck, kt as CircleAlert, x as RefreshCw } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/update-app-D-c3c0-E.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Deteksi sesi admin di sisi klien saja. Nilai awal `null` = belum diketahui,
* sehingga markup SSR & hidrasi pertama identik (tidak ada hydration mismatch)
* dan menu admin tidak pernah "berkedip" untuk pengguna biasa.
*/
function useAdminSession() {
	const [email, setEmail] = (0, import_react.useState)(null);
	const [resolved, setResolved] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let alive = true;
		supabase.auth.getSession().then(({ data }) => {
			if (!alive) return;
			setEmail(data.session?.user?.email ?? null);
			setResolved(true);
		});
		const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
			setEmail(session?.user?.email ?? null);
			setResolved(true);
		});
		return () => {
			alive = false;
			sub.subscription.unsubscribe();
		};
	}, []);
	return {
		email,
		isAdmin: !!email,
		resolved
	};
}
/**
* Kartu "Perbarui Aplikasi" untuk halaman Pengaturan.
* Memungkinkan pengguna secara manual memeriksa dan menerapkan pembaruan Service Worker/PWA.
*/
function UpdateAppCard() {
	const [status, setStatus] = (0, import_react.useState)("idle");
	const handleUpdate = async () => {
		if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
			setStatus("up-to-date");
			return;
		}
		if (typeof navigator.onLine === "boolean" && !navigator.onLine) {
			setStatus("error");
			return;
		}
		setStatus("checking");
		try {
			let reg = await navigator.serviceWorker.getRegistration();
			if (!reg) reg = await navigator.serviceWorker.register("/sw.js", {
				scope: "/",
				updateViaCache: "none"
			});
			if (!reg) {
				setStatus("up-to-date");
				return;
			}
			let updateFound = false;
			const handleUpdateFound = () => {
				const installingWorker = reg.installing;
				if (!installingWorker) return;
				updateFound = true;
				installingWorker.addEventListener("statechange", () => {
					if (installingWorker.state === "installed" || installingWorker.state === "activated") {
						setStatus("success");
						setTimeout(() => {
							window.location.reload();
						}, 1e3);
					}
				});
			};
			reg.addEventListener("updatefound", handleUpdateFound, { once: true });
			if (reg.waiting) {
				updateFound = true;
				reg.waiting.postMessage({ type: "SKIP_WAITING" });
				setStatus("success");
				setTimeout(() => {
					window.location.reload();
				}, 1e3);
				return;
			}
			await reg.update();
			setTimeout(() => {
				reg?.removeEventListener("updatefound", handleUpdateFound);
				if (!updateFound && !reg?.waiting && !reg?.installing) setStatus("up-to-date");
			}, 1500);
		} catch (err) {
			console.warn("[PWA Update] Gagal memeriksa pembaruan:", err);
			setStatus("error");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-3 rounded-2xl border border-border bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-semibold",
				children: "Pembaruan Aplikasi"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs text-muted-foreground",
				children: "Pastikan aplikasi menggunakan resource terbaru."
			}),
			status === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: handleUpdate,
				className: "mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:opacity-90",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), " Perbarui Aplikasi"]
			}),
			status === "checking" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				disabled: true,
				className: "mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/60 px-4 py-2 text-xs font-semibold text-primary-foreground opacity-80 cursor-not-allowed",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }), " Memeriksa pembaruan..."]
			}),
			status === "success" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pembaruan berhasil diterapkan." })]
			}),
			status === "up-to-date" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Aplikasi sudah menggunakan versi terbaru." })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: handleUpdate,
					className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-accent/10 transition",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), " Periksa Lagi"]
				})]
			}),
			status === "error" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-4 shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Pembaruan belum berhasil. Pastikan koneksi internet Anda baik lalu coba lagi." })]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: handleUpdate,
					className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5" }), " Coba Lagi"]
				})]
			})
		]
	});
}
//#endregion
export { useAdminSession as n, UpdateAppCard as t };
