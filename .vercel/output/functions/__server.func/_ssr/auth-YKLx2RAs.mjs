import { o as __toESM } from "../_runtime.mjs";
import { t as supabase } from "./client-khLhW5dO.mjs";
import { _ as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { vt as ArrowLeft, xt as Sparkles } from "../_libs/lucide-react.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as PasswordInput } from "./password-input-Ca2o9hnq.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-YKLx2RAs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AuthPage() {
	const [mode, setMode] = (0, import_react.useState)("signin");
	const [email, setEmail] = (0, import_react.useState)("");
	const [sentTo, setSentTo] = (0, import_react.useState)(null);
	const [password, setPassword] = (0, import_react.useState)("");
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [regionName, setRegionName] = (0, import_react.useState)("");
	const [regionTagline, setRegionTagline] = (0, import_react.useState)("");
	const [regionCoords, setRegionCoords] = (0, import_react.useState)("");
	const [loading, setLoading] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	const submit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			if (mode === "forgot") {
				const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` });
				if (error) throw error;
				setSentTo(email);
				toast.success("Tautan pemulihan dikirim ke email Anda.");
			} else if (mode === "signin") {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password
				});
				if (error) throw error;
				toast.success("Selamat datang!");
				navigate({
					to: "/admin",
					replace: true
				});
			} else {
				if (!regionName.trim()) throw new Error("Nama wilayah wajib diisi.");
				const { error } = await supabase.auth.signUp({
					email,
					password,
					options: {
						emailRedirectTo: `${window.location.origin}/admin`,
						data: {
							full_name: fullName,
							region_name: regionName,
							region_tagline: regionTagline || null,
							region_coordinates: regionCoords || null
						}
					}
				});
				if (error) throw error;
				toast.success("Pendaftaran diterima. Akun Anda akan diaktifkan oleh tim Rekomendify.");
				setMode("signin");
			}
		} catch (err) {
			toast.error(err.message ?? "Gagal");
		} finally {
			setLoading(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid min-h-screen place-items-center batik-bg px-5 py-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-sm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/",
					"aria-label": "Kembali ke beranda",
					className: "inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent/10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), " Kembali"]
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
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-2xl",
						children: mode === "signin" ? "Masuk Admin" : mode === "signup" ? "Daftar Admin Wilayah" : "Lupa Password"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted-foreground",
						children: mode === "signin" ? "Khusus pengelola wilayah." : mode === "signup" ? "Satu admin = satu wilayah. Akun akan diaktifkan manual setelah verifikasi." : "Masukkan email akun Anda. Kami kirim tautan untuk membuat password baru."
					}),
					mode === "forgot" && sentTo && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 rounded-xl bg-primary/10 p-3 text-sm text-foreground",
						children: [
							"Tautan pemulihan sudah dikirim ke ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: sentTo
							}),
							". Cek juga folder spam."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: "mt-5 space-y-3",
						children: [
							mode === "signup" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								required: true,
								placeholder: "Nama lengkap Anda",
								value: fullName,
								onChange: (e) => setFullName(e.target.value),
								className: "input"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-muted/40 p-3 space-y-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
										children: "Wilayah yang akan dikelola"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										required: true,
										placeholder: "Nama wilayah (mis. Desa Wisata Mulyosari)",
										value: regionName,
										onChange: (e) => setRegionName(e.target.value),
										className: "input"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										placeholder: "Tagline / sapaan singkat (opsional)",
										value: regionTagline,
										onChange: (e) => setRegionTagline(e.target.value),
										className: "input"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										placeholder: "Koordinat wilayah, mis. -8.002344,111.817618 (opsional)",
										value: regionCoords,
										onChange: (e) => setRegionCoords(e.target.value),
										className: "input"
									})
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								required: true,
								placeholder: "Email",
								value: email,
								onChange: (e) => setEmail(e.target.value),
								className: "input",
								autoComplete: "email"
							}),
							mode !== "forgot" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasswordInput, {
								value: password,
								onChange: setPassword,
								required: true,
								minLength: 6,
								autoComplete: mode === "signin" ? "current-password" : "new-password"
							}),
							mode === "signin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex justify-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setSentTo(null);
										setMode("forgot");
									},
									className: "text-xs font-semibold text-primary hover:underline",
									children: "Lupa password?"
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								disabled: loading,
								type: "submit",
								className: "w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-60",
								children: loading ? "Memproses…" : mode === "signin" ? "Masuk" : mode === "signup" ? "Daftar Wilayah Saya" : "Kirim tautan pemulihan"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setMode(mode === "signin" ? "signup" : "signin"),
						className: "mt-4 w-full text-center text-sm text-muted-foreground hover:text-foreground",
						children: mode === "signin" ? "Belum punya wilayah? Daftar di sini" : "Sudah punya akun? Masuk"
					})
				]
			})]
		})
	});
}
//#endregion
export { AuthPage as component };
