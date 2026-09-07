import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Konfigurasi Capacitor — LOCAL-FIRST.
 *
 * `server.url` TIDAK dipakai dan tidak boleh ditambahkan: seluruh UI React
 * dibundel ke dalam APK (`webDir: dist/capacitor`) dan dijalankan dari aset
 * lokal. Website hanya dipakai sebagai origin API (server function).
 *
 * Blok TENANT_CONFIG di bawah DIHASILKAN OTOMATIS oleh `npm run sync-tenant`
 * dari tenant.config.json. Jangan mengeditnya manual.
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
  webDir: "dist/capacitor",
  android: {
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
    // Navigasi di dalam aplikasi ditangani router lokal. Domain tenant tetap
    // diizinkan agar tautan lama (mis. dari notifikasi/QR) tidak mentok, sedang
    // domain lain & skema aplikasi (tel:, wa:, maps:) diserahkan ke Android.
    allowNavigation: TENANT.navigationHosts,
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
