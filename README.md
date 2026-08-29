# Rekomendify Link

# PROJECT TASK

# Rekomendify — Web App Shell / Capacitor Android Wrapper

Bertindak sebagai **Senior Frontend Developer sekaligus Senior PWA/Web Architecture Engineer**.

Saya ingin membuat sebuah **project web baru yang sepenuhnya terpisah dari Rekomendify**.

Project ini bukan pengembangan fitur Rekomendify.

Fungsi project ini adalah menjadi **lightweight Web App Shell / Launcher** yang nantinya akan dibungkus menjadi **Android APK menggunakan CapacitorJS**.

Tujuan bisnisnya:

> Membuat APK Android dengan nama aplikasi, icon, package identity, dan lifecycle aplikasi sendiri, tetapi konten utama tetap berasal dari website Rekomendify.

Dengan arsitektur ini:

```text
Android APK
     ↓
Capacitor
     ↓
App Shell / Launcher
     ↓
Website Rekomendify
     ↓
https://www.rekomendify.com/r/desa-wisata-mulyosari
```

Keuntungan yang diinginkan:

* APK tidak perlu dibangun ulang setiap kali konten website berubah.
* Update konten utama dilakukan melalui website.
* APK berfungsi sebagai container/app shell yang relatif stabil.
* Developer dapat merawat website tanpa harus selalu menyentuh project Android.
* APK nantinya dapat memiliki nama aplikasi dan icon sendiri.
* Project dapat dikembangkan lebih lanjut untuk distribusi Google Play Store.

---

# ⚠️ PRINSIP PALING PENTING

Apa yang tertulis di prompt ini adalah **initial requirement**, bukan alasan untuk mengabaikan best practice.

Gunakan penilaian engineering Anda.

Jika terdapat pendekatan yang lebih aman, lebih stabil, lebih kompatibel dengan Capacitor, atau lebih sesuai dengan Android modern, gunakan pendekatan tersebut.

Namun:

> **Jangan mengubah tujuan arsitektur hanya karena terdapat alternatif teknis.**

Prioritas:

1. Stabilitas
2. Simplicity
3. Mobile-first UX
4. Capacitor compatibility
5. Maintainability
6. Security
7. Easy deployment
8. Minimal unnecessary dependencies

Jangan membuat backend untuk project ini.

Jangan membuat database.

Jangan membuat authentication.

Jangan membuat Supabase.

Jangan membuat sistem admin.

Jangan memasukkan business logic Rekomendify ke project ini.

Project ini harus tetap menjadi **thin App Shell**.

---

# 1. TECH STACK

Gunakan:

* React
* Vite
* TypeScript
* Tailwind CSS
* CapacitorJS-compatible architecture

Gunakan struktur project yang bersih dan mudah dibuka melalui VS Code.

Pastikan:

```text
npm install
npm run dev
npm run build
```

dapat berjalan dengan baik.

Project harus menghasilkan build production yang kompatibel dengan Capacitor.

---

# 2. SINGLE SOURCE OF CONFIGURATION

Buat file:

```text
src/config.ts
```

Isi awal:

```ts
export const APP_CONFIG = {
  TARGET_URL: "https://www.rekomendify.com/r/desa-wisata-mulyosari",
  VILLAGE_NAME: "Desa Mulyosari",
};
```

File ini menjadi **single source of truth** untuk informasi target aplikasi.

Seluruh bagian berikut harus membaca konfigurasi dari `APP_CONFIG`:

* target URL
* loading screen
* offline screen
* header
* error state
* informasi desa
* logic navigasi yang berkaitan dengan target.

Jangan hard-code URL yang sama di banyak file.

---

# 3. URL TIDAK BOLEH DAPAT DIUBAH USER

Jangan membuat:

* form URL
* settings URL
* input URL
* tombol mengganti website
* konfigurasi URL dari localStorage
* konfigurasi URL dari query parameter user.

URL hanya dapat diubah oleh developer melalui:

```text
src/config.ts
```

User tidak boleh dapat mengubah target website melalui HP.

---

# 4. APP STARTUP FLOW

Ketika App Shell dibuka:

```text
App start
   ↓
Load configuration
   ↓
Check network availability
   ↓
Jika online
   ↓
Load / redirect ke TARGET_URL
```

Gunakan pendekatan yang paling kompatibel dengan:

* browser
* Capacitor Android WebView
* Android lifecycle.

Jika `window.location.href` memang merupakan pendekatan terbaik untuk arsitektur ini, gunakan.

Namun jangan memaksakan `window.location.href` apabila hasil audit menunjukkan terdapat mekanisme navigasi yang lebih tepat untuk Capacitor.

Tujuan akhirnya adalah:

> User tidak merasa sedang membuka launcher terpisah. User langsung masuk ke Rekomendify.

