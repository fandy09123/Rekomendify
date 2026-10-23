# Deployment recovery

- [x] Audit repository, lockfiles, runtime, and supplied Cloudflare failure evidence.
- [x] Reproduce frozen installation and apply minimal verified repairs.
- [x] Verify frozen installation, configuration tests, automatic checks, and public app behavior; Pages artifact remains unavailable.
- [x] Provide forensic report and exact Cloudflare settings in DEPLOYMENT-AUDIT.md.
- [ ] Verify actual Cloudflare deployment — blocked: no dashboard/deployment access; user must send changes and redeploy.

# Forensic Log Ingestion audit (Okt 2026)

- [x] Baseline terukur dari Supabase logs: ~480 REST query/menit (locations 240, regions 120, couriers 120) dari crawler di situs deployed + 146 req 400 (`region_id=eq.undefined`) + visits 401 RLS violation.
- [x] Fix P0 `getLocationBySlug`: 2 query per render (regions!inner embedding) + TTL cache in-isolate + CDN cache — verified sandbox, typecheck + build OK.
- [x] Fix P0 `recordVisit`: guard skip bila regionId null; dedupe engagement 5 menit tersedia (`shouldRecordEngagement`).
- [x] `robots.txt`: `Crawl-delay: 10` untuk semua crawler yang patuh.
- [ ] Redeploy (Vercel/Cloudflare) agar fix aktif di jalur yang menerima banjir — blocked: deployment di luar sandbox; traffic banjir tidak melewati preview sandbox.
## Selesai
- [x] Integrasi identitas korporat PT Rekomendasi Pilihan Utama (footer global, homepage, tentang/bantuan/privasi, email publik, metadata + JSON-LD, hapus kartu maskot & QR di beranda global) — 2026-10-22; verifikasi runtime halaman wilayah terhalang jaringan sandbox ke backend data.
