import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getSupabasePublicConfig } from "@/integrations/supabase/config";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { url, publishableKey } = getSupabasePublicConfig();
        const sb = createClient<Database>(url, publishableKey, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
        });
        const { data: regions } = await sb.from("regions").select("slug, updated_at").eq("is_published", true);
        const { data: locations } = await sb.from("locations").select("slug, updated_at, regions!inner(slug, is_published)").eq("is_published", true);

        const urls: string[] = [
          `  <url><loc>${BASE_URL}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
          `  <url><loc>${BASE_URL}/explore</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`,
        ];
        for (const r of regions ?? []) {
          urls.push(`  <url><loc>${BASE_URL}/r/${r.slug}</loc><lastmod>${new Date(r.updated_at).toISOString()}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>`);
        }
        for (const l of locations ?? []) {
          const rs = (l as any).regions?.slug;
          if (!rs || !(l as any).regions?.is_published) continue;
          urls.push(`  <url><loc>${BASE_URL}/r/${rs}/${l.slug}</loc><lastmod>${new Date(l.updated_at).toISOString()}</lastmod><changefreq>weekly</changefreq><priority>0.7</priority></url>`);
        }

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } });
      },
    },
  },
});
