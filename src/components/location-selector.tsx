/**
 * LocationCombobox — Searchable single-select untuk satu Location.
 * LocationMultiSelect — Searchable multi-select (maks. N) untuk target Location banner.
 *
 * Keduanya reuse komponen Command (cmdk) + Popover yang sudah tersedia di /components/ui.
 * Tidak ada perubahan backend/API. Semua filtering dilakukan di frontend dari data yang sudah dimuat.
 */

import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, X, Plus, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface LocationOption {
  id: string;
  name: string;
  category?: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// LocationCombobox — single-select dengan search
// ─────────────────────────────────────────────────────────────────────────────

interface LocationComboboxProps {
  locations: LocationOption[];
  value: string;           // location_id atau "" untuk kosong
  onChange: (id: string) => void;
  placeholder?: string;
  emptyLabel?: string;
  required?: boolean;
}

export function LocationCombobox({
  locations,
  value,
  onChange,
  placeholder = "Cari atau pilih lokasi…",
  emptyLabel = "— Tidak ada —",
  required = false,
}: LocationComboboxProps) {
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => locations.find((l) => l.id === value) ?? null,
    [locations, value],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-label={placeholder}
          className="mt-1 flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-sm transition hover:bg-accent/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <span className={cn("min-w-0 flex-1 truncate text-left", !selected && "text-muted-foreground")}>
            {selected ? selected.name : (required ? placeholder : emptyLabel)}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command>
          <CommandInput placeholder="Ketik nama lokasi…" />
          <CommandList>
            <CommandEmpty>
              <span className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Search className="size-4" /> Lokasi tidak ditemukan.
              </span>
            </CommandEmpty>
            <CommandGroup>
              {/* Opsi kosong jika tidak wajib */}
              {!required && (
                <CommandItem
                  key="__empty__"
                  value=""
                  onSelect={() => { onChange(""); setOpen(false); }}
                  className="text-muted-foreground"
                >
                  <Check className={cn("size-4", value === "" ? "opacity-100" : "opacity-0")} />
                  — pilih —
                </CommandItem>
              )}
              {locations.map((loc) => (
                <CommandItem
                  key={loc.id}
                  value={`${loc.name} ${loc.category ?? ""}`}
                  onSelect={() => { onChange(loc.id); setOpen(false); }}
                >
                  <Check className={cn("size-4 shrink-0", value === loc.id ? "opacity-100 text-primary" : "opacity-0")} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{loc.name}</span>
                    {loc.category && (
                      <span className="block truncate text-xs text-muted-foreground">{loc.category}</span>
                    )}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LocationMultiSelect — multi-select dengan search, selected tags, maks. N
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
  addLabel = "Tambah lokasi tujuan",
}: LocationMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedLocations = useMemo(
    () => locations.filter((l) => selectedIds.includes(l.id)),
    [locations, selectedIds],
  );

  // Location yang belum terpilih ditampilkan sebagai opsi di selector
  const unselected = useMemo(
    () => locations.filter((l) => !selectedIds.includes(l.id)),
    [locations, selectedIds],
  );

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((x) => x !== id));
    } else {
      if (selectedIds.length >= max) return; // silently reject, caller bisa toast
      onChange([...selectedIds, id]);
    }
  };

  const remove = (id: string) => onChange(selectedIds.filter((x) => x !== id));

  return (
    <div className="space-y-2">
      {/* Selected tags */}
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
                onClick={() => remove(loc.id)}
                aria-label={`Hapus ${loc.name}`}
                className="rounded-full p-0.5 hover:bg-primary/20"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tombol tambah — hanya tampil jika belum mencapai maks */}
      {selectedIds.length < max && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <Plus className="size-3.5" />
              {addLabel}
            </button>
          </PopoverTrigger>

          <PopoverContent className="w-72 p-0" align="start">
            <Command>
              <CommandInput placeholder="Cari lokasi…" />
              <CommandList>
                <CommandEmpty>
                  <span className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Search className="size-4" /> Lokasi tidak ditemukan.
                  </span>
                </CommandEmpty>
                <CommandGroup heading={`${selectedIds.length}/${max} dipilih`}>
                  {unselected.map((loc) => (
                    <CommandItem
                      key={loc.id}
                      value={`${loc.name} ${loc.category ?? ""}`}
                      onSelect={() => {
                        toggle(loc.id);
                        // Tutup popover setelah pilih jika sudah maks
                        if (selectedIds.length + 1 >= max) setOpen(false);
                      }}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{loc.name}</span>
                        {loc.category && (
                          <span className="block truncate text-xs text-muted-foreground">{loc.category}</span>
                        )}
                      </span>
                    </CommandItem>
                  ))}
                  {unselected.length === 0 && selectedIds.length > 0 && (
                    <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                      Semua lokasi sudah dipilih.
                    </p>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}

      {selectedIds.length === 0 && (
        <p className="text-xs text-muted-foreground">Belum ada lokasi tujuan dipilih.</p>
      )}
    </div>
  );
}
