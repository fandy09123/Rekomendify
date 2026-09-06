import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ShieldCheck, Copy, Check, Mail, ExternalLink, ChevronRight } from "lucide-react";
import { PRIVACY_POLICY, type PrivacySection } from "@/content/privacy-policy";
import { toast } from "sonner";

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSectionId?: string;
}

export function PrivacyPolicyModal({
  open,
  onOpenChange,
  initialSectionId,
}: PrivacyPolicyModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState<string | null>(initialSectionId ?? null);
  const [copied, setCopied] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (initialSectionId) {
      setActiveSection(initialSectionId);
    }
  }, [initialSectionId]);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return PRIVACY_POLICY.sections;
    const q = searchQuery.toLowerCase();
    return PRIVACY_POLICY.sections.filter((sec) => {
      const inTitle = sec.title.toLowerCase().includes(q);
      const inParagraphs = sec.paragraphs.some((p) => p.toLowerCase().includes(q));
      const inBullets = sec.bullets?.some((b) => b.toLowerCase().includes(q));
      const inSubsections = sec.subsections?.some(
        (sub) =>
          sub.subtitle.toLowerCase().includes(q) ||
          sub.paragraphs?.some((p) => p.toLowerCase().includes(q))
      );
      return inTitle || inParagraphs || inBullets || inSubsections;
    });
  }, [searchQuery]);

  const copyPrivacyLink = async () => {
    try {
      await navigator.clipboard.writeText(PRIVACY_POLICY.privacyUrl);
      setCopied(true);
      toast.success("Tautan Kebijakan Privasi berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin tautan.");
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-xs sm:items-center sm:p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onOpenChange(false)}
          className="absolute inset-0 bg-transparent"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 280 }}
          role="dialog"
          aria-modal="true"
          aria-label="Dokumen Kebijakan Privasi Rekomendify"
          className="relative z-10 flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-background shadow-lift sm:rounded-3xl border border-border"
        >
          {/* Header */}
          <div className="sticky top-0 z-20 flex flex-col border-b border-border bg-background/95 px-5 py-4 backdrop-blur-md">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary">
                  <ShieldCheck className="size-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="font-display text-lg sm:text-xl truncate leading-tight">
                    Kebijakan Privasi Rekomendify
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Terakhir diperbarui: <span className="font-medium text-foreground">{PRIVACY_POLICY.lastUpdated}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Tutup Kebijakan Privasi"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mt-3.5">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari pasal atau kata kunci (misal: Kamera, Lokasi, Supabase)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-border bg-muted/40 pl-9 pr-4 py-2 text-xs focus:bg-background focus:outline-hidden focus:ring-2 focus:ring-primary/30"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Bersihkan
                </button>
              )}
            </div>
          </div>

          {/* Body Content (Scrollable) */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 scrollbar-thin">
            {/* Quick Summary Pill Banner */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-xs leading-relaxed text-foreground">
              <p className="font-semibold text-primary mb-1">📌 Ringkasan Prinsip Privasi:</p>
              <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                {PRIVACY_POLICY.principles.map((pr, idx) => (
                  <li key={idx}>{pr}</li>
                ))}
              </ul>
            </div>

            {/* Section Index list if searching or filtering */}
            {filteredSections.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Tidak ada pasal yang cocok dengan pencarian &ldquo;{searchQuery}&rdquo;.
              </div>
            ) : (
              filteredSections.map((sec) => (
                <article
                  key={sec.id}
                  id={`privacy-sec-${sec.id}`}
                  className={`rounded-2xl border p-4 sm:p-5 transition-colors ${
                    activeSection === sec.id
                      ? "border-primary/40 bg-primary/5"
                      : "border-border bg-card"
                  }`}
                >
                  <h3 className="font-display text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
                    <span className="shrink-0 grid size-6 place-items-center rounded-lg bg-accent/15 text-accent text-xs font-bold">
                      {sec.number}
                    </span>
                    {sec.title}
                  </h3>

                  {/* Paragraphs */}
                  <div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                    {sec.paragraphs.map((p, pIdx) => (
                      <p key={pIdx}>{p}</p>
                    ))}
                  </div>

                  {/* Bullets */}
                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="mt-3 space-y-1.5 list-disc pl-5 text-sm text-muted-foreground">
                      {sec.bullets.map((b, bIdx) => (
                        <li key={bIdx}>{b}</li>
                      ))}
                    </ul>
                  )}

                  {/* Subsections */}
                  {sec.subsections && sec.subsections.length > 0 && (
                    <div className="mt-4 space-y-3 pl-2 border-l-2 border-border">
                      {sec.subsections.map((sub, subIdx) => (
                        <div key={subIdx} className="space-y-1">
                          <p className="font-semibold text-sm text-foreground">{sub.subtitle}</p>
                          {sub.paragraphs?.map((sp, spIdx) => (
                            <p key={spIdx} className="text-sm text-muted-foreground leading-relaxed">
                              {sp}
                            </p>
                          ))}
                          {sub.bullets && sub.bullets.length > 0 && (
                            <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                              {sub.bullets.map((sb, sbIdx) => (
                                <li key={sbIdx}>{sb}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))
            )}
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 z-20 border-t border-border bg-background/95 p-4 backdrop-blur-md flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-2">
              <button
                onClick={copyPrivacyLink}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
                {copied ? "Tersalin!" : "Salin Tautan"}
              </button>
              <a
                href={`mailto:${PRIVACY_POLICY.contact.email}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                <Mail className="size-3.5 text-muted-foreground" />
                Kontak Email
              </a>
            </div>

            <button
              onClick={() => onOpenChange(false)}
              className="inline-flex items-center justify-center gap-1 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Tutup
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
