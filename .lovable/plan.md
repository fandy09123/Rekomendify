
# Sprint Audit & Stabilisasi Rekomendify

Ruang lingkup permintaan sangat luas (audit end-to-end + lanjut fitur). Saya membaginya menjadi 5 fase yang bisa dieksekusi berurutan. Setiap fase menghasilkan aplikasi yang tetap jalan sebelum lanjut ke fase berikutnya. Saya akan menyampaikan laporan hasil setelah tiap fase, bukan hanya di akhir, karena sprint sepanjang ini terlalu berisiko dikerjakan tanpa checkpoint.

## Fase 1 — Regression fix: Upload gambar & Storage

Temuan awal dari audit:

- `src/lib/upload.functions.ts` mengirim base64 lewat JSON RPC. Setelah pengetatan (magic-byte + admin-only), payload besar (>~4 MB base64) berisiko gagal di Worker karena batas body dan alokasi memori. Selain itu bucket `IMAGE` diakses lewat `supabaseAdmin`, sehingga kolom `owner` di `storage.objects` menjadi `NULL` → policy `owner = auth.uid()` untuk UPDATE/DELETE membuat admin tidak bisa mengganti/menghapus gambar sendiri di kemudian hari.
- Bucket public tetapi tidak ada SELECT policy untuk role `anon` (bucket public bypass RLS SELECT — OK), namun tidak ada INSERT policy sama sekali; upload hanya lewat service role. Ini menutup jalur direct-upload dari client.
- `SUPABASE_SERVICE_ROLE_KEY` tidak tersedia di env preview lokal saat ini (hanya di runtime published). Ini menjelaskan "upload gagal" di preview.

Perbaikan:

1. Kembalikan upload ke **direct upload dari client** dengan session admin, guarded oleh RLS Storage yang ketat:
   - Policy INSERT: hanya admin aktif (via `private.is_active_admin`) dengan path `regions/{region_id}/…` dan ekstensi whitelist.
   - Simpan `owner = auth.uid()` otomatis (client upload) → policy UPDATE/DELETE `owner = auth.uid()` tetap bekerja.
2. `uploadImage` server fn dipertahankan hanya sebagai **fallback / validasi opsional**, tidak lagi jalur utama. Ini menghapus dependensi service-role di preview dan menghilangkan bottleneck base64.
3. Validasi ekstensi + magic byte dijalankan client-side sebelum upload; server-side dijaga oleh RLS + storage policy (mime whitelist).
4. Tambah tombol "hapus" yang menggunakan client session (bukan admin), sehingga policy DELETE bekerja.

## Fase 2 — Audit Auth, Middleware, Server Functions

- Verifikasi `src/start.ts` (CSRF middleware saat ini masih aktif — konfirmasi kompatibel dengan versi TanStack yang terpasang; kalau tidak, ganti dengan proteksi origin manual).
- Audit semua `.functions.ts` untuk: input validation, ownership check, cross-region leak (`assignQr` sudah aman; cek `saveLocation`, `saveInfoPost`, `saveCategory`, `releaseQr`, `deleteLocation`, `deleteInfoPost`, `deleteCategory` — pastikan `region_id` target = region admin).
- Konfirmasi jalur `_authenticated` gate + `attachSupabaseAuth` bearer masih berfungsi setelah update dependency.

## Fase 3 — Audit DB, RLS, Trigger, Constraint

- Cek trigger `handle_new_user` (baru → non-aktif) masih benar.
- Cek policy `qr_assets` / `qr_assignments` — apakah QR "hanya aktif saat ter-assign" (`tg_qr_sync_status`) masih jalan.
- Cek analytics: `visits.qr_assignment_id` menyimpan snapshot sehingga rotasi QR tidak mencampur analytics lama. Bila belum, tambah kolom `location_id` denormalized di `visits` (sudah ada) → aman.
- Cek constraint `gmaps_url` (^https?://), unique slug region, dsb.

## Fase 4 — Audit Frontend end-to-end

- Semua rute: `/`, `/auth`, `/explore`, `/scan`, `/saved`, `/settings`, `/messages`, `/r/$slug`, `/r/$slug_/…`, `/q/$code`, `/_authenticated/admin.*`.
- Loading / error / empty state, mobile layout, PWA install banner, redirect wilayah terakhir.
- Verifikasi form admin (Location, Category, Info Post, Region) semua submit → refresh berjalan.

## Fase 5 — Lanjut roadmap

Setelah stabil, lanjut item roadmap yang belum selesai (prioritas dari `.lovable/plan.md`):
- Cetak PDF QR batch (untuk regional admin).
- Filter kategori + pencarian di halaman wilayah.
- Ringkasan analitik yang mudah dibaca admin (harian / lokasi teratas).
- Polishing PWA offline shell.

## Detail teknis kunci (Fase 1)

```text
storage.objects INSERT policy (IMAGE bucket)
  bucket_id = 'IMAGE'
  AND private.is_active_admin(auth.uid())
  AND (storage.extension(name) IN ('jpg','jpeg','png','webp','gif'))
  AND (position('regions/' in name) = 1)   // enforce prefix

Client upload:
  supabase.storage.from('IMAGE').upload(
    `regions/${regionId}/${crypto.randomUUID()}.${ext}`,
    file,
    { contentType: file.type, upsert: false }
  )
  → owner otomatis = auth.uid() karena pakai session user
```

## Konfirmasi yang saya butuhkan sebelum eksekusi

1. Setuju dengan jalur **direct client upload + RLS ketat** (Fase 1)? Atau tetap paksa via server function (butuh service-role di preview → harus diverifikasi env-nya)?
2. Setuju laporan diberikan **per fase** (bukan hanya di akhir), agar bisa hentikan / arahkan ulang kalau ada perubahan prioritas?

Setelah Anda approve plan ini, saya mulai dari Fase 1.
