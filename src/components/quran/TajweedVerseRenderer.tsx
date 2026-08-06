/**
 * Quran Gateway — Interactive Tajweed Verse Renderer
 * Renders Arabic text with optional Tajweed rule color coding, hover/tap tooltips, and interactive legend.
 */

import { useState } from "react";
import { parseTajweedSegments, TAJWEED_RULES, type TajweedRuleType } from "@/lib/tajweed";
import { Info, Palette } from "lucide-react";

interface TajweedVerseRendererProps {
  arabicText: string;
  fontSizeRem?: number;
  showTajweed?: boolean;
  onWordClick?: (wordIndex: number, wordText: string) => void;
  locale?: "he" | "ar" | "en";
}

export function TajweedVerseRenderer({
  arabicText,
  fontSizeRem = 2.1,
  showTajweed = true,
  onWordClick,
  locale = "he",
}: TajweedVerseRendererProps) {
  const [activeRuleHover, setActiveRuleHover] = useState<TajweedRuleType | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  const segments = parseTajweedSegments(arabicText);

  // Split text by space for word-level click handlers
  const words = arabicText.split(" ");

  return (
    <div className="relative space-y-3">
      {/* Tajweed Toggle & Legend Button */}
      <div className="flex items-center justify-end gap-2 text-xs">
        <button
          type="button"
          onClick={() => setShowLegend((v) => !v)}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-background/80 px-2.5 py-1 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
        >
          <Palette className="h-3.5 w-3.5 text-primary" />
          <span>
            {locale === "ar"
              ? "دليل أحكام التجويد"
              : locale === "he"
                ? "מקרא כללי תג'וויד"
                : "Tajweed Legend"}
          </span>
        </button>
      </div>

      {/* Tajweed Legend Modal / Accordion */}
      {showLegend && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2 text-xs backdrop-blur-sm animate-in fade-in">
          <div className="flex items-center gap-1.5 font-bold text-primary border-b border-primary/10 pb-1.5">
            <Info className="h-4 w-4" />
            <span>
              {locale === "ar"
                ? "أحكام التجويد الملونة"
                : locale === "he"
                  ? "כללי התג'וויד וההגייה המדויקת"
                  : "Tajweed Recitation Rules Guide"}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {Object.values(TAJWEED_RULES).map((rule) => (
              <div
                key={rule.type}
                className={`rounded-lg border p-2 flex flex-col gap-1 transition-all ${rule.badgeClass}`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>{rule.nameAr}</span>
                  <span
                    className="h-2.5 w-2.5 rounded-full inline-block shadow-xs"
                    style={{ backgroundColor: rule.colorHex }}
                  />
                </div>
                <div className="text-[11px] opacity-90">
                  {locale === "he"
                    ? rule.nameHe
                    : locale === "en"
                      ? rule.nameEn
                      : rule.descriptionEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rendered Arabic Verse Text */}
      <div
        className="ayah-text leading-relaxed text-right text-foreground font-quran-arabic tracking-wide select-text py-2"
        dir="rtl"
        lang="ar"
        style={{ fontSize: `${fontSizeRem}rem` }}
      >
        {!showTajweed
          ? // Plain Text Display with Word Click Handlers
            words.map((w, idx) => (
              <span
                key={`${idx}-${w}`}
                onClick={() => onWordClick?.(idx + 1, w)}
                className="hover:bg-primary/10 hover:rounded px-1 cursor-pointer transition-colors inline-block"
              >
                {w}{" "}
              </span>
            ))
          : // Annotated Tajweed Display
            segments.map((seg, idx) => {
              if (!seg.rule) {
                return <span key={idx}>{seg.text}</span>;
              }

              const ruleMeta = TAJWEED_RULES[seg.rule];
              const isHovered = activeRuleHover === seg.rule;

              return (
                <span
                  key={idx}
                  onMouseEnter={() => setActiveRuleHover(seg.rule ?? null)}
                  onMouseLeave={() => setActiveRuleHover(null)}
                  className={`transition-all duration-200 cursor-help rounded px-0.5 relative inline-block ${
                    ruleMeta ? ruleMeta.textClass : ""
                  } ${isHovered ? "bg-primary/20 ring-1 ring-primary/40 scale-105" : ""}`}
                  title={`${ruleMeta?.nameAr || ""} - ${locale === "he" ? ruleMeta?.nameHe : ruleMeta?.nameEn}`}
                >
                  {seg.text}
                </span>
              );
            })}
      </div>
    </div>
  );
}
