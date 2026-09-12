import { c as createServerFn } from "./esm-B50dUWcE.mjs";
import { t as requireSupabaseAuth } from "./auth-middleware-LwaZmRsQ.mjs";
import { t as createSsrRpc } from "./createSsrRpc-JmkAOqFF.mjs";
import { a as objectType, r as enumType, s as stringType } from "../_libs/zod.mjs";
import { i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { ht as Bell } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-push-field-D0mnEpEx.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Pengiriman Web Push oleh Admin Wilayah.
*
* Kewenangan tidak pernah diambil dari request: region target selalu dibaca
* dari `profiles` milik user yang login (dan harus `is_active`). Admin karena
* itu mustahil menembak wilayah lain dengan memanipulasi payload.
*/
var SendInput = objectType({
	entityType: enumType([
		"info_post",
		"location",
		"ad"
	]),
	entityId: stringType().max(80).nullable().optional(),
	title: stringType().trim().min(1).max(80),
	body: stringType().trim().min(1).max(180),
	/** Path relatif di dalam aplikasi, mis. `/r/mulyosari/warung-bu-tin`. */
	path: stringType().trim().max(300).nullable().optional()
});
var sendRegionPush = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator((data) => SendInput.parse(data)).handler(createSsrRpc("33d1b0b39e48a5b8a4f31b4504bfdde56464e4b4139de5bbbc8d7f44c40ce667"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("58798a6fcc6f8503dc8cf3f10a4c3bbc1dcacd040852ca222a06e4ad87365e1b"));
createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("13127f242376a56cf61eab9676fcf2c341e7e4967c22891a9583f8c0feab64c8"));
var emptyPushDraft = () => ({
	enabled: false,
	title: "",
	body: ""
});
function AdminPushField({ value, onChange, label = "Kirim notifikasi ke pengikut wilayah", hint, titlePlaceholder, bodyPlaceholder }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-2xl border border-border bg-muted/30 p-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-start gap-2 text-sm font-medium",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					className: "mt-1",
					checked: value.enabled,
					onChange: (e) => onChange({
						...value,
						enabled: e.target.checked
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4 text-primary" }),
						" ",
						label
					]
				})]
			}),
			hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 pl-6 text-xs text-muted-foreground",
				children: hint
			}),
			value.enabled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-3 space-y-2 pl-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					maxLength: 80,
					value: value.title,
					onChange: (e) => onChange({
						...value,
						title: e.target.value
					}),
					placeholder: titlePlaceholder ?? "Judul notifikasi",
					className: "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
					maxLength: 180,
					rows: 2,
					value: value.body,
					onChange: (e) => onChange({
						...value,
						body: e.target.value
					}),
					placeholder: bodyPlaceholder ?? "Isi singkat notifikasi",
					className: "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
				})]
			})
		]
	});
}
/**
* Mengirim push setelah entitas tersimpan. Kegagalan push tidak boleh
* menggagalkan penyimpanan data, jadi error hanya ditampilkan sebagai toast.
*/
async function dispatchPush(input) {
	if (!input.draft.enabled) return;
	const title = input.draft.title.trim() || input.fallbackTitle;
	const body = input.draft.body.trim() || input.fallbackBody;
	if (!title || !body) {
		toast.error("Judul dan isi notifikasi tidak boleh kosong.");
		return;
	}
	try {
		const res = await sendRegionPush({ data: {
			entityType: input.entityType,
			entityId: input.entityId ?? null,
			title,
			body,
			path: input.path ?? null
		} });
		if (res.duplicated) toast.info("Notifikasi serupa baru saja dikirim.");
		else toast.success(`Notifikasi terkirim ke ${res.sent} perangkat${res.failed ? `, ${res.failed} gagal` : ""}.`);
	} catch (e) {
		toast.error(e?.message ?? "Notifikasi gagal dikirim.");
	}
}
//#endregion
export { dispatchPush as n, emptyPushDraft as r, AdminPushField as t };
