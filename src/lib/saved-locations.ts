// Simple localStorage-backed favorites. No backend, no auth.
export type SavedLocation = {
  id: string;
  slug: string;
  name: string;
  regionSlug: string;
  regionName?: string | null;
  photo_url?: string | null;
  category?: string | null;
  hours?: string | null;
  savedAt: number;
};

const KEY = "rekomendify:saved-locations:v1";

function read(): SavedLocation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: SavedLocation[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("rekomendify:saved-changed"));
}

export function listSaved(): SavedLocation[] {
  return read().sort((a, b) => b.savedAt - a.savedAt);
}

export function isSaved(id: string): boolean {
  return read().some((x) => x.id === id);
}

export function saveLocation(loc: SavedLocation) {
  const list = read().filter((x) => x.id !== loc.id);
  list.push({ ...loc, savedAt: Date.now() });
  write(list);
}

export function removeSaved(id: string) {
  write(read().filter((x) => x.id !== id));
}
