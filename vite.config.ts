// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Dynamically select Nitro preset:
  // - Vercel CI sets process.env.VERCEL=1 -> outputs .vercel/output
  // - Cloudflare Pages sets process.env.CF_PAGES=1 -> outputs .output/public + _worker.js
  // - Lovable sandbox forces cloudflare-module
  // - NITRO_PRESET env var allows explicit overrides
  nitro: {
    preset:
      process.env.NITRO_PRESET ||
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

