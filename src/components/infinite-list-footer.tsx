import { Loader2 } from "lucide-react";

type Props = {
  hasMore: boolean;
  total: number;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
  onLoadMore: () => void;
  emptyDoneLabel?: string;
};

/** Indikator kecil di bawah daftar: memuat batch berikutnya atau tanda selesai. */
export function InfiniteListFooter({ hasMore, total, sentinelRef, onLoadMore, emptyDoneLabel }: Props) {
  if (total === 0) return null;
  return (
    <div ref={sentinelRef} className="py-4 text-center">
      {hasMore ? (
        <button
          type="button"
          onClick={onLoadMore}
          className="inline-flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
          Memuat rekomendasi…
        </button>
      ) : (
        <p className="text-xs text-muted-foreground">
          {emptyDoneLabel ?? "Semua rekomendasi sudah ditampilkan."}
        </p>
      )}
    </div>
  );
}
