import { useEffect, useState } from "react";

/** PRNG deterministik agar urutan stabil untuk seed yang sama. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Pengacakan stabil: urutan berubah antar sesi, tetapi tidak berubah
 * saat komponen re-render. seed = 0 berarti urutan asli (SSR & render pertama).
 */
export function seededShuffle<T>(items: readonly T[], seed: number, salt = ""): T[] {
  const out = items.slice();
  if (!seed) return out;
  const rnd = mulberry32(seed ^ hash(salt));
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const SEED_KEY = "rekomendify:order-seed";

/**
 * Seed per sesi browser. Bernilai 0 pada server dan render pertama sehingga
 * hidrasi tetap cocok, lalu terisi setelah mount.
 */
export function useSessionSeed(): number {
  const [seed, setSeed] = useState(0);
  useEffect(() => {
    let s = 0;
    try {
      const stored = sessionStorage.getItem(SEED_KEY);
      s = stored ? Number(stored) : 0;
      if (!s || !Number.isFinite(s)) {
        s = Math.floor(Math.random() * 2147483647) + 1;
        sessionStorage.setItem(SEED_KEY, String(s));
      }
    } catch {
      s = 1;
    }
    setSeed(s);
  }, []);
  return seed;
}
