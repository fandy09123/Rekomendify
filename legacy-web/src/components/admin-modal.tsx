/**
 * AdminModal — satu pola modal responsif untuk seluruh panel admin.
 *
 * Kenapa dibuat:
 * Sebelumnya tiap dialog admin menulis sendiri `fixed inset-0 … grid place-items-center`
 * dengan `onClick={onClose}` pada backdrop. Dua masalah nyata di HP:
 *  1. Konten panjang (mis. form Promosi) tumbuh melebihi viewport sehingga header
 *     dan tombol simpan ikut tergulung; ketika keyboard Android muncul, tombol
 *     penting terdorong keluar layar.
 *  2. `onClick` di backdrop juga menyala saat elemen yang diklik (mis. item daftar
 *     lokasi) di-unmount saat itu juga — browser me-retarget event ke backdrop —
 *     sehingga modal tertutup sendiri dan fokus input hilang.
 *
 * Solusi: satu shell dengan header/footer sticky, body yang scroll sendiri,
 * tinggi dibatasi `dvh` (ikut menyusut saat keyboard muncul), safe-area Android,
 * dan penutupan backdrop yang hanya terjadi bila pointerdown DAN click sama-sama
 * terjadi pada backdrop itu sendiri.
 */

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminModalProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  /** Bila diisi, isi modal dibungkus <form> dan footer ikut submit. */
  onSubmit?: (e: React.FormEvent) => void;
  size?: "md" | "lg";
}

export function AdminModal({ title, subtitle, children, footer, onClose, onSubmit, size = "md" }: AdminModalProps) {
  const downOnBackdrop = useRef(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    downOnBackdrop.current = e.target === e.currentTarget;
  }, []);
  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (downOnBackdrop.current && e.target === e.currentTarget) onClose();
      downOnBackdrop.current = false;
    },
    [onClose],
  );

  const Panel = onSubmit ? "form" : "div";

  return (
    <div
      onPointerDown={onPointerDown}
      onClick={onClick}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <Panel
        {...(onSubmit ? { onSubmit } : {})}
        className={cn(
          "flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl bg-card shadow-xl sm:max-h-[88dvh] sm:rounded-3xl",
          size === "lg" ? "sm:max-w-lg" : "sm:max-w-md",
        )}
      >
        <div className="flex shrink-0 items-start gap-3 border-b border-border/70 px-5 py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-display text-xl sm:text-2xl">{title}</h2>
            {subtitle && <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="-mr-1 grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-border/70 bg-card px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </div>
        )}
      </Panel>
    </div>
  );
}
