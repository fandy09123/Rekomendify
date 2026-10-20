import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const lock = JSON.parse(readFileSync(new URL("../bun.lock", import.meta.url), "utf8").replace(/,\s*([}\]])/g, "$1"));

test("frozen install uses identical direct dependency specifications", () => {
  for (const group of ["dependencies", "devDependencies"]) {
    assert.deepEqual(lock.workspaces[""][group], manifest[group]);
  }
  assert.deepEqual(lock.overrides, manifest.overrides);
});

test("Cloudflare Pages output matches installed SSR preset", () => {
  const config = JSON.parse(readFileSync(new URL("../wrangler.jsonc", import.meta.url), "utf8"));
  assert.equal(config.pages_build_output_dir, "dist");
  assert.ok(config.compatibility_flags.includes("nodejs_compat"));
  const preset = readFileSync(new URL("../node_modules/nitro/dist/_presets.mjs", import.meta.url), "utf8");
  const start = preset.indexOf("const cloudflarePages = defineNitroPreset(");
  assert.ok(start >= 0);
  const pages = preset.slice(start, preset.indexOf("const cloudflarePagesStatic", start));
  assert.ok(pages.includes('dir: "{{ rootDir }}/dist"'));
  assert.ok(pages.includes('serverDir: "{{ output.dir }}/_worker.js"'));
});