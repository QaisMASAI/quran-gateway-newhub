import { useState } from "react";
import { X, Copy, Check, Share2, Quote, BookOpen } from "lucide-react";

interface HadithShareModalProps {
  collectionTitle: string;
  hadithNum: number;
  narrator?: string | null;
  arabicText: string;
  englishText?: string | null;
  hebrewText?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function HadithShareModal({
  collectionTitle,
  hadithNum,
  narrator,
  arabicText,
  englishText,
  hebrewText,
  isOpen,
  onClose,
}: HadithShareModalProps) {
  const [copiedType, setCopiedType] = useState<"text" | "citation" | null>(null);

  if (!isOpen) return null;

  const formattedText = `"${narrator ? narrator + ": " : ""}${englishText || arabicText}"\n\n— ${collectionTitle}, Hadith #${hadithNum}\n\nRead more on Quran Explorer: ${typeof window !== "undefined" ? window.location.href : ""}`;

  const formattedCitation = `${collectionTitle}. Hadith No. ${hadithNum}. Narrated by ${narrator || "Unknown"}. Retrievable at ${typeof window !== "undefined" ? window.location.href : ""}`;

  const handleCopy = (text: string, type: "text" | "citation") => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl animate-in fade-in zoom-in duration-150">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Share & Export Hadith</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Visual Quote Card Preview */}
        <div className="mt-4 rounded-2xl border border-gold/30 bg-gradient-to-br from-amber-500/10 via-background to-emerald-500/5 p-4 shadow-xs">
          <Quote className="h-6 w-6 text-gold mb-2 opacity-60" />
          <p
            className="font-arabic-ui text-sm font-semibold leading-relaxed text-foreground"
            dir="rtl"
          >
            {arabicText.length > 200 ? arabicText.slice(0, 200) + "..." : arabicText}
          </p>
          {(englishText || hebrewText) && (
            <p className="mt-3 text-xs italic text-muted-foreground">
              "{englishText || hebrewText}"
            </p>
          )}
          <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[10px] font-bold text-primary">
            <span>
              {collectionTitle} #{hadithNum}
            </span>
            <span>{narrator}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={() => handleCopy(formattedText, "text")}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-primary" />
              <span>Copy Full Formatted Text</span>
            </div>
            {copiedType === "text" ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <Check className="h-3.5 w-3.5" /> Copied
              </span>
            ) : (
              <span className="text-muted-foreground">Text</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleCopy(formattedCitation, "citation")}
            className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>Copy Academic Citation (Chicago/APA)</span>
            </div>
            {copiedType === "citation" ? (
              <span className="flex items-center gap-1 text-emerald-600 font-bold">
                <Check className="h-3.5 w-3.5" /> Copied
              </span>
            ) : (
              <span className="text-muted-foreground">Citation</span>
            )}
          </button>
        </div>

        <div className="mt-5 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-secondary px-4 py-1.5 text-xs font-semibold text-secondary-foreground hover:bg-secondary/80"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
