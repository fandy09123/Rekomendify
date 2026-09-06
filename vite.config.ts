// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

/**
 * Satu codebase, dua target build:
 *
 * 1. WEB / PWA (default)  → SSR + server function, preset Cloudflare/Vercel.
 * 2. ANDROID APK (CAP_BUILD=1) → mode SPA: shell di-prerender menjadi HTML statis
 *    sehingga seluruh UI React dibundel LOKAL ke dalam APK. Tidak ada server.url,
 *    tidak ada remote UI. Data tetap diambil dari server function website
 *    (lintas origin) ketika internet tersedia.
 */
const isCapacitorBuild = process.env.CAP_BUILD === "1";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(isCapacitorBuild
      ? {
          // Shell SPA: satu HTML statis yang mem-boot router di klien.
          spa: { enabled: true, prerender: { outputPath: "/index.html" } },
          // Sitemap tidak relevan untuk APK.
          sitemap: { enabled: false },
        }
      : {}),
  },
  nitro: {
    preset: isCapacitorBuild
      ? "static"
      : process.env.NITRO_PRESET ||
        (process.env.VERCEL ? "vercel" : "cloudflare-pages"),
  },
  vite: {
    ssr: {
      noExternal: ["leaflet"],
    },
    build: {
      rolldownOptions: {
        external: ["leaflet", "leaflet/dist/leaflet.css", /^leaflet/],
      },
      rollupOptions: {
        external: ["leaflet", "leaflet/dist/leaflet.css", /^leaflet/],
      },
    },
  },
});
