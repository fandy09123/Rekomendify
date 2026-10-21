# Audit forensik dan pemulihan Cloudflare — Rekomendify

## A. Ringkasan masalah

Log Cloudflare 20 Oktober 2026 menunjukkan kegagalan pada `bun install --frozen-lockfile`, sebelum kompilasi aplikasi. Kegagalan yang sama berhasil direproduksi dengan Bun 1.2.15 menggunakan `package.json` dan `bun.lock` dari commit yang tersedia, `c2b7995`. Tiga spesifikasi dependency Capacitor berbeda antara manifest dan lockfile. Ini membuktikan masalah konsistensi repository; bukan bukti bahwa gambar menyebabkan kegagalan instalasi.

Commit persis dalam log, `03d3449ff26069d3565a4d649985f96e84817210`, tidak tersedia pada riwayat workspace. Oleh karena itu penyebab spesifik commit tersebut tidak bisa dipastikan hanya dari reproduksi commit lain.

## B. Hasil audit

- Diperiksa: `package.json`, kedua lockfile, `bunfig.toml`, `vite.config.ts`, `wrangler.jsonc`, `vercel.json`, `.gitignore`, `AGENTS.md`, konfigurasi TypeScript/lint, entry server/root/router, route konten, aset publik, riwayat Git yang tersedia, dan log pemeriksaan otomatis.
- Framework aktual: React 19 + TanStack Start, Vite 8.1.5, Nitro 3.0.260603-beta. Website memakai SSR/server functions; target APK terpisah melalui `CAP_BUILD=1`.
- Bun lokal 1.3.3; Node lokal 22.22.0. Log Cloudflare: Bun 1.2.15 dan Node 22.16.0.
- Preset Nitro `cloudflare-pages` yang terpasang mendefinisikan output `dist/` dan server `dist/_worker.js/`. Keterangan ini berasal dari implementasi preset, bukan hasil build Pages baru.
- Wrapper Lovable menimpa preset/output di sandbox. Hasil pemeriksaan Lovable tidak membuktikan artifact Cloudflare Pages.
- `.vercel/output` adalah artifact lama target Vercel; tidak digunakan sebagai bukti keberhasilan build terkini.
- Dashboard Cloudflare, branch production, root directory aktual, environment values, secrets, dan deployment remote tidak dapat diperiksa.

## C. Root cause

### Terkonfirmasi

1. Instalasi dalam log berhenti pada validasi lockfile.
2. Commit tersedia `c2b7995` memiliki perbedaan:
   - `@capacitor/core`: manifest `^7.6.9`, lock `^7`.
   - `@capacitor/status-bar`: manifest `^7.0.6`, lock `^7`.
   - `@capacitor/cli`: manifest `^7.6.9`, lock `^7`.
3. Reproduksi terisolasi menggunakan pasangan tersebut dan Bun 1.2.15 menghasilkan pesan frozen-lockfile yang sama.
4. Manifest workspace yang sudah diselaraskan dan lockfile Bun lolos frozen install, termasuk uji awal dengan Bun 1.2.15. Jadi perbedaan versi Bun sendiri belum terbukti menyebabkan error awal.
5. Lockfile npm usang: spesifikasi wrapper `^2.15.0` berbeda dari manifest `2.26.5`; entry paket npm mencatat versi wrapper lama `2.19.5`.
6. Wrangler menunjuk `.output/public`, sedangkan preset Pages terpasang mendefinisikan `dist`.

### Risiko lain

Externalisasi Leaflet pada build dapat meninggalkan import paket yang tidak dapat diselesaikan browser. Externalisasi dihapus; import dinamis browser yang sudah ada tetap dipakai.

### Belum terverifikasi

Isi commit gagal persis, alasan Wrangler disembunyikan pada commit tersebut, pengaturan dashboard, environment production, artifact SSR Pages baru, dan kondisi website live.

## D. Perubahan yang dilakukan

- `package.json`, `bun.lock`: satu jalur instalasi Bun, versi alat dinyatakan, dependency langsung diselaraskan. Tidak melakukan upgrade massal dependency lain.
- `package-lock.json`: dihapus karena usang; Bun menjadi lockfile otoritatif.
- `.node-version`: Node 22.22.0 untuk menyamakan lingkungan yang diuji.
- `vercel.json`: instalasi frozen Bun juga digunakan pada target Vercel; framework tetap sama.
- `wrangler.jsonc`: output Pages menjadi `dist`; `nodejs_compat` dipertahankan.
- `vite.config.ts`: hapus externalisasi Leaflet, pertahankan dynamic import, preset Pages/Vercel dan target APK.
- `scripts/deployment-config.test.mjs`: tes kesesuaian dependency/override dan output preset Pages.
- Metadata route publik/admin dilengkapi tanpa mengubah URL, tampilan, atau alur bisnis; metadata gambar hanya menerima URL HTTPS.
- `__root.tsx` dan tujuh route wilayah: error dinarrow dari `unknown`, sesuai kontrak paket saat ini; pesan Error normal tidak berubah.
- `AGENTS.md`: aturan konsistensi instalasi dan deployment; `roadmap.md`: status pekerjaan.

Database, RLS, secrets, konfigurasi native Android, VAPID, dan Service Worker tidak diubah.

## E. Hasil pengujian

