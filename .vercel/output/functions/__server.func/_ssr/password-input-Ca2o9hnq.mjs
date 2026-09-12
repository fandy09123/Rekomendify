import { o as __toESM } from "../_runtime.mjs";
import { a as require_react, i as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { J as Eye, Y as EyeOff } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/password-input-Ca2o9hnq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Input password dengan tombol lihat/sembunyikan (standar industri). */
function PasswordInput({ value, onChange, placeholder = "Password", required, minLength, autoComplete, name, id }) {
	const [show, setShow] = (0, import_react.useState)(false);
	const fallbackId = (0, import_react.useId)();
	const inputId = id ?? fallbackId;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
			id: inputId,
			name,
			type: show ? "text" : "password",
			value,
			onChange: (e) => onChange(e.target.value),
			placeholder,
			required,
			minLength,
			autoComplete,
			className: "input pr-11"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => setShow((s) => !s),
			"aria-label": show ? "Sembunyikan password" : "Tampilkan password",
			"aria-pressed": show,
			"aria-controls": inputId,
			title: show ? "Sembunyikan password" : "Tampilkan password",
			className: "absolute inset-y-0 right-0 grid w-11 place-items-center rounded-r-xl text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
			children: show ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-4" })
		})]
	});
}
//#endregion
export { PasswordInput as t };
