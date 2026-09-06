import { useLayoutEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/**
 * Menampilkan teks multi-paragraf (mengikuti line break dari database)
 * dengan mekanisme "Selengkapnya" bila teksnya panjang.
 */
export function ExpandableText({
  text,
  collapsedHeight = 132,
  className = "",
}: {
  text: string;
  collapsedHeight?: number;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflowing(el.scrollHeight > collapsedHeight + 8);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, collapsedHeight]);

  const paragraphs = text.split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className={className}>
      <motion.div
        animate={{ maxHeight: expanded || !overflowing ? 4000 : collapsedHeight }}
        initial={false}
        transition={{ duration: 0.32, ease: "easeInOut" }}
        className="relative overflow-hidden"
      >
        <div ref={ref} className="space-y-3">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-foreground/85">
              {p}
            </p>
          ))}
        </div>
        <AnimatePresence>
          {!expanded && overflowing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {overflowing && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:opacity-80"
        >
          {expanded ? "Ringkas" : "Selengkapnya"}
          <ChevronDown className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      )}
    </div>
  );
}
