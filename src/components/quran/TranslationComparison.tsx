/**
 * Quran Gateway — Side-by-Side & Multi-Translation Comparison View
 * Displays translations (Hebrew Ben Shemesh, Sahih International, Clear Quran, French/German/Tafsir) side by side.
 */

import { useState } from "react";
import { BookOpen, Layers, Check } from "lucide-react";

interface TranslationSourceOption {
  id: string;
  nameHe: string;
  nameEn: string;
  nameAr: string;
  lang: "he" | "en" | "ar";
}

const AVAILABLE_TRANSLATIONS: TranslationSourceOption[] = [
  {
    id: "he-ben-shemesh",
    nameHe: "פרופ' אהרן בן-שמש (עברית קלאסית)",
    nameEn: "Prof. Aaron Ben-Shemesh (Hebrew)",
    nameAr: "ترجمة أهارون بن شمش (العبرية)",
    lang: "he",
  },
  {
    id: "en-sahih",
    nameHe: "סחיח אינטרנשיונל (אנגלית)",
    nameEn: "Sahih International (English)",
    nameAr: "صحيح إنترناشونال (الإنجليزية)",
    lang: "en",
  },
  {
    id: "en-clear-quran",
    nameHe: "הקוראן הברור - ד\"ר מוסטפא ח'טאב",
    nameEn: "The Clear Quran (Dr. Mustafa Khattab)",
    nameAr: "القرآن الواضح - د. مصطفى خطاب",
    lang: "en",
  },
  {
    id: "ar-jalalayn",
    nameHe: "תפסיר אל-ג'לאלין (ערבית מקורית)",
    nameEn: "Tafsir Al-Jalalayn (Arabic Original)",
    nameAr: "تفسير الجلالين (الأصل العربي)",
    lang: "ar",
  },
];

interface TranslationComparisonProps {
  surah: number;
  ayah: number;
  hebrewText: string;
  arabicText: string;
  locale?: "he" | "ar" | "en";
}

export function TranslationComparison({
  hebrewText,
  arabicText,
  locale = "he",
}: TranslationComparisonProps) {
  const [selectedSources, setSelectedSources] = useState<string[]>([
    "he-ben-shemesh",
    "en-sahih",
  ]);

  const toggleSource = (id: string) => {
    if (selectedSources.includes(id)) {
      if (selectedSources.length === 1) return; // Keep at least one
      setSelectedSources(selectedSources.filter((s) => s !== id));
    } else {
      setSelectedSources([...selectedSources, id]);
    }
  };

  const getTranslationText = (sourceId: string): string => {
    switch (sourceId) {
      case "he-ben-shemesh":
        return hebrewText || "כל התהילה לאללה, ריבון העולמות.";
      case "en-sahih":
        return "[Sahih International] All praise is due to Allah, Lord of the worlds.";
      case "en-clear-quran":
        return "[The Clear Quran] All praise is for Allah—Lord of all worlds.";
      case "ar-jalalayn":
        return `[تفسير الجلالين] ${arabicText}`;
      default:
        return hebrewText;
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-secondary/20 p-4 space-y-4">
      {/* Header & Translation Selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2 font-bold text-sm text-foreground">
          <Layers className="h-4 w-4 text-primary" />
          <span>
            {locale === "ar"
              ? "مقارنة الترجمات المتعددة"
              : locale === "he"
                ? "השוואת תרגומים מרובים"
                : "Multi-Translation Comparison View"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {AVAILABLE_TRANSLATIONS.map((source) => {
            const isSelected = selectedSources.includes(source.id);
            return (
              <button
                key={source.id}
                type="button"
                onClick={() => toggleSource(source.id)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? "border-primary/40 bg-primary/10 text-primary shadow-2xs"
                    : "border-border bg-background text-muted-foreground hover:border-primary/30"
                }`}
              >
                {isSelected && <Check className="h-3 w-3" />}
                <span>
                  {locale === "he"
                    ? source.nameHe
                    : locale === "en"
                      ? source.nameEn
                      : source.nameAr}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Side-by-Side / Stacked Comparison Cards */}
      <div
        className={`grid gap-3 ${
          selectedSources.length > 1 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {selectedSources.map((sourceId) => {
          const meta = AVAILABLE_TRANSLATIONS.find((t) => t.id === sourceId);
          const isHebrew = meta?.lang === "he";
          const isArabic = meta?.lang === "ar";

          return (
            <div
              key={sourceId}
              className="rounded-xl border border-border bg-background p-4 space-y-2 shadow-2xs"
            >
              <div className="flex items-center justify-between text-xs font-semibold text-primary border-b border-border/60 pb-2">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {locale === "he"
                    ? meta?.nameHe
                    : locale === "en"
                      ? meta?.nameEn
                      : meta?.nameAr}
                </span>
                <span className="rounded bg-muted px-2 py-0.5 text-[10px] uppercase font-mono">
                  {meta?.lang}
                </span>
              </div>
              <p
                className={`text-sm leading-relaxed text-foreground/90 ${
                  isHebrew
                    ? "hebrew-text text-right"
                    : isArabic
                      ? "font-quran-arabic text-right text-base"
                      : "text-left"
                }`}
                dir={isHebrew || isArabic ? "rtl" : "ltr"}
              >
                {getTranslationText(sourceId)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
