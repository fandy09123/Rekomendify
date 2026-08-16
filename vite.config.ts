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
  // Hard-pin Nitro to the Vercel preset for self-deployments. This is ignored
  // inside the Lovable sandbox build (the wrapper forces cloudflare-module there),
  // but on Vercel CI it makes the build emit `.vercel/output/` in the standard
  // Build Output API v3 layout that Vercel auto-detects.
  nitro: { preset: "vercel" },
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

