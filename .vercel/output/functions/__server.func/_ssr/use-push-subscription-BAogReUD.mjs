import { o as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { t as createSsrRpc } from "./createSsrRpc-JmkAOqFF.mjs";
import { a as objectType, n as booleanType, s as stringType } from "../_libs/zod.mjs";
import { a as require_react } from "../_libs/react+tanstack__react-query.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/use-push-subscription-BAogReUD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Push Notification — sisi pengunjung (tanpa login).
*
* Prinsip keamanan:
* - Tabel `push_subscriptions` / `push_region_follows` TIDAK punya grant untuk
*   anon/authenticated. Seluruh operasi hanya lewat server function ini
*   memakai service role, sehingga tidak ada cara membaca langganan orang lain
*   dari browser.
* - Endpoint push adalah kapabilitas rahasia milik perangkat itu sendiri
*   (acak & tidak bisa ditebak). Ia dipakai sebagai identitas perangkat,
*   jadi user anonim tidak perlu login untuk mengelola langganannya.
* - Private VAPID key tidak pernah keluar dari server.
*/
var SubscriptionInput = objectType({
	endpoint: stringType().url().max(2e3),
	p256dh: stringType().min(1).max(255),
	auth: stringType().min(1).max(255),
	userAgent: stringType().max(400).nullable().optional()
});
/** Public VAPID key — memang dirancang untuk dipakai di browser. */
var getPushConfig = createServerFn({ method: "GET" }).handler(createSsrRpc("0e96b490fee478b9ea7a32f0c3d96709008fe304659f4cc6a467eb5b76f2af9e"));
/**
* Menyimpan/menyegarkan langganan perangkat dan mengembalikan daftar wilayah
* yang diikuti perangkat tersebut. Idempoten: satu endpoint = satu baris.
*/
var syncPushSubscription = createServerFn({ method: "POST" }).validator((data) => SubscriptionInput.parse(data)).handler(createSsrRpc("703ade5153ecdd88b502d1b84c7fd5dd56759e16dcbe0ab463fc4aa4fb53531a"));
/** Mengikuti / berhenti mengikuti satu wilayah untuk perangkat ini. */
var setRegionFollow = createServerFn({ method: "POST" }).validator((data) => SubscriptionInput.extend({
	regionSlug: stringType().min(1).max(120),
	follow: booleanType()
}).parse(data)).handler(createSsrRpc("516717dd6b7b0c5dc561a3e8617902a47dabb75da269db02d29fb6b39460b96f"));
/** Dipakai saat browser mencabut izin / user unsubscribe total. */
var deactivatePushSubscription = createServerFn({ method: "POST" }).validator((data) => objectType({ endpoint: stringType().url().max(2e3) }).parse(data)).handler(createSsrRpc("a3a18ff37e05f99c9749839fb44240e8df3cec673a61a8d74803e90e4d108cc0"));
/**
* State langganan Web Push untuk satu perangkat.
*
* Semua akses browser API dilakukan di dalam `useEffect` / event handler,
* sehingga markup SSR dan hidrasi pertama tetap identik.
*/
function urlBase64ToUint8Array(base64String) {
	const sanitized = base64String.trim().replace(/\s+/g, "");
	const base64 = (sanitized + "=".repeat((4 - sanitized.length % 4) % 4)).replace(/-/g, "+").replace(/_/g, "/");
	const rawData = atob(base64);
	const outputArray = new Uint8Array(rawData.length);
	for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
	return outputArray;
}
function bufferToB64url(buf) {
	if (!buf) return "";
	const bytes = new Uint8Array(buf);
	let s = "";
	for (const b of bytes) s += String.fromCharCode(b);
	return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function toPayload(sub) {
	return {
		endpoint: sub.endpoint,
		p256dh: bufferToB64url(sub.getKey("p256dh")),
		auth: bufferToB64url(sub.getKey("auth")),
		userAgent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 400) : null
	};
}
var getSwRegistrationWithTimeout = (timeoutMs = 2500) => {
	if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return Promise.resolve(null);
	return Promise.race([navigator.serviceWorker.ready, new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs))]);
};
async function ensureActiveServiceWorker(reg) {
	if (reg.active && reg.active.state === "activated") return reg;
	const worker = reg.active || reg.installing || reg.waiting;
	if (!worker) return reg;
	if (worker.state === "activated") return reg;
	return new Promise((resolve) => {
		const onStateChange = () => {
			if (worker.state === "activated" || reg.active) {
				worker.removeEventListener("statechange", onStateChange);
				resolve(reg);
			}
		};
		worker.addEventListener("statechange", onStateChange);
		setTimeout(() => {
			worker.removeEventListener("statechange", onStateChange);
			resolve(reg);
		}, 3e3);
	});
}
function isIOSNonStandalone() {
	if (typeof window === "undefined" || typeof navigator === "undefined") return false;
	const ua = navigator.userAgent;
	if (!(/iPad|iPhone|iPod/.test(ua) || /Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return false;
	return !(window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);
}
function mapPushError(e) {
	const msg = e?.message ?? String(e ?? "");
	if (isIOSNonStandalone()) return "Untuk menerima notifikasi di iPhone/iPad, tambahkan Rekomendify ke Layar Utama (Add to Home Screen) terlebih dahulu.";
	if (msg.includes("Izin notifikasi ditolak") || msg.includes("permission") || msg.includes("denied") || msg.includes("NotAllowedError")) return "Izin notifikasi ditolak. Aktifkan izin notifikasi Rekomendify di pengaturan browser Anda.";
	if (msg.includes("Registration failed") || msg.includes("push service error")) return "Gagal mendaftarkan notifikasi di perangkat mobile. Pastikan Layanan Google Play / koneksi internet aktif, lalu coba muat ulang.";
	return msg || "Gagal mengaktifkan notifikasi push.";
}
function usePushSubscription() {
	const [supported, setSupported] = (0, import_react.useState)(false);
	const [configured, setConfigured] = (0, import_react.useState)(false);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [permission, setPermission] = (0, import_react.useState)("unsupported");
	const [subscribed, setSubscribed] = (0, import_react.useState)(false);
	const [regionSlugs, setRegionSlugs] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)(null);
	const publicKeyRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		let alive = true;
		(async () => {
			if (!(typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window)) {
				if (alive) setReady(true);
				return;
			}
			if (!alive) return;
			setSupported(true);
			setPermission(Notification.permission);
			try {
				const cfg = await getPushConfig();
				if (!alive) return;
				publicKeyRef.current = cfg.publicKey ?? "BMvbOkQOWVOUQK3dcxqAtGIxV6f_hRLtTGnYSXkh6TzkaKqoUjp819YrxqGRDekGwIrXHgtLfOWxWQdiM13qzcE";
				setConfigured(Boolean(publicKeyRef.current));
				const reg = await getSwRegistrationWithTimeout(2500);
				if (reg) {
					const existing = await reg.pushManager.getSubscription();
					if (!alive) return;
					if (existing && Notification.permission === "granted") {
						setSubscribed(true);
						const res = await syncPushSubscription({ data: toPayload(existing) });
						if (alive) setRegionSlugs(res.regionSlugs ?? []);
					}
				}
			} catch {} finally {
				if (alive) setReady(true);
			}
		})();
		return () => {
			alive = false;
		};
	}, []);
	/** Memastikan ada langganan aktif; mengembalikan payload langganan. */
	const ensureSubscription = (0, import_react.useCallback)(async () => {
		if (isIOSNonStandalone()) throw new Error("Untuk menerima notifikasi di iPhone/iPad, tambahkan Rekomendify ke Layar Utama (Add to Home Screen) terlebih dahulu.");
		if (!supported) throw new Error("Browser atau perangkat ini belum mendukung notifikasi Web Push.");
		const key = publicKeyRef.current;
		if (!key) throw new Error("Notifikasi belum dikonfigurasi di server.");
		const perm = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
		setPermission(perm);
		if (perm !== "granted") throw new Error("Izin notifikasi ditolak. Aktifkan lewat pengaturan browser.");
		let reg = await getSwRegistrationWithTimeout(4e3);
		if (!reg) throw new Error("Service Worker belum siap. Coba muat ulang halaman.");
		reg = await ensureActiveServiceWorker(reg);
		const appServerKey = urlBase64ToUint8Array(key);
		let existing = await reg.pushManager.getSubscription();
		if (existing) {
			const existingKey = bufferToB64url(existing.options?.applicationServerKey ?? null);
			const wantedKey = key.trim().replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");
			if (existingKey && existingKey !== wantedKey) {
				try {
					await deactivatePushSubscription({ data: { endpoint: existing.endpoint } });
				} catch {}
				await existing.unsubscribe().catch(() => {});
				existing = null;
			}
		}
		const sub = existing ?? await reg.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: appServerKey
		});
		setSubscribed(true);
		return toPayload(sub);
	}, [supported]);
	const enable = (0, import_react.useCallback)(async () => {
		setBusy(true);
		setError(null);
		try {
			setRegionSlugs((await syncPushSubscription({ data: await ensureSubscription() })).regionSlugs ?? []);
			return true;
		} catch (e) {
			setError(mapPushError(e));
			return false;
		} finally {
			setBusy(false);
		}
	}, [ensureSubscription]);
	const toggleFollow = (0, import_react.useCallback)(async (slug, follow) => {
		setBusy(true);
		setError(null);
		try {
			setRegionSlugs((await setRegionFollow({ data: {
				...await ensureSubscription(),
				regionSlug: slug,
				follow
			} })).regionSlugs ?? []);
			return true;
		} catch (e) {
			setError(mapPushError(e));
			return false;
		} finally {
			setBusy(false);
		}
	}, [ensureSubscription]);
	const disable = (0, import_react.useCallback)(async () => {
		setBusy(true);
		setError(null);
		try {
			const reg = await getSwRegistrationWithTimeout(4e3);
			const sub = reg ? await reg.pushManager.getSubscription() : null;
			if (sub) {
				await deactivatePushSubscription({ data: { endpoint: sub.endpoint } });
				await sub.unsubscribe();
			}
			setSubscribed(false);
			setRegionSlugs([]);
		} catch (e) {
			setError(e?.message ?? "Gagal menonaktifkan notifikasi.");
		} finally {
			setBusy(false);
		}
	}, []);
	return {
		supported,
		configured,
		ready,
		permission,
		subscribed,
		regionSlugs,
		busy,
		error,
		isFollowing: (0, import_react.useCallback)((slug) => regionSlugs.includes(slug), [regionSlugs]),
		enable,
		toggleFollow,
		disable
	};
}
//#endregion
export { usePushSubscription as t };
