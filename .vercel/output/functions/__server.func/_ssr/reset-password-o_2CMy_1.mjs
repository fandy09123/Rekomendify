import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-khLhW5dO.mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { Ct as LoaderCircle, Ot as CircleCheck, m as ShieldAlert, vt as ArrowLeft, xt as Sparkles } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as PasswordInput } from "./password-input-Ca2o9hnq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/reset-password-o_2CMy_1.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Terjemahan error yang dikirim Supabase pada hash URL. */
function readHashError() {
	if (typeof window === "undefined") return null;
	const parts = [window.location.hash.replace(/^#/, ""), window.location.search.replace(/^\?/, "")];
	for (const raw of parts) {
		if (!raw) continue;
		const p = new URLSearchParams(raw);
		const code = p.get("error_code");
		const err = p.get("error");
		if (!code && !err) continue;
		if (code === "otp_expired") return "Tautan pemulihan sudah kedaluwarsa. Minta tautan baru dari halaman masuk.";
		if (err === "access_denied") return "Tautan pemulihan sudah pernah dipakai atau tidak berlaku lagi.";
		return p.get("error_description")?.replace(/\+/g, " ") ?? "Tautan pemulihan tidak berlaku.";
	}
	return null;
}
function ResetPasswordPage() {
	const navigate = useNavigate();
	const [status, setStatus] = (0, import_react.useState)("checking");
	const [reason, setReason] = (0, import_react.useState)(null);
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let active = true;
		const hashError = readHashError();
		if (hashError) {
			setReason(hashError);
			setStatus("invalid");
			return;
		}
		const { data: sub } = supabase.auth.onAuthStateChange((event) => {
			if (!active) return;
			if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setStatus("ready");
		});
		const settle = setTimeout(() => {
			supabase.auth.getSession().then(({ data }) => {
				if (!active) return;
				setStatus((s) => {
					if (s === "ready") return s;
					if (data.session) return "ready";
					setReason("Tautan pemulihan tidak ditemukan atau sudah kedaluwarsa.");
					return "invalid";
				});
			});
		}, 1200);
		return () => {
			active = false;
			clearTimeout(settle);
			sub.subscription.unsubscribe();
		};
	}, []);
	const tooShort = password.length > 0 && password.length < 8;
	const mismatch = confirm.length > 0 && confirm !== password;
	const canSubmit = password.length >= 8 && password === confirm && !saving;
	const submit = async (e) => {
		e.preventDefault();
		if (!canSubmit) return;
		setSaving(true);
		try {
			const { error } = await supabase.auth.updateUser({ password });
			if (error) throw error;
			setStatus("done");
			toast.success("Password berhasil diperbarui.");
		} catch (err) {
			toast.error(err?.message ?? "Gagal memperbarui password");
		} finally {
			setSaving(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center batik-bg px-5 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/auth",
					"aria-label": "Kembali ke halaman masuk",
					className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent/10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Masuk"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					className: "inline-flex items-center gap-2 text-primary",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-5" }),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-display text-lg",
							children: "Rekomendify"
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-3xl border border-border bg-card p-6 shadow-lift",
				children: [
					status === "checking" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 py-6 text-sm text-muted-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-5 animate-spin text-primary" }), " Memeriksa tautan pemulihan…"]
					}),
					status === "invalid" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto grid size-12 place-items-center rounded-2xl bg-destructive/10 text-destructive",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldAlert, { className: "size-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-3 font-display text-2xl",
								children: "Tautan tidak berlaku"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: reason ?? "Tautan pemulihan sudah kedaluwarsa atau pernah dipakai. Minta tautan baru dari halaman masuk."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/auth",
								className: "mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground",
								children: "Kembali ke halaman masuk"
							})
						]
					}),
					status === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-6" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
								className: "mt-3 font-display text-2xl",
								children: "Password diperbarui"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-sm text-muted-foreground",
								children: "Silakan lanjut ke dashboard Admin Wilayah Anda."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								onClick: () => navigate({
									to: "/admin",
									replace: true
								}),
								className: "mt-5 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground",
								children: "Buka Dashboard"
							})
						]
					}),
					status === "ready" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-2xl",
							children: "Buat password baru"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Minimal 8 karakter. Gunakan kombinasi huruf dan angka."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							onSubmit: submit,
							className: "mt-5 space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
									value: password,
									onChange: setPassword,
									placeholder: "Password baru",
									autoComplete: "new-password",
									required: true,
									minLength: 8
								}),
								tooShort && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-destructive",
									children: "Password minimal 8 karakter."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
									value: confirm,
									onChange: setConfirm,
									placeholder: "Ulangi password baru",
									autoComplete: "new-password",
									required: true,
									minLength: 8
								}),
								mismatch && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-destructive",
									children: "Konfirmasi password belum sama."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "submit",
									disabled: !canSubmit,
									className: "flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-60",
									children: [saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 animate-spin" }), saving ? "Menyimpan…" : "Simpan password baru"]
								})
							]
						})
					] })
				]
			})]
		})
	});
}
//#endregion
export { ResetPasswordPage as component };
