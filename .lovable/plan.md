# Rekomendify App Shell — Launcher untuk Capacitor Android

Membuat App Shell tipis: satu halaman yang menampilkan loading, memeriksa koneksi, lalu mengarahkan WebView langsung ke situs Rekomendify. Tanpa backend, tanpa database, tanpa autentikasi, tanpa editor URL.

## Alur aplikasi

```text
App start
   ↓
Baca APP_CONFIG (src/config.ts)
   ↓
Layar loading: "Desa Mulyosari — Menyiapkan aplikasi..."
   ↓
Cek koneksi (navigator.onLine + probe ringan ke TARGET_URL)
   ↓
Online  → redirect penuh ke TARGET_URL
Gagal   → layar "Koneksi Terputus" + tombol [Coba Lagi]
```

Redirect penuh (bukan iframe) dipilih karena paling stabil di Android WebView: tidak terhalang header keamanan situs, cookie dan session Rekomendify bekerja normal, dan user merasa langsung berada di aplikasi Rekomendify.

## Yang akan dibuat / diubah

- `src/config.ts` — satu-satunya sumber konfigurasi: `TARGET_URL`, `VILLAGE_NAME`. Semua teks dan logika membacanya dari sini.
- `src/routes/index.tsx` — halaman App Shell (menggantikan placeholder): state `checking` → `redirecting` / `offline`, judul & metadata halaman dari config.
- `src/components/shell/LoadingScreen.tsx`, `OfflineScreen.tsx` — UI mobile-first, minimal, dengan tombol Coba Lagi (mengulang pemeriksaan tanpa reload paksa, agar tidak ada infinite reload).
- `src/lib/connectivity.ts` — probe koneksi ringan (satu request no-cors dengan timeout) + listener event `online`/`offline`.
- `src/lib/capacitor-shell.ts` — inisialisasi khusus native: listener tombol Back Android, aman saat berjalan di browser biasa.
- `capacitor.config.ts` — appId/appName placeholder yang jelas untuk diganti developer, `webDir` mengarah ke output build statis, `androidScheme: "https"`, dan allowlist navigasi ke domain rekomendify.com agar redirect tidak dianggap link eksternal.
- Dependency: `@capacitor/core`, `@capacitor/cli`, `@capacitor/app`, `@capacitor/browser` (untuk link eksternal). Tidak ada dependency lain yang ditambahkan.
- `README-APPSHELL.md` — panduan Bahasa Indonesia: build web, `npx cap init`/`add android`/`sync`, `./gradlew assembleDebug` beserta alternatif Windows `.\gradlew.bat`, lokasi APK, dan cara mengganti nama aplikasi/package/icon.

## Tombol Back Android

Listener `App.addListener('backButton')` dari `@capacitor/app`:
- Setelah redirect, WebView berada di domain Rekomendify sehingga history dikelola oleh situs itu sendiri; jika `canGoBack` true → kembali satu langkah.
- Jika tidak ada history → `App.exitApp()` (perilaku keluar normal Android), bukan `history.back()` membabi buta. Tidak ada risiko back loop atau aplikasi tidak bisa ditutup.
- Di browser desktop listener tidak aktif dan tidak menimbulkan error.

## Link eksternal

Link internal Rekomendify tetap di dalam WebView melalui allowlist navigasi Capacitor. Skema non-http (`tel:`, `mailto:`, `whatsapp:`, `intent:`) dan domain lain ditangani Android/Capacitor agar dibuka oleh aplikasi yang tepat. Tidak ada logika yang memaksa semua link ke browser eksternal.

## Catatan teknis

Project ini berbasis TanStack Start (stack tetap di Lovable). Agar kompatibel dengan Capacitor yang membutuhkan aset statis, halaman shell dibuat sepenuhnya client-side dan dipastikan menghasilkan `index.html` statis pada build; `webDir` Capacitor akan diarahkan ke folder output tersebut, dan langkah verifikasinya dijelaskan di panduan. Tidak ada Service Worker baru yang dibuat, tidak ada cache agresif terhadap situs remote.

## Keamanan

Tidak ada secret, API key, atau kredensial di project ini. `TARGET_URL` bersifat publik. Error teknis hanya dicatat ke console; user hanya melihat pesan ramah.

## Batasan yang jujur

Perubahan konten/UI di website Rekomendify tidak memerlukan rebuild APK. Perubahan native — plugin baru, permission Android, package ID, icon, splash screen — tetap memerlukan build dan rilis APK baru.
