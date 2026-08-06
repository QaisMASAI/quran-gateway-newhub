/**
 * Quran Gateway — Premium Verse Display System
 * Supports 5 Display Modes (Reading, Study, Teaching, Memorization, Comparison),
 * Tajweed color coding, Word-by-Word Morphology, Advanced Audio Controls, and Related Content.
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  GraduationCap,
  Brain,
  Layers,
  Sparkles,
  BookText,
  Star,
  NotebookPen,
  GitFork,
  Eye,
  EyeOff,
  Tag,
  User,
  HeartHandshake,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "react-i18next";
import { useFavorites } from "@/lib/favorites";
import { useReadingSettings } from "@/lib/reading-settings";
import { normalizeLocale } from "@/lib/i18n";
import { cleanText } from "@/lib/quran-api";
import { getVerseMorphology, type WordMorphology } from "@/lib/morphology";
import { getVerseRelations } from "@/lib/verse-relations";
import { TajweedVerseRenderer } from "@/components/quran/TajweedVerseRenderer";
import { WordMorphologyModal } from "@/components/quran/WordMorphologyModal";
import { AudioPlayerControls } from "@/components/quran/AudioPlayerControls";
import { TranslationComparison } from "@/components/quran/TranslationComparison";
import { ShareButtons } from "@/components/ShareButtons";
import { NotePanel } from "@/components/NotePanel";
import { getAyahLinks, getConnectedVerses } from "@/lib/ayah-links";

export type VerseDisplayMode = "reading" | "study" | "teaching" | "memorization" | "comparison";

export interface PremiumVerseCardProps {
  surah: number;
  surahName: string;
  ayah: number;
  arabic: string;
  hebrew: string;
  highlight?: string;
  maxAyahInSurah?: number;
  initialMode?: VerseDisplayMode;
}

export function PremiumVerseCard({
  surah,
  surahName,
  ayah,
  arabic,
  hebrew,
  maxAyahInSurah,
  initialMode = "study",
}: PremiumVerseCardProps) {
  const { isFav, toggle } = useFavorites();
  const fav = isFav(surah, ayah);
  const { t, i18n } = useTranslation("common");
  const locale = (normalizeLocale(i18n.language) ?? "he") as "he" | "ar" | "en";

  const [mode, setMode] = useState<VerseDisplayMode>(initialMode);
  const [selectedWord, setSelectedWord] = useState<WordMorphology | null>(null);
  const [showNote, setShowNote] = useState(false);
  const [panel, setPanel] = useState<null | "tafsir" | "sabab">(null);
  const [hifzMasked, setHifzMasked] = useState(false);
  const [reading] = useReadingSettings();

  const verseKey = `${surah}:${ayah}`;
  const morphologyWords = useMemo(
    () => getVerseMorphology(verseKey, arabic),
    [verseKey, arabic],
  );
  const relations = useMemo(
    () => getVerseRelations(surah, ayah, locale),
    [surah, ayah, locale],
  );
  const links = useMemo(() => getAyahLinks(surah, ayah, locale), [surah, ayah, locale]);
  const connectedVerses = useMemo(
    () => getConnectedVerses(surah, ayah, 4, locale),
    [surah, ayah, locale],
  );

  const articleRef = useRef<HTMLElement | null>(null);

  const modeLabels: Record<
    VerseDisplayMode,
    { labelAr: string; labelHe: string; labelEn: string; icon: typeof BookOpen }
  > = {
    reading: { labelAr: "مراءة", labelHe: "מצב קריאה", labelEn: "Reading", icon: BookOpen },
    study: { labelAr: "دراسة وتجويذ", labelHe: "מצב עיון ותג'וויד", labelEn: "Study", icon: Sparkles },
    teaching: { labelAr: "تعليم", labelHe: "מצב הוראה וניתוח", labelEn: "Teaching", icon: GraduationCap },
    memorization: { labelAr: "حفظ", labelHe: "מצב שינון (חפז)", labelEn: "Memorization", icon: Brain },
    comparison: { labelAr: "مقارنة", labelHe: "השוואת תרגומים", labelEn: "Comparison", icon: Layers },
  };

  return (
    <article
      ref={articleRef}
      id={`v-${ayah}`}
      className="relative rounded-2xl border border-border/80 bg-card/80 p-5 sm:p-7 shadow-xs transition-all duration-300 hover:border-primary/40 hover:shadow-md backdrop-blur-md scroll-mt-24 space-y-5"
    >
      {/* Ayah Badge & Mode Switcher Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
        {/* Ayah number badge */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/20 bg-primary-soft text-xs font-bold text-primary shadow-2xs">
            {ayah}
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {surahName} {surah}:{ayah}
          </span>
        </div>

        {/* Display Mode Selector Chips */}
        <div className="flex flex-wrap items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border">
          {(Object.keys(modeLabels) as VerseDisplayMode[]).map((mKey) => {
            const meta = modeLabels[mKey];
            const Icon = meta.icon;
            const isActive = mode === mKey;
            return (
              <button
                key={mKey}
                type="button"
                onClick={() => setMode(mKey)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-background text-primary font-bold shadow-2xs border border-border"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : ""}`} />
                <span>{locale === "he" ? meta.labelHe : locale === "en" ? meta.labelEn : meta.labelAr}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Verse Rendering Container */}
      <div className="space-y-4">
        {/* Tajweed & Interactive Arabic Text */}
        <TajweedVerseRenderer
          arabicText={arabic}
          fontSizeRem={1.85 * reading.arabicScale}
          showTajweed={mode === "study" || mode === "teaching"}
          locale={locale}
          onWordClick={(wordIdx) => {
            const wordData = morphologyWords.find((w) => w.wordIndex === wordIdx);
            if (wordData) setSelectedWord(wordData);
          }}
        />

        {/* Word-by-Word Morphology Chips Bar (Visible in Study & Teaching modes) */}
        {(mode === "study" || mode === "teaching") && (
          <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>
                {locale === "ar"
                  ? "التحليل الصرفي المباشر (اضغط على أي كلمة)"
                  : locale === "he"
                    ? "ניתוח מורפולוגי מבוסס מילים (לחץ על מילה לפרטים)"
                    : "Word-by-Word Morphology Analysis (Click any word)"}
              </span>
              <span className="text-[10px] text-primary">{morphologyWords.length} words</span>
            </div>
            <div className="flex flex-wrap gap-1.5" dir="rtl">
              {morphologyWords.map((word) => (
                <button
                  key={word.wordIndex}
                  type="button"
                  onClick={() => setSelectedWord(word)}
                  className="group rounded-lg border border-border bg-background px-2.5 py-1.5 text-center transition-all hover:border-primary/50 hover:shadow-2xs"
                >
                  <div className="text-sm font-bold font-quran-arabic text-primary group-hover:scale-105 transition-transform">
                    {word.wordArabic}
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono">
                    {word.root}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Teaching Mode Special Annotations */}
        {mode === "teaching" && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
              <GraduationCap className="h-4 w-4" />
              <span>
                {locale === "ar"
                  ? "ملاحظات وتوجيهات المعلم والتدبر"
                  : locale === "he"
                    ? "הערות והנחיות מורה ללימוד ושינון"
                    : "Teacher Annotations & Recitation Rules"}
              </span>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              {locale === "he"
                ? "שִים לֵב להקפדה על הברה נכונה של כללי התג'וויד בקטע זה. שי לב לקלקלה באותיות העצירה ולמתיחת המד."
                : "Pay special attention to clear pronunciation and proper Tajweed elongation on the Madd rules highlighted above."}
            </p>
          </div>
        )}

        {/* Translation Section (Masked in Memorization Mode) */}
        {mode !== "comparison" && locale !== "ar" && (
          <div
            className={`transition-all duration-300 ${
              hifzMasked || mode === "memorization"
                ? "blur-md select-none opacity-40 hover:blur-none cursor-pointer"
                : ""
            }`}
          >
            <p
              className={
                locale === "he"
                  ? "hebrew-text text-[15px] text-foreground/85 leading-relaxed text-right"
                  : "font-reading-en text-[15px] leading-relaxed text-foreground/85 text-left"
              }
              dir={locale === "he" ? "rtl" : "ltr"}
            >
              {cleanText(hebrew)}
            </p>
          </div>
        )}

        {/* Comparison Mode Component */}
        {mode === "comparison" && (
          <TranslationComparison
            surah={surah}
            ayah={ayah}
            hebrewText={hebrew}
            arabicText={arabic}
            locale={locale}
          />
        )}
      </div>

      {/* Advanced Audio Controls Toolbar */}
      <AudioPlayerControls
        surah={surah}
        surahName={surahName}
        ayah={ayah}
        maxAyahInSurah={maxAyahInSurah}
        arabicText={arabic}
        translationText={hebrew}
        locale={locale}
      />

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {/* Memorization Mask Toggle */}
        <button
          type="button"
          onClick={() => setHifzMasked((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            hifzMasked
              ? "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "border-border bg-background text-muted-foreground hover:border-primary/30"
          }`}
        >
          {hifzMasked ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          <span>{hifzMasked ? "Show Translation" : "Hifz Mask"}</span>
        </button>

        {/* Tafsir Panel Toggle */}
        <button
          type="button"
          onClick={() => setPanel(panel === "tafsir" ? null : "tafsir")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            panel === "tafsir"
              ? "border-primary/40 bg-primary/10 text-primary font-bold"
              : "border-border bg-background text-muted-foreground hover:border-primary/30"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t("ui.ayah.tafsir")}</span>
        </button>

        {/* Asbab Nuzul Panel Toggle */}
        <button
          type="button"
          onClick={() => setPanel(panel === "sabab" ? null : "sabab")}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            panel === "sabab"
              ? "border-primary/40 bg-primary/10 text-primary font-bold"
              : "border-border bg-background text-muted-foreground hover:border-primary/30"
          }`}
        >
          <BookText className="h-3.5 w-3.5" />
          <span>{t("ui.ayah.sabab")}</span>
        </button>

        {/* Bookmark / Save */}
        <button
          type="button"
          onClick={() => toggle({ surah, ayah, surahName, arabic, hebrew })}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            fav
              ? "border-gold/40 bg-gold/15 text-foreground font-bold"
              : "border-border bg-background text-muted-foreground hover:border-primary/30"
          }`}
        >
          <Star className={`h-3.5 w-3.5 ${fav ? "fill-current text-gold" : ""}`} />
          <span>{fav ? t("ui.ayah.saved") : t("ui.ayah.save")}</span>
        </button>

        {/* Personal Notes Panel Toggle */}
        <button
          type="button"
          onClick={() => setShowNote((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            showNote
              ? "border-primary/40 bg-primary/10 text-primary font-bold"
              : "border-border bg-background text-muted-foreground hover:border-primary/30"
          }`}
        >
          <NotebookPen className="h-3.5 w-3.5" />
          <span>{t("ui.ayah.note")}</span>
        </button>
      </div>

      {showNote && <NotePanel surah={surah} ayah={ayah} onClose={() => setShowNote(false)} />}

      {/* Tafsir/Asbab Inline Panel */}
      {panel && (
        <div className="rounded-xl border border-border bg-secondary/40 p-4 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-1.5 text-xs font-bold text-primary uppercase tracking-wide">
            {panel === "tafsir" ? <Sparkles className="h-4 w-4" /> : <BookText className="h-4 w-4" />}
            <span>{panel === "tafsir" ? t("ui.ayah.tafsirTitle") : t("ui.ayah.sababTitle")}</span>
          </div>
          <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed">
            <ReactMarkdown skipHtml>
              {panel === "tafsir"
                ? "### תפסיר אל-ג'לאלין\nכל התהילה והשבח מגיעים לאללה לבדו, הבורא והמכלכל של כל העולמות והנבראים."
                : "### סיבת ההתגלות (אסבאב א-נזול)\nהפסוק ירד כדי לבאר את ראשית ההודיה לה' יתברך בפתח הספר הקדוש."}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Related Content & Similar Verses Section */}
      {relations.length > 0 && (
        <div className="rounded-xl border border-border bg-secondary/20 p-3 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
            <GitFork className="h-3.5 w-3.5 text-primary" />
            <span>
              {locale === "ar"
                ? "الآيات المترابطة والمشابهة (المتشابهات)"
                : locale === "he"
                  ? "פסוקים דומים ואשכולות נושאיים"
                  : "Related & Similar Verses (Mutashabihat)"}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {relations.map((rel) => (
              <Link
                key={rel.verseKey}
                to="/surah/$id"
                params={{ id: String(rel.surah) }}
                hash={`v-${rel.ayah}`}
                search={{ q: undefined }}
                className="group rounded-lg border border-border bg-background p-2.5 transition-all hover:border-primary/40 hover:shadow-2xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-primary font-semibold">
                  <span>{rel.surahNameHe} ({rel.verseKey})</span>
                  <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px]">
                    {rel.relationshipType}
                  </span>
                </div>
                <div className="text-[11px] text-foreground/80 mt-1 line-clamp-1 font-quran-arabic" dir="rtl">
                  {rel.arabicSnippet}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Thematic Links */}
      {links.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-border pt-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("ui.ayah.related")}
          </span>
          {links.map((l) => {
            const Icon = l.kind === "prophet" ? User : l.kind === "emotion" ? HeartHandshake : Tag;
            return (
              <Link
                key={`${l.kind}-${l.slug}`}
                to="/learn/$kind/$slug"
                params={{ kind: l.kind === "prophet" ? "prophet" : "topic", slug: l.slug }}
                className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary hover:border-primary/50 transition-colors"
              >
                <Icon className="h-3 w-3" />
                <span>{l.title}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Share Buttons */}
      <div className="border-t border-border pt-3">
        <ShareButtons
          surah={surah}
          ayah={ayah}
          surahName={surahName}
          arabic={arabic}
          hebrew={cleanText(hebrew)}
        />
      </div>

      {/* Word Morphology Modal */}
      <WordMorphologyModal
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
        locale={locale}
      />
    </article>
  );
}
