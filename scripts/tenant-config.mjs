/**
 * Loader + validator konfigurasi tenant (build-time).
 *
 * Sumber kebenaran: tenant.config.json (ter-version-control, mudah di-`git diff`).
 * Override opsional: .env di root (berguna untuk build lokal tenant lain).
 *
 * Tidak ada nilai di sini yang bersifat secret; semuanya publik.
 */
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

export const ROOT = process.cwd();
const CONFIG_FILE = "tenant.config.json";

const KEYS = [
  ["villageSlug", "VILLAGE_SLUG"],
  ["villageName", "VILLAGE_NAME"],
  ["appName", "APP_NAME"],
  ["appId", "APP_ID"],
  ["targetUrl", "TARGET_URL"],
];

function parseDotEnv(source) {
  const out = {};
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

export class TenantConfigError extends Error {}

/** Baca konfigurasi tenant tanpa memodifikasi file apa pun. */
export async function loadTenantConfig() {
  const configPath = path.join(ROOT, CONFIG_FILE);
  if (!existsSync(configPath)) {
    throw new TenantConfigError(`${CONFIG_FILE} tidak ditemukan di root project.`);
  }

  let base;
  try {
    base = JSON.parse(await readFile(configPath, "utf8"));
  } catch (error) {
    throw new TenantConfigError(`${CONFIG_FILE} bukan JSON yang valid: ${error.message}`);
  }

  const envPath = path.join(ROOT, ".env");
  const fileEnv = existsSync(envPath) ? parseDotEnv(await readFile(envPath, "utf8")) : {};

  const raw = {};
  const sources = {};
  for (const [key, envKey] of KEYS) {
    // Prioritas: process.env (CI) > .env > tenant.config.json
    const fromProcess = process.env[envKey];
    const fromFile = fileEnv[envKey];
    if (fromProcess) {
      raw[key] = fromProcess;
      sources[key] = "process.env";
    } else if (fromFile) {
      raw[key] = fromFile;
      sources[key] = ".env";
    } else {
      raw[key] = base[key];
      sources[key] = CONFIG_FILE;
    }
  }

  return { config: validateTenantConfig(raw), sources };
}

/** Validasi ketat; melempar TenantConfigError dengan semua pesan sekaligus. */
export function validateTenantConfig(raw) {
  const errors = [];
  const str = (key) => (typeof raw[key] === "string" ? raw[key].trim() : "");

  const villageSlug = str("villageSlug");
  const villageName = str("villageName");
  const appName = str("appName");
  const appId = str("appId");
  const targetUrl = str("targetUrl");

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(villageSlug)) {
    errors.push("VILLAGE_SLUG harus lowercase a-z, 0-9, dipisah '-' (contoh: desa-wisata-mulyosari).");
  }
  if (villageName.length < 2 || villageName.length > 60 || /[<>\n\r]/.test(villageName)) {
    errors.push("VILLAGE_NAME harus 2-60 karakter tanpa karakter markup.");
  }
  if (appName.length < 2 || appName.length > 30 || /[<>\n\r]/.test(appName)) {
    errors.push("APP_NAME harus 2-30 karakter (batas praktis label launcher Android).");
  }

  const segments = appId.split(".");
  const RESERVED = new Set([
    "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", "class", "const",
    "continue", "default", "do", "double", "else", "enum", "extends", "final", "finally", "float",
    "for", "goto", "if", "implements", "import", "instanceof", "int", "interface", "long", "native",
    "new", "package", "private", "protected", "public", "return", "short", "static", "strictfp",
    "super", "switch", "synchronized", "this", "throw", "throws", "transient", "try", "void",
    "volatile", "while", "true", "false", "null",
  ]);
  const segmentOk = (s) => /^[a-z][a-z0-9_]*$/.test(s) && !RESERVED.has(s);
  if (segments.length < 2 || !segments.every(segmentOk)) {
    errors.push(
      "APP_ID harus applicationId Android/Java yang valid: minimal 2 segmen, lowercase, dipisah titik, tanpa spasi/karakter ilegal, bukan keyword Java (contoh: com.rekomendify.desamulyosari).",
    );
  }

  let url = null;
  try {
    url = new URL(targetUrl);
    if (url.protocol !== "https:") errors.push("TARGET_URL wajib menggunakan https://.");
  } catch {
    errors.push("TARGET_URL bukan URL yang valid.");
  }

  if (errors.length > 0) {
    throw new TenantConfigError(errors.map((e) => `- ${e}`).join("\n"));
  }

  const host = url.hostname;
  const baseDomain = host.split(".").slice(-2).join(".");

  return {
    villageSlug,
    villageName,
    appName,
    appId,
    targetUrl,
    targetOrigin: url.origin,
    targetHost: host,
    /** Domain dasar untuk allowlist WebView & pemeriksaan origin native. */
    trustedHostSuffix: baseDomain,
    /** Path direktori Java yang harus cocok dengan appId. */
    javaPackagePath: appId.split(".").join("/"),
  };
}
