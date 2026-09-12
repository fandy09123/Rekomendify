import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { Ct as LoaderCircle, P as MapPin, f as Shuffle, n as X, r as Wallet, rt as Clock } from "../_libs/lucide-react.mjs";
import { n as parseCoordinates } from "./geo-D2rp2Tvf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/search-filters-BRc39-Go.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Sakelar urutan: acak (default) atau terdekat dari posisi pengguna.
* Permission tidak pernah dipaksa — jika ditolak, daftar tetap tampil normal.
*/
function NearbySwitch({ active, state, onNearby, onDefault }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onDefault,
				"aria-pressed": !active,
				className: `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${!active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shuffle, { className: "size-3.5" }), " Semua"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: onNearby,
				"aria-pressed": active,
				disabled: state === "loading",
				className: `inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`,
				children: [state === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }), " Terdekat"]
			})]
		}),
		state === "idle" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: "Pilih “Terdekat” untuk mengurutkan tempat berdasarkan jarak. Browser akan menanyakan izin lokasi, dan posisi Anda hanya dipakai di perangkat ini untuk menghitung jarak."
		}),
		state === "denied" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: "Aktifkan izin lokasi di browser (ikon gembok pada address bar → Lokasi) untuk melihat tempat terdekat. Daftar tetap bisa dijelajahi seperti biasa."
		}),
		state === "unsupported" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-xs text-muted-foreground",
			children: "Perangkat ini belum mendukung deteksi lokasi."
		})
	] });
}
function toLatLng(coords) {
	const c = parseCoordinates(coords);
	if (!c) return null;
	const [lat, lng] = c.split(",").map(Number);
	return {
		lat,
		lng
	};
}
/** Jarak haversine dalam meter. */
function distanceMeters(a, b) {
	const R = 6371e3;
	const toRad = (d) => d * Math.PI / 180;
	const dLat = toRad(b.lat - a.lat);
	const dLng = toRad(b.lng - a.lng);
	const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}
/** "350 m" / "1,2 km" — pembulatan yang nyaman dibaca. */
function formatDistance(m) {
	if (m < 1e3) return `${Math.round(m / 10) * 10} m`;
	const km = m / 1e3;
	return `${km < 10 ? km.toFixed(1).replace(".", ",") : Math.round(km)} km`;
}
/** Geolokasi browser yang aman untuk SSR: hanya diakses saat handler dipanggil. */
function useUserLocation() {
	const [position, setPosition] = (0, import_react.useState)(null);
	const [state, setState] = (0, import_react.useState)("idle");
	return {
		position,
		state,
		request: (0, import_react.useCallback)(() => {
			if (typeof navigator === "undefined" || !navigator.geolocation) {
				setState("unsupported");
				return;
			}
			setState("loading");
			navigator.geolocation.getCurrentPosition((pos) => {
				setPosition({
					lat: pos.coords.latitude,
					lng: pos.coords.longitude
				});
				setState("granted");
			}, () => setState("denied"), {
				enableHighAccuracy: false,
				timeout: 1e4,
				maximumAge: 3e5
			});
		}, []),
		clear: (0, import_react.useCallback)(() => {
			setPosition(null);
			setState("idle");
		}, [])
	};
}
var normalize = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
/** Sinonim ringan agar cara mengetik orang awam tetap ketemu. */
var SYNONYMS = {
	kopi: [
		"kopi",
		"coffee",
		"kafe",
		"cafe",
		"ngopi"
	],
	makan: [
		"makan",
		"makanan",
		"kuliner",
		"warung",
		"rumah makan",
		"resto",
		"restoran"
	],
	murah: [
		"murah",
		"terjangkau",
		"hemat",
		"ekonomis"
	],
	mahal: [
		"mahal",
		"premium",
		"mewah"
	],
	wisata: [
		"wisata",
		"wisatawan",
		"tour",
		"objek wisata",
		"destinasi"
	],
	penginapan: [
		"penginapan",
		"hotel",
		"homestay",
		"losmen",
		"villa"
	]
};
function expand(token) {
	for (const list of Object.values(SYNONYMS)) if (list.some((w) => normalize(w) === token)) return list.map(normalize);
	return [token];
}
/** Mengubah potongan angka harga Indonesia menjadi rupiah. */
function parseAmount(raw) {
	const m = raw.match(/(\d[\d.,]*)\s*(rb|ribu|k|jt|juta|m)?/i);
	if (!m) return null;
	const digits = m[1].replace(/[.,](?=\d{3}\b)/g, "").replace(/,/g, ".");
	let n = Number.parseFloat(digits);
	if (!Number.isFinite(n)) return null;
	const unit = (m[2] ?? "").toLowerCase();
	if (unit === "rb" || unit === "ribu" || unit === "k") n *= 1e3;
	else if (unit === "jt" || unit === "juta" || unit === "m") n *= 1e6;
	return n;
}
/** Nilai rupiah rata-rata dari sebuah teks harga bebas; `null` bila tak terbaca. */
function parsePriceValue(price) {
	if (!price) return null;
	const text = price.toLowerCase();
	if (/gratis|free|cuma[- ]?cuma|0\b/.test(text) && !/\d{3}/.test(text)) return 0;
	const parts = text.match(/\d[\d.,]*\s*(rb|ribu|k|jt|juta)?/gi);
	if (!parts || parts.length === 0) return null;
	const values = parts.map(parseAmount).filter((v) => v != null && v >= 0);
	if (values.length === 0) return null;
	return (Math.min(...values) + Math.max(...values)) / 2;
}
/** Ambang harga (rupiah) yang masuk akal untuk warung/wisata desa. */
var CHEAP_MAX = 25e3;
var MID_MAX = 75e3;
function priceTier(price) {
	const v = parsePriceValue(price);
	if (v == null) return "unknown";
	if (v <= CHEAP_MAX) return "murah";
	if (v <= MID_MAX) return "sedang";
	return "mahal";
}
var PRICE_FILTER_LABEL = {
	all: "Semua harga",
	murah: "Murah",
	sedang: "Sedang",
	mahal: "Mahal"
};
var ALWAYS_OPEN = /24\s*jam|24\s*\/\s*7|buka\s*24/i;
var CLOSED = /tutup\s*(sementara|total)?$/i;
/** Membaca semua interval "HH.MM–HH.MM" dari teks bebas. */
function parseHours(hours) {
	if (!hours) return null;
	const text = hours.toLowerCase();
	if (ALWAYS_OPEN.test(text)) return {
		intervals: [{
			start: 0,
			end: 1440
		}],
		always: true
	};
	const re = /(\d{1,2})[.:]?(\d{2})?\s*(?:wib|wita|wit)?\s*(?:-|–|—|s\/d|sampai|hingga|s.d.)\s*(\d{1,2})[.:]?(\d{2})?/g;
	const intervals = [];
	let m;
	while (m = re.exec(text)) {
		const h1 = Number(m[1]);
		const h2 = Number(m[3]);
		if (h1 > 24 || h2 > 24) continue;
		const start = h1 * 60 + Number(m[2] ?? 0);
		let end = h2 * 60 + Number(m[4] ?? 0);
		if (end <= start) end += 1440;
		intervals.push({
			start,
			end
		});
	}
	if (intervals.length === 0) {
		if (CLOSED.test(text)) return {
			intervals: [],
			always: false
		};
		return null;
	}
	return {
		intervals,
		always: false
	};
}
/** `true` buka, `false` tutup, `null` bila format jam tidak terbaca. */
function isOpenAt(hours, at = /* @__PURE__ */ new Date()) {
	const parsed = parseHours(hours);
	if (!parsed) return null;
	if (parsed.always) return true;
	if (parsed.intervals.length === 0) return false;
	const minutes = at.getHours() * 60 + at.getMinutes();
	return parsed.intervals.some((iv) => minutes >= iv.start && minutes < iv.end || iv.end > 1440 && minutes + 1440 >= iv.start && minutes + 1440 < iv.end);
}
var PERIODS = {
	pagi: {
		start: 300,
		end: 660
	},
	siang: {
		start: 660,
		end: 900
	},
	sore: {
		start: 900,
		end: 1080
	},
	malam: {
		start: 1080,
		end: 1440
	}
};
/** Apakah jam operasional bersinggungan dengan periode hari tertentu. */
function opensDuring(hours, period) {
	const parsed = parseHours(hours);
	if (!parsed) return null;
	if (parsed.always) return true;
	const p = PERIODS[period];
	return parsed.intervals.some((iv) => {
		const spans = [{
			start: iv.start,
			end: Math.min(iv.end, 1440)
		}];
		if (iv.end > 1440) spans.push({
			start: 0,
			end: iv.end - 1440
		});
		return spans.some((s) => s.start < p.end && s.end > p.start);
	});
}
var HOURS_FILTER_LABEL = {
	all: "Kapan saja",
	now: "Buka sekarang",
	pagi: "Buka pagi",
	siang: "Buka siang",
	sore: "Buka sore",
	malam: "Buka malam"
};
function haystack(loc, categories) {
	const cat = categories.find((c) => c.id === loc.category_id);
	const tier = priceTier(loc.price_range);
	const parsed = parseHours(loc.hours);
	const periodWords = parsed ? [
		"pagi",
		"siang",
		"sore",
		"malam"
	].filter((p) => opensDuring(loc.hours, p)).join(" ") : "";
	return normalize([
		loc.name,
		loc.description ?? "",
		loc.price_range ?? "",
		loc.hours ?? "",
		cat?.name ?? "",
		cat?.slug ?? "",
		tier === "unknown" ? "" : tier,
		parsed?.always ? "24 jam buka terus" : "",
		periodWords ? `buka ${periodWords}` : ""
	].join(" "));
}
/** Semua kata kunci harus cocok (AND), tiap kata boleh cocok sebagian. */
function matchesQuery(loc, query, categories) {
	const q = normalize(query);
	if (!q) return true;
	const hay = haystack(loc, categories);
	return q.split(" ").every((token) => expand(token).some((v) => hay.includes(v)));
}
function passesFilters(loc, opts) {
	const categories = opts.categories ?? [];
	if (opts.query && !matchesQuery(loc, opts.query, categories)) return false;
	const price = opts.price ?? "all";
	if (price !== "all" && priceTier(loc.price_range) !== price) return false;
	const hours = opts.hours ?? "all";
	if (hours === "now") {
		if (isOpenAt(loc.hours, opts.now) !== true) return false;
	} else if (hours !== "all") {
		if (opensDuring(loc.hours, hours) !== true) return false;
	}
	return true;
}
/**
* Baris filter sederhana untuk pencarian tempat: Harga & Jam buka.
* Sengaja memakai chip besar (touch target ≥ 44px) dan bahasa sehari-hari,
* bukan istilah teknis, karena penggunanya masyarakat umum.
*/
var PRICE_ORDER = [
	"all",
	"murah",
	"sedang",
	"mahal"
];
var HOURS_ORDER = [
	"all",
	"now",
	"pagi",
	"siang",
	"sore",
	"malam"
];
function Chip({ active, children, onClick, label }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		"aria-pressed": active,
		"aria-label": label,
		className: `min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-accent/10"}`,
		children
	});
}
function SearchFilters({ price, hours, onPrice, onHours }) {
	const dirty = price !== "all" || hours !== "all";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, {
					className: "size-3.5",
					"aria-hidden": "true"
				}), " Harga"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1",
				children: PRICE_ORDER.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					active: price === p,
					onClick: () => onPrice(p),
					label: `Harga: ${PRICE_FILTER_LABEL[p]}`,
					children: PRICE_FILTER_LABEL[p]
				}, p))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
					className: "size-3.5",
					"aria-hidden": "true"
				}), " Jam buka"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "-mx-1 flex gap-2 overflow-x-auto px-1 pb-1",
				children: HOURS_ORDER.map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
					active: hours === h,
					onClick: () => onHours(h),
					label: `Jam buka: ${HOURS_FILTER_LABEL[h]}`,
					children: HOURS_FILTER_LABEL[h]
				}, h))
			})] }),
			dirty && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => {
					onPrice("all");
					onHours("all");
				},
				className: "inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
					className: "size-3.5",
					"aria-hidden": "true"
				}), " Hapus filter"]
			})
		]
	});
}
//#endregion
export { passesFilters as a, formatDistance as i, SearchFilters as n, toLatLng as o, distanceMeters as r, useUserLocation as s, NearbySwitch as t };
