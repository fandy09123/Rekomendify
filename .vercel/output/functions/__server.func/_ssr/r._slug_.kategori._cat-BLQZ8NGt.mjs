import { o as __toESM } from "../_runtime.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { B as LayoutGrid, n as X, vt as ArrowLeft, y as Search } from "../_libs/lucide-react.mjs";
import { r as PageShell, t as LocationCard } from "./rekomendify-O7_GABh0.mjs";
import { n as getRegionBySlug } from "./public.functions-Bx_rFy4n.mjs";
import { i as useSessionSeed, n as seededShuffle, r as useIncrementalList, t as InfiniteListFooter } from "./infinite-list-footer-Dm05D3am.mjs";
import { a as passesFilters, i as formatDistance, n as SearchFilters, o as toLatLng, r as distanceMeters, s as useUserLocation, t as NearbySwitch } from "./search-filters-BRc39-Go.mjs";
import { t as Route } from "./r._slug_.kategori._cat-Dfqjusqa.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._slug_.kategori._cat-BLQZ8NGt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function KategoriPage() {
	const { slug, cat } = Route.useParams();
	const initialData = Route.useLoaderData();
	const { data } = useQuery({
		queryKey: ["region", slug],
		queryFn: () => getRegionBySlug({ data: { slug } }),
		initialData
	});
	const category = (0, import_react.useMemo)(() => data?.categories?.find((c) => c.slug === cat || c.id === cat) ?? null, [data, cat]);
	const seed = useSessionSeed();
	const { position, state, request, clear } = useUserLocation();
	const [nearby, setNearby] = (0, import_react.useState)(false);
	const [query, setQuery] = (0, import_react.useState)("");
	const [price, setPrice] = (0, import_react.useState)("all");
	const [hours, setHours] = (0, import_react.useState)("all");
	const list = (0, import_react.useMemo)(() => {
		if (!data || !category) return [];
		const all = data.locations.filter((l) => l.category_id === category.id && passesFilters(l, {
			query,
			price,
			hours,
			categories: data.categories
		}));
		const feat = all.filter((l) => l.is_featured);
		const plain = seededShuffle(all.filter((l) => !l.is_featured), seed, `cat:${cat}`);
		const ordered = [...feat, ...plain];
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
		category,
		query,
		price,
		hours,
		seed,
		cat,
		nearby,
		position
	]);
	const page = useIncrementalList(list, `cat:${slug}:${cat}:${query}:${price}:${hours}:${nearby ? "near" : "std"}`, 10);
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
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex items-center gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/10 text-2xl",
						children: category?.icon || /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-6 text-primary" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-3xl leading-tight",
							children: category?.name ?? "Kategori"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-0.5 text-sm text-muted-foreground",
							children: [
								list.length,
								" tempat di ",
								region.name
							]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "size-4 shrink-0 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: `Cari di ${category?.name ?? "kategori ini"}…`,
							"aria-label": `Cari tempat di kategori ${category?.name ?? "ini"}`,
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
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
						})
					]
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-5",
		children: [
			categories.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "-mx-1 mt-4 flex gap-2 overflow-x-auto pb-1",
				children: categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/r/$slug/kategori/$cat",
					params: {
						slug: region.slug,
						cat: c.slug ?? c.id
					},
					className: `shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${c.id === category?.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`,
					children: [c.icon ? `${c.icon} ` : "", c.name]
				}, c.id))
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 space-y-2.5",
				children: list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground",
					children: query.trim() ? `Tidak ada tempat yang cocok dengan "${query.trim()}" di kategori ini.` : "Belum ada tempat pada kategori ini."
				}) : page.visible.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCard, {
					regionSlug: region.slug,
					locSlug: l.slug,
					name: l.name,
					photo: l.photo_url,
					category: category?.name,
					hours: l.hours,
					price: l.price_range,
					featured: l.is_featured,
					distance: l._dist != null ? formatDistance(l._dist) : null
				}, l.id))
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
export { KategoriPage as component };
