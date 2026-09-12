import { o as __toESM } from "../_runtime.mjs";
import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-LwaZmRsQ.mjs";
import { t as createSsrRpc } from "./createSsrRpc-JmkAOqFF.mjs";
import { a as objectType, i as numberType, n as booleanType, o as preprocessType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { p as myRegion } from "./admin.functions-zLuOZcAW.mjs";
import { a as require_react, i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { D as Pencil, N as Megaphone, O as Pause, T as Play, c as Trash2, l as Target, nt as Coins, w as Plus, xt as Sparkles } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as ImageUploader, o as removeImagesByUrl, r as commitUrl } from "./image-uploader-DHQy0j7E.mjs";
import { n as LocationCombobox, r as LocationMultiSelect, t as AdminModal } from "./admin-modal-C4JH9OZf.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.iklan-DTXsFc0R.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Sistem Iklan Rekomendify (sisi admin wilayah).
*
* Tiga penempatan:
* - `banner`      → carousel promosi di beranda wilayah (maks. 5 lokasi tujuan)
* - `featured`    → sorotan sebuah lokasi di dalam satu kategori
* - `contextual`  → promosi yang muncul di halaman detail lokasi lain (host)
*
* Aktivasi memotong kredit lewat RPC `activate_ad` yang atomik di Postgres,
* sehingga tidak mungkin terjadi saldo minus atau double-spend.
*/
var nullableUrl = preprocessType((v) => v === "" || v == null ? null : v, stringType().trim().url().refine((u) => /^https?:\/\//i.test(u), "URL harus http(s)").nullable());
var nullableUuid = preprocessType((v) => v === "" || v == null ? null : v, stringType().uuid().nullable());
var AdInput = objectType({
	id: stringType().uuid().optional(),
	placement: enumType([
		"banner",
		"featured",
		"contextual"
	]),
	title: stringType().trim().min(1).max(120),
	description: stringType().trim().max(500).nullable().optional(),
	image_url: nullableUrl.optional(),
	location_id: nullableUuid.optional(),
	category_id: nullableUuid.optional(),
	host_location_id: nullableUuid.optional(),
	sort_order: numberType().int().default(0),
	target_ids: arrayType(stringType().uuid()).max(5).default([])
});
var listAds = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("366da62c569d5cf4ed507bbee6d54fa3f8cbe22d555f04c3ce6799883bb552e9"));
/** Saldo kredit, daftar harga paket, dan riwayat mutasi kredit wilayah. */
var myCredits = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("331cb9ec76a322ffb8a44e87bc6bb46b56cfd42967a2229a22a3eb706025893f"));
var saveAd = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => AdInput.parse(data)).handler(createSsrRpc("0999d7cb4ae96f2e6ecb28ef58a0b4a0b9af2baa2e0a0629e2fe6fabe45b163d"));
var deleteAd = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({ id: stringType().uuid() }).parse(data)).handler(createSsrRpc("165f6b5098b795c7472c0550a57f60e43dd18da3ce1c2f9509a61dff5b5b1836"));
/** Aktivasi berbayar — pemotongan kredit dilakukan atomik di dalam Postgres. */
var activateAd = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({
	id: stringType().uuid(),
	duration_days: numberType().int().min(1).max(365)
}).parse(data)).handler(createSsrRpc("007cf165f8ad46c0998041fe0c4bd9676d64fff431594ac50e9b61ca5cda98ae"));
/** Jeda / lanjutkan tayang tanpa mengubah kredit maupun masa berlaku. */
var setAdPaused = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => objectType({
	id: stringType().uuid(),
	paused: booleanType()
}).parse(data)).handler(createSsrRpc("412f3a1b4557ffc9c13bf0898a5879185bdc51a5e886b5ba7a375338b8f4e085"));
var PLACEMENT_LABEL = {
	banner: "Banner Beranda",
	featured: "Sorotan Kategori",
	contextual: "Promosi Kontekstual"
};
function statusLabel(ad) {
	if (ad.end_at && new Date(ad.end_at) <= /* @__PURE__ */ new Date()) return {
		text: "Kedaluwarsa",
		cls: "bg-muted text-muted-foreground"
	};
	if (ad.status === "active") return {
		text: "Tayang",
		cls: "bg-primary/12 text-primary"
	};
	if (ad.status === "paused") return {
		text: "Dijeda",
		cls: "bg-mustard/40 text-ink"
	};
	return {
		text: "Draf",
		cls: "bg-muted text-muted-foreground"
	};
}
function AdminAdsPage() {
	const { data: region } = useQuery({
		queryKey: ["my-region"],
		queryFn: () => myRegion()
	});
	const { data: ads, refetch } = useQuery({
		queryKey: ["my-ads"],
		queryFn: () => listAds()
	});
	const { data: credits, refetch: refetchCredits } = useQuery({
		queryKey: ["my-credits"],
		queryFn: () => myCredits()
	});
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [activating, setActivating] = (0, import_react.useState)(null);
	if (!region?.region) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Wilayah belum terhubung ke akun Anda."
	});
	const list = ads ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Iklan & Promosi"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Kelola promosi berbayar di ",
						region.region.name,
						"."
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setEditing({
						placement: "banner",
						title: "",
						target_ids: []
					}),
					className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Iklan baru"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "grid size-11 place-items-center rounded-xl bg-mustard/40 text-ink",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Coins, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs uppercase tracking-wider text-muted-foreground",
							children: "Kredit promosi"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-display text-2xl leading-tight",
							children: credits?.balance ?? 0
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-[16rem] text-right text-xs text-muted-foreground",
						children: "Penambahan kredit dilakukan oleh operator Rekomendify setelah pembayaran diverifikasi."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 space-y-2",
				children: [list.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid place-items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-14 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "size-6" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 font-display text-lg",
							children: "Belum ada iklan"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Buat promosi pertama untuk mitra usaha wilayah Anda."
						})
					]
				}), list.map((ad) => {
					const st = statusLabel(ad);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-start gap-3 rounded-xl border border-border bg-card p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "size-14 shrink-0 overflow-hidden rounded-lg bg-muted",
								children: ad.image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: ad.image_url,
									alt: "",
									className: "size-full object-cover"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-full place-items-center text-muted-foreground",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "size-5" })
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate font-medium",
										children: ad.title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: `rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${st.cls}`,
										children: st.text
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: [
										PLACEMENT_LABEL[ad.placement],
										ad.locations?.name ? ` • ${ad.locations.name}` : "",
										ad.end_at ? ` • s/d ${new Date(ad.end_at).toLocaleDateString("id-ID")}` : "",
										ad.credits_spent ? ` • ${ad.credits_spent} kredit` : ""
									]
								})]
							}),
							ad.status === "active" || ad.status === "paused" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								title: ad.status === "active" ? "Jeda" : "Lanjutkan",
								onClick: async () => {
									try {
										await setAdPaused({ data: {
											id: ad.id,
											paused: ad.status === "active"
										} });
										toast.success(ad.status === "active" ? "Iklan dijeda." : "Iklan tayang kembali.");
										refetch();
									} catch (e) {
										toast.error(e.message);
									}
								},
								className: "rounded-md p-2 text-muted-foreground hover:bg-muted",
								children: ad.status === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pause, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-4" })
							}) : null,
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								title: "Aktifkan",
								onClick: () => setActivating(ad),
								className: "rounded-md p-2 text-primary hover:bg-primary/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => setEditing({
									...ad,
									target_ids: (ad.ad_targets ?? []).map((t) => t.location_id)
								}),
								className: "rounded-md p-2 text-muted-foreground hover:bg-muted",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: async () => {
									if (!confirm("Hapus iklan ini? Kredit yang sudah dipakai tidak dikembalikan.")) return;
									await deleteAd({ data: { id: ad.id } });
									removeImagesByUrl([ad.image_url]);
									toast.success("Terhapus");
									refetch();
								},
								className: "rounded-md p-2 text-destructive hover:bg-destructive/10",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
							})
						]
					}, ad.id);
				})]
			}),
			(credits?.ledger?.length ?? 0) > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl",
					children: "Riwayat kredit"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-3 divide-y divide-border rounded-2xl border border-border bg-card",
					children: credits.ledger.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 p-3 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `font-semibold ${l.delta < 0 ? "text-destructive" : "text-primary"}`,
								children: l.delta > 0 ? `+${l.delta}` : l.delta
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "min-w-0 flex-1 truncate text-muted-foreground",
								children: l.reason
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground",
								children: new Date(l.created_at).toLocaleDateString("id-ID")
							})
						]
					}, l.id))
				})]
			}),
			editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdDialog, {
				initial: editing,
				region,
				onClose: () => setEditing(null),
				onSaved: () => {
					setEditing(null);
					refetch();
				}
			}),
			activating && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivateDialog, {
				ad: activating,
				prices: credits?.prices ?? [],
				balance: credits?.balance ?? 0,
				onClose: () => setActivating(null),
				onDone: () => {
					setActivating(null);
					refetch();
					refetchCredits();
				}
			})
		]
	});
}
function AdDialog({ initial, region, onClose, onSaved }) {
	const [f, setF] = (0, import_react.useState)({
		description: "",
		image_url: null,
		...initial
	});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const rawLocations = region.locations ?? [];
	const categories = region.categories ?? [];
	const targets = f.target_ids ?? [];
	const locationOptions = (0, import_react.useMemo)(() => rawLocations.map((l) => ({
		id: l.id,
		name: l.name,
		category: l.categories?.name ?? null
	})), [rawLocations]);
	const save = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const image_url = await commitUrl(f.image_url ?? null);
			await saveAd({ data: {
				id: f.id,
				placement: f.placement,
				title: f.title,
				description: f.description || null,
				image_url,
				location_id: f.location_id || null,
				category_id: f.category_id || null,
				host_location_id: f.host_location_id || null,
				sort_order: Number(f.sort_order ?? 0),
				target_ids: f.placement === "banner" ? targets : []
			} });
			toast.success("Iklan tersimpan. Aktifkan untuk mulai tayang.");
			onSaved();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminModal, {
		title: f.id ? "Ubah iklan" : "Iklan baru",
		size: "lg",
		onClose,
		onSubmit: save,
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onClose,
				className: "flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold",
				children: "Batal"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				disabled: saving,
				className: "flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50",
				children: saving ? "Menyimpan…" : "Simpan"
			})]
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm",
					children: ["Penempatan", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: f.placement,
						onChange: (e) => setF({
							...f,
							placement: e.target.value
						}),
						className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "banner",
								children: "Banner Beranda"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "featured",
								children: "Sorotan Kategori"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "contextual",
								children: "Promosi Kontekstual"
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm",
					children: ["Judul", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						required: true,
						maxLength: 120,
						value: f.title,
						onChange: (e) => setF({
							...f,
							title: e.target.value
						}),
						className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm",
					children: ["Deskripsi singkat", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						maxLength: 500,
						rows: 2,
						value: f.description ?? "",
						onChange: (e) => setF({
							...f,
							description: e.target.value
						}),
						className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
					value: f.image_url,
					onChange: (url) => setF({
						...f,
						image_url: url
					}),
					label: "Gambar promosi",
					lockAspect: 16 / 9,
					hint: "Rasio dikunci 16:9 agar banner beranda tampil konsisten."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-1 font-medium",
						children: ["Lokasi yang dipromosikan", f.placement === "banner" ? " (opsional)" : ""]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCombobox, {
						locations: locationOptions,
						value: f.location_id ?? "",
						onChange: (id) => setF((s) => ({
							...s,
							location_id: id
						}))
					})]
				}),
				f.placement === "featured" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "block text-sm",
					children: ["Kategori tempat disorot (opsional)", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
						value: f.category_id ?? "",
						onChange: (e) => setF({
							...f,
							category_id: e.target.value
						}),
						className: "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: "",
							children: "Semua kategori"
						}), categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
							value: c.id,
							children: c.name
						}, c.id))]
					})]
				}),
				f.placement === "contextual" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-1 font-medium",
						children: "Tayang di halaman lokasi"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationCombobox, {
						locations: locationOptions,
						value: f.host_location_id ?? "",
						onChange: (id) => setF((s) => ({
							...s,
							host_location_id: id
						})),
						required: true
					})]
				}),
				f.placement === "banner" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mb-1.5 flex items-center gap-1.5 font-medium",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "size-4 text-accent" }),
							"Lokasi tujuan tambahan",
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground",
								children: [targets.length, "/5"]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationMultiSelect, {
						locations: locationOptions,
						selectedIds: targets,
						onChange: (ids) => {
							if (ids.length > 5) {
								toast.error("Maksimal 5 lokasi tujuan.");
								return;
							}
							setF((s) => ({
								...s,
								target_ids: ids
							}));
						},
						max: 5
					})]
				})
			]
		})
	});
}
function ActivateDialog({ ad, prices, balance, onClose, onDone }) {
	const options = (0, import_react.useMemo)(() => prices.filter((p) => p.placement === ad.placement).sort((a, b) => a.duration_days - b.duration_days), [prices, ad.placement]);
	const [days, setDays] = (0, import_react.useState)(options[0]?.duration_days ?? 7);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const cost = options.find((o) => o.duration_days === days)?.credits ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AdminModal, {
		title: "Aktifkan iklan",
		subtitle: `${ad.title} — ${PLACEMENT_LABEL[ad.placement]}`,
		onClose,
		footer: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: onClose,
				className: "flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold",
				children: "Batal"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				disabled: busy || options.length === 0 || balance < cost,
				onClick: async () => {
					setBusy(true);
					try {
						await activateAd({ data: {
							id: ad.id,
							duration_days: days
						} });
						toast.success(`Iklan tayang ${days} hari. ${cost} kredit terpakai.`);
						onDone();
					} catch (e) {
						toast.error(e.message);
					} finally {
						setBusy(false);
					}
				},
				className: "flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50",
				children: busy ? "Memproses…" : "Aktifkan"
			})]
		}),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [options.map((o) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setDays(o.duration_days),
				className: `flex min-h-12 w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm ${days === o.duration_days ? "border-primary bg-primary/5" : "border-border"}`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "font-semibold",
					children: [o.duration_days, " hari"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-muted-foreground",
					children: [o.credits, " kredit"]
				})]
			}, o.duration_days)), options.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Paket harga belum tersedia."
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mt-4 text-sm",
			children: [
				"Saldo: ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "font-semibold",
					children: balance
				}),
				" kredit → sisa setelah aktivasi:",
				" ",
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: `font-semibold ${balance - cost < 0 ? "text-destructive" : ""}`,
					children: balance - cost
				})
			]
		})]
	});
}
//#endregion
export { AdminAdsPage as component };
