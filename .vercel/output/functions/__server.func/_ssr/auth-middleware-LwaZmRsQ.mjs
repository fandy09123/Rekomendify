import { t as getSupabasePublicConfig } from "./config-Jd4haonG.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { t as getRequest } from "./request-response-BEPp1C2k.mjs";
import { n as createMiddleware } from "./createStart-DwZhSttb.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-middleware-LwaZmRsQ.js
var requireSupabaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const { url, publishableKey } = getSupabasePublicConfig();
	const request = getRequest();
	if (!request?.headers) throw new Error("Unauthorized: No request headers available");
	const authHeader = request.headers.get("authorization");
	if (!authHeader) throw new Error("Unauthorized: No authorization header provided");
	if (!authHeader.startsWith("Bearer ")) throw new Error("Unauthorized: Only Bearer tokens are supported");
	const token = authHeader.replace("Bearer ", "");
	if (!token) throw new Error("Unauthorized: No token provided");
	const supabase = createClient(url, publishableKey, {
		global: { headers: { Authorization: `Bearer ${token}` } },
		auth: {
			storage: void 0,
			persistSession: false,
			autoRefreshToken: false
		}
	});
	const { data, error } = await supabase.auth.getClaims(token);
	if (error || !data?.claims) throw new Error("Unauthorized: Invalid token");
	if (!data.claims.sub) throw new Error("Unauthorized: No user ID found in token");
	return next({ context: {
		supabase,
		userId: data.claims.sub,
		claims: data.claims
	} });
});
//#endregion
export { requireSupabaseAuth as t };
