//#region node_modules/.nitro/vite/services/ssr/assets/config-Jd4haonG.js
var DEFAULT_SUPABASE_URL = "https://ejuqhezcxbctqlquysdr.supabase.co";
var DEFAULT_SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdXFoZXpjeGJjdHFscXV5c2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTUzOTcsImV4cCI6MjA5NzY5MTM5N30.dl7PeWJnI7MPkHkYUqK9XcmJi-L0fPIFOVr7bSnCnqM";
function getProcessEnv() {
	if (typeof globalThis === "undefined") return {};
	return globalThis.process?.env ?? {};
}
function getSupabasePublicConfig() {
	const runtimeEnv = getProcessEnv();
	const viteEnv = {
		"BASE_URL": "/",
		"DEV": false,
		"MODE": "production",
		"PROD": true,
		"SSR": true,
		"TSS_DEV_SERVER": "false",
		"TSS_DEV_SSR_STYLES_BASEPATH": "/",
		"TSS_DEV_SSR_STYLES_ENABLED": "true",
		"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
		"TSS_INLINE_CSS_ENABLED": "false",
		"TSS_ROUTER_BASEPATH": "",
		"TSS_SERVER_FN_BASE": "/_serverFn/"
	};
	const url = runtimeEnv.SUPABASE_URL || runtimeEnv.VITE_SUPABASE_URL || viteEnv.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
	const publishableKey = runtimeEnv.SUPABASE_PUBLISHABLE_KEY || runtimeEnv.VITE_SUPABASE_PUBLISHABLE_KEY || viteEnv.VITE_SUPABASE_PUBLISHABLE_KEY || DEFAULT_SUPABASE_PUBLISHABLE_KEY;
	if (!url || !publishableKey) throw new Error("Missing Supabase public configuration.");
	return {
		url,
		publishableKey
	};
}
//#endregion
export { getSupabasePublicConfig as t };
