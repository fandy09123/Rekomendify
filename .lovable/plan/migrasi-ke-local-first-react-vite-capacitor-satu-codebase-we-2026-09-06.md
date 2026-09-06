# Migrasi ke Local-First React/Vite + Capacitor (satu codebase: Web + PWA + APK)

## Hasil audit (fakta dari source aktual)

- `legacy-web/` adalah aplikasi **TanStack Start (SSR)**, bukan SPA Vite biasa: **tidak ada** `index.html` maupun `tailwind.config.js` (Tailwind v4 lewat `src/styles.css`). Jadi daftar file di brief tidak bisa dipindah apa adanya.
- Seluruh data berjalan lewat **48 server function** (`public.functions.ts` 11, `admin.functions.ts` 21, `push.functions.ts` 5, `ads.functions.ts` 7, `push-admin.functions.ts` 4) + 10 route dengan `loader`. Supabase service-role, VAPID, dan webpush hanya dipakai di sisi server — ini yang membuat rahasia tetap di server dan tidak boleh berpindah ke APK.
- Root project saat ini hanya App Shell tipis: `src/config.ts`, `src/routes/index.tsx` (redirect ke website), `scripts/sync-tenant.mjs`, `capacitor.config.ts` (sudah **tanpa** `server.url`), `android/` dengan `MainActivity` berisi permission bridge kamera/lokasi/notifikasi.
- Website sudah punya Service Worker offline (`public/sw.js`: app shell, page cache, image cache, web push) dan manifest PWA — dipertahankan, tidak dihapus.

**Akar masalah:** UI APK berasal dari remote website (App Shell → `location.replace`). Karena itu APK gagal total saat offline dan tidak memakai kemampuan native.

## Keputusan arsitektur inti

Satu codebase, dua target build:

```text
src/ (TanStack Start, satu-satunya frontend)
   ├── build web/PWA  → SSR + server functions (Cloudflare/Vercel, seperti sekarang)
   └── build APK      → mode SPA (shell di-prerender) → dist/capacitor → WebView lokal
```

Di APK, UI + router + aset ada di dalam APK. Data tetap dari backend yang sudah ada: server function dipanggil **lintas origin** ke domain tenant memakai `serverFns.fetch` kustom (didukung TanStack Start) + `createCsrfMiddleware({ origin })` yang mengizinkan origin WebView. Tidak ada `server.url`, tidak ada iframe, tidak ada duplikasi business logic, tidak ada rahasia di APK.

## Tahapan implementasi

1. **Migrasi source**: `legacy-web/src` → `src`, `legacy-web/public` → `public`, `legacy-web/supabase` → `supabase`, plus `components.json`/`tsconfig`. Bagian shell yang tetap dipakai (`src/config.ts`, `src/tenant.generated.ts`, `src/lib/capacitor-shell.ts`) dipindah ke `src/native/`. Route redirect App Shell dihapus; `src/routes/index.tsx` milik website yang dipakai.
2. **Merge dependency**: gabungkan dependency legacy-web (Supabase, leaflet, html5-qrcode, qrcode, framer-motion) ke root, pertahankan seluruh paket Capacitor + script `sync-tenant` dan `build:capacitor`. Tambah `@capacitor/camera`, `@capacitor/geolocation`, `@capacitor/push-notifications`, `@capacitor/status-bar`, `@capacitor/keyboard`, `@capacitor/splash-screen`.
3. **Build target APK**: `vite.config.ts` mengaktifkan mode SPA + preset statis bila `CAP_BUILD=1`; `scripts/build-capacitor-shell.mjs` ditulis ulang menjadi penyalin output statis ke `dist/capacitor` (shell → `index.html`). `capacitor.config.ts` tetap lokal (`webDir` diarahkan ke hasil build ini).
4. **Lapisan native** (`src/native/`): `capabilities.ts` (`isNativeApp`, `supportsNativeCamera`, …, memakai `Capacitor.isNativePlatform()`), `camera.ts`, `location.ts`, `notifications.ts`, `browser.ts` (link eksternal), `back-button.ts`. Komponen yang ada memanggil service ini; di browser jatuh ke Web API yang sekarang. Permission hanya diminta saat tombol fitur ditekan.
5. **Offline**: TanStack Query persistence ke IndexedDB untuk data publik (cache-first/stale-while-revalidate), data admin & auth tidak dipersist. Service Worker tetap untuk web; di APK aset sudah lokal sehingga SW hanya menangani gambar/data (deteksi kapabilitas). Banner status Online/Offline/Sinkronisasi.
6. **Startup & UX native**: lazy route admin, tanpa request/permission saat startup, tampilkan data cache dulu; status bar, safe-area, splash, keyboard, tombol Back.
7. **Verifikasi**: `bun install`, typecheck, `npm run build` (web), `npm run build:capacitor`, `npx cap sync android`.
8. **Cleanup**: `legacy-web/` dihapus hanya setelah semua di atas hijau dan tidak ada import yang menunjuk ke sana.

## Batasan yang harus Anda ketahui lebih dulu

- **Gradle tidak bisa dijalankan di lingkungan ini** (tanpa JDK/Android SDK), dan pengujian APK di perangkat (kamera, GPS, notifikasi, keyboard, cold start offline) juga tidak bisa saya lakukan. Langkah itu tetap harus Anda jalankan di mesin Windows Anda; saya berikan perintahnya dan tidak akan mengklaim lulus tanpa bukti.
- Agar APK bisa membaca data, **website perlu di-deploy ulang** dengan pengaturan CSRF/origin baru. Sebelum deploy itu, APK offline-nya jalan tapi data baru belum masuk.
- Push native (FCM) memerlukan `google-services.json` dari Firebase console milik Anda; saya siapkan kodenya, file itu Anda tambahkan.
- Migrasi ini besar dan menyentuh hampir seluruh project. Saya kerjakan bertahap sesuai urutan di atas dan melaporkan hasil tiap tahap.
