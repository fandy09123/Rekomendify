import { o as __toESM } from "../_runtime.mjs";
import { _ as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { b as updateMyRegion, p as myRegion } from "./admin.functions-zLuOZcAW.mjs";
import { a as require_react, i as require_jsx_runtime, t as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { vt as ArrowLeft } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as deleteRemovedImages, n as ImageUploader, r as commitUrl } from "./image-uploader-DHQy0j7E.mjs";
import { t as CoordinateField } from "./coordinate-field-DNebZu32.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin.region-BbQ_nMWF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RegionSettingsPage() {
	const { data, refetch } = useQuery({
		queryKey: ["my-region"],
		queryFn: () => myRegion()
	});
	const [form, setForm] = (0, import_react.useState)(null);
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (data?.region) setForm(data.region);
	}, [data?.region?.id]);
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Memuat…"
	});
	if (!data.region) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted-foreground",
		children: "Wilayah belum terhubung ke akun Anda."
	});
	if (!form) return null;
	const submit = async (e) => {
		e.preventDefault();
		setSaving(true);
		try {
			const cover_image_url = await commitUrl(form.cover_image_url);
			await updateMyRegion({ data: {
				name: form.name,
				slug: form.slug,
				tagline: form.tagline || null,
				description: form.description || null,
				cover_image_url,
				welcome_message: form.welcome_message || null,
				mascot_name: form.mascot_name || null,
				coordinates: form.coordinates || null,
				admin_whatsapp: form.admin_whatsapp || null,
				is_published: !!form.is_published
			} });
			deleteRemovedImages([data.region?.cover_image_url], [cover_image_url]);
			toast.success("Wilayah tersimpan");
			refetch();
		} catch (err) {
			toast.error(err.message);
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto max-w-3xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/admin",
				className: "inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Kembali ke Dashboard"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-3xl",
				children: "Pengaturan Wilayah"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "Detail wilayah yang Anda kelola. Slug menentukan URL publik."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: submit,
				className: "mt-6 space-y-4 rounded-2xl border border-border bg-card p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nama wilayah",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								value: form.name,
								onChange: (e) => setForm({
									...form,
									name: e.target.value
								}),
								className: "input"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Slug URL",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.slug ?? "",
								onChange: (e) => setForm({
									...form,
									slug: e.target.value
								}),
								className: "input"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Tagline",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: form.tagline ?? "",
							onChange: (e) => setForm({
								...form,
								tagline: e.target.value
							}),
							className: "input",
							placeholder: "Surga kecil di kaki Wilis"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Deskripsi",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: form.description ?? "",
							onChange: (e) => setForm({
								...form,
								description: e.target.value
							}),
							className: "input min-h-24"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "Welcome message (sapaan maskot)",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
							value: form.welcome_message ?? "",
							onChange: (e) => setForm({
								...form,
								welcome_message: e.target.value
							}),
							className: "input min-h-20",
							placeholder: "Sugeng rawuh di Desa Mulyosari!"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid gap-3 sm:grid-cols-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
							label: "Nama maskot",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								value: form.mascot_name ?? "",
								onChange: (e) => setForm({
									...form,
									mascot_name: e.target.value
								}),
								className: "input",
								placeholder: "Cak Mulyo & Jeng Sari"
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CoordinateField, {
						label: "Koordinat wilayah (lat,lng)",
						value: form.coordinates,
						onChange: (v) => setForm({
							...form,
							coordinates: v
						}),
						hint: "Titik pusat wilayah. Isi manual atau pilih di peta."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "WhatsApp Admin Wilayah",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: form.admin_whatsapp ?? "",
							onChange: (e) => setForm({
								...form,
								admin_whatsapp: e.target.value
							}),
							className: "input",
							placeholder: "08123456789"
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "-mt-2 text-xs text-muted-foreground",
						children: "Dipakai wisatawan untuk layanan resmi wilayah: daftarkan usaha, lapor kesalahan data, dan bantuan."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
						label: "Cover wilayah",
						value: form.cover_image_url,
						onChange: (url) => setForm({
							...form,
							cover_image_url: url
						}),
						defaultAspect: 16 / 9,
						hint: "Direkomendasikan rasio 16:9"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: !!form.is_published,
							onChange: (e) => setForm({
								...form,
								is_published: e.target.checked
							})
						}), "Publikasikan wilayah (terlihat publik)"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						disabled: saving,
						className: "w-full rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60",
						children: saving ? "Menyimpan…" : "Simpan perubahan"
					})
				]
			})
		]
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
export { RegionSettingsPage as component };
