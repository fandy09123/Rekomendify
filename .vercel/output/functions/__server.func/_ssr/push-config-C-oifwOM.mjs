import { r as __exportAll$1 } from "../_runtime.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/push-config-C-oifwOM.js
var push_config_C_oifwOM_exports = /* @__PURE__ */ __exportAll$1({
	n: () => push_config_exports,
	t: () => DEFAULT_VAPID_PUBLIC_KEY
});
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var push_config_exports = /* @__PURE__ */ __exportAll({ DEFAULT_VAPID_PUBLIC_KEY: () => DEFAULT_VAPID_PUBLIC_KEY });
/**
* Satu-satunya sumber VAPID **public** key untuk sisi frontend.
*
* Public key memang dirancang untuk dipakai di browser (dikirim ke push
* service sebagai `applicationServerKey`), jadi aman berada di bundle.
* Private key TIDAK pernah ada di sini — ia hanya hidup sebagai env var
* server (VAPID_PRIVATE_KEY) di deployment backend.
*
* Nilai env (VITE_VAPID_PUBLIC_KEY / VAPID_PUBLIC_KEY di server) tetap
* diprioritaskan bila tersedia, sehingga rotasi key cukup dilakukan di
* environment variable tanpa mengubah kode.
*/
var DEFAULT_VAPID_PUBLIC_KEY = "BMvbOkQOWVOUQK3dcxqAtGIxV6f_hRLtTGnYSXkh6TzkaKqoUjp819YrxqGRDekGwIrXHgtLfOWxWQdiM13qzcE";
//#endregion
export { push_config_C_oifwOM_exports as t };
