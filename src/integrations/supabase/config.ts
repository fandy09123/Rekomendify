const DEFAULT_SUPABASE_URL = 'https://ejuqhezcxbctqlquysdr.supabase.co';
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVqdXFoZXpjeGJjdHFscXV5c2RyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMTUzOTcsImV4cCI6MjA5NzY5MTM5N30.dl7PeWJnI7MPkHkYUqK9XcmJi-L0fPIFOVr7bSnCnqM';

type RuntimeEnv = Record<string, string | undefined>;

function getProcessEnv(): RuntimeEnv {
  if (typeof globalThis === "undefined") return {};
  const maybeProcess = (globalThis as typeof globalThis & { process?: { env?: RuntimeEnv } }).process;
  return maybeProcess?.env ?? {};
}

export function getSupabasePublicConfig() {
  const runtimeEnv = getProcessEnv();
  const viteEnv = (import.meta.env ?? {}) as RuntimeEnv;

  const url =
    runtimeEnv.SUPABASE_URL ||
    runtimeEnv.VITE_SUPABASE_URL ||
    viteEnv.VITE_SUPABASE_URL ||
    DEFAULT_SUPABASE_URL;

  const publishableKey =
    runtimeEnv.SUPABASE_PUBLISHABLE_KEY ||
    runtimeEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
    viteEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
    DEFAULT_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) {
    throw new Error("Missing Supabase public configuration.");
  }

  return { url, publishableKey };
}
