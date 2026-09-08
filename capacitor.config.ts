import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Konfigurasi Capacitor — aplikasi LOCAL-FIRST.
 *
 * Seluruh frontend React/Vite dibundel ke dalam APK (`webDir`). TIDAK ada
 * `server.url`, tidak ada redirect ke website eksternal saat startup, dan tidak
 * ada iframe. Data diambil dari backend yang sama dengan website lewat server
 * function lintas origin ketika internet tersedia.
 *
 * Blok TENANT_CONFIG di bawah DIHASILKAN OTOMATIS oleh `npm run sync-tenant`
 * dari tenant.config.json. Jangan mengeditnya manual; kode di luar blok tetap
 * milik developer dan tidak disentuh oleh script.
 */
// TENANT_CONFIG_START
const TENANT = {
  appId: "com.rekomendify.desamulyosari",
  appName: "Desa Mulyosari",
  navigationHosts: ["www.rekomendify.com", "rekomendify.com", "*.rekomendify.com"],
};
// TENANT_CONFIG_END

const config: CapacitorConfig = {
  appId: TENANT.appId,
  appName: TENANT.appName,
  // UI aplikasi = aset lokal hasil build Vite (lihat scripts/build-capacitor.mjs).
  webDir: "dist/capacitor",
  android: {
    allowMixedContent: false,
  },
  server: {
    // Aset lokal dilayani lewat https://localhost agar cookie & secure context
    // (kamera, lokasi, kripto) berperilaku seperti di browser.
    androidScheme: "https",
    // `allowNavigation` DIKOSONGKAN dengan sengaja: UI aplikasi tidak boleh
    // berpindah ke website remote. Semua tautan luar (termasuk domain tenant
    // `TENANT.navigationHosts`) dibuka di browser/aplikasi sistem lewat
    // src/native/links.ts.
    allowNavigation: [],
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#fbf7ef",
      androidScaleType: "CENTER_CROP",
    },
  },
};

export default config;
