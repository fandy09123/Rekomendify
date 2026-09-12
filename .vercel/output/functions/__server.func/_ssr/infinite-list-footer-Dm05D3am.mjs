import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { Ct as LoaderCircle } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/infinite-list-footer-Dm05D3am.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** PRNG deterministik agar urutan stabil untuk seed yang sama. */
function mulberry32(seed) {
	let a = seed >>> 0;
	return () => {
		a = a + 1831565813 >>> 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}
function hash(str) {
	let h = 2166136261;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 16777619);
	}
	return h >>> 0;
}
/**
* Pengacakan stabil: urutan berubah antar sesi, tetapi tidak berubah
* saat komponen re-render. seed = 0 berarti urutan asli (SSR & render pertama).
*/
function seededShuffle(items, seed, salt = "") {
	const out = items.slice();
	if (!seed) return out;
	const rnd = mulberry32(seed ^ hash(salt));
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(rnd() * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}
/**
* Seed per pemuatan halaman (bukan per sesi): setiap refresh/reload menghasilkan
* urutan baru, tetapi tetap stabil selama halaman dibuka & saat navigasi antar
* rute (nilai disimpan di modul, bukan di state komponen).
* Bernilai 0 pada server dan render pertama agar hidrasi tetap cocok.
*/
var PAGE_SEED = 0;
function getPageSeed() {
	if (!PAGE_SEED) PAGE_SEED = Math.floor(Math.random() * 2147483647) + 1;
	return PAGE_SEED;
}
function useSessionSeed() {
	const [seed, setSeed] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		setSeed(getPageSeed());
	}, []);
	return seed;
}
/**
* Menampilkan daftar secara bertahap (batch) + sentinel untuk infinite scroll.
* Data sumber tetap berasal dari query/loader yang sudah ada — hook ini hanya
* mengurangi jumlah item yang benar-benar dirender pada initial load.
*
* Pagination otomatis reset saat `resetKey` (kategori, query, filter, dsb) berubah.
*/
function useIncrementalList(items, resetKey, batchSize = 10) {
	const [count, setCount] = (0, import_react.useState)(batchSize);
	const sentinelRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		setCount(batchSize);
	}, [resetKey, batchSize]);
	const hasMore = count < items.length;
	const loadMore = (0, import_react.useCallback)(() => {
		setCount((c) => Math.min(c + batchSize, items.length));
	}, [batchSize, items.length]);
	(0, import_react.useEffect)(() => {
		const el = sentinelRef.current;
		if (!el || !hasMore || typeof IntersectionObserver === "undefined") return;
		const io = new IntersectionObserver((entries) => {
			if (entries.some((e) => e.isIntersecting)) loadMore();
		}, { rootMargin: "400px 0px" });
		io.observe(el);
		return () => io.disconnect();
	}, [hasMore, loadMore]);
	return {
		visible: (0, import_react.useMemo)(() => items.slice(0, count), [items, count]),
		hasMore,
		loadMore,
		sentinelRef,
		total: items.length
	};
}
/** Indikator kecil di bawah daftar: memuat batch berikutnya atau tanda selesai. */
function InfiniteListFooter({ hasMore, total, sentinelRef, onLoadMore, emptyDoneLabel }) {
	if (total === 0) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: sentinelRef,
		className: "py-4 text-center",
		children: hasMore ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: onLoadMore,
			className: "inline-flex items-center gap-2 text-xs text-muted-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
				className: "size-3.5 animate-spin",
				"aria-hidden": true
			}), "Memuat rekomendasi…"]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs text-muted-foreground",
			children: emptyDoneLabel ?? "Semua rekomendasi sudah ditampilkan."
		})
	});
}
//#endregion
export { useSessionSeed as i, seededShuffle as n, useIncrementalList as r, InfiniteListFooter as t };