---

# 5. LOADING SCREEN

Saat website target sedang dipersiapkan, tampilkan loading screen yang sederhana.

Contoh:

```text
Desa Mulyosari

Menyiapkan aplikasi...

[ loading indicator ]
```

Gunakan:

```text
APP_CONFIG.VILLAGE_NAME
```

Jangan hard-code nama desa di component.

Loading harus:

* ringan
* cepat
* mobile-first
* tidak berlebihan
* tidak membuat user menunggu tanpa informasi.

---

# 6. NETWORK / OFFLINE HANDLING

Gunakan:

```text
navigator.onLine
```

serta:

```text
online
offline
```

events sebagai indikator perubahan koneksi.

Namun jangan menganggap `navigator.onLine === true` sebagai bukti bahwa internet benar-benar dapat mengakses server.

Jika diperlukan, gunakan pendekatan ringan untuk melakukan connectivity check terhadap target/server.

Jangan membuat sistem network monitoring yang kompleks.

Jika aplikasi tidak dapat mengakses website target karena koneksi gagal, tampilkan:

```text
Koneksi Terputus

Koneksi internet terputus.
Harap periksa jaringan Anda.

[ Coba Lagi ]
```

Nama desa:

```text
APP_CONFIG.VILLAGE_NAME
```

Tombol:

```text
window.location.reload()
```

atau mekanisme reload yang paling sesuai berdasarkan implementasi final.

---

# 7. ERROR HANDLING

Jika website target gagal dimuat:

Jangan membuat:

* blank screen
* infinite loading
* infinite redirect
* crash.

Tampilkan fallback UI yang ramah.

Contoh:

```text
Aplikasi belum dapat terhubung.

Periksa koneksi internet Anda lalu coba lagi.

[ Coba Lagi ]
```

Jangan menampilkan error teknis kepada user biasa seperti:

```text
ERR_CONNECTION_RESET
ERR_NAME_NOT_RESOLVED
CapacitorException
WebView error code -2
```

Error teknis boleh dicatat melalui console hanya untuk developer.

---

# 8. ANDROID BACK BUTTON / GESTURE

Gunakan integrasi Capacitor:

```text
@capacitor/app
```

Gunakan:

```text
App.addListener('backButton', ...)
```

Tujuannya:

```text
Android Back
     ↓
Jika WebView memiliki history
     ↓
kembali ke halaman web sebelumnya
```

Jangan langsung menutup aplikasi apabila masih terdapat navigation history.

Namun gunakan mekanisme yang aman.

Jangan membuat:

```text
history.back()
```

secara membabi buta ketika history kosong.

Jika tidak ada history yang dapat digunakan, gunakan perilaku Android/Capacitor yang paling sesuai untuk keluar dari aplikasi.

Pastikan tidak terjadi:

* infinite back loop
* navigation error
* aplikasi tidak dapat ditutup sama sekali.

---

# 9. REMOTE WEBSITE ARCHITECTURE

Konten utama aplikasi berasal dari:

```text
APP_CONFIG.TARGET_URL
```

Jangan menduplikasi website Rekomendify ke dalam project ini.

Jangan melakukan:

```text
copy source Rekomendify
```

ke project App Shell.

Jangan membuat clone frontend Rekomendify.

Project ini hanya menjadi container.

Arsitektur yang diinginkan:

```text
APK
│
├── Capacitor
│
└── App Shell
       │
       └── Remote Rekomendify Website
```

Dengan demikian perubahan UI/content Rekomendify dapat dilakukan di server/web tanpa harus membangun ulang APK untuk setiap perubahan website.

---

# 10. EXTERNAL LINK & NAVIGATION POLICY

Audit kebutuhan navigasi website.

Pastikan link internal Rekomendify tetap berada di dalam pengalaman aplikasi.

Untuk link yang memang seharusnya membuka aplikasi eksternal, seperti:

* WhatsApp
* telepon
* email
* Google Maps
* browser eksternal

gunakan pendekatan yang kompatibel dengan Android/Capacitor.

Jangan membuat semua link otomatis membuka browser eksternal.

Sebaliknya, jangan sampai link eksternal yang memang membutuhkan aplikasi lain menjadi rusak.

Gunakan best practice berdasarkan kemampuan Capacitor dan Android WebView.

---

# 11. SECURITY

App Shell ini tidak membutuhkan secret.

Jangan memasukkan:

* API key private
* VAPID private key
* Supabase service role key
* database credentials
* secret token.

Semua konfigurasi frontend harus dianggap public.

`TARGET_URL` bukan secret.

Jangan membuat backend hanya untuk redirect sederhana.

---

# 12. PERFORMANCE

Project harus sangat ringan.

Hindari dependency yang tidak diperlukan.

Target:

