# Rekomendify App Shell — Panduan Developer

App Shell tipis yang dibungkus menjadi APK Android dengan Capacitor. Konten utama tetap berasal
dari website Rekomendify.

```text
Android APK
   ↓
Capacitor (WebView + plugin native)
   ↓
App Shell  (loading → cek koneksi → redirect)
   ↓
https://www.rekomendify.com/r/desa-wisata-mulyosari
```

---

## 1. Konfigurasi (satu-satunya tempat yang diubah)

`src/config.ts`

```ts
export const APP_CONFIG = {
  TARGET_URL: "https://www.rekomendify.com/r/desa-wisata-mulyosari",
  VILLAGE_NAME: "Desa Mulyosari",
};
```

Semua teks (loading, offline, judul halaman) dan logika redirect membaca dari file ini —
termasuk shell statis yang dibundel ke APK. Tidak ada form/settings/localStorage yang bisa
mengubah URL dari sisi user.

---

## 2. Menjalankan di komputer (VS Code)

```bash
npm install
npm run dev      # buka http://localhost:8080
npm run build    # build web (SSR/hosting)
```

---

## 3. Build folder statis untuk Capacitor

```bash
npm run build:capacitor
```

Perintah ini menjalankan `vite build`, lalu `scripts/build-capacitor-shell.mjs` yang
menghasilkan folder statis:

```text
dist/capacitor/
  index.html        <- App Shell (loading / offline / redirect)
  assets/*.css      <- CSS Tailwind hasil build
  favicon.ico
```

Folder inilah yang dibundel ke APK (`webDir` di `capacitor.config.ts`). Isinya hanya beberapa
KB: satu HTML + satu CSS, tanpa framework di dalam APK.

> Kenapa terpisah dari `dist/client`? Build web project ini adalah build server-rendered,
> sedangkan Capacitor butuh `index.html` statis yang bisa dibuka dari dalam APK.

---

## 4. Membuat APK lewat Terminal VS Code

Prasyarat: **JDK 17**, **Android SDK** (`ANDROID_HOME` / `ANDROID_SDK_ROOT` sudah di-set),
Node 20+.

```bash
# 1) Siapkan folder statis
npm run build:capacitor

# 2) Inisialisasi Capacitor (sekali saja)
#    Nilai default sudah ada di capacitor.config.ts — ganti dulu appId/appName di sana
#    bila Anda memakai identitas lain. appId TIDAK bisa diubah setelah rilis di Play Store.
npx cap init

# 3) Tambahkan platform Android (sekali saja) -> membuat folder android/
npx cap add android

# 4) Salin hasil build web ke project Android (ulangi setiap kali web berubah)
npx cap sync android

# 5) Build APK debug
cd android
./gradlew assembleDebug          # macOS / Linux
```

Di **Windows (PowerShell/CMD)** gunakan:

```powershell
.\gradlew.bat assembleDebug
```

Hasil APK biasanya berada di:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Jika struktur Gradle berbeda, cari file `.apk` di dalam `android/app/build/outputs/`.
Untuk rilis Play Store gunakan `bundleRelease` (AAB) dengan keystore Anda sendiri:

```bash
./gradlew bundleRelease
```

Install ke HP yang terhubung:

```bash
npx cap run android
# atau
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 5. Identitas aplikasi Android (setelah `npx cap add android`)

| Yang diatur              | Lokasi                                                     |
| ------------------------ | ---------------------------------------------------------- |
| App Name                 | `capacitor.config.ts` → `appName`, lalu `android/app/src/main/res/values/strings.xml` |
| Package ID               | `capacitor.config.ts` → `appId` (set **sebelum** `cap add android`) |
| Version Name / Code      | `android/app/build.gradle` (`versionName`, `versionCode`)   |
| App Icon                 | `android/app/src/main/res/mipmap-*` (mudah dibuat dengan Android Studio → Image Asset, atau paket `@capacitor/assets`) |
| Splash Screen            | plugin `@capacitor/splash-screen` + resource `res/drawable` |

Contoh identitas (boleh diganti): App Name `Desa Mulyosari`, Package ID
`com.rekomendify.desamulyosari`.

---

## 6. Cara kerja teknis

**Startup**: shell tampil → cek `navigator.onLine` → satu request ringan ber-timeout 6 detik ke
`TARGET_URL` (`mode: no-cors`, `cache: no-store`) → jika berhasil, `location.replace(TARGET_URL)`.
`replace` dipakai agar shell tidak masuk ke history, sehingga tombol Back tidak memantul kembali
ke launcher. Ada guard `redirected` supaya tidak pernah terjadi redirect/reload berulang.

**Offline / error**: satu layar ramah "Koneksi Terputus" + tombol **Coba Lagi** yang mengulang
pemeriksaan. Jika koneksi kembali (event `online`), percobaan diulang otomatis. Tidak ada blank
screen, infinite loading, maupun pesan teknis seperti `ERR_NAME_NOT_RESOLVED` — error hanya
dicatat ke `console` untuk developer.

**Tombol Back Android**: listener `App.addListener('backButton')` dari `@capacitor/app`. Jika
`canGoBack` → `history.back()`; jika tidak ada history → `App.exitApp()`. Tidak ada
`history.back()` membabi buta, jadi aplikasi selalu bisa ditutup.

**Navigasi & link eksternal**: `server.allowNavigation` di `capacitor.config.ts` menjaga semua
halaman `rekomendify.com` tetap di dalam WebView. Skema non-http (`tel:`, `mailto:`,
`whatsapp:`, `geo:`, `intent:`) dan domain lain diserahkan ke Android agar dibuka aplikasi yang
tepat — tidak ada logika yang memaksa semua link ke browser eksternal.

**Keamanan**: tidak ada secret, API key, atau kredensial di project ini. `TARGET_URL` bersifat
publik. Tidak ada backend, database, autentikasi, maupun admin panel.

**Service Worker**: App Shell tidak mendaftarkan Service Worker apa pun, agar tidak berkonflik
dengan PWA/Service Worker milik Rekomendify.

---

## 7. Model maintenance

- Perubahan konten/UI di website Rekomendify → **tidak perlu rebuild APK**; user cukup membuka
  aplikasi lagi dan mendapatkan versi terbaru.
- Perubahan pada shell (teks loading, `TARGET_URL`), plugin native baru, permission Android
  baru, package ID, icon, atau splash screen → **butuh `npm run build:capacitor` +
  `npx cap sync android` + build & rilis APK baru**.
