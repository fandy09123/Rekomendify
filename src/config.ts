/**
 * SINGLE SOURCE OF TRUTH untuk App Shell.
 *
 * Hanya developer yang boleh mengubah nilai di file ini.
 * Tidak ada form, settings, localStorage, atau query parameter yang boleh
 * mengubah TARGET_URL dari sisi user.
 *
 * Nilai di sini bersifat PUBLIC. Jangan pernah menaruh secret/API key di sini.
 */
export const APP_CONFIG = {
  TARGET_URL: "https://www.rekomendify.com/r/desa-wisata-mulyosari",
  VILLAGE_NAME: "Desa Mulyosari",
} as const;

/** Origin dari TARGET_URL, dipakai untuk connectivity probe & allowlist. */
export const TARGET_ORIGIN = new URL(APP_CONFIG.TARGET_URL).origin;
