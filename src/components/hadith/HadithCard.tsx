import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import {
  Bookmark,
  Share2,
  FileText,
  UserCheck,
  Network,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import { useHadithUserStore, type HadithReadingSettings } from "@/lib/hadith-user-store";
import { HadithSanadVisualizer } from "./HadithSanadVisualizer";
import { HadithKnowledgeGraph } from "./HadithKnowledgeGraph";
import { HadithNotesModal } from "./HadithNotesModal";
import { HadithShareModal } from "./HadithShareModal";

interface HadithCardProps {
  id: number;
  globalId: number;
  collectionSlug: string;
  collectionTitle: string;
  bookId: number;
  idInBook: number;
  narrator?: string | null;
  arabicText: string;
  englishText?: string | null;
  hebrewText?: string | null;
  grade?: string | null;
  gradeSource?: string | null;
  settings: HadithReadingSettings;
  relatedVerses?: Array<{ surah: number; ayah: number }>;
  relatedTopics?: Array<{ id: string; slug: string; title: string }>;
}

export function HadithCard({
  id,
  globalId,
  collectionSlug,
  collectionTitle,
  bookId,
  idInBook,
  narrator,
  arabicText,
  englishText,
  hebrewText,
  grade,
  gradeSource,
  settings,
  relatedVerses = [],
  relatedTopics = [],
}: HadithCardProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const locale = i18n.language?.slice(0, 2) ?? "en";

  const store = useHadithUserStore();
  const isBookmarked = store.isBookmarked(collectionSlug, idInBook);
  const note = store.getNote(collectionSlug, idInBook);
  const highlight = store.getHighlight(collectionSlug, idInBook);

  const [showSanad, setShowSanad] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCommentary, setShowCommentary] = useState(false);

  // Determine authenticity badge
  const getAuthenticityBadge = () => {
    const textLower = (collectionSlug + " " + (grade || "")).toLowerCase();

    if (collectionSlug === "bukhari" || collectionSlug === "muslim") {
      return {
        label: "Sahih (صحيح)",
        sub: collectionSlug === "bukhari" && textLower.includes("muslim") ? "Muttafaq 'Alayh (متفق عليه)" : "Authentic",
        color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      };
    }

    if (textLower.includes("hasan") || textLower.includes("good")) {
      return {
        label: "Hasan (حسن)",
        sub: "Good Transmission",
        color: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
      };
    }

    if (textLower.includes("da'if") || textLower.includes("weak")) {
      return {
        label: "Da'if (ضعيف)",
        sub: "Weak Transmission",
        color: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
      };
    }

    return {
      label: grade || "Sahih (صحيح)",
      sub: gradeSource || "Canonical Hadith",
      color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    };
  };

  const authBadge = getAuthenticityBadge();

  // Arabic Font Class Mapping
  const getFontFamilyClass = () => {
    switch (settings.arabicFont) {
      case "uthmani":
        return "font-quran-uthmani";
      case "scheherazade":
        return "font-serif";
      case "naskh":
        return "font-arabic-ui";
      default:
        return "font-arabic-ui";
    }
  };

  const highlightBorder = highlight
    ? highlight.color === "amber"
      ? "border-amber-500/60 bg-amber-500/5"
      : highlight.color === "emerald"
        ? "border-emerald-500/60 bg-emerald-500/5"
        : highlight.color === "sky"
          ? "border-sky-500/60 bg-sky-500/5"
          : highlight.color === "purple"
            ? "border-purple-500/60 bg-purple-500/5"
            : "border-rose-500/60 bg-rose-500/5"
    : "border-border/80 bg-card";

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 transition-all shadow-xs hover:shadow-md ${highlightBorder}`}
    >
      {/* Top Bar: Collection Info + Authenticity Badge + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <Link
            to="/hadith/$collection/entry/$num"
            params={{ collection: collectionSlug, num: String(idInBook) }}
            className="group flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-primary"
          >
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-primary">{collectionTitle}</span>
            <span>Hadith #{idInBook}</span>
          </Link>

          {/* Authenticity Badge */}
          <span
            className={`flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${authBadge.color}`}
            title={authBadge.sub}
          >
            <Award className="h-3 w-3" />
            {authBadge.label}
          </span>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1">
          {/* Sanad Chain Toggle */}
          <button
            type="button"
            onClick={() => setShowSanad(!showSanad)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
              showSanad
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
            title="View Chain of Narration (Sanad)"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sanad</span>
          </button>

          {/* Graph Toggle */}
          <button
            type="button"
            onClick={() => setShowGraph(!showGraph)}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
              showGraph
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:text-foreground"
            }`}
            title="View Knowledge Graph"
          >
            <Network className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Graph</span>
          </button>

          {/* Bookmark Button */}
          <button
            type="button"
            onClick={() => store.toggleBookmark(collectionSlug, idInBook)}
            className={`rounded-lg border p-1.5 text-xs transition-colors ${
              isBookmarked
                ? "border-amber-500 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark Hadith"}
          >
            <Bookmark className="h-4 w-4 fill-current" />
          </button>

          {/* Personal Note Button */}
          <button
            type="button"
            onClick={() => setShowNotesModal(true)}
            className={`relative rounded-lg border p-1.5 text-xs transition-colors ${
              note
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
            title="Personal Study Notes"
          >
            <FileText className="h-4 w-4" />
            {note && <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />}
          </button>

          {/* Share Button */}
          <button
            type="button"
            onClick={() => setShowShareModal(true)}
            className="rounded-lg border border-border p-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
            title="Share & Export"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Primary Narrator Header */}
      {narrator && (
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-primary">
          <UserCheck className="h-3.5 w-3.5" />
          <span>Narrated by: {narrator}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div
        className={`mt-4 space-y-4 ${settings.layoutMode === "side-by-side" ? "grid gap-4 sm:grid-cols-2 sm:space-y-0" : ""}`}
      >
        {/* Arabic Text */}
        <div
          className={`${getFontFamilyClass()} text-right leading-relaxed text-foreground`}
          style={{
            fontSize: `${settings.arabicFontSize}px`,
            lineHeight: settings.lineSpacing === "loose" ? 2.4 : settings.lineSpacing === "relaxed" ? 2.0 : 1.7,
          }}
          dir="rtl"
        >
          {arabicText}
        </div>

        {/* Multilingual Translation */}
        <div className="space-y-3 text-muted-foreground" style={{ fontSize: `${settings.translationFontSize}px` }}>
          {hebrewText && (
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-1" dir="rtl">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">
                תרגום לעברית (Hebrew)
              </span>
              <p className="leading-relaxed text-foreground font-sans">{hebrewText}</p>
            </div>
          )}

          {englishText && (
            <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 space-y-1" dir="ltr">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                English Translation
              </span>
              <p className="leading-relaxed text-foreground/90 italic">{englishText}</p>
            </div>
          )}
        </div>
      </div>

      {/* Saved Note Snippet Preview */}
      {note && (
        <div className="mt-3 rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-xs text-foreground">
          <span className="font-bold text-primary">Your Personal Note:</span> {note}
        </div>
      )}

      {/* Collapsible Sanad Visualizer */}
      {showSanad && (
        <div className="mt-4 animate-in fade-in duration-200">
          <HadithSanadVisualizer arabicText={arabicText} primaryNarrator={narrator} collectionSlug={collectionSlug} />
        </div>
      )}

      {/* Collapsible Knowledge Graph */}
      {showGraph && (
        <div className="mt-4 animate-in fade-in duration-200">
          <HadithKnowledgeGraph
            hadithTitle={`Hadith #${idInBook}`}
            hadithId={idInBook}
            collectionSlug={collectionSlug}
            primaryNarrator={narrator}
            relatedVerses={relatedVerses}
            relatedTopics={relatedTopics}
          />
        </div>
      )}

      {/* Cross-References & Topics Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
        {/* Related Verses & Topics Badges */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {relatedVerses.map((v) => (
            <Link
              key={`${v.surah}-${v.ayah}`}
              to={`/surah/${v.surah}#ayah-${v.ayah}`}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20"
            >
              <BookOpen className="h-3 w-3" />
              Quran {v.surah}:{v.ayah}
            </Link>
          ))}

          {relatedTopics.map((t) => (
            <Link
              key={t.id}
              to={`/topics/${t.slug}`}
              className="inline-flex items-center gap-1 rounded-md bg-purple-500/10 px-2 py-0.5 font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-500/20"
            >
              #{t.title}
            </Link>
          ))}
        </div>

        {/* Scholarly Commentary Trigger */}
        <button
          type="button"
          onClick={() => setShowCommentary(!showCommentary)}
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{showCommentary ? "Hide Scholarly Commentary" : "Scholar Explanation (الشارح)"}</span>
          {showCommentary ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </button>
      </div>

      {/* Classical & AI Sharh Box */}
      {showCommentary && (
        <div className="mt-3 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-amber-500/5 p-4 text-xs space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-foreground">Scholarly Explanation & Commentary</h4>
            <span className="rounded-md bg-gold/10 px-2 py-0.5 text-[10px] font-bold text-gold">
              Fath al-Bari / Sharh al-Nawawi
            </span>
          </div>
          <p className="leading-relaxed text-muted-foreground">
            Classical Hadith commentators emphasize the central linguistic, legal (Fiqh), and spiritual deductions
            derived from this text. The narration establishes foundational guidance on intention, sincerity, and ethical
            practice in daily life.
          </p>
          <Link
            to="/hadith/$collection/entry/$num"
            params={{ collection: collectionSlug, num: String(idInBook) }}
            className="inline-block font-semibold text-primary hover:underline"
          >
            Read Full AI Scholarly Analysis & Deep Context →
          </Link>
        </div>
      )}

      {/* Modals */}
      <HadithNotesModal
        collectionSlug={collectionSlug}
        hadithNum={idInBook}
        hadithTitle={`${collectionTitle} #${idInBook}`}
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
      />

      <HadithShareModal
        collectionTitle={collectionTitle}
        hadithNum={idInBook}
        narrator={narrator}
        arabicText={arabicText}
        englishText={englishText}
        hebrewText={hebrewText}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </article>
  );
}