| Pemeriksaan | Status | Bukti/batasan |
| --- | --- | --- |
| Reproduksi commit `c2b7995`, Bun 1.2.15 frozen | FAIL, diharapkan | Error frozen-lockfile identik; perbedaan spesifikasi teridentifikasi |
| Frozen install workspace Bun 1.3.3 | PASS | Tidak ada perubahan dependency diperlukan |
| Uji awal manifest/lockfile yang diselaraskan, Bun 1.2.15 | PASS | Sebelum pembaruan paket terakhir |
| Dua tes konfigurasi | PASS | `node --test scripts/deployment-config.test.mjs` |
| Pemeriksaan otomatis Lovable | PASS | Log terbaru `build OK`; bukan deployment Pages |
| Lint konfigurasi dan tes | PASS | `bunx eslint vite.config.ts scripts/deployment-config.test.mjs` |
| Lint seluruh repository | BLOCKED | Percobaan terhenti setelah timeout; lint terfokus route juga menemukan format/aturan lama, tidak dibereskan secara massal |
| Build produksi Pages manual | NOT RUN | Lingkungan ini mengandalkan pemeriksaan otomatis; tidak tersedia artifact Pages baru |
| Pemeriksaan artifact `dist/_worker.js` | NOT RUN | Direktori build Pages baru belum terbentuk |
| Browser `/`, `/explore`, `/scan`, `/auth`, icon, SW | PASS | HTTP 200, tidak ada page runtime error dalam pemeriksaan |
| Beranda → wilayah nyata | PASS | `/r/desa-wisata-mulyosari`, nama wilayah dan daftar lokasi terbaca, tanpa layar gagal muat |
| Login/admin yang terautentikasi | NOT RUN | Tidak dilakukan login; halaman masuk saja diperiksa |
| Foto lokasi remote | NOT RUN | Tidak semua foto tervalidasi; beberapa placeholder terlihat pada screenshot |
| Deployment Cloudflare remote | BLOCKED | Tidak ada akses dashboard/deployment |

## F. Pengaturan Cloudflare yang perlu diverifikasi

Untuk project **Pages** yang memakai repository ini (bukan project Workers), periksa Settings → Builds & deployments:

| Pengaturan | Nilai aktual dashboard | Nilai yang dituju |
| --- | --- | --- |
| Root directory | Tidak diketahui | Root repository; kosong atau `/` sesuai tampilan dashboard |
| Framework preset | Tidak diketahui | None/custom; aplikasi tetap TanStack Start SSR |
| Build command | Tidak diketahui | `bun run build` |
| Output directory | Tidak diketahui | `dist` |
| Bun | Log lama: 1.2.15 | `BUN_VERSION=1.3.3` |
| Node | Log lama: 22.16.0 | `NODE_VERSION=22.22.0` |
| Nitro target | Tidak diketahui | `NITRO_PRESET=cloudflare-pages` |
| Capacitor flag | Tidak diketahui | Jangan set `CAP_BUILD=1` untuk website |
| Vercel flag | Tidak diketahui | Jangan set `VERCEL` untuk Pages |
| Compatibility | Repository: `nodejs_compat` | Pertahankan |

Pertahankan frozen install. Jika automatic install masih memilih perintah lain, samakan dengan Bun pinned dan `bun install --frozen-lockfile`; jangan menggantinya dengan instalasi non-deterministik.

Environment source yang perlu dicocokkan dengan deployment lama: `SUPABASE_URL`/`VITE_SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`/`VITE_SUPABASE_PUBLISHABLE_KEY`, dan `SUPABASE_SERVICE_ROLE_KEY` untuk fungsi privileged. Jangan mengisi service-role pada `VITE_*`. Konfigurasi push dan secrets existing harus dipertahankan; keberadaan/nilai production belum diverifikasi. Override tenant `.env.example` tetap opsional untuk proses APK/tenant, bukan bukti kebutuhan build Pages.

## G. Langkah deployment berikutnya

1. Pastikan perubahan workspace tersinkron ke branch GitHub yang digunakan Pages: manifest, Bun lockfile, penghapusan npm lockfile, config, versi Node, tes, serta penyesuaian route.
2. Cocokkan pengaturan di bagian F; jangan mengubah project live ke Workers atau static-only.
3. Jalankan deployment preview branch terlebih dahulu. Pastikan log mencantumkan Bun 1.3.3, frozen install berhasil, `bun run build` berhasil, serta output SSR `dist/_worker.js` dan aset tersedia.
4. Verifikasi URL preview: beranda, wilayah, detail lokasi, refresh deep-link, login/admin, gambar, dan fungsi server. Jangan hanya memeriksa upload artifact.
5. Setelah preview lolos, redeploy branch production dan verifikasi URL live serta log runtime Cloudflare.
6. Jika error baru muncul, lanjutkan dari log tahap tersebut. Jangan kembali menghapus Wrangler atau menghilangkan frozen flag.

Tidak ada git push, pemicu deploy, ataupun perubahan dashboard yang dilakukan dari workspace ini.

## H. Status akhir

**PARTIALLY FIXED** — instalasi diperbaiki dan lolos tes; konfigurasi Pages diselaraskan dengan preset yang terpasang dan aplikasi lokal terbaca. Build produksi Pages, artifact SSR, dan deployment remote tetap menunggu verifikasi di Cloudflare. Ini belum memenuhi syarat FIXED AND VERIFIED.