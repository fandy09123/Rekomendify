import { o as __toESM } from "../_runtime.mjs";
import { b as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { E as Phone, M as MessageCircle, P as MapPin, St as ShieldQuestionMark, d as Store, dt as Bookmark, ft as BookmarkCheck, g as Share2, k as Navigation, ot as ChevronDown, pt as Bike, rt as Clock, u as Tag, vt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as waChatUrl, t as mapsDirUrl } from "./geo-D2rp2Tvf.mjs";
import { n as AnimatePresence, t as motion } from "../_libs/framer-motion.mjs";
import { n as MascotWelcome, t as LocationCard } from "./rekomendify-O7_GABh0.mjs";
import { c as recordEngagement, i as listContextualAds, l as recordVisit, r as getRegionContact, t as getLocationBySlug } from "./public.functions-Bx_rFy4n.mjs";
import { t as ContextualAdCard } from "./ads-DXjqdEwr.mjs";
import { t as Route } from "./r._slug_._loc-B0Rdo8EZ.mjs";
import { i as saveLocation, r as removeSaved, t as isSaved } from "./saved-locations-DDQGcli2.mjs";
import { t as MediaGallery } from "./media-gallery-GKgkj6xZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/r._slug_._loc-DNbJyaV0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Menampilkan teks multi-paragraf (mengikuti line break dari database)
* dengan mekanisme "Selengkapnya" bila teksnya panjang.
*/
function ExpandableText({ text, collapsedHeight = 132, className = "" }) {
	const [expanded, setExpanded] = (0, import_react.useState)(false);
	const [overflowing, setOverflowing] = (0, import_react.useState)(false);
	const ref = (0, import_react.useRef)(null);
	(0, import_react.useLayoutEffect)(() => {
		const el = ref.current;
		if (!el) return;
		const check = () => setOverflowing(el.scrollHeight > collapsedHeight + 8);
		check();
		const ro = new ResizeObserver(check);
		ro.observe(el);
		return () => ro.disconnect();
	}, [text, collapsedHeight]);
	const paragraphs = text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.div, {
			animate: { maxHeight: expanded || !overflowing ? 4e3 : collapsedHeight },
			initial: false,
			transition: {
				duration: .32,
				ease: "easeInOut"
			},
			className: "relative overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				ref,
				className: "space-y-3",
				children: paragraphs.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-relaxed text-foreground/85",
					children: p
				}, i))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: !expanded && overflowing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				className: "pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent"
			}) })]
		}), overflowing && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => setExpanded((v) => !v),
			"aria-expanded": expanded,
			className: "mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:opacity-80",
			children: [expanded ? "Ringkas" : "Selengkapnya", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: `size-4 transition-transform ${expanded ? "rotate-180" : ""}` })]
		})]
	});
}
/**
* Teks berbagi ringkas. Deskripsi asli lokasi tetap utuh di database —
* yang dipersingkat hanya representasi untuk share payload.
*/
function truncateText(input, max = 120) {
	const clean = String(input ?? "").replace(/\s+/g, " ").trim();
	if (clean.length <= max) return clean;
	const cut = clean.slice(0, max);
	const lastSpace = cut.lastIndexOf(" ");
	return `${(lastSpace > max * .6 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:!-]+$/, "")}…`;
}
/** Ringkasan share untuk sebuah lokasi: nama, wilayah, deskripsi singkat. */
function buildLocationShareText(opts) {
	const lines = [opts.name];
	const sub = [opts.category, opts.regionName].filter(Boolean).join(" · ");
	if (sub) lines.push(sub);
	const desc = truncateText(opts.description, 120);
	if (desc) lines.push(desc);
	lines.push("Lihat di Rekomendify");
	return lines.join("\n");
}
/** Berbagi dengan Web Share API bila tersedia; fallback salin tautan. */
async function shareOrCopy(data) {
	if (typeof navigator !== "undefined" && typeof navigator.share === "function") try {
		await navigator.share(data);
		return "shared";
	} catch (e) {
		if (e?.name === "AbortError") return "shared";
	}
	try {
		await navigator.clipboard.writeText(`${data.text}\n${data.url}`);
		return "copied";
	} catch {
		return "failed";
	}
}
function getSafeInternalHref(value) {
	if (!value) return null;
	try {
		const base = typeof window === "undefined" ? "https://rekomendify.local" : window.location.origin;
		const url = new URL(value, base);
		return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : null;
	} catch {
		return null;
	}
}
function LocationPage() {
	const router = useRouter();
	const { slug, loc } = Route.useParams();
	const { from, fromLabel } = Route.useSearch();
	const initialData = Route.useLoaderData();
	const { data } = useQuery({
		queryKey: [
			"location",
			slug,
			loc
		],
		queryFn: () => getLocationBySlug({ data: {
			regionSlug: slug,
			locationSlug: loc
		} }),
		initialData
	});
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	const [saved, setSaved] = (0, import_react.useState)(false);
	const { data: regionContact } = useQuery({
		queryKey: ["region-contact", slug],
		queryFn: () => getRegionContact({ data: { slug } })
	});
	const { data: contextualAds } = useQuery({
		queryKey: ["contextual-ads", data?.location?.id],
		queryFn: () => listContextualAds({ data: { hostLocationId: data.location.id } }),
		enabled: !!data?.location?.id
	});
	(0, import_react.useEffect)(() => {
		if (!data?.location) return;
		setSaved(isSaved(data.location.id));
		recordVisit({ data: {
			regionId: data.region.id,
			locationId: data.location.id,
			source: "direct"
		} }).catch(() => {});
	}, [data?.location?.id]);
	if (!data) return null;
	const { region, location, otherLocations = [], categories = [], couriers = [] } = data;
	const cat = location.categories;
	const coords = location.coordinates;
	const mapsUrl = mapsDirUrl(coords);
	const ownerWaUrl = waChatUrl(location.whatsapp, `Halo, saya menemukan ${location.name} melalui Rekomendify.`);
	const activeCouriers = couriers.filter((c) => c?.whatsapp);
	const canContact = Boolean(ownerWaUrl) || activeCouriers.length > 0;
	const regionAdminWaUrl = waChatUrl(regionContact?.admin_whatsapp, `Halo Admin ${region.name}, saya ingin bertanya/melaporkan tentang ${location.name} di Rekomendify.`);
	const parentHref = getSafeInternalHref(from);
	const handleBack = () => {
		if (parentHref) {
			router.navigate({
				href: parentHref,
				replace: true
			});
			return;
		}
		router.navigate({
			to: "/r/$slug",
			params: { slug: region.slug }
		});
	};
	const sortedRecommendations = [...otherLocations].sort((a, b) => {
		const aSameCat = location.category_id && a.category_id === location.category_id ? 1 : 0;
		const bSameCat = location.category_id && b.category_id === location.category_id ? 1 : 0;
		if (aSameCat !== bSameCat) return bSameCat - aSameCat;
		const aFeat = a.is_featured ? 1 : 0;
		return (b.is_featured ? 1 : 0) - aFeat;
	});
	const track = (kind) => {
		recordEngagement({ data: {
			regionId: region.id,
			locationId: location.id,
			kind
		} }).catch(() => {});
	};
	const handleConfirmYes = () => {
		if (confirm === "save") if (saved) {
			removeSaved(location.id);
			setSaved(false);
			toast.success("Dihapus dari tersimpan.");
		} else {
			saveLocation({
				id: location.id,
				slug: location.slug,
				name: location.name,
				regionSlug: region.slug,
				regionName: region.name,
				photo_url: location.photo_url,
				category: cat?.name ?? null,
				hours: location.hours,
				savedAt: Date.now()
			});
			setSaved(true);
			track("save");
			toast.success("Disimpan di perangkat ini.");
		}
		else if (confirm === "gmaps") if (mapsUrl) {
			track("gmaps");
			window.open(mapsUrl, "_blank", "noopener,noreferrer");
		} else toast.error("Koordinat lokasi belum tersedia.");
		setConfirm(null);
	};
	const confirmCopy = {
		save: saved ? {
			title: "Hapus dari tersimpan?",
			body: "Lokasi ini akan dihapus dari daftar tersimpan pada perangkat ini."
		} : {
			title: "Simpan lokasi?",
			body: "Lokasi ini akan disimpan pada cache browser perangkat Anda."
		},
		gmaps: {
			title: "Buka Google Maps?",
			body: `Anda akan diarahkan ke Google Maps untuk menuju ${location.name}.`
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen pb-28",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative",
				children: [location.gallery_urls?.length || location.youtube_url || location.photo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MediaGallery, {
					photo: location.photo_url,
					gallery: location.gallery_urls,
					youtube: location.youtube_url,
					alt: location.name
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid aspect-[4/3] w-full place-items-center bg-muted text-muted-foreground sm:aspect-[16/9]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-12" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/50 to-transparent p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: handleBack,
						className: "pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-card/90 px-3 py-1.5 text-xs font-semibold backdrop-blur transition hover:bg-card active:scale-95",
						"aria-label": "Kembali",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-3.5" }),
							" ",
							fromLabel ?? region.name
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: async () => {
							const text = buildLocationShareText({
								name: location.name,
								regionName: region.name,
								description: location.description,
								category: cat?.name
							});
							track("share");
							const result = await shareOrCopy({
								title: `${location.name} — Rekomendify`,
								text,
								url: window.location.href
							});
							if (result === "copied") toast.success("Tautan & ringkasan disalin.");
							if (result === "failed") toast.error("Gagal membagikan tautan.");
						},
						"aria-label": "Bagikan",
						className: "pointer-events-auto grid size-9 place-items-center rounded-full bg-card/90 backdrop-blur transition hover:bg-card active:scale-95",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-4" })
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto -mt-6 max-w-md rounded-t-3xl bg-background px-5 pt-6",
				children: [
					cat && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-semibold uppercase tracking-wider text-accent",
						children: cat.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-1 font-display text-3xl leading-tight",
						children: location.name
					}),
					location.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExpandableText, {
						className: "mt-3",
						text: location.description
					}),
					(location.hours || location.price_range || location.whatsapp || mapsUrl) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-6 space-y-3 rounded-2xl border border-border bg-card p-4 text-sm",
						children: [
							location.hours && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "size-4" }),
								label: "Jam operasional",
								value: location.hours
							}),
							location.price_range && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-4" }),
								label: "Kisaran harga",
								value: location.price_range
							}),
							location.whatsapp && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "size-4" }),
								label: "WhatsApp",
								value: location.whatsapp
							}),
							mapsUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-4" }),
								label: "Lokasi",
								value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Tersedia di Google Maps"
								})
							})
						]
					}),
					regionAdminWaUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-6 rounded-2xl border border-border bg-card p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid size-9 shrink-0 place-items-center rounded-xl bg-accent/12 text-accent",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldQuestionMark, { className: "size-4" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold",
										children: "Ada yang tidak sesuai?"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-0.5 text-xs text-muted-foreground",
										children: [
											"Laporkan data keliru atau tanya langsung ke admin ",
											region.name,
											"."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: regionAdminWaUrl,
										target: "_blank",
										rel: "noopener noreferrer",
										className: "mt-3 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold hover:bg-accent/10",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-3.5 text-primary" }), " Hubungi Admin Wilayah"]
									})
								]
							})]
						})
					}),
					(contextualAds?.length ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-lg leading-tight",
							children: "Promosi di sekitar"
						}), contextualAds.map((ad) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ContextualAdCard, {
							regionSlug: region.slug,
							ad
						}, ad.id))]
					}),
					sortedRecommendations.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 border-t border-border pt-6 pb-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mb-4",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MascotWelcome, {
									name: "Cak Mulyo & Jeng Sari",
									message: `Masih keliling ${region.name}? Yuk lanjut lihat tempat menarik lainnya di sekitar sini!`
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-xl leading-tight text-foreground",
									children: "Rekomendasi Tempat Lain"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-xs font-medium text-muted-foreground",
									children: [sortedRecommendations.length, " pilihan"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: "Langsung klik untuk menjelajah tanpa perlu kembali ke menu beranda."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 space-y-3",
								children: sortedRecommendations.map((l) => {
									const itemCategoryName = l.categories?.name ?? categories.find((c) => c.id === l.category_id)?.name ?? null;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCard, {
										regionSlug: region.slug,
										locSlug: l.slug,
										name: l.name,
										photo: l.photo_url,
										category: itemCategoryName,
										hours: l.hours,
										price: l.price_range,
										featured: l.is_featured
									}, l.id);
								})
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid max-w-md grid-cols-3 gap-2 px-4 py-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setConfirm("chat"),
							disabled: !canContact,
							className: "flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground transition active:scale-95 disabled:opacity-40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5 text-primary" }), " Hubungi"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setConfirm("save"),
							className: "flex flex-col items-center justify-center gap-1 rounded-2xl border border-border bg-card px-3 py-2.5 text-xs font-semibold text-foreground transition active:scale-95",
							children: [saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookmarkCheck, { className: "size-5 text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-5 text-primary" }), saved ? "Tersimpan" : "Simpan"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setConfirm("gmaps"),
							disabled: !mapsUrl,
							className: "flex flex-col items-center justify-center gap-1 rounded-2xl bg-primary px-3 py-2.5 text-xs font-semibold text-primary-foreground shadow-lift transition active:scale-95 disabled:opacity-40",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigation, { className: "size-5" }), " Google Maps"]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, { children: confirm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
				initial: { opacity: 0 },
				animate: { opacity: 1 },
				exit: { opacity: 0 },
				className: "fixed inset-0 z-50 grid place-items-end bg-black/40 sm:place-items-center",
				onClick: () => setConfirm(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
					initial: { y: 60 },
					animate: { y: 0 },
					exit: { y: 60 },
					onClick: (e) => e.stopPropagation(),
					className: "w-full max-w-md rounded-t-3xl bg-card p-6 sm:rounded-3xl",
					children: confirm === "chat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl",
							children: "Hubungi siapa?"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: "Pilih kontak yang ingin Anda hubungi lewat WhatsApp."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 space-y-2",
							children: [ownerWaUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => {
									track("whatsapp");
									setConfirm(null);
									window.location.href = ownerWaUrl;
								},
								className: "flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition active:scale-[0.98]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Store, { className: "size-4" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm font-semibold",
										children: "Hubungi pemilik"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-xs text-muted-foreground",
										children: location.name
									})]
								})]
							}), activeCouriers.map((c) => {
								const url = waChatUrl(c.whatsapp, `Halo ${c.name}, saya butuh bantuan kurir/ojek menuju ${location.name} (via Rekomendify).`);
								if (!url) return null;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => {
										track("whatsapp");
										setConfirm(null);
										window.location.href = url;
									},
									className: "flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition active:scale-[0.98]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-9 shrink-0 place-items-center rounded-full bg-accent/10 text-accent",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bike, { className: "size-4" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-sm font-semibold",
											children: c.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-xs text-muted-foreground",
											children: "Kurir / ojek lokal"
										})]
									})]
								}, c.id);
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setConfirm(null),
							className: "mt-5 w-full rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold",
							children: "Tutup"
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl",
							children: confirmCopy[confirm].title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted-foreground",
							children: confirmCopy[confirm].body
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setConfirm(null),
								className: "flex-1 rounded-full border border-border bg-card px-4 py-3 text-sm font-semibold",
								children: "Tidak"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: handleConfirmYes,
								className: "flex-1 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground",
								children: "Ya"
							})]
						})
					] })
				})
			}) })
		]
	});
}
function Row({ icon, label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mt-0.5 text-muted-foreground",
			children: icon
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "text-xs uppercase tracking-wider text-muted-foreground",
				children: label
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "mt-0.5 text-foreground",
				children: value
			})]
		})]
	});
}
//#endregion
export { LocationPage as component };
