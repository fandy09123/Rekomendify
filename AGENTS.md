<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use Bun 1.3.3 and the committed `bun.lock` with frozen installs on Node 22.22.x; one authoritative lockfile prevents manifest drift across hosting providers.
- Preserve TanStack Start SSR and the Nitro `cloudflare-pages` target for external Pages builds; its installed preset emits `dist/` including `_worker.js`, while Lovable's sandbox overrides output independently.
- Bundle browser-only Leaflet via its existing dynamic imports, never mark it external; published browsers and Workers cannot resolve bare package imports.
- Public data reads in `src/lib/public.functions.ts` must stay cache-first: CDN `Cache-Control` via `publicCache()` plus an in-isolate TTL cache (`withMemCache`), and each page's data in as few REST queries as possible (region + couriers embedded via `regions!inner`); write tracking must be deduped client-side (`src/lib/visit-tracking.ts`) and skipped when `regionId` is null — this is the Log Ingestion / cost-control invariant after the October 2026 crawl flood.
