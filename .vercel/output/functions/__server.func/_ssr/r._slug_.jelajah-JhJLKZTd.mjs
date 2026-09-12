import { o as __toESM } from "../_runtime.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { n as X, vt as ArrowLeft, y as Search } from "../_libs/lucide-react.mjs";
import { r as PageShell, t as LocationCard } from "./rekomendify-O7_GABh0.mjs";
import { n as getRegionBySlug } from "./public.functions-Bx_rFy4n.mjs";
import { i as useSessionSeed, n as seededShuffle, r as useIncrementalList, t as InfiniteListFooter } from "./infinite-list-footer-Dm05D3am.mjs";
import { t as Route } from "./r._slug_.jelajah-BftVmhH2.mjs";
import { a as passesFilters, i as formatDistance, n as SearchFilters, o as toLatLng, r as distanceMeters, s as useUserLocation, t as NearbySwitch } from "./search-filters-BRc39-Go.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._slug_.jelajah-JhJLKZTd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function JelajahWilayah() {
	const { slug } = Route.useParams();
	const initialData = Route.useLoaderData();
	const { data } = useQuery({
		queryKey: ["region", slug],
		queryFn: () => getRegionBySlug({ data: { slug } }),
		initialData
	});
	const [activeCat, setActiveCat] = (0, import_react.useState)(null);
	const [query, setQuery] = (0, import_react.useState)("");
	const [nearby, setNearby] = (0, import_react.useState)(false);
	const [price, setPrice] = (0, import_react.useState)("all");
	const [hours, setHours] = (0, import_react.useState)("all");
	const seed = useSessionSeed();
	const { position, state, request, clear } = useUserLocation();
	const filtered = (0, import_react.useMemo)(() => {
		if (!data) return [];
		const base = data.locations.filter((l) => (!activeCat || l.category_id === activeCat) && passesFilters(l, {
			query,
			price,
			hours,
			categories: data.categories
		}));
		const ordered = [...base.filter((l) => l.is_featured), ...seededShuffle(base.filter((l) => !l.is_featured), seed, `jelajah:${activeCat ?? "all"}`)];
		if (!nearby || !position) return ordered.map((l) => ({
			...l,
			_dist: null
		}));
		return ordered.map((l) => {
			const p = toLatLng(l.coordinates);
			return {
				...l,
				_dist: p ? distanceMeters(position, p) : null
			};
		}).sort((a, b) => (a._dist ?? Infinity) - (b._dist ?? Infinity));
	}, [
		data,
		activeCat,
		query,
		price,
		hours,
		seed,
		nearby,
		position
	]);
	const page = useIncrementalList(filtered, `jelajah:${slug}:${activeCat ?? "all"}:${query}:${price}:${hours}:${nearby ? "near" : "std"}`, 10);
	if (!data) return null;
	const { region, categories } = data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "batik-bg pb-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-md px-5 pt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/r/$slug",
					params: { slug: region.slug },
					className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }),
						" ",
						region.name
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-3xl leading-tight",
					children: "Jelajah Wilayah"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted-foreground",
					children: [
						"Cari & saring tempat di ",
						region.name,
						"."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Cari tempat, kopi, nasi pecel…",
							"aria-label": "Cari tempat",
							type: "search",
							inputMode: "search",
							enterKeyHint: "search",
							autoComplete: "off",
							className: "w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
						}),
						query && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setQuery(""),
							"aria-label": "Hapus pencarian",
							className: "shrink-0 rounded-full p-0.5 text-muted-foreground hover:text-foreground",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
						})
					]
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-5",
		children: [
			categories.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "-mx-1 mt-4 flex gap-2 overflow-x-auto pb-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setActiveCat(null),
					className: `shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${activeCat === null ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`,
					children: "Semua"
				}), categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setActiveCat(c.id),
					className: `shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${activeCat === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`,
					children: [c.icon ? `${c.icon} ` : "", c.name]
				}, c.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchFilters, {
					price,
					hours,
					onPrice: setPrice,
					onHours: setHours
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NearbySwitch, {
					active: nearby,
					state,
					onNearby: () => {
						setNearby(true);
						if (!position) request();
					},
					onDefault: () => {
						setNearby(false);
						clear();
					}
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-5 text-xs uppercase tracking-wider text-muted-foreground",
				children: [filtered.length, " tempat"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 space-y-2.5",
				children: [filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground",
					children: "Tidak ada tempat yang cocok."
				}), page.visible.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCard, {
					regionSlug: region.slug,
					locSlug: l.slug,
					name: l.name,
					photo: l.photo_url,
					category: categories.find((c) => c.id === l.category_id)?.name,
					hours: l.hours,
					price: l.price_range,
					featured: l.is_featured,
					distance: l._dist != null ? formatDistance(l._dist) : null
				}, l.id))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfiniteListFooter, {
				hasMore: page.hasMore,
				total: page.total,
				sentinelRef: page.sentinelRef,
				onLoadMore: page.loadMore,
				emptyDoneLabel: "Semua tempat sudah ditampilkan."
			})
		]
	})] });
}
//#endregion
export { JelajahWilayah as component };
