import { o as __toESM } from "../_runtime.mjs";
import { c as listMyInfoPosts, i as deleteInfoPost, p as myRegion, v as saveInfoPost } from "./admin.functions-zLuOZcAW.mjs";
import { a as require_react, i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { D as Pencil, N as Megaphone, c as Trash2, w as Plus } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as deleteRemovedImages, i as commitUrls, n as ImageUploader, o as removeImagesByUrl, r as commitUrl, t as GalleryUploader } from "./image-uploader-DHQy0j7E.mjs";
import { n as dispatchPush, r as emptyPushDraft, t as AdminPushField } from "./admin-push-field-D0mnEpEx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.info-hCzeqI8q.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AdminInfoPage() {
	const { data: region } = useQuery({
		queryKey: ["my-region"],
		queryFn: () => myRegion()
	});
	const { data: posts, refetch } = useQuery({
		queryKey: ["my-info-posts"],
		queryFn: () => listMyInfoPosts()
	});
	const [editing, setEditing] = (0, import_react.useState)(null);
	if (!region?.region) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Wilayah belum terhubung ke akun Anda."
	});
	const categories = region.categories ?? [];
	const list = posts ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-4xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-3xl",
					children: "Info Lokal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						"Pengumuman & kabar untuk warga ",
						region.region.name,
						"."
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					onClick: () => setEditing({
						title: "",
						body: "",
						is_published: true
					}),
					className: "inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Info baru"]
				})]
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
							children: "Belum ada info"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Mulai posting pengumuman pertama Anda."
						})
					]
				}), list.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-start gap-3 rounded-xl border border-border bg-card p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "size-14 shrink-0 overflow-hidden rounded-lg bg-muted",
							children: p.cover_image_url ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: p.cover_image_url,
								alt: "",
								className: "size-full object-cover"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "grid size-full place-items-center text-muted-foreground",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "size-5" })
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-medium",
									children: p.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: [
										p.categories?.name ?? "Tanpa kategori",
										" • ",
										new Date(p.published_at).toLocaleDateString("id-ID"),
										" ",
										!p.is_published && "• 📦 draft"
									]
								}),
								p.body && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 line-clamp-2 text-xs text-muted-foreground",
									children: p.body
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setEditing(p),
							className: "rounded-md p-2 text-muted-foreground hover:bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: async () => {
								if (confirm("Hapus info ini?")) {
									await deleteInfoPost({ data: { id: p.id } });
									removeImagesByUrl([p.cover_image_url, ...p.gallery_urls ?? []]);
									toast.success("Terhapus");
									refetch();
								}
							},
							className: "rounded-md p-2 text-destructive hover:bg-destructive/10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, p.id))]
			}),
			editing && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InfoDialog, {
				initial: editing,
				regionSlug: region.region.slug,
				categories,
				onClose: () => setEditing(null),
				onSaved: () => {
					setEditing(null);
					refetch();
				}
			})
		]
	});
}
function InfoDialog({ initial, categories, regionSlug, onClose, onSaved }) {
	const [f, setF] = (0, import_react.useState)(initial);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [push, setPush] = (0, import_react.useState)(emptyPushDraft());
	const save = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const cover_image_url = await commitUrl(f.cover_image_url);
			const gallery_urls = await commitUrls(Array.isArray(f.gallery_urls) ? f.gallery_urls : []);
			const saved = await saveInfoPost({ data: {
				id: f.id,
				category_id: f.category_id || null,
				title: f.title,
				body: f.body ?? "",
				cover_image_url,
				gallery_urls,
				youtube_url: f.youtube_url || null,
				is_published: f.is_published !== false
			} });
			deleteRemovedImages([initial.cover_image_url, ...Array.isArray(initial.gallery_urls) ? initial.gallery_urls : []], [cover_image_url, ...gallery_urls]);
			toast.success("Tersimpan");
			if (f.is_published !== false) await dispatchPush({
				draft: push,
				entityType: "info_post",
				entityId: saved?.id ?? null,
				path: `/r/${regionSlug}/messages`,
				fallbackTitle: f.title,
				fallbackBody: (f.body ?? "").slice(0, 160) || "Ada kabar baru di wilayah Anda."
			});
			onSaved();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-black/40 p-4",
		onClick: onClose,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: save,
			onClick: (e) => e.stopPropagation(),
			className: "my-8 w-full max-w-lg rounded-3xl bg-card p-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: f.id ? "Edit info" : "Info baru"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Judul",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: f.title,
								onChange: (e) => setF({
									...f,
									title: e.target.value
								}),
								className: "input",
								placeholder: "Pemadaman listrik 12 Juli…"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Kategori (opsional)",
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Isi info",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								required: true,
								value: f.body ?? "",
								onChange: (e) => setF({
									...f,
									body: e.target.value
								}),
								className: "input min-h-32",
								placeholder: "Detail pengumuman…"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
							label: "Gambar sampul",
							value: f.cover_image_url,
							onChange: (url) => setF({
								...f,
								cover_image_url: url
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GalleryUploader, {
							value: f.gallery_urls,
							onChange: (urls) => setF({
								...f,
								gallery_urls: urls
							})
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: f.is_published !== false,
								onChange: (e) => setF({
									...f,
									is_published: e.target.checked
								})
							}), "Publikasikan (terlihat publik)"]
						}),
						f.is_published !== false && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AdminPushField, {
							value: push,
							onChange: setPush,
							hint: "Pengikut wilayah akan menerima notifikasi berisi tautan ke halaman Info Lokal.",
							titlePlaceholder: f.title || "Judul notifikasi",
							bodyPlaceholder: "Ringkasan singkat pengumuman"
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
//#endregion
export { AdminInfoPage as component };
