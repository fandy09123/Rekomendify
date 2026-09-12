import { t as getSupabasePublicConfig } from "./config-Jd4haonG.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-khLhW5dO.js
function createSupabaseClient() {
	const { url, publishableKey } = getSupabasePublicConfig();
	return createClient(url, publishableKey, { auth: {
		storage: typeof window !== "undefined" ? window.localStorage : void 0,
		persistSession: true,
		autoRefreshToken: true
	} });
}
var _supabase;
var supabase = new Proxy({}, { get(_, prop, receiver) {
	if (!_supabase) _supabase = createSupabaseClient();
	return Reflect.get(_supabase, prop, receiver);
} });
//#endregion
export { supabase as t };
