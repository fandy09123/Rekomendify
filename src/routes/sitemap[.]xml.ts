import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getSupabasePublicConfig } from "@/integrations/supabase/config";

// Domain kanonikal resmi aplikasi
const BASE_URL = process.env["SITE_URL"] || "https://www.rekomendify.com";

// Cache in-memory per worker isolate (TTL 6 jam)
// Mencegah ribuan request bot crawler memicu query 5.000 baris ke Supabase berulang kali
let cachedSitemapXml: string | null = null;
let cachedExpiresAt = 0;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 jam

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const now = Date.now();

        // 1. Jika cache memori masih berlaku, layani langsung (0 query ke database)
        if (cachedSitemapXml && cachedExpiresAt > now) {
          return new Response(cachedSitemapXml, {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
              "X-Sitemap-Cache": "HIT",
            },
          });
        }

        // 2. Daftar halaman statis utama
        const urls: string[] = [
          `  <url><loc>${BASE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
          `  <url><loc>${BASE_URL}/explore</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`,
          `  <url><loc>${BASE_URL}/tentang</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
          `  <url><loc>${BASE_URL}/bantuan</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
          `  <url><loc>${BASE_URL}/privasi</loc><changefreq>monthly</changefreq><priority>0.3</priority></url>`,
        ];

        try {
          const { url, publishableKey } = getSupabasePublicConfig();
          const sb = createClient<Database>(url, publishableKey, {
            auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          });

          // Query data wilayah & lokasi publik
          const [regionsRes, locationsRes] = await Promise.all([
            sb.from("regions").select("slug, updated_at").eq("is_published", true).limit(500),
            sb
              .from("locations")
              .select("slug, updated_at, regions!inner(slug, is_published)")
              .eq("is_published", true)
              .limit(5000),
          ]);

          // Masukkan URL wilayah
          for (const r of regionsRes.data ?? []) {
            if (!r.slug) continue;
            const lastmod = r.updated_at
              ? new Date(r.updated_at).toISOString()
              : new Date().toISOString();
            urls.push(
              `  <url><loc>${BASE_URL}/r/${escapeXml(r.slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`,
            );
          }

          // Masukkan URL detail lokasi
          for (const l of locationsRes.data ?? []) {
            const region = (l as any).regions;
            if (!region?.slug || !region?.is_published || !l.slug) continue;

            const lastmod = l.updated_at
              ? new Date(l.updated_at).toISOString()
              : new Date().toISOString();
            urls.push(
              `  <url><loc>${BASE_URL}/r/${escapeXml(region.slug)}/${escapeXml(l.slug)}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`,
            );
          }

          const xml = [
            `<?xml version="1.0" encoding="UTF-8"?>`,
            `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
            ...urls,
            `</urlset>`,
          ].join("\n");

          // Simpan ke cache memori isolate
          cachedSitemapXml = xml;
          cachedExpiresAt = now + CACHE_TTL_MS;

          return new Response(xml, {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=0, s-maxage=21600, stale-while-revalidate=86400",
              "X-Sitemap-Cache": "MISS",
            },
          });
        } catch (error) {
          console.warn("[sitemap] Gagal mengambil data dinamis, menyajikan sitemap statis:", error);

          // Jika terjadi error koneksi ke Supabase, sajikan sitemap statis agar crawler tidak menerima HTTP 500
          const fallbackXml = [
            `<?xml version="1.0" encoding="UTF-8"?>`,
            `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
            ...urls,
            `</urlset>`,
          ].join("\n");

          return new Response(fallbackXml, {
            headers: {
              "Content-Type": "application/xml; charset=utf-8",
              "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=600",
              "X-Sitemap-Cache": "FALLBACK",
            },
          });
        }
      },
    },
  },
});
