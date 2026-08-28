import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Konfigurasi Capacitor untuk App Shell.
 *
 * CATATAN untuk developer:
 * - `appId` dan `appName` di bawah adalah CONTOH. Ganti sesuai identitas rilis
 *   Anda SEBELUM menjalankan `npx cap add android`. Mengubah appId setelah
 *   aplikasi rilis di Play Store tidak dimungkinkan.
 * - `webDir` harus menunjuk ke folder hasil build web yang berisi index.html.
 *   Verifikasi dengan `ls dist/client` setelah `npm run build`.
 */
const config: CapacitorConfig = {
  appId: "com.rekomendify.desamulyosari",
  appName: "Desa Mulyosari",
  webDir: "dist/client",
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
    allowNavigation: ["www.rekomendify.com", "rekomendify.com", "*.rekomendify.com"],
  },
};

export default config;
