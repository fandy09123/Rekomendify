# Rekomendify — Satu Codebase, Dua Target (Web/PWA + APK Android)

Sejak migrasi local-first, **tidak ada lagi App Shell / web-wrapper**. Frontend
React + Vite (TanStack Start) yang sama dipakai untuk:

| Target | Perintah | Hasil |
| --- | --- | --- |
| Website / PWA (SSR + server function) | `npm run build` | `dist/` (dideploy seperti biasa) |
| APK Android (aset lokal di dalam APK) | `npm run build:capacitor` | `dist/capacitor/` → `android/` |

`npm run build:capacitor` menulis ulang `dist/`. Untuk deploy website,
jalankan `npm run build` lagi setelahnya.

## Arsitektur APK

- Seluruh UI, router, dan aset ada **di dalam APK**. Tidak ada `server.url`,
  tidak ada redirect ke website saat startup, tidak ada iframe.
- Data diambil dari backend yang sama dengan website melalui **server function
  lintas origin** (`src/native/api-origin.ts` → `TARGET_ORIGIN` dari
  `tenant.config.json`). CSRF di sisi server mengizinkan origin aplikasi
  (`src/lib/native-cors.ts`, `src/start.ts`).
- Offline: data publik disimpan di IndexedDB (`src/lib/query-persist.ts`,
  cache-first + revalidate, ada versi/batas/kedaluwarsa). Tidak ada layar kosong.
- Service Worker hanya dipakai di web/PWA (`src/native/capabilities.ts`).

## Lapisan native (`src/native/`)

| File | Fungsi |
| --- | --- |
| `capabilities.ts` | Deteksi platform resmi (`Capacitor.isNativePlatform()`), bukan user-agent |
| `camera.ts` | Ambil foto: plugin Camera di APK, input `capture` di browser |
| `location.ts` | Lokasi: plugin Geolocation di APK, `navigator.geolocation` di web |
| `notifications.ts` | Push native (butuh konfigurasi push Firebase); web tetap Web Push |
| `links.ts` | Tautan luar dibuka di browser/aplikasi sistem |
| `shell.ts` | Status bar, splash, keyboard, tombol Back Android |
| `api-origin.ts` | Mengarahkan panggilan server function ke origin website |
| `tenant.ts`, `connectivity.ts` | Identitas tenant & cek koneksi |

Izin perangkat **hanya diminta saat tombol fiturnya ditekan**, tidak saat
startup.

## Ganti desa (multi-tenant)

1. Edit `tenant.config.json` (atau override lewat `.env`, lihat `.env.example`).
2. `npm run sync-tenant` → memperbarui `src/tenant.generated.ts`,
   `capacitor.config.ts`, `android/app/build.gradle`, `strings.xml`, dan package
   Java `MainActivity`.
3. `npm run build:capacitor`
4. `npx cap sync android`
5. `cd android && .\gradlew.bat assembleDebug`
   → `android/app/build/outputs/apk/debug/app-debug.apk`

## Catatan

- Gradle/Android SDK tidak tersedia di lingkungan Lovable; build APK dan
  pengujian perangkat dilakukan di mesin developer.
- Push notifikasi native memerlukan `google-services.json` dari Firebase.
- Tidak ada secret, API key, atau VAPID private key di dalam APK.
