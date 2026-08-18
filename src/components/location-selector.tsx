/**
 * LocationCombobox — pencarian + pilih satu Location.
 * LocationMultiSelect — pencarian + pilih beberapa Location (maks. N).
 *
 * CATATAN PENTING (perbaikan mobile):
 * Versi sebelumnya membungkus input pencarian di dalam Radix Popover + cmdk.
 * Popover itu dirender lewat portal ke <body>, sementara dialog iklan adalah
 * overlay `fixed` buatan sendiri. Kombinasi focus-trap Popover, DismissableLayer
 * (pointerdown di document) dan overlay tersebut membuat Chrome Android
 * kehilangan fokus tepat setelah input disentuh, sehingga keyboard tidak pernah
 * bertahan dan admin tidak bisa mengetik.
 *
 * Sekarang input dirender inline (tanpa portal, tanpa focus trap, tanpa cmdk),
 * jadi satu ketukan langsung memunculkan keyboard di HP maupun desktop.
 * Semua filtering tetap di frontend dari data yang sudah dimuat.
 */

import { useId, useMemo, useState } from "react";
import { Check, X, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface LocationOption {
  id: string;
  name: string;
  category?: string | null;
}

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

function useFiltered(locations: LocationOption[], q: string) {
  return useMemo(() => {
    const query = norm(q);
    if (!query) return locations;
    const tokens = query.split(" ");
    return locations.filter((l) => {
      const hay = norm(`${l.name} ${l.category ?? ""}`);
      return tokens.every((t) => hay.includes(t));
    });
  }, [locations, q]);
}

function SearchField({
  value,
  onChange,
  placeholder,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  id: string;
}) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        id={id}
        type="search"
        inputMode="search"
        autoComplete="off"
        enterKeyHint="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-11 w-full rounded-xl border border-border bg-background pl-9 pr-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Hapus pencarian"
          className="absolute right-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LocationCombobox — single select
// ─────────────────────────────────────────────────────────────────────────────

interface LocationComboboxProps {
  locations: LocationOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  required?: boolean;
}

export function LocationCombobox({
  locations,
  value,
  onChange,
  placeholder = "Cari nama lokasi…",
  emptyLabel = "— Tidak ada —",
  required = false,
}: LocationComboboxProps) {
  const [q, setQ] = useState("");
  const inputId = useId();
  const selected = useMemo(() => locations.find((l) => l.id === value) ?? null, [locations, value]);
  const filtered = useFiltered(locations, q);

  return (
    <div className="space-y-2">
      <SearchField id={inputId} value={q} onChange={setQ} placeholder={placeholder} />

      <p className="text-xs text-muted-foreground">
        Terpilih: <span className="font-medium text-foreground">{selected ? selected.name : emptyLabel}</span>
      </p>

      <ul className="max-h-56 overflow-y-auto overscroll-contain rounded-xl border border-border bg-background">
        {!required && (
          <li>
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex min-h-11 w-full items-center gap-2 px-3 text-left text-sm text-muted-foreground hover:bg-accent/10"
            >
              <Check className={cn("size-4 shrink-0", value === "" ? "opacity-100 text-primary" : "opacity-0")} />
              {emptyLabel}
            </button>
          </li>
        )}
        {filtered.map((loc) => (
          <li key={loc.id}>
            <button
              type="button"
              onClick={() => onChange(loc.id)}
              aria-pressed={value === loc.id}
              className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent/10"
            >
              <Check className={cn("size-4 shrink-0", value === loc.id ? "opacity-100 text-primary" : "opacity-0")} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{loc.name}</span>
                {loc.category && <span className="block truncate text-xs text-muted-foreground">{loc.category}</span>}
              </span>
            </button>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="px-3 py-4 text-center text-sm text-muted-foreground">Lokasi tidak ditemukan.</li>
        )}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LocationMultiSelect — multi select (maks. N)
// ─────────────────────────────────────────────────────────────────────────────

interface LocationMultiSelectProps {
  locations: LocationOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  max?: number;
  addLabel?: string;
}

export function LocationMultiSelect({
  locations,
  selectedIds,
  onChange,
  max = 5,
}: LocationMultiSelectProps) {
  const [q, setQ] = useState("");
  const inputId = useId();
  const selectedLocations = useMemo(
    () => locations.filter((l) => selectedIds.includes(l.id)),
    [locations, selectedIds],
  );
  const filtered = useFiltered(locations, q);
  const full = selectedIds.length >= max;

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) onChange(selectedIds.filter((x) => x !== id));
    else if (!full) onChange([...selectedIds, id]);
  };

  return (
    <div className="space-y-2">
      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedLocations.map((loc) => (
            <span
              key={loc.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {loc.name}
              <button
                type="button"
                onClick={() => toggle(loc.id)}
                aria-label={`Hapus ${loc.name}`}
                className="grid size-5 place-items-center rounded-full hover:bg-primary/20"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <SearchField id={inputId} value={q} onChange={setQ} placeholder="Cari lokasi tujuan…" />

      <ul className="max-h-56 overflow-y-auto overscroll-contain rounded-xl border border-border bg-background">
        {filtered.map((loc) => {
          const on = selectedIds.includes(loc.id);
          return (
            <li key={loc.id}>
              <button
                type="button"
                onClick={() => toggle(loc.id)}
                disabled={!on && full}
                aria-pressed={on}
                className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent/10 disabled:opacity-40"
              >
                <Check className={cn("size-4 shrink-0", on ? "opacity-100 text-primary" : "opacity-0")} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{loc.name}</span>
                  {loc.category && <span className="block truncate text-xs text-muted-foreground">{loc.category}</span>}
                </span>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-3 py-4 text-center text-sm text-muted-foreground">Lokasi tidak ditemukan.</li>
        )}
      </ul>

      <p className="text-xs text-muted-foreground">
        {selectedIds.length}/{max} lokasi tujuan dipilih{full ? " — batas tercapai." : "."}
      </p>
    </div>
  );
}
