import { o as __toESM } from "../_runtime.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as saveCourier, a as deleteLocation, g as saveCategory, n as deleteCategory, p as myRegion, r as deleteCourier, y as saveLocation } from "./admin.functions-zLuOZcAW.mjs";
import { a as require_react, i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { D as Pencil, P as MapPin, X as ExternalLink, c as Trash2, n as X, pt as Bike, u as Tag, w as Plus, y as Search } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as deleteRemovedImages, i as commitUrls, n as ImageUploader, o as removeImagesByUrl, r as commitUrl, t as GalleryUploader } from "./image-uploader-DHQy0j7E.mjs";
import { t as CoordinateField } from "./coordinate-field-DNebZu32.mjs";
import { n as dispatchPush, r as emptyPushDraft, t as AdminPushField } from "./admin-push-field-D0mnEpEx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.index-CC8Mw2i0.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Salinan aturan slug yang dipakai server (`admin.functions.ts`) agar frontend
* bisa menebak URL publik entitas yang baru disimpan tanpa refetch tambahan.
*/
var slugify = (s) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 80);
function AdminDashboard() {
	const { data, refetch } = useQuery({
		queryKey: ["my-region"],
		queryFn: () => myRegion()
	});
	const [tab, setTab] = (0, import_react.useState)("locations");
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Memuat…"
	});
	if (!data.region) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-xl rounded-3xl border border-dashed border-border p-8 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-2xl",
			children: "Wilayah belum terhubung"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted-foreground",
			children: "Akun Anda belum dikaitkan ke wilayah mana pun. Hubungi tim Rekomendify untuk bantuan."
		})]
	});
	const { region, categories, locations } = data;
	const couriers = data.couriers ?? [];
	const published = locations.filter((l) => l.is_published).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-5xl space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-border bg-card p-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-start justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold uppercase tracking-wider text-primary",
								children: "Wilayah Anda"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-1 font-display text-3xl",
								children: region.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted-foreground",
								children: ["/", region.slug]
							}),
							region.tagline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm",
								children: region.tagline
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `rounded-full px-3 py-1 text-xs font-bold ${region.is_published ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"}`,
								children: region.is_published ? "PUBLISHED" : "DRAFT"
							}), region.is_published && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
								href: `/r/${region.slug}`,
								target: "_blank",
								rel: "noreferrer",
								className: "inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs",
								children: ["Buka publik ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3" })]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Lokasi",
								value: locations.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Terbit",
								value: published
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Kategori",
								value: categories.length
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								label: "Featured",
								value: locations.filter((l) => l.is_featured).length
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/admin/region",
						className: "mt-4 inline-block text-sm text-primary hover:underline",
						children: "Ubah detail wilayah →"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-1 border-b border-border",
				children: [
					["locations", `Lokasi (${locations.length})`],
					["categories", `Kategori (${categories.length})`],
					["couriers", `Kurir (${couriers.length})`]
				].map(([k, l]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					onClick: () => setTab(k),
					className: `px-4 py-2 text-sm font-medium ${tab === k ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`,
					children: l
				}, k))
			}),
			tab === "locations" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationsTab, {
				categories,
				locations,
				regionSlug: region.slug,
				onChanged: refetch
			}),
			tab === "categories" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoriesTab, {
				categories,
				onChanged: refetch
			}),
			tab === "couriers" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CouriersTab, {
				couriers,
				onChanged: refetch
			})
		]
	});
}
function Stat({ label, value }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-muted/40 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-xs uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 font-display text-2xl",
			children: value
		})]
	});
}
function CategoriesTab({ categories, onChanged }) {
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [q, setQ] = (0, import_react.useState)("");
	const needle = q.trim().toLowerCase();
	const filtered = needle ? categories.filter((c) => [c.name, c.slug].filter(Boolean).some((v) => String(v).toLowerCase().includes(needle))) : categories;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => setEditing({
				name: "",
				icon: "",
				sort_order: categories.length
			}),
			className: "mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Kategori baru"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
			value: q,
			onChange: setQ,
			placeholder: "Cari kategori…"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2 sm:grid-cols-2",
			children: [
				filtered.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 rounded-xl border border-border bg-card p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-10 place-items-center rounded-lg bg-accent/15 text-xl",
							children: c.icon || /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tag, { className: "size-5 text-accent" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: c.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs text-muted-foreground",
								children: ["/", c.slug]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setEditing(c),
							className: "rounded-md p-2 hover:bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: async () => {
								if (confirm("Hapus kategori?")) {
									await deleteCategory({ data: { id: c.id } });
									onChanged();
								}
							},
							className: "rounded-md p-2 text-destructive hover:bg-destructive/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, c.id)),
				categories.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "col-span-full rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground",
					children: "Belum ada kategori."
				}),
				categories.length > 0 && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "col-span-full rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground",
					children: "Tidak ada kategori yang cocok."
				})
			]
		}),
		editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryDialog, {
			initial: editing,
			onClose: () => setEditing(null),
			onSaved: () => {
				setEditing(null);
				onChanged();
			}
		})
	] });
}
function CategoryDialog({ initial, onClose, onSaved }) {
	const [f, setF] = (0, import_react.useState)(initial);
	const save = async (e) => {
		e.preventDefault();
		try {
			await saveCategory({ data: {
				id: f.id,
				name: f.name,
				icon: f.icon || null,
				sort_order: Number(f.sort_order) || 0
			} });
			toast.success("Tersimpan");
			onSaved();
		} catch (err) {
			toast.error(err.message);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: save,
			onClick: (e) => e.stopPropagation(),
			className: "w-full max-w-md rounded-3xl bg-card p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: f.id ? "Edit kategori" : "Kategori baru"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Nama",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							required: true,
							value: f.name,
							onChange: (e) => setF({
								...f,
								name: e.target.value
							}),
							className: "input",
							placeholder: "Kuliner, Hotel, Wisata…"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Icon (emoji, opsional)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: f.icon ?? "",
							onChange: (e) => setF({
								...f,
								icon: e.target.value
							}),
							className: "input",
							placeholder: "🍜"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold",
						children: "Batal"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						className: "flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground",
						children: "Simpan"
					})]
				})
			]
		})
	});
}
function SearchInput({ value, onChange, placeholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mb-3 max-w-sm",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value,
				onChange: (e) => onChange(e.target.value),
				placeholder,
				className: "w-full rounded-full border border-border bg-card py-2 pl-9 pr-9 text-sm outline-none focus:border-primary"
			}),
			value && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onChange(""),
				"aria-label": "Bersihkan pencarian",
				className: "absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5" })
			})
		]
	});
}
function LocationsTab({ categories, locations, regionSlug, onChanged }) {
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [q, setQ] = (0, import_react.useState)("");
	const needle = q.trim().toLowerCase();
	const filtered = needle ? locations.filter((l) => [
		l.name,
		l.slug,
		l.price_range,
		l.hours,
		categories.find((c) => c.id === l.category_id)?.name
	].filter(Boolean).some((v) => String(v).toLowerCase().includes(needle))) : locations;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => setEditing({
				name: "",
				coordinates: "",
				is_published: true,
				is_featured: false,
				sort_order: locations.length
			}),
			className: "mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Lokasi baru"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchInput, {
			value: q,
			onChange: setQ,
			placeholder: "Cari lokasi, kategori, harga…"
		}),
		needle && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "mb-2 text-xs text-muted-foreground",
			children: [
				filtered.length,
				" dari ",
				locations.length,
				" lokasi"
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-2",
			children: [
				filtered.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 rounded-xl border border-border bg-card p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-12 shrink-0 overflow-hidden rounded-lg bg-muted",
							children: l.photo_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: l.photo_url,
								alt: "",
								className: "size-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-full place-items-center text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "size-5" })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate font-medium",
								children: l.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "truncate text-xs text-muted-foreground",
								children: [
									categories.find((c) => c.id === l.category_id)?.name ?? "Tanpa kategori",
									" ",
									l.is_featured && "• ⭐",
									" ",
									!l.is_published && "• 📦 draft"
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setEditing(l),
							className: "rounded-md p-2 text-muted-foreground hover:bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: async () => {
								if (confirm("Hapus lokasi?")) {
									await deleteLocation({ data: { id: l.id } });
									removeImagesByUrl([l.photo_url, ...l.gallery_urls ?? []]);
									onChanged();
								}
							},
							className: "rounded-md p-2 text-destructive hover:bg-destructive/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, l.id)),
				locations.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground",
					children: "Belum ada lokasi. Klik \"Lokasi baru\" untuk menambah."
				}),
				locations.length > 0 && filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground",
					children: [
						"Tidak ada lokasi yang cocok dengan \"",
						q,
						"\"."
					]
				})
			]
		}),
		editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LocationDialog, {
			initial: editing,
			categories,
			regionSlug,
			onClose: () => setEditing(null),
			onSaved: () => {
				setEditing(null);
				onChanged();
			}
		})
	] });
}
function LocationDialog({ initial, categories, regionSlug, onClose, onSaved }) {
	const [f, setF] = (0, import_react.useState)(initial);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [push, setPush] = (0, import_react.useState)(emptyPushDraft());
	const save = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const photo_url = await commitUrl(f.photo_url);
			const gallery_urls = await commitUrls(Array.isArray(f.gallery_urls) ? f.gallery_urls : []);
			const saved = await saveLocation({ data: {
				id: f.id,
				category_id: f.category_id || null,
				name: f.name,
				photo_url,
				coordinates: f.coordinates || null,
				gallery_urls,
				youtube_url: f.youtube_url || null,
				description: f.description || null,
				whatsapp: f.whatsapp || null,
				hours: f.hours || null,
				price_range: f.price_range || null,
				is_featured: !!f.is_featured,
				is_published: f.is_published !== false,
				sort_order: Number(f.sort_order) || 0
			} });
			deleteRemovedImages([initial.photo_url, ...Array.isArray(initial.gallery_urls) ? initial.gallery_urls : []], [photo_url, ...gallery_urls]);
			toast.success("Tersimpan");
			if (f.is_published !== false) await dispatchPush({
				draft: push,
				entityType: "location",
				entityId: saved?.id ?? null,
				path: `/r/${regionSlug}/${slugify(f.name)}`,
				fallbackTitle: f.name,
				fallbackBody: (f.description ?? "").slice(0, 160) || `Tempat baru di wilayah: ${f.name}`
			});
			onSaved();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 overflow-y-auto",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: save,
			onClick: (e) => e.stopPropagation(),
			className: "my-8 w-full max-w-lg rounded-3xl bg-card p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: f.id ? "Edit lokasi" : "Lokasi baru"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nama lokasi",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: f.name,
								onChange: (e) => setF({
									...f,
									name: e.target.value
								}),
								className: "input",
								placeholder: "Cafe Senja, Hotel Wilis…"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Kategori",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: f.category_id ?? "",
								onChange: (e) => setF({
									...f,
									category_id: e.target.value || null
								}),
								className: "input",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "",
									children: "— tanpa kategori —"
								}), categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: c.id,
									children: c.name
								}, c.id))]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
							label: "Foto utama",
							value: f.photo_url,
							onChange: (url) => setF({
								...f,
								photo_url: url
							}),
							hint: "Digunakan sebagai thumbnail & sampul."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GalleryUploader, {
							value: f.gallery_urls,
							onChange: (urls) => setF({
								...f,
								gallery_urls: urls
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoordinateField, {
							label: "Koordinat lokasi (lat,lng) — opsional",
							value: f.coordinates,
							onChange: (v) => setF({
								...f,
								coordinates: v
							}),
							hint: "Kosongkan untuk entri non-fisik seperti lowongan kerja atau pengumuman."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Link YouTube (opsional)",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: f.youtube_url ?? "",
								onChange: (e) => setF({
									...f,
									youtube_url: e.target.value
								}),
								className: "input",
								placeholder: "https://youtu.be/…"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Deskripsi",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								value: f.description ?? "",
								onChange: (e) => setF({
									...f,
									description: e.target.value
								}),
								className: "input min-h-20"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "WhatsApp",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: f.whatsapp ?? "",
									onChange: (e) => setF({
										...f,
										whatsapp: e.target.value
									}),
									className: "input",
									placeholder: "+6281…"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Harga",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: f.price_range ?? "",
									onChange: (e) => setF({
										...f,
										price_range: e.target.value
									}),
									className: "input",
									placeholder: "Rp 10rb–25rb"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Jam buka",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: f.hours ?? "",
								onChange: (e) => setF({
									...f,
									hours: e.target.value
								}),
								className: "input",
								placeholder: "08.00–22.00"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: !!f.is_featured,
									onChange: (e) => setF({
										...f,
										is_featured: e.target.checked
									})
								}), " Featured"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: f.is_published !== false,
									onChange: (e) => setF({
										...f,
										is_published: e.target.checked
									})
								}), " Published"]
							})]
						}),
						f.is_published !== false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPushField, {
							value: push,
							onChange: setPush,
							hint: "Pengikut wilayah akan menerima notifikasi berisi tautan langsung ke lokasi ini.",
							titlePlaceholder: f.name || "Judul notifikasi",
							bodyPlaceholder: "Tempat baru siap dikunjungi!"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold",
						children: "Batal"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: saving,
						className: "flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60",
						children: saving ? "Mengunggah…" : "Simpan"
					})]
				})
			]
		})
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-1",
			children
		})]
	});
}
function CouriersTab({ couriers, onChanged }) {
	const [editing, setEditing] = (0, import_react.useState)(null);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-3 text-sm text-muted-foreground",
			children: "Kurir / ojek lokal ditawarkan ke wisatawan di halaman detail lokasi sebagai alternatif menghubungi pemilik."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			onClick: () => setEditing({
				name: "",
				whatsapp: "",
				coordinates: "",
				is_active: true,
				sort_order: couriers.length
			}),
			className: "mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Kurir baru"]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-2 sm:grid-cols-2",
			children: [couriers.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3 rounded-xl border border-border bg-card p-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid size-10 place-items-center rounded-lg bg-accent/15 text-accent",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bike, { className: "size-5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate font-medium",
							children: c.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "truncate text-xs text-muted-foreground",
							children: [
								c.whatsapp,
								" ",
								!c.is_active && "• nonaktif"
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setEditing(c),
						className: "rounded-md p-2 text-muted-foreground hover:bg-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: async () => {
							if (confirm("Hapus kurir?")) {
								await deleteCourier({ data: { id: c.id } });
								onChanged();
							}
						},
						className: "rounded-md p-2 text-destructive hover:bg-destructive/10",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
					})
				]
			}, c.id)), couriers.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground sm:col-span-2",
				children: "Belum ada kurir terdaftar."
			})]
		}),
		editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CourierDialog, {
			initial: editing,
			onClose: () => setEditing(null),
			onSaved: () => {
				setEditing(null);
				onChanged();
			}
		})
	] });
}
function CourierDialog({ initial, onClose, onSaved }) {
	const [f, setF] = (0, import_react.useState)(initial);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const save = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			await saveCourier({ data: {
				id: f.id,
				name: f.name,
				whatsapp: f.whatsapp,
				coordinates: f.coordinates || null,
				is_active: f.is_active !== false,
				sort_order: Number(f.sort_order) || 0
			} });
			toast.success("Tersimpan");
			onSaved();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center bg-black/40 p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: save,
			onClick: (e) => e.stopPropagation(),
			className: "w-full max-w-md rounded-3xl bg-card p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: f.id ? "Edit kurir" : "Kurir baru"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nama kurir / ojek",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: f.name,
								onChange: (e) => setF({
									...f,
									name: e.target.value
								}),
								className: "input",
								placeholder: "Ojek Pak Karno"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "WhatsApp",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: f.whatsapp ?? "",
								onChange: (e) => setF({
									...f,
									whatsapp: e.target.value
								}),
								className: "input",
								placeholder: "08123456789"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoordinateField, {
							label: "Koordinat pangkalan (opsional)",
							value: f.coordinates,
							onChange: (v) => setF({
								...f,
								coordinates: v
							}),
							hint: "Titik mangkal kurir. Isi manual atau pilih di peta."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
								label: "Urutan",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "number",
									value: f.sort_order ?? 0,
									onChange: (e) => setF({
										...f,
										sort_order: e.target.value
									}),
									className: "input"
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
								className: "mt-6 flex items-center gap-2 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: f.is_active !== false,
									onChange: (e) => setF({
										...f,
										is_active: e.target.checked
									})
								}), " Aktif"]
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-5 flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: onClose,
						className: "flex-1 rounded-full border border-border px-4 py-2.5 text-sm font-semibold",
						children: "Batal"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: saving,
						className: "flex-1 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60",
						children: saving ? "Menyimpan…" : "Simpan"
					})]
				})
			]
		})
	});
}
//#endregion
export { AdminDashboard as component };