```text
Fast startup
Small bundle
Minimal JavaScript
Minimal network request
```

Jangan memasukkan framework besar yang tidak diperlukan.

Gunakan lazy loading hanya apabila memang memberikan manfaat.

---

# 13. UI DESIGN

Gunakan Tailwind CSS.

Mobile-first.

Desain harus:

* sederhana
* modern
* bersih
* responsive
* tidak ramai
* cepat dirender.

Launcher bukan dashboard.

Jangan membuat banyak menu.

User pada dasarnya hanya perlu:

```text
Buka aplikasi
↓
Loading sebentar
↓
Masuk Rekomendify
```

Loading/offline/error state harus menjadi bagian utama UI.

---

# 14. CAPACITOR READINESS

Project harus disiapkan agar nantinya dapat digunakan dengan:

```text
CapacitorJS
```

Jangan berpura-pura bahwa web project sudah menjadi APK.

Jika Capacitor belum ditambahkan karena environment Lovable hanya mengerjakan frontend, siapkan project agar developer dapat menjalankan:

```bash
npm install @capacitor/core @capacitor/cli
```

dan kemudian:

```bash
npx cap init
npx cap add android
```

tanpa harus melakukan refactor besar.

---

# 15. ANDROID APP IDENTITY

Jangan membuat konfigurasi Android yang tidak diperlukan pada tahap frontend.

Namun struktur project harus memungkinkan developer nantinya mengatur:

```text
App Name
Package ID
Version Name
Version Code
App Icon
Splash Screen
```

Contoh konsep:

```text
App Name:
Desa Mulyosari

Package ID:
com.rekomendify.desamulyosari
```

**Catatan:**

Package ID di atas hanya contoh dan tidak harus digunakan apabila developer nantinya memilih identifier lain.

Jangan mengubah atau membuat package ID secara sembarangan pada tahap frontend.

---

# 16. PLAY STORE MAINTENANCE MODEL

Arsitektur harus mendukung model maintenance:

```text
APK
 ↓
Capacitor App Shell
 ↓
Remote Website
 ↓
Rekomendify
```

Contoh:

Developer mengubah:

```text
Website Rekomendify
```

maka:

```text
Website berubah
       ↓
User membuka APK
       ↓
APK memuat website terbaru
```

Tidak perlu rebuild APK untuk perubahan website yang hanya terjadi pada remote web content.

Namun pahami bahwa perubahan yang membutuhkan perubahan native Android tetap membutuhkan update APK.

Contohnya:

* native plugin baru
* permission Android baru
* perubahan package identity
* perubahan native functionality
* perubahan konfigurasi Android.

Jangan membuat klaim bahwa **semua** perubahan aplikasi dapat dilakukan tanpa update APK.

---

# 17. PWA vs APK

Project ini tidak dimaksudkan untuk menggantikan PWA Rekomendify.

Pisahkan:

```text
REKOMENDIFY
=
Website/PWA utama
```

dengan:

```text
APP SHELL
=
Container Android menggunakan Capacitor
```

Jangan mencampurkan Service Worker PWA Rekomendify ke dalam App Shell tanpa alasan teknis.

Audit bagaimana remote website bekerja di dalam Capacitor WebView dan jangan membuat Service Worker tambahan yang berpotensi konflik.

---

# 18. FAILURE SAFETY

Jika TARGET_URL berubah atau website sedang down:

App Shell tidak boleh crash.

Tampilkan fallback:

```text
Desa Mulyosari

Aplikasi sedang tidak dapat terhubung.

Silakan periksa koneksi internet Anda.

[ Coba Lagi ]
```

---

# 19. DEVELOPMENT EXPERIENCE

Pastikan project nyaman digunakan melalui VS Code.

Developer harus dapat menjalankan:

```bash
npm install
npm run dev
```

dan:

```bash
npm run build
```

tanpa error TypeScript.

Jika terdapat lint/type error, perbaiki.

Jangan meninggalkan placeholder code yang menyebabkan build gagal.

---

# 20. FINAL ACCEPTANCE TEST

Pastikan skenario berikut terpenuhi.

### TEST A — Online

```text
Buka App Shell
↓
Internet tersedia
↓
TARGET_URL dibuka
↓
Rekomendify tampil
```

### TEST B — Offline

```text
Buka App Shell
↓
Internet tidak tersedia
↓
Offline UI tampil
```

### TEST C — Retry

```text
Offline UI
↓
Coba Lagi
↓
Internet kembali
↓
Website dicoba kembali
```

### TEST D — Android Back

```text
Buka Rekomendify
↓
Navigasi ke halaman lain
↓
Android Back
↓
Kembali ke halaman sebelumnya
```

Jika tidak ada history:

```text
Android Back
↓
Perilaku exit Android normal
```

### TEST E — Remote Website Update

