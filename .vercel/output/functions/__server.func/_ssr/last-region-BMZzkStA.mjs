//#region node_modules/.nitro/vite/services/ssr/assets/last-region-BMZzkStA.js
/**
* Ingatan wilayah terakhir untuk PWA — sepenuhnya di sisi klien.
*
* Prinsip:
* - localStorage menyimpan wilayah TERAKHIR yang benar-benar dikunjungi
*   (selalu ditimpa, bukan "wilayah pertama" yang permanen).
* - sessionStorage menandai bahwa auto-redirect sudah dipakai pada sesi ini,
*   sehingga pengguna PWA bisa keluar wilayah dan menjelajah wilayah lain
*   tanpa langsung dilempar balik.
*/
var KEY = "rekomendify:last-region";
var LEGACY_KEY = "rekomendify:pwa-home-region";
var SESSION_FLAG = "rekomendify:launch-redirect-done";
function setLastRegion(slug) {
	if (typeof window === "undefined" || !slug) return;
	try {
		window.localStorage.setItem(KEY, slug);
		window.localStorage.removeItem(LEGACY_KEY);
	} catch {}
}
function getLastRegion() {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage.getItem(KEY);
	} catch {
		return null;
	}
}
/** Dipakai saat pengguna menekan "Keluar dari Wilayah". */
function clearLastRegion() {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.removeItem(KEY);
		window.localStorage.removeItem(LEGACY_KEY);
		window.sessionStorage.setItem(SESSION_FLAG, "1");
	} catch {}
}
function isStandalone() {
	if (typeof window === "undefined") return false;
	return window.matchMedia?.("(display-mode: standalone)").matches === true || window.navigator.standalone === true;
}
/**
* True hanya sekali per peluncuran aplikasi (cold start). Setelah itu navigasi
* ke beranda global selalu dihormati.
*/
function consumeLaunchRedirect() {
	if (typeof window === "undefined") return null;
	try {
		if (window.sessionStorage.getItem(SESSION_FLAG)) return null;
		window.sessionStorage.setItem(SESSION_FLAG, "1");
		return getLastRegion();
	} catch {
		return null;
	}
}
//#endregion
export { setLastRegion as i, consumeLaunchRedirect as n, isStandalone as r, clearLastRegion as t };
