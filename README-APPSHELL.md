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

## 1. Konfigurasi tenant (satu-satunya tempat yang diubah)

`tenant.config.json` di root project:

```json
{
  "villageSlug": "mulyosari",
  "villageName": "Desa Mulyosari",
  "appName": "Desa Mulyosari",
  "appId": "com.rekomendify.desamulyosari",
  "targetUrl": "https://www.rekomendify.com/r/desa-wisata-mulyosari"
}
```

Setelah mengubahnya jalankan:

```bash
npm run sync-tenant             # tulis perubahan
npm run sync-tenant -- --dry-run  # lihat file yang akan berubah, tanpa menulis
```

Script menyinkronkan identitas tenant ke: `src/tenant.generated.ts` (dipakai `src/config.ts`,
App Shell, dan shell statis APK), blok `TENANT_CONFIG` di `capacitor.config.ts`, blok
`TENANT_CONFIG` di `android/app/build.gradle` (`namespace` + `applicationId`),
`android/app/src/main/res/values/strings.xml`, serta direktori + deklarasi `package` Java
`MainActivity` dan konstanta `TRUSTED_HOST_SUFFIX`.

Override lokal opsional: buat `.env` (lihat `.env.example`) dengan `VILLAGE_SLUG`,
`VILLAGE_NAME`, `APP_NAME`, `APP_ID`, `TARGET_URL`. Prioritas: `process.env` > `.env` >
`tenant.config.json`. Semua nilai ini bersifat publik/build-time — **jangan** pernah menaruh
secret, API key, atau keystore password di sana. Tidak ada form/settings/localStorage yang bisa
mengubah URL dari sisi user; tenant adalah build-time config, bukan pilihan runtime.

Validasi wajib lolos sebelum satu file pun ditulis: slug lowercase/`-`, `APP_NAME` 2–30
karakter, `APP_ID` package Java valid (lowercase, ≥2 segmen, bukan keyword), `TARGET_URL`
wajib `https://`. Bila struktur file target tidak sesuai (marker hilang, dua `MainActivity`,
dsb.) script berhenti dengan pesan jelas dan **tidak** mengubah file apa pun. Tidak ada file
`.bak` — periksa hasilnya dengan `git diff`.

### Membuat APK desa baru

```bash
# 1) ubah tenant.config.json (atau .env)
npm run sync-tenant
git diff                    # periksa perubahan identitas
npm run build:capacitor     # sudah menjalankan sync-tenant otomatis
npx cap sync android
cd android && ./gradlew assembleDebug     # Windows: .\gradlew.bat assembleDebug
```

Catatan: mengubah `appId` = aplikasi Android yang berbeda (APK/listing Play Store baru).
Icon & splash screen tetap aset per-desa yang diganti manual di `android/app/src/main/res`.

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

---

## Native permissions & Muat Ulang (lapisan native)

Semua kapabilitas hardware ditangani di `android/app/src/main/java/.../MainActivity.java`.
Website Rekomendify tetap menjadi pemilik seluruh business logic (QR, peta, konten).

### Permission (least privilege)

`AndroidManifest.xml` hanya mendeklarasikan: `INTERNET`, `ACCESS_NETWORK_STATE`,
`CAMERA`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `POST_NOTIFICATIONS`.
Kamera & GPS dideklarasikan `uses-feature ... required="false"`.

Tidak ada permission yang diminta saat startup. Alurnya:

```text
Halaman web meminta kamera (Scan QR)
  -> WebChromeClient.onPermissionRequest()
  -> origin diperiksa (harus https://*.rekomendify.com)
  -> hanya RESOURCE_VIDEO_CAPTURE yang dipertimbangkan (mikrofon selalu deny)
  -> runtime permission CAMERA diminta bila belum ada
  -> hasil runtime -> PermissionRequest.grant([camera]) / deny()

Halaman web meminta lokasi (Terdekat)
  -> onGeolocationPermissionsShowPrompt(origin, callback)
  -> origin diperiksa -> runtime permission FINE/COARSE_LOCATION
  -> callback.invoke(origin, granted, false)
```

Notifikasi diminta hanya lewat bridge (saat user mengaktifkan fiturnya). Jika user
sudah menolak permanen, tidak ada prompt native lagi — aplikasi membuka
pengaturan sistem. Tidak ada implementasi FCM baru pada tahap ini.

### Bridge untuk halaman "Privasi & Izin"

Tersedia di WebView sebagai `window.AndroidShell` (hanya untuk origin rekomendify.com):

```js
AndroidShell.getPermissionStatus()
// {"platform":"android","camera":"granted|denied|prompt","location":...,"notifications":...}
AndroidShell.requestCameraPermission()
AndroidShell.requestLocationPermission()
AndroidShell.requestNotificationPermission()
AndroidShell.openAppSettings()
AndroidShell.reload()
```

Saat aplikasi kembali foreground, native memicu event
`androidshell:permissionschanged` sehingga halaman dapat membaca ulang status
(mis. setelah user mengubah izin dari Android Settings). Status tidak pernah
dipalsukan: bila `window.AndroidShell` tidak ada, gunakan Permissions API browser.

Helper TypeScript untuk sisi web: `src/lib/capacitor-shell.ts`.

### Muat Ulang

Tekan tombol Back Android saat berada di halaman paling awal (tidak ada history):
muncul dialog native **Muat Ulang / Keluar / Batal**. `Muat Ulang` menjalankan
`webView.reload()` — setara refresh browser: URL saat ini dipertahankan, App Shell
tidak dijalankan ulang, dan cookie/localStorage/IndexedDB/cache tidak dihapus.
Website juga dapat memanggil `AndroidShell.reload()` dari menunya sendiri.
Tidak ada overlay tombol permanen di atas UI Rekomendify.
