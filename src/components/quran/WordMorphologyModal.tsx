/**
 * Quran Gateway — Word-by-Word Morphological Breakdown Modal
 * Displays root (الجذر), pattern (الوزن), part of speech, grammatical case, translation, and root occurrences.
 */

import { X, BookOpen, Layers, Sparkles, Hash } from "lucide-react";
import type { WordMorphology } from "@/lib/morphology";

interface WordMorphologyModalProps {
  word: WordMorphology | null;
  onClose: () => void;
  locale?: "he" | "ar" | "en";
}

export function WordMorphologyModal({
  word,
  onClose,
  locale = "he",
}: WordMorphologyModalProps) {
  if (!word) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div
        className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 overflow-hidden"
        dir={locale === "en" ? "ltr" : "rtl"}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Word Display Header */}
        <div className="text-center space-y-2 border-b border-border pb-4">
          <span className="inline-block rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-semibold text-primary">
            {locale === "ar"
              ? `الكلمة رقم ${word.wordIndex}`
              : locale === "he"
                ? `מילה מספר ${word.wordIndex}`
                : `Word #${word.wordIndex}`}
          </span>
          <h3
            className="text-4xl font-bold font-quran-arabic text-primary tracking-wide pt-1"
            dir="rtl"
          >
            {word.wordArabic}
          </h3>
          <p className="text-base text-foreground/80 font-medium">
            {locale === "he" ? word.translationHe : word.translationEn}
          </p>
        </div>

        {/* Morphological Analysis Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {/* Root (الجذر) */}
          <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 text-primary" />
              <span>
                {locale === "ar" ? "الجذر اللغوي" : locale === "he" ? "השורش" : "Root"}
              </span>
            </div>
            <div
              className="text-xl font-bold text-primary font-quran-arabic tracking-widest"
              dir="rtl"
            >
              {word.root}
            </div>
          </div>

          {/* Pattern (الوزن) */}
          <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Layers className="h-3.5 w-3.5 text-gold" />
              <span>
                {locale === "ar" ? "الوزن الصرفي" : locale === "he" ? "המשקל" : "Pattern"}
              </span>
            </div>
            <div className="text-xl font-bold text-foreground font-quran-arabic" dir="rtl">
              {word.pattern}
            </div>
          </div>

          {/* Part of Speech (نوع الكلمة) */}
          <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>
                {locale === "ar" ? "نوع الكلمة" : locale === "he" ? "חלק הדיבור" : "Part of Speech"}
              </span>
            </div>
            <div className="text-sm font-semibold text-foreground">
              {locale === "ar"
                ? word.partOfSpeech
                : locale === "he"
                  ? word.posHebrew
                  : word.posEnglish}
            </div>
          </div>

          {/* Grammatical Case (الإعراب) */}
          <div className="rounded-xl border border-border bg-secondary/30 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Hash className="h-3.5 w-3.5 text-blue-500" />
              <span>
                {locale === "ar" ? "الإعراب" : locale === "he" ? "יחסה ونيتوح" : "Grammar Case"}
              </span>
            </div>
            <div className="text-xs font-semibold text-foreground">
              {locale === "ar"
                ? word.grammarCase
                : locale === "he"
                  ? word.grammarCaseHe
                  : word.grammarCaseEn}
            </div>
          </div>
        </div>

        {/* Root Meaning & Occurrences */}
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2 text-xs">
          <div className="font-bold text-primary flex items-center justify-between">
            <span>
              {locale === "ar"
                ? "دلالة الجذر في القرآن الكريم"
                : locale === "he"
                  ? "משמעות השורש והופעותיו במקרא הקוראني"
                  : "Root Meaning & Quranic Occurrences"}
            </span>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
              {word.quranOccurrencesCount}{" "}
              {locale === "ar" ? "مرة" : locale === "he" ? "הופעות" : "times"}
            </span>
          </div>
          <p className="text-foreground/80 leading-relaxed">
            {locale === "he" ? word.rootMeaningHe : word.rootMeaningEn}
          </p>
          {word.exampleVerses.length > 0 && (
            <div className="pt-2 border-t border-primary/10 flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-muted-foreground">
                {locale === "he" ? "פסוקים לדוגמה:" : "Example Verses:"}
              </span>
              {word.exampleVerses.map((vKey) => (
                <span
                  key={vKey}
                  className="rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-mono text-primary"
                >
                  {vKey}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
