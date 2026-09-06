/**
 * SINGLE SOURCE OF TRUTH untuk App Shell.
 *
 * Nilai tenant (nama desa & TARGET_URL) berasal dari `tenant.config.json`
 * dan disalin ke `src/tenant.generated.ts` oleh `npm run sync-tenant`.
 * Jangan mengedit nilai tenant di file ini — ubah tenant.config.json lalu sync.
 *
 * Tidak ada form, settings, localStorage, atau query parameter yang boleh
 * mengubah TARGET_URL dari sisi user.
 *
 * Nilai di sini bersifat PUBLIC. Jangan pernah menaruh secret/API key di sini.
 */
import { TENANT } from "./tenant.generated";

export const APP_CONFIG = {
  TARGET_URL: TENANT.TARGET_URL,
  VILLAGE_NAME: TENANT.VILLAGE_NAME,
  VILLAGE_SLUG: TENANT.VILLAGE_SLUG,
  APP_NAME: TENANT.APP_NAME,
} as const;

/** Origin dari TARGET_URL, dipakai untuk connectivity probe & allowlist. */
export const TARGET_ORIGIN = new URL(APP_CONFIG.TARGET_URL).origin;
