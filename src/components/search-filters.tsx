/**
 * Baris filter sederhana untuk pencarian tempat: Harga & Jam buka.
 * Sengaja memakai chip besar (touch target ≥ 44px) dan bahasa sehari-hari,
 * bukan istilah teknis, karena penggunanya masyarakat umum.
 */

import { Clock, Wallet, X } from "lucide-react";
import {
  HOURS_FILTER_LABEL,
  PRICE_FILTER_LABEL,
  type HoursFilter,
  type PriceFilter,
} from "@/lib/location-search";

const PRICE_ORDER: PriceFilter[] = ["all", "murah", "sedang", "mahal"];
const HOURS_ORDER: HoursFilter[] = ["all", "now", "pagi", "siang", "sore", "malam"];

function Chip({
  active,
  children,
  onClick,
  label,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={`min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-accent/10"
      }`}
    >
      {children}
    </button>
  );
}

export function SearchFilters({
  price,
  hours,
  onPrice,
  onHours,
}: {
  price: PriceFilter;
  hours: HoursFilter;
  onPrice: (v: PriceFilter) => void;
  onHours: (v: HoursFilter) => void;
}) {
  const dirty = price !== "all" || hours !== "all";

  return (
    <div className="space-y-2">
      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Wallet className="size-3.5" aria-hidden="true" /> Harga
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {PRICE_ORDER.map((p) => (
            <Chip key={p} active={price === p} onClick={() => onPrice(p)} label={`Harga: ${PRICE_FILTER_LABEL[p]}`}>
              {PRICE_FILTER_LABEL[p]}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Clock className="size-3.5" aria-hidden="true" /> Jam buka
        </p>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {HOURS_ORDER.map((h) => (
            <Chip key={h} active={hours === h} onClick={() => onHours(h)} label={`Jam buka: ${HOURS_FILTER_LABEL[h]}`}>
              {HOURS_FILTER_LABEL[h]}
            </Chip>
          ))}
        </div>
      </div>

      {dirty && (
        <button
          type="button"
          onClick={() => { onPrice("all"); onHours("all"); }}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" aria-hidden="true" /> Hapus filter
        </button>
      )}
    </div>
  );
}
