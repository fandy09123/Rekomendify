import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Menampilkan daftar secara bertahap (batch) + sentinel untuk infinite scroll.
 * Data sumber tetap berasal dari query/loader yang sudah ada — hook ini hanya
 * mengurangi jumlah item yang benar-benar dirender pada initial load.
 *
 * Pagination otomatis reset saat `resetKey` (kategori, query, filter, dsb) berubah.
 */
export function useIncrementalList<T>(items: T[], resetKey: string, batchSize = 10) {
  const [count, setCount] = useState(batchSize);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setCount(batchSize);
  }, [resetKey, batchSize]);

  const hasMore = count < items.length;

  const loadMore = useCallback(() => {
    setCount((c) => Math.min(c + batchSize, items.length));
  }, [batchSize, items.length]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) loadMore();
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore]);

  const visible = useMemo(() => items.slice(0, count), [items, count]);

  return { visible, hasMore, loadMore, sentinelRef, total: items.length };
}
