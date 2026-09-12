import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { $ as Crosshair, Ct as LoaderCircle, P as MapPin, ot as ChevronDown } from "../_libs/lucide-react.mjs";
import { n as parseCoordinates } from "./geo-D2rp2Tvf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/coordinate-field-DNebZu32.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_CENTER = [-7.797068, 110.370529];
function toLatLng(value) {
	const c = parseCoordinates(value);
	if (!c) return null;
	const [lat, lng] = c.split(",").map(Number);
	return [lat, lng];
}
/** Peta OpenStreetMap yang hanya dimuat di browser (aman untuk SSR). */
function LeafletPicker({ value, onPick }) {
	const containerRef = (0, import_react.useRef)(null);
	const mapRef = (0, import_react.useRef)(null);
	const markerRef = (0, import_react.useRef)(null);
	const onPickRef = (0, import_react.useRef)(onPick);
	onPickRef.current = onPick;
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		(async () => {
			const [{ default: L }] = await Promise.all([import("leaflet"), import("leaflet/dist/leaflet.css")]);
			if (cancelled || !containerRef.current || mapRef.current) return;
			const start = toLatLng(value) ?? DEFAULT_CENTER;
			const map = L.map(containerRef.current, { attributionControl: true }).setView(start, toLatLng(value) ? 16 : 11);
			L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
				maxZoom: 19,
				attribution: "&copy; OpenStreetMap"
			}).addTo(map);
			const icon = L.divIcon({
				className: "",
				html: `<span style="display:block;width:20px;height:20px;border-radius:9999px;background:var(--primary,#0f766e);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)"></span>`,
				iconSize: [20, 20],
				iconAnchor: [10, 10]
			});
			const place = (lat, lng) => {
				const c = `${lat.toFixed(6)},${lng.toFixed(6)}`;
				if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
				else markerRef.current = L.marker([lat, lng], {
					icon,
					draggable: true
				}).addTo(map).on("dragend", (e) => {
					const p = e.target.getLatLng();
					onPickRef.current(`${p.lat.toFixed(6)},${p.lng.toFixed(6)}`);
				});
				onPickRef.current(c);
			};
			if (toLatLng(value)) {
				const [lat, lng] = toLatLng(value);
				markerRef.current = L.marker([lat, lng], {
					icon,
					draggable: true
				}).addTo(map).on("dragend", (e) => {
					const p = e.target.getLatLng();
					onPickRef.current(`${p.lat.toFixed(6)},${p.lng.toFixed(6)}`);
				});
			}
			map.on("click", (e) => place(e.latlng.lat, e.latlng.lng));
			mapRef.current = map;
			setReady(true);
			setTimeout(() => map.invalidateSize(), 50);
		})();
		return () => {
			cancelled = true;
			if (mapRef.current) {
				mapRef.current.remove();
				mapRef.current = null;
				markerRef.current = null;
			}
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const ll = toLatLng(value);
		if (!ll || !mapRef.current) return;
		if (markerRef.current) {
			const cur = markerRef.current.getLatLng();
			if (Math.abs(cur.lat - ll[0]) < 1e-6 && Math.abs(cur.lng - ll[1]) < 1e-6) return;
			markerRef.current.setLatLng(ll);
			mapRef.current.panTo(ll);
		}
	}, [value]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: containerRef,
			className: "h-64 w-full rounded-xl",
			style: { zIndex: 0 }
		}), !ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "absolute inset-0 grid place-items-center rounded-xl bg-muted/60 text-sm text-muted-foreground",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin" })
		})]
	});
}
function CoordinateField({ label = "Koordinat (lat,lng)", value, onChange, hint }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const [mounted, setMounted] = (0, import_react.useState)(false);
	const [locating, setLocating] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const valid = !!parseCoordinates(value);
	const dirty = !!(value && String(value).trim());
	const locate = () => {
		if (typeof navigator === "undefined" || !navigator.geolocation) return;
		setLocating(true);
		navigator.geolocation.getCurrentPosition((pos) => {
			onChange(`${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`);
			setLocating(false);
			setOpen(true);
		}, () => setLocating(false), {
			enableHighAccuracy: true,
			timeout: 1e4
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
		children: label
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-1 space-y-2",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: value ?? "",
					onChange: (e) => onChange(e.target.value),
					className: "input flex-1",
					placeholder: "-8.002344,111.817618",
					inputMode: "text",
					"aria-invalid": dirty && !valid
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: locate,
					disabled: locating,
					"aria-label": "Gunakan lokasi saya",
					title: "Gunakan lokasi saya",
					className: "grid size-11 shrink-0 place-items-center rounded-xl border border-border bg-card text-foreground hover:bg-accent/10 disabled:opacity-60",
					children: locating ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Crosshair, { className: "size-4" })
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => setOpen((o) => !o),
				"aria-expanded": open,
				className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold hover:bg-accent/10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-3.5" }),
					" ",
					open ? "Tutup peta" : "Pilih di peta",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `size-3.5 transition-transform ${open ? "rotate-180" : ""}` })
				]
			}),
			mounted && open && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "overflow-hidden rounded-xl border border-border",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeafletPicker, {
					value,
					onPick: onChange
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "border-t border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground",
					children: "Ketuk peta untuk memindahkan penanda, atau geser penanda. Koordinat terisi otomatis."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				children: dirty && !valid ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-destructive",
					children: "Format belum benar. Contoh: -8.002344,111.817618"
				}) : hint ?? "Boleh diisi manual atau lewat peta."
			})
		]
	})] });
}
//#endregion
export { CoordinateField as t };