Developer mengubah website Rekomendify.

APK tidak diubah.

User membuka APK kembali.

Expected:

```text
APK tetap sama
↓
Remote website dimuat
↓
User mendapatkan website terbaru
```

### TEST F — Build

Pastikan:

```bash
npm run build
```

berhasil tanpa error.

---

# 21. OUTPUT SETELAH CODING

Setelah implementasi selesai, jangan hanya mengatakan "selesai".

Berikan laporan:

### A. Struktur

File utama yang dibuat/diubah.

### B. Arsitektur

Jelaskan secara sederhana:

```text
APK
 ↓
Capacitor
 ↓
App Shell
 ↓
Remote Rekomendify
```

### C. Configuration

Jelaskan bagaimana `src/config.ts` menjadi single source of truth.

### D. Network

Jelaskan bagaimana online/offline detection bekerja.

### E. Android Back

Jelaskan bagaimana Capacitor menangani tombol Back.

### F. Security

Pastikan tidak ada secret yang dimasukkan ke frontend.

### G. Build readiness

Pastikan:

```bash
npm run build
```

berhasil.

### H. Capacitor

Berikan langkah berikutnya untuk developer manusia setelah frontend selesai.

---

# 22. PANDUAN BUILD APK VIA VS CODE TERMINAL

Setelah coding selesai, berikan panduan sederhana dalam Bahasa Indonesia.

Target saya adalah membangun APK melalui **Terminal VS Code**, tanpa harus membuka GUI Android Studio untuk proses build.

Gunakan alur:

```text
Frontend selesai
       ↓
npm run build
       ↓
install Capacitor
       ↓
npx cap init
       ↓
npx cap add android
       ↓
npx cap sync android
       ↓
cd android
       ↓
./gradlew assembleDebug
```

Jelaskan setiap langkah dengan bahasa sederhana.

Jika environment Windows menggunakan PowerShell/CMD dan perintah:

```bash
./gradlew assembleDebug
```

tidak bekerja, berikan alternatif Windows yang sesuai, misalnya:

```powershell
.\gradlew.bat assembleDebug
```

Jelaskan lokasi APK hasil build.

Contoh lokasi yang kemungkinan digunakan:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Namun jangan mengklaim path tersebut secara mutlak apabila struktur Gradle aktual berbeda.

---

# 23. HAL YANG DILARANG

Jangan:

* membuat backend
* membuat database
* membuat Supabase
* membuat authentication
* membuat admin panel
* membuat URL editor
* membuat settings URL
* memasukkan secret
* clone Rekomendify
* mengubah source Rekomendify
* membuat Service Worker baru tanpa alasan
* membuat sistem update website sendiri yang tidak diperlukan
* membuat cache agresif terhadap remote website
* membuat offline copy seluruh Rekomendify
* membuat APK installer di dalam web
* membuat mekanisme uninstall/reinstall
* membuat infinite redirect
* membuat infinite reload
* membuat dependency yang tidak diperlukan.

---

# 24. ENGINEERING PRINCIPLE

Jangan menganggap prompt ini sebagai spesifikasi yang harus diikuti secara literal jika terdapat konflik dengan best practice.

Gunakan prinsip:

> **Audit → Design → Implement → Verify**

Jika terdapat bagian yang secara teknis lebih tepat dilakukan oleh Capacitor/native Android daripada frontend React, jangan memaksakannya ke React.

Jika terdapat bagian yang lebih tepat dilakukan di tahap konfigurasi Android setelah `npx cap add android`, jelaskan dan jangan membuat workaround frontend.

Jika terdapat potensi masalah dengan remote website di Android WebView, identifikasi dan gunakan pendekatan yang paling stabil.

---

# HASIL AKHIR YANG DIINGINKAN

Saya ingin memiliki project frontend baru yang secara konsep sesederhana:

```text
                    ┌──────────────────────┐
                    │     Android APK      │
                    │                      │
                    │      Capacitor       │
                    │          ↓           │
                    │      App Shell       │
                    │          ↓           │
                    │   Remote Rekomendify │
                    └──────────┬───────────┘
                               ↓
              https://www.rekomendify.com/
                 r/desa-wisata-mulyosari
```

APK harus menjadi **container yang ringan dan stabil**, sedangkan Rekomendify tetap menjadi aplikasi/web utama.

Tujuan akhirnya:

> **Update website = tidak perlu rebuild APK untuk perubahan web biasa.**

Tetapi:

> **Perubahan native Android = tetap membutuhkan update APK.**

Gunakan arsitektur best practice dan perubahan seminimal mungkin.

**Jangan membangun sistem yang lebih kompleks daripada masalah yang ingin diselesaikan.**

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/e989073b-ba95-4c9a-ba91-ecf6f7b9d1aa).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
