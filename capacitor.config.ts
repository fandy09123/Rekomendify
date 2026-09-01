import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Konfigurasi Capacitor untuk App Shell.
 *
 * Blok TENANT_CONFIG di bawah DIHASILKAN OTOMATIS oleh `npm run sync-tenant`
 * dari tenant.config.json. Jangan mengeditnya manual; kode di luar blok tetap
 * milik developer dan tidak disentuh oleh script.
 *
 * Catatan: `server.url` TIDAK dipakai. Shell statis dibundel ke APK dan
 * melakukan redirect penuh ke TARGET_URL setelah connectivity check, sehingga
 * APK tetap punya layar offline yang berguna saat website tidak terjangkau.
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
    // Konten dilayani lewat https:// agar cookie/secure context website target
    // berperilaku sama seperti di browser.
    allowMixedContent: false,
  },
  server: {
    androidScheme: "https",
    // Domain berikut tetap dibuka DI DALAM WebView (pengalaman in-app).
    // Domain/skema lain (tel:, mailto:, whatsapp:, maps, dsb.) diserahkan ke
    // Android agar dibuka oleh aplikasi yang tepat.
    allowNavigation: TENANT.navigationHosts,
  },
};

export default config;
