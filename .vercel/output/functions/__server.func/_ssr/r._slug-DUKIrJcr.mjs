import { o as __toESM } from "../_runtime.mjs";
import { _ as Link, l as useLocation } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { B as LayoutGrid, Ct as LoaderCircle, Tt as Ellipsis, dt as Bookmark, ht as Bell, mt as BellRing, ut as CalendarDays, vt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as motion } from "../_libs/framer-motion.mjs";
import { i as mascots_default, r as PageShell, t as LocationCard } from "./rekomendify-O7_GABh0.mjs";
import { l as recordVisit, n as getRegionBySlug, o as listRegionAds } from "./public.functions-Bx_rFy4n.mjs";
import { t as usePushSubscription } from "./use-push-subscription-BAogReUD.mjs";
import { t as Route } from "./r._slug-BoYwak9-.mjs";
import { i as setLastRegion, t as clearLastRegion } from "./last-region-BMZzkStA.mjs";
import { t as ShareButton } from "./share-button-qJzvC06J.mjs";
import { n as PromotedBadge } from "./ads-DXjqdEwr.mjs";
import { i as useSessionSeed, n as seededShuffle, r as useIncrementalList, t as InfiniteListFooter } from "./infinite-list-footer-Dm05D3am.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._slug-DUKIrJcr.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Satu ruang visual untuk sambutan maskot + promosi wilayah.
* Rasio tetap 16:9 agar tidak ada layout shift antar slide.
*/
function HomeHero({ regionSlug, mascotName, welcomeMessage, ads }) {
	const slides = (0, import_react.useMemo)(() => [{
		kind: "welcome",
		id: "welcome"
	}, ...ads.map((a) => ({
		kind: "ad",
		id: a.id,
		ad: a
	}))], [ads]);
	const count = slides.length;
	const [index, setIndex] = (0, import_react.useState)(0);
	const [paused, setPaused] = (0, import_react.useState)(false);
	const drag = (0, import_react.useRef)(null);
	const [dx, setDx] = (0, import_react.useState)(0);
	const go = (0, import_react.useCallback)((next) => setIndex((next % count + count) % count), [count]);
	(0, import_react.useEffect)(() => {
		if (count < 2 || paused) return;
		const t = setInterval(() => setIndex((v) => (v + 1) % count), 6e3);
		return () => clearInterval(t);
	}, [count, paused]);
	(0, import_react.useEffect)(() => {
		if (index > count - 1) setIndex(0);
	}, [count, index]);
	const onPointerDown = (e) => {
		if (count < 2) return;
		drag.current = {
			x: e.clientX,
			y: e.clientY,
			locked: null
		};
		setPaused(true);
	};
	const onPointerMove = (e) => {
		const d = drag.current;
		if (!d) return;
		const mx = e.clientX - d.x;
		const my = e.clientY - d.y;
		if (!d.locked) {
			if (Math.abs(mx) < 8 && Math.abs(my) < 8) return;
			d.locked = Math.abs(mx) > Math.abs(my) ? "x" : "y";
		}
		if (d.locked === "x") setDx(mx);
	};
	const endDrag = () => {
		const d = drag.current;
		drag.current = null;
		setPaused(false);
		if (d?.locked === "x" && Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1));
		setDx(0);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"aria-label": "Sambutan dan promosi wilayah",
		className: "mt-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative overflow-hidden rounded-3xl border border-border bg-card shadow-soft",
			style: { touchAction: "pan-y" },
			onPointerDown,
			onPointerMove,
			onPointerUp: endDrag,
			onPointerCancel: endDrag,
			onMouseEnter: () => setPaused(true),
			onMouseLeave: () => setPaused(false),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "aspect-[16/9] w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex h-full w-full transition-transform duration-300 ease-out",
					style: { transform: `translate3d(calc(${-index * 100}% + ${dx}px), 0, 0)` },
					children: slides.map((s) => s.kind === "welcome" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WelcomeSlide, {
						name: mascotName,
						message: welcomeMessage
					}, s.id) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdSlide, {
						regionSlug,
						ad: s.ad,
						draggingRef: drag
					}, s.id))
				})
			})
		}), count > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-2 flex justify-center gap-1.5",
			children: slides.map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				"aria-label": `Tampilkan slide ${i + 1}`,
				"aria-current": i === index,
				onClick: () => go(i),
				className: `h-1.5 rounded-full transition-all ${i === index ? "w-5 bg-primary" : "w-1.5 bg-border"}`
			}, s.id))
		})]
	});
}
function WelcomeSlide({ name, message }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full w-full shrink-0 items-center gap-3 bg-card px-4 sm:gap-4 sm:px-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.img, {
			src: mascots_default,
			alt: "Cak Mulyo & Jeng Sari",
			width: 96,
			height: 96,
			decoding: "async",
			draggable: false,
			className: "size-20 shrink-0 select-none sm:size-24",
			animate: { rotate: [
				0,
				-3,
				3,
				0
			] },
			transition: {
				duration: 3,
				repeat: Infinity,
				ease: "easeInOut"
			}
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "truncate text-[11px] font-semibold uppercase tracking-wider text-primary",
				children: name
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 line-clamp-3 text-sm leading-relaxed text-foreground",
				children: message
			})]
		})]
	});
}
function AdSlide({ regionSlug, ad, draggingRef }) {
	const target = ad.locations ?? null;
	const body = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [ad.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: ad.image_url,
		alt: ad.title,
		loading: "lazy",
		draggable: false,
		className: "absolute inset-0 size-full select-none object-cover"
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 bg-muted" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-3 sm:p-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "line-clamp-1 font-display text-base text-white sm:text-lg",
			children: ad.title
		}), ad.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "line-clamp-2 text-[11px] leading-snug text-white/85 sm:text-xs",
			children: ad.description
		})]
	})] });
	const className = "relative block h-full w-full shrink-0 overflow-hidden bg-muted";
	if (!target) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className,
		children: body
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/r/$slug/$loc",
		params: {
			slug: regionSlug,
			loc: target.slug
		},
		"aria-label": `${ad.title} — buka ${target.name}`,
		onClick: (e) => {
			if (draggingRef.current?.locked === "x") e.preventDefault();
		},
		className,
		children: body
	});
}
/**
* Tombol "Ikuti Wilayah" untuk pengunjung (tanpa login).
* Tidak dirender sampai pemeriksaan klien selesai agar SSR & hidrasi identik.
*/
function PushFollowButton({ regionSlug, regionName, className = "" }) {
	const push = usePushSubscription();
	if (!push.ready) return null;
	const following = push.isFollowing(regionSlug);
	const onClick = async () => {
		if (!push.supported) {
			toast.error("Browser Anda belum mendukung notifikasi Rekomendify.");
			return;
		}
		if (!push.configured) {
			toast.error("Notifikasi belum dikonfigurasi di server.");
			return;
		}
		if (await push.toggleFollow(regionSlug, !following)) toast.success(following ? "Notifikasi wilayah dimatikan." : `Kabar terbaru${regionName ? ` dari ${regionName}` : ""} akan dikirim ke perangkat ini.`);
		else if (push.error) toast.error(push.error);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick,
		disabled: push.busy,
		"aria-pressed": following,
		title: following ? "Berhenti mengikuti wilayah" : "Ikuti wilayah ini untuk menerima notifikasi",
		"aria-label": following ? "Berhenti mengikuti wilayah" : "Ikuti wilayah ini",
		className: `inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${following ? "bg-primary text-primary-foreground" : "border border-border bg-card text-foreground hover:bg-accent/10"} ${className}`,
		children: [push.busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-3.5 animate-spin" }) : following ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellRing, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-3.5" }), following ? "Diikuti" : "Ikuti"]
	});
}
/**
* Perhitungan hari pasaran Jawa (siklus 5 hari) secara deterministik.
* Tidak memakai database, API eksternal, maupun randomisasi.
*
* Acuan:
* 1 Januari 1970 = Kamis Wage
* 1 Januari 2000 = Sabtu Legi
*
* Dengan urutan pasaran:
* Legi → Pahing → Pon → Wage → Kliwon
*
* Rumus:
* PASARAN[(hari sejak epoch + 3) % 5]
*/
var PASARAN = [
	"Legi",
	"Pahing",
	"Pon",
	"Wage",
	"Kliwon"
];
var HARI = [
	"Minggu",
	"Senin",
	"Selasa",
	"Rabu",
	"Kamis",
	"Jumat",
	"Sabtu"
];
var BULAN = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember"
];
var TZ = "Asia/Jakarta";
/** Ambil komponen tanggal lokal Indonesia (WIB) apa pun timezone perangkat. */
function jakartaDateParts(now = /* @__PURE__ */ new Date()) {
	const [y, m, d] = new Intl.DateTimeFormat("en-CA", {
		timeZone: TZ,
		year: "numeric",
		month: "2-digit",
		day: "2-digit"
	}).format(now).split("-").map(Number);
	return {
		year: y,
		month: m,
		day: d
	};
}
/** Info hari & pasaran untuk tanggal lokal Indonesia. */
function javaneseDayInfo(now = /* @__PURE__ */ new Date()) {
	const { year, month, day } = jakartaDateParts(now);
	const utcMs = Date.UTC(year, month - 1, day);
	const days = Math.floor(utcMs / 864e5);
	const pasaran = PASARAN[((days + 3) % 5 + 5) % 5];
	const dayName = HARI[((days + 4) % 7 + 7) % 7];
	return {
		pasaran,
		dayName,
		dateLabel: `${day} ${BULAN[month - 1]}`,
		/** Contoh: "Senin Legi" */
		short: `${dayName} ${pasaran}`,
		/** Contoh: "Senin, 25 Agustus" */
		long: `${dayName}, ${day} ${BULAN[month - 1]} ${year}`,
		iso: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
	};
}
function RegionPage() {
	const { slug } = Route.useParams();
	const { src } = Route.useSearch();
	const initialData = Route.useLoaderData();
	const location = useLocation();
	const { data } = useQuery({
		queryKey: ["region", slug],
		queryFn: () => getRegionBySlug({ data: { slug } }),
		initialData
	});
	const { data: ads } = useQuery({
		queryKey: ["region-ads", slug],
		queryFn: () => listRegionAds({ data: { regionSlug: slug } })
	});
	const seed = useSessionSeed();
	const shuffledRest = (0, import_react.useMemo)(() => {
		const promoted = new Set((ads?.featured ?? []).map((a) => a.location_id).filter(Boolean));
		return seededShuffle((data?.locations ?? []).filter((l) => !l.is_featured && !promoted.has(l.id)), seed, `home:${slug}`);
	}, [
		data?.locations,
		ads?.featured,
		seed,
		slug
	]);
	const restPage = useIncrementalList(shuffledRest, `home:${slug}`, 10);
	const [javaDay, setJavaDay] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => setJavaDay(javaneseDayInfo()), []);
	(0, import_react.useEffect)(() => {
		if (!data?.region) return;
		recordVisit({ data: {
			regionId: data.region.id,
			source: src ?? "direct"
		} }).catch(() => {});
		setLastRegion(data.region.slug);
	}, [
		data?.region?.id,
		data?.region?.slug,
		src
	]);
	if (!data) return null;
	const { region, categories, locations } = data;
	const promotedIds = new Set((ads?.featured ?? []).map((a) => a.location_id).filter(Boolean));
	const featured = [...locations.filter((l) => promotedIds.has(l.id)), ...locations.filter((l) => l.is_featured && !promotedIds.has(l.id))];
	const rest = shuffledRest;
	const MAX_SHORTCUTS = 9;
	const hasOverflow = categories.length > 10;
	const shortcuts = hasOverflow ? categories.slice(0, MAX_SHORTCUTS) : categories;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "batik-bg pb-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-md px-5 pt-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center justify-between gap-1.5 sm:gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/",
						onClick: () => clearLastRegion(),
						title: "Keluar dari Wilayah",
						"aria-label": "Keluar dari Wilayah",
						className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground transition hover:bg-accent/10",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs",
							children: "Keluar"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1.5 shrink-0 sm:gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PushFollowButton, {
								regionSlug: region.slug,
								regionName: region.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShareButton, {
								title: `${region.name} — Rekomendify`,
								text: `Jelajahi ${region.name} lewat Rekomendify`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/saved",
								search: {
									region: region.slug,
									regionName: region.name
								},
								title: "Lokasi Tersimpan",
								"aria-label": "Lokasi Tersimpan",
								className: "inline-flex items-center justify-center gap-1.5 rounded-full border border-border bg-card p-1.5 text-xs font-semibold text-foreground transition hover:bg-accent/10 min-[380px]:px-2.5 min-[380px]:py-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-3.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "hidden min-[380px]:inline",
									children: "Tersimpan"
								})]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 text-xs font-semibold uppercase tracking-wider text-primary",
					children: "Wilayah Wisata"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-1 line-clamp-2 font-display text-3xl leading-tight",
					children: region.name
				}),
				region.tagline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 line-clamp-2 text-sm leading-snug text-muted-foreground",
					children: region.tagline
				}),
				javaDay && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, {
						className: "size-3.5 shrink-0 text-primary",
						"aria-hidden": true
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Hari ini • ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-foreground",
							children: javaDay.short
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "hidden min-[380px]:inline",
							children: [", ", javaDay.dateLabel]
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HomeHero, {
					regionSlug: region.slug,
					mascotName: region.mascot_name || "Cak Mulyo & Jeng Sari",
					welcomeMessage: region.welcome_message || `Sugeng rawuh di ${region.name}! Yuk, saya temani jelajah wilayah ini.`,
					ads: ads?.banners ?? []
				})
			]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-md px-5",
		children: [
			categories.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-6 flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg",
					children: "Kategori"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/r/$slug/kategori",
					params: { slug: region.slug },
					className: "text-xs font-semibold text-primary hover:underline",
					children: "Lihat semua"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 grid grid-cols-5 gap-x-2 gap-y-3",
				children: [shortcuts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/r/$slug/kategori/$cat",
					params: {
						slug: region.slug,
						cat: c.slug
					},
					preload: "intent",
					title: c.name,
					className: "group flex flex-col items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-12 place-items-center rounded-2xl border border-border bg-card text-xl transition group-hover:shadow-soft group-active:scale-95",
						children: c.icon ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							"aria-hidden": true,
							children: c.icon
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutGrid, { className: "size-5 text-primary" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "line-clamp-2 w-full text-center text-[10px] font-medium leading-tight text-muted-foreground",
						children: c.name
					})]
				}) }, c.id)), hasOverflow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/r/$slug/kategori",
					params: { slug: region.slug },
					preload: "intent",
					title: "Kategori lainnya",
					className: "group flex flex-col items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-12 place-items-center rounded-2xl border border-dashed border-border bg-card text-muted-foreground transition group-hover:shadow-soft group-active:scale-95",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "w-full text-center text-[10px] font-medium leading-tight text-muted-foreground",
						children: "Lainnya"
					})]
				}) })]
			})] }),
			featured.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-7 flex items-baseline justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-lg",
					children: "Rekomendasi utama"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-xs text-muted-foreground",
					children: [featured.length, " tempat · geser →"]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2",
				children: featured.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/r/$slug/$loc",
					params: {
						slug: region.slug,
						loc: l.slug
					},
					search: { from: location.href },
					className: "group w-44 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card sm:w-56",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "aspect-[4/3] overflow-hidden bg-muted",
						children: l.photo_url && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: l.photo_url,
							alt: l.name,
							loading: "lazy",
							className: "size-full object-cover transition group-hover:scale-105"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "p-3",
						children: [
							promotedIds.has(l.id) && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PromotedBadge, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "truncate font-display text-base",
								children: l.name
							}),
							l.price_range && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: l.price_range
							})
						]
					})]
				}, l.id))
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "daftar-lokasi",
				className: "mt-7 font-display text-lg scroll-mt-6",
				children: "Tempat di wilayah ini"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 space-y-2.5",
				children: rest.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground",
					children: "Belum ada tempat yang cocok."
				}) : restPage.visible.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCard, {
					regionSlug: region.slug,
					locSlug: l.slug,
					name: l.name,
					photo: l.photo_url,
					category: categories.find((c) => c.id === l.category_id)?.name,
					hours: l.hours,
					price: l.price_range,
					featured: l.is_featured
				}, l.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfiniteListFooter, {
				hasMore: restPage.hasMore,
				total: restPage.total,
				sentinelRef: restPage.sentinelRef,
				onLoadMore: restPage.loadMore,
				emptyDoneLabel: "Semua tempat sudah ditampilkan."
			})
		]
	})] }) });
}
//#endregion
export { RegionPage as component };
