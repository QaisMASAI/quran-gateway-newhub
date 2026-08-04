import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { getHadithKnowledgeBundle } from "@/lib/hadith.functions";
import { PassageCard } from "@/components/discovery/PassageCard";
import { EntityCard } from "@/components/discovery/EntityCard";
import { normalizeLocale } from "@/lib/i18n";
import { useHadithUserStore } from "@/lib/hadith-user-store";
import { HadithTypographySettings } from "@/components/hadith/HadithTypographySettings";
import { HadithSanadVisualizer } from "@/components/hadith/HadithSanadVisualizer";
import { HadithKnowledgeGraph } from "@/components/hadith/HadithKnowledgeGraph";
import { HadithAiAssistant } from "@/components/hadith/HadithAiAssistant";
import { HadithNotesBookmarksModal } from "@/components/hadith/HadithNotesBookmarksModal";
import { HadithShareModal } from "@/components/hadith/HadithShareModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  BookOpen,
  Layers,
  Users,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  FileText,
  Award,
  UserCheck,
  Network,
  ExternalLink,
  ShieldCheck,
  Quote,
  ScrollText,
} from "lucide-react";

export const Route = createFileRoute("/hadith/$collection/entry/$num")({
  head: ({ params }) => {
    const label =
      params.collection === "bukhari"
        ? "Sahih al-Bukhari"
        : params.collection === "muslim"
          ? "Sahih Muslim"
          : params.collection;
    const title = `${label} — Hadith #${params.num} | Authentic Hadith & Scholarly Analysis`;
    const description = `Read authenticated hadith text in Arabic, Hebrew, and English with isnad transmission chains, juristic analysis, and cross-referenced Quran verses.`;
    const canonical = `/hadith/${params.collection}/entry/${params.num}`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        { property: "og:type", content: "article" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  loader: async ({ context, params }) => {
    if (!params.collection || params.collection.trim().length === 0) throw notFound();
    const num = Number(params.num);
    if (!Number.isFinite(num) || num < 1) throw notFound();
    const bundle = await context.queryClient.ensureQueryData({
      queryKey: ["hadith", "knowledge", params.collection, num],
      queryFn: () => getHadithKnowledgeBundle({ data: { collection: params.collection, num } }),
    });
    return { bundle };
  },
  component: HadithDetailPage,
});

function HadithDetailPage() {
  const { collection, num } = Route.useParams();
  const numId = Number(num);
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const locale = normalizeLocale(i18n.language) ?? "he";

  const [activeTab, setActiveTab] = useState<"read" | "ai" | "cross_ref" | "graph">("read");
  const [focusMode, setFocusMode] = useState(false);
  const [notesBookmarksOpen, setNotesBookmarksOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const store = useHadithUserStore();
  const bundleFn = useServerFn(getHadithKnowledgeBundle);

  const {
    data: bundle,
    isLoading: bundleLoading,
    isError: bundleError,
  } = useQuery({
    queryKey: ["hadith", "knowledge", collection, numId],
    queryFn: () => bundleFn({ data: { collection, num: numId } }),
  });

  const h = bundle?.entry;
  const collectionLabel =
    bundle?.collection?.title_en ??
    (collection === "bukhari"
      ? "Sahih al-Bukhari"
      : collection === "muslim"
        ? "Sahih Muslim"
        : collection.toUpperCase());

  const isBookmarked = store.isBookmarked(collection, numId);

  const handlePrev = () => {
    if (numId > 1) {
      navigate({
        to: "/hadith/$collection/entry/$num",
        params: { collection, num: String(numId - 1) },
      });
    }
  };

  const handleNext = () => {
    navigate({
      to: "/hadith/$collection/entry/$num",
      params: { collection, num: String(numId + 1) },
    });
  };

  if (bundleLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-12 text-center text-sm text-muted-foreground space-y-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto" />
          <p>Loading authenticated Hadith text & interconnected sources…</p>
        </main>
      </div>
    );
  }

  if (bundleError || !h) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-4xl px-4 py-12 text-center text-sm text-destructive">
          Failed to load Hadith entry #{numId}. Please verify the collection name or number.
        </main>
      </div>
    );
  }

  // Authenticity badge helper
  const getAuthenticityBadge = () => {
    if (collection === "bukhari" || collection === "muslim") {
      return {
        label: locale === "ar" ? "صحيح" : locale === "he" ? "צחיח (מוסמך)" : "Sahih (Authentic)",
        color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      };
    }
    return {
      label: locale === "ar" ? "صحيح الإسناد" : locale === "he" ? "צחיח (מוסמך)" : "Sahih Isnad",
      color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    };
  };

  const authBadge = getAuthenticityBadge();

  return (
    <div className="min-h-screen bg-background pb-16" dir={isRtl ? "rtl" : "ltr"}>
      {!focusMode && <Header />}

      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Navigation Bar */}
        {!focusMode && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <Link
                to="/hadith"
                className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4 text-primary" />
                <span>{locale === "ar" ? "الفهرس" : locale === "he" ? "אינדקס חדית'" : "Hadith Hub"}</span>
              </Link>

              <span className="text-border">|</span>

              <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
                <span>{collectionLabel}</span>
                <span className="text-primary font-mono">
                  (Book #{h.book_id} • Hadith #{h.id_in_book})
                </span>
              </div>
            </div>

            {/* Stepper & Actions */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrev}
                disabled={numId <= 1}
                className="rounded-xl gap-1 text-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>{locale === "ar" ? "الحديث السابق" : locale === "he" ? "הקודם" : "Prev"}</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleNext}
                className="rounded-xl gap-1 text-xs"
              >
                <span>{locale === "ar" ? "الحديث التالي" : locale === "he" ? "הבא" : "Next"}</span>
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => store.toggleBookmark(collection, numId)}
                className={`rounded-xl ${
                  isBookmarked ? "text-amber-500 hover:bg-amber-500/10" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Bookmark Hadith"
              >
                <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-amber-500" : ""}`} />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setNotesBookmarksOpen(true)}
                className="rounded-xl text-primary hover:bg-primary/10"
                title="Notes & Bookmarks"
              >
                <FileText className="h-4 w-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setShareModalOpen(true)}
                className="rounded-xl text-muted-foreground hover:text-foreground"
                title="Share Hadith"
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Primary Hadith Master Card */}
        <div className="rounded-3xl border border-border/80 bg-card/90 p-6 md:p-8 shadow-md space-y-6">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary font-bold text-xs px-3 py-1">
                {collectionLabel}
              </Badge>
              <Badge variant="outline" className={`text-xs px-2.5 py-0.5 font-bold ${authBadge.color}`}>
                <Award className="h-3.5 w-3.5 mr-1" />
                {authBadge.label}
              </Badge>
              <span className="text-xs font-mono text-muted-foreground">
                Book {h.book_id} • Chapter Entry #{h.id_in_book}
              </span>
            </div>

            {h.narrator && (
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <UserCheck className="h-4 w-4" />
                <span>Narrated by: {h.narrator}</span>
              </div>
            )}
          </div>

          {/* Typography Toolbar */}
          <HadithTypographySettings
            settings={store.settings}
            onUpdate={store.updateSettings}
            focusMode={focusMode}
            onToggleFocusMode={() => setFocusMode(!focusMode)}
          />

          {/* Arabic Canonical Text */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              النص العربي المعتمد (Arabic Text)
            </span>
            <p
              className="font-quran text-right text-2xl md:text-3xl text-foreground leading-loose tracking-wide"
              dir="rtl"
            >
              {h.arabic_text}
            </p>
          </div>

          {/* Multilingual Section (Hebrew & English) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/50 pt-4">
            {/* Hebrew Translation */}
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2" dir="rtl">
              <div className="flex items-center justify-between text-xs font-bold text-primary">
                <span className="flex items-center gap-1">
                  <Quote className="h-3.5 w-3.5" /> תרגום לעברית (Hebrew)
                </span>
                <span className="text-[10px] bg-primary/10 px-2 py-0.5 rounded-full font-mono">עברית</span>
              </div>
              <p className="text-sm md:text-base text-foreground leading-relaxed font-sans">
                {h.hebrew_text || "חדית' מוסמך מתוך מסורת נביא אסלאם. תוכן הוראות המוסר וההלכה מפורט בשפה העברית."}
              </p>
            </div>

            {/* English Translation */}
            <div className="rounded-2xl border border-border/60 bg-secondary/30 p-4 space-y-2" dir="ltr">
              <div className="flex items-center justify-between text-xs font-bold text-foreground/80">
                <span className="flex items-center gap-1">
                  <Quote className="h-3.5 w-3.5 text-primary" /> English Translation
                </span>
                <span className="text-[10px] bg-secondary px-2 py-0.5 rounded-full font-mono">English</span>
              </div>
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed italic">
                {h.english_text || "Authentic tradition recorded in canonical Hadith collections."}
              </p>
            </div>
          </div>
        </div>

        {/* Primary Workspace View Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-secondary/50 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("read")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "read"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ScrollText className="h-4 w-4" />
              <span>{locale === "ar" ? "الإسناد والرواية" : locale === "he" ? "חדית' ומסורת" : "Isnad & Text"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ai")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "ai"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-4 w-4 text-gold" />
              <span>
                {locale === "ar" ? "المساعد الذكي" : locale === "he" ? "ניתוח חכם AI" : "AI Scholarly Engine"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("cross_ref")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "cross_ref"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-4 w-4" />
              <span>
                {locale === "ar" ? "المراجع والقرآن" : locale === "he" ? "הצלבה עם הקוראן" : "Cross-References"}
                <span className="ml-1 rounded-full bg-primary-soft/40 px-1.5 py-0.2 text-[10px]">
                  {bundle.relatedVerses.length + bundle.relatedTopics.length}
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("graph")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "graph"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Network className="h-4 w-4" />
              <span>{locale === "ar" ? "شبكة المعرفة" : locale === "he" ? "רשת ידע" : "Knowledge Graph"}</span>
            </button>
          </div>
        </div>

        {/* TAB 1: Hadith Reader & Chain Visualizer */}
        {activeTab === "read" && (
          <div className="space-y-6">
            {/* Sanad Chain Visualizer */}
            <HadithSanadVisualizer
              arabicText={h.arabic_text}
              primaryNarrator={h.narrator}
              collectionSlug={collection}
            />

            {/* Similar Hadiths Section */}
            {bundle.relatedHadith && bundle.relatedHadith.length > 0 && (
              <section className="rounded-2xl border border-border/80 bg-card p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                    <Quote className="h-4 w-4 text-primary" />
                    <span>
                      {locale === "ar"
                        ? "الأحاديث المخرجة والمشابهة بنفس الإسناد"
                        : locale === "he"
                          ? "חדית'ים מקבילים ודומים"
                          : "Similar & Parallel Hadiths"}
                    </span>
                  </h3>
                  <Badge variant="outline" className="text-[10px]">
                    {bundle.relatedHadith.length} Matches
                  </Badge>
                </div>

                <div className="space-y-3">
                  {bundle.relatedHadith.map((rh) => (
                    <div
                      key={rh.id}
                      className="rounded-xl border border-border/70 bg-secondary/20 p-4 space-y-2 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                          {rh.collection_slug.toUpperCase()} #{rh.id_in_book}
                        </Badge>
                        <Link
                          to="/hadith/$collection/entry/$num"
                          params={{ collection: rh.collection_slug, num: String(rh.id_in_book) }}
                          className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-semibold"
                        >
                          <span>{locale === "ar" ? "فتح الحديث" : "Open Hadith"}</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>

                      <p className="font-quran text-right text-base text-foreground leading-relaxed" dir="rtl">
                        {rh.arabic_text}
                      </p>

                      {rh.hebrew_text ? (
                        <p className="text-xs text-muted-foreground" dir="rtl">
                          {rh.hebrew_text}
                        </p>
                      ) : rh.english_text ? (
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {rh.english_text}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* TAB 2: AI Scholarly Assistant */}
        {activeTab === "ai" && (
          <HadithAiAssistant
            collectionLabel={collectionLabel}
            hadithNumber={h.id_in_book}
            narrator={h.narrator}
            arabicText={h.arabic_text}
            englishText={h.english_text}
            hebrewText={h.hebrew_text}
            verseRefs={(bundle.relatedVerses || []).map((v) => `${v.surah}:${v.ayah}`)}
            tafsirSnippets={(bundle.relatedTafsir || []).map((t) => t.body.slice(0, 400))}
            citations={[
              `${collectionLabel}, Book ${h.book_id}, Hadith ${h.id_in_book}`,
              ...(bundle.relatedVerses || []).map((v) => `Quran Verse ${v.surah}:${v.ayah}`),
            ]}
            locale={locale === "ar" ? "ar" : locale === "en" ? "en" : "he"}
          />
        )}

        {/* TAB 3: Cross-References */}
        {activeTab === "cross_ref" && (
          <div className="space-y-6">
            {/* Directly Linked Verses */}
            {bundle.relatedVerses.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>
                    {locale === "ar"
                      ? "الآيات القرآنية ذات الصلة المباشرة"
                      : locale === "he"
                        ? "פסוקי קוראן מקושרים ישירות"
                        : "Directly Cross-Referenced Quran Verses"}
                  </span>
                </h3>
                <div className="space-y-3">
                  {bundle.relatedVerses.map((v) => (
                    <PassageCard
                      key={`${v.surah}:${v.ayah}`}
                      surah={v.surah}
                      ayahStart={v.ayah}
                      ayahEnd={v.ayah}
                      locale={locale}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Directly Linked Tafsir Passages */}
            {bundle.relatedTafsir && bundle.relatedTafsir.length > 0 && (
              <section className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span>
                    {locale === "ar"
                      ? "نصوص التفاسير المرتبطة"
                      : locale === "he"
                        ? "קטעי תפסיר מלווים"
                        : "Related Tafsir Passages"}
                  </span>
                </h3>
                <div className="space-y-3">
                  {bundle.relatedTafsir.map((t) => (
                    <div key={t.id} className="rounded-2xl border border-border/80 bg-card p-4 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline" className="border-gold/40 text-gold font-bold">
                          {t.source_name}
                        </Badge>
                        <Link
                          to="/tafsir/$surah/$ayah"
                          params={{ surah: String(t.surah), ayah: String(t.ayah_start) }}
                          className="text-xs text-primary hover:underline font-semibold"
                        >
                          Tafsir Verse {t.surah}:{t.ayah_start}
                        </Link>
                      </div>
                      <p className="text-xs text-foreground/90 font-reading-ar leading-relaxed" dir="rtl">
                        {t.body}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Linked Topics & Prophets */}
            {(bundle.relatedTopics.length > 0 || bundle.relatedProphets.length > 0) && (
              <section className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>
                    {locale === "ar"
                      ? "المواضيع والأنبياء المرتبطون"
                      : locale === "he"
                        ? "נושאים ונביאים מקושרים"
                        : "Linked Topics & Prophets"}
                  </span>
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {bundle.relatedProphets.map((p) => (
                    <EntityCard
                      key={p.id}
                      entity={{
                        ...p,
                        description_i18n: p.summary_i18n,
                        hero_image: null,
                        icon: null,
                        sort_order: 0,
                        kind: "prophet",
                      }}
                      locale={locale}
                      kindLabel={locale === "ar" ? "نبي" : locale === "he" ? "נביא" : "Prophet"}
                    />
                  ))}

                  {bundle.relatedTopics.map((t) => (
                    <EntityCard
                      key={t.id}
                      entity={{
                        ...t,
                        description_i18n: t.summary_i18n,
                        hero_image: null,
                        icon: null,
                        sort_order: 0,
                        kind: "topic",
                      }}
                      locale={locale}
                      kindLabel={locale === "ar" ? "موضوع" : locale === "he" ? "נושא" : "Topic"}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* TAB 4: Knowledge Graph */}
        {activeTab === "graph" && (
          <HadithKnowledgeGraph
            hadithTitle={`Hadith #${h.id_in_book}`}
            hadithId={h.id_in_book}
            collectionSlug={collection}
            primaryNarrator={h.narrator}
            relatedVerses={bundle.relatedVerses}
            relatedTopics={bundle.relatedTopics.map((t) => ({
              id: t.id,
              slug: t.slug,
              title: t.title_i18n.en || t.title_i18n.ar || t.slug,
            }))}
          />
        )}
      </main>

      {/* Notes & Bookmarks Modal */}
      <HadithNotesBookmarksModal
        isOpen={notesBookmarksOpen}
        onClose={() => setNotesBookmarksOpen(false)}
        locale={locale === "ar" ? "ar" : locale === "en" ? "en" : "he"}
      />

      {/* Share Modal */}
      <HadithShareModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        arabicText={h.arabic_text}
        englishText={h.english_text || undefined}
        hebrewText={h.hebrew_text || undefined}
        collectionTitle={collectionLabel}
        hadithNum={h.id_in_book}
        narrator={h.narrator}
      />
    </div>
  );
}
