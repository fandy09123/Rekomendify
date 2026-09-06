/**
 * SINGLE SOURCE OF TRUTH tenant untuk frontend.
 *
 * Nilai tenant (nama desa, slug, TARGET_URL) berasal dari `tenant.config.json`
 * dan disalin ke `src/tenant.generated.ts` oleh `npm run sync-tenant`.
 * Jangan mengedit nilai tenant di file ini — ubah tenant.config.json lalu sync.
 *
 * TARGET_URL / TARGET_ORIGIN TIDAK lagi dipakai sebagai sumber UI (tidak ada
 * lagi redirect ke website). Di APK, origin ini hanya dipakai sebagai
 * API origin untuk memanggil server function website.
 *
 * Nilai di sini bersifat PUBLIC. Jangan pernah menaruh secret/API key di sini.
 */
import { TENANT } from "../tenant.generated";

export const APP_CONFIG = {
  TARGET_URL: TENANT.TARGET_URL,
  VILLAGE_NAME: TENANT.VILLAGE_NAME,
  VILLAGE_SLUG: TENANT.VILLAGE_SLUG,
  APP_NAME: TENANT.APP_NAME,
} as const;

/** Origin dari TARGET_URL: API origin saat aplikasi berjalan sebagai APK. */
export const TARGET_ORIGIN = new URL(APP_CONFIG.TARGET_URL).origin;

/** Path region default tenant (mis. "/r/desa-wisata-mulyosari"). */
export const TENANT_PATH = new URL(APP_CONFIG.TARGET_URL).pathname.replace(/\/$/, "");

/** Slug region tenant di dalam website (segmen terakhir TARGET_URL). */
export const TENANT_REGION_SLUG = TENANT_PATH.split("/").filter(Boolean).pop() ?? "";
