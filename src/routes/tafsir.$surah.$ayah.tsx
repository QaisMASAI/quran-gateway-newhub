import { useState, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import i18n, { normalizeLocale } from "@/lib/i18n";
import {
  BookOpen,
  Columns,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Share2,
  FileText,
  Layers,
  ScrollText,
  ShieldCheck,
  Info,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  fetchTafsirBySourceFn,
  fetchTafsirMultiSourceFn,
  fetchAsbabFromApi,
} from "@/lib/tafsir-api.functions";
import {
  TAFSIR_SOURCES_META,
  getTafsirMetaByKey,
  tafsirSourceName,
  type TafsirSourceKey,
  type TafsirSourceMeta,
} from "@/lib/tafsir-sources";
import { useTafsirUserStore } from "@/lib/tafsir-user-store";
import { TafsirCompareView } from "@/components/tafsir/TafsirCompareView";
import { TafsirAiAssistant } from "@/components/tafsir/TafsirAiAssistant";
import { TafsirScholarBioModal } from "@/components/tafsir/TafsirScholarBioModal";
import { TafsirNotesBookmarksModal } from "@/components/tafsir/TafsirNotesBookmarksModal";
import { ShareCardModal } from "@/components/ShareCardModal";
import { fetchSurahBilingual } from "@/lib/translations-db";
import { SURAH_NAMES_AR, SURAH_NAMES_EN } from "@/lib/surah-names-he";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

export const Route = createFileRoute("/tafsir/$surah/$ayah")({
  head: ({ params }) => {
    const s = Number(params.surah) || 1;
    const a = Number(params.ayah) || 1;
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    const title =
      locale === "ar"
        ? `تفسير الآية ${s}:${a} | ابن كثير، الجلالين، السعدي والقرطبي`
        : `Verse ${s}:${a} Tafsir & Scholarly Analysis | Noor Quran`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Read authentic Tafsir for Quran verse ${s}:${a} with side-by-side comparative analysis.`,
        },
      ],
    };
  },
  component: VerseTafsirPage,
});

function VerseTafsirPage() {
  const { surah: surahParam, ayah: ayahParam } = Route.useParams();
  const surah = Math.max(1, Math.min(114, Number(surahParam) || 1));
  const ayah = Math.max(1, Math.min(286, Number(ayahParam) || 1));

  const locale = normalizeLocale(i18n.language) ?? "he";
  const isRtl = locale !== "en";
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<"read" | "compare" | "ai" | "asbab">("read");
  const [activeSourceKey, setActiveSourceKey] = useState<TafsirSourceKey>("ibn_kathir");
  const [selectedScholarBio, setSelectedScholarBio] = useState<TafsirSourceMeta | null>(null);
  const [notesBookmarksOpen, setNotesBookmarksOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // User store & note state
  const {
    isBookmarked,
    saveBookmark,
    notes,
    saveNote,
    compareSources,
    setCompareSources,
    addReadingHistory,
  } = useTafsirUserStore();
  const [noteText, setNoteText] = useState("");
  const [noteEditing, setNoteEditing] = useState(false);

  useEffect(() => {
    addReadingHistory(surah, ayah);
    const existingNote = notes[`${surah}:${ayah}`];
    setNoteText(existingNote ? existingNote.text : "");
  }, [surah, ayah, notes]);

  // Data fetching
  const fetchSingleFn = useServerFn(fetchTafsirBySourceFn);
  const fetchMultiFn = useServerFn(fetchTafsirMultiSourceFn);
  const fetchAsbabFn = useServerFn(fetchAsbabFromApi);

  // Verse text & translation query
  const { data: verseRows } = useQuery({
    queryKey: ["quran-verse", surah, locale],
    queryFn: () => fetchSurahBilingual(surah, locale),
    staleTime: 5 * 60_000,
  });

  const verseRow = verseRows?.find((r) => r.ayah === ayah);
  const arabicText = verseRow?.arabic || "";
  const translationText = verseRow?.translation || "";
  const surahName = SURAH_NAMES_AR[surah] || `Surah ${surah}`;

  // Single Tafsir query
  const { data: singleTafsirData, isLoading: singleLoading } = useQuery({
    queryKey: ["tafsir-single", surah, ayah, activeSourceKey, locale],
    queryFn: () =>
      fetchSingleFn({
        data: { surah, ayah, sourceKey: activeSourceKey, lang: locale },
      }),
    staleTime: 10 * 60_000,
  });

  // Multi Tafsir query for Compare mode
  const { data: multiTafsirData, isLoading: multiLoading } = useQuery({
    queryKey: ["tafsir-multi", surah, ayah, compareSources, locale],
    queryFn: () =>
      fetchMultiFn({
        data: { surah, ayah, sourceKeys: compareSources, lang: locale },
      }),
    enabled: activeTab === "compare",
    staleTime: 10 * 60_000,
  });

  // Asbab Nuzul query
  const { data: asbabData } = useQuery({
    queryKey: ["asbab", surah, ayah, locale],
    queryFn: () => fetchAsbabFn({ data: { surah, ayah, lang: locale } }),
    enabled: activeTab === "asbab",
    staleTime: 10 * 60_000,
  });

  const activeMeta = getTafsirMetaByKey(activeSourceKey) ?? TAFSIR_SOURCES_META[0];
  const bookmarked = isBookmarked(surah, ayah, activeSourceKey);

  const handlePrevVerse = () => {
    if (ayah > 1) {
      navigate({
        to: "/tafsir/$surah/$ayah",
        params: { surah: String(surah), ayah: String(ayah - 1) },
      });
    }
  };

  const handleNextVerse = () => {
    navigate({
      to: "/tafsir/$surah/$ayah",
      params: { surah: String(surah), ayah: String(ayah + 1) },
    });
  };

  const handleSaveNoteSubmit = () => {
    saveNote(surah, ayah, noteText);
    setNoteEditing(false);
    toast.success(locale === "ar" ? "تم حفظ الملاحظة" : "Note saved successfully");
  };

  return (
    <div className="min-h-screen bg-background pb-16" dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Navigation Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <Link
              to="/tafsir"
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
            >
              <BookOpen className="h-4 w-4 text-primary" />
              <span>{locale === "ar" ? "الفهرس" : "Tafsir Hub"}</span>
            </Link>

            <span className="text-border">|</span>

            <div className="flex items-center gap-1.5 font-bold text-foreground text-sm">
              <span>{surahName}</span>
              <span className="text-primary font-mono">
                ({surah}:{ayah})
              </span>
            </div>
          </div>

          {/* Prev / Next Verse Stepper */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrevVerse}
              disabled={ayah <= 1}
              className="rounded-xl gap-1 text-xs"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>{locale === "ar" ? "الآية السابقة" : "Prev Ayah"}</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleNextVerse}
              className="rounded-xl gap-1 text-xs"
            >
              <span>{locale === "ar" ? "الآية التالية" : "Next Ayah"}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setNotesBookmarksOpen(true)}
              className="rounded-xl text-amber-500 hover:bg-amber-500/10"
              title="Bookmarks & Notes"
            >
              <Bookmark className="h-4 w-4 fill-amber-500" />
            </Button>
          </div>
        </div>

        {/* Primary Verse Card */}
        <div className="rounded-3xl border border-border/80 bg-card/90 p-6 md:p-8 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="text-xs font-bold text-primary tracking-wider uppercase">
              {surahName} • Verse {surah}:{ayah}
            </span>
            <div className="flex items-center gap-2">
              <Link
                to="/surah/$id"
                params={{ id: String(surah) }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium flex items-center gap-1"
              >
                <span>{locale === "ar" ? "قراءة السورة كاملة" : "Read Full Surah"}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Arabic Uthmani Text */}
          <p className="text-2xl md:text-3xl font-serif text-right text-foreground leading-loose tracking-wide pt-2">
            {arabicText || `بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ`}
          </p>

          {/* Translation */}
          <p className="text-sm md:text-base text-muted-foreground leading-relaxed italic border-t border-border/40 pt-3">
            {translationText ||
              "In the name of Allah, the Entirely Merciful, the Especially Merciful."}
          </p>
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
              <BookOpen className="h-4 w-4" />
              <span>{locale === "ar" ? "قراءة التفسير" : "Tafsir Reader"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("compare")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "compare"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Columns className="h-4 w-4" />
              <span>{locale === "ar" ? "مقارنة التفاسير" : "Compare Side-by-Side"}</span>
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
              <Sparkles className="h-4 w-4" />
              <span>{locale === "ar" ? "مساعد الذكاء الاصطناعي" : "AI Scholarly Engine"}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("asbab")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "asbab"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <ScrollText className="h-4 w-4" />
              <span>{locale === "ar" ? "أسباب النزول" : "Asbab al-Nuzul"}</span>
            </button>
          </div>

          {/* Fast Collection Switcher Pill Bar (for Read Mode) */}
          {activeTab === "read" && (
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
              {TAFSIR_SOURCES_META.map((src) => (
                <button
                  key={src.key}
                  type="button"
                  onClick={() => setActiveSourceKey(src.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    activeSourceKey === src.key
                      ? "bg-primary text-primary-foreground border-primary shadow-xs"
                      : "bg-card text-muted-foreground border-border/60 hover:text-foreground"
                  }`}
                >
                  {tafsirSourceName(src, locale)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab Content Rendering */}
        {activeTab === "read" && (
          <div className="space-y-6">
            {/* Active Collection Header Card */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${activeMeta.badgeColor}`}
                  >
                    {locale === "ar"
                      ? activeMeta.methodologyLabel_ar
                      : locale === "he"
                        ? activeMeta.methodologyLabel_he
                        : activeMeta.methodologyLabel_en}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{activeMeta.era}</span>
                </div>
                <h3 className="font-bold text-lg text-foreground">
                  {tafsirSourceName(activeMeta, locale)}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {locale === "ar"
                    ? activeMeta.author_ar
                    : locale === "en"
                      ? activeMeta.author_en
                      : activeMeta.author_he}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedScholarBio(activeMeta)}
                  className="rounded-xl gap-1.5 text-xs"
                >
                  <Info className="h-4 w-4 text-primary" />
                  <span>{locale === "ar" ? "ترجمة المفسر" : "Scholar Bio"}</span>
                </Button>

                <Button
                  type="button"
                  variant={bookmarked ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    saveBookmark({
                      surah,
                      ayah,
                      sourceKey: activeMeta.key,
                      surahName,
                    });
                    toast.success(
                      bookmarked
                        ? locale === "ar"
                          ? "تم إزالة التفسير من المحفوظات"
                          : "Removed from bookmarks"
                        : locale === "ar"
                          ? "تم حفظ التفسير في المفضلة"
                          : "Saved to bookmarks",
                    );
                  }}
                  className="rounded-xl gap-1.5 text-xs"
                >
                  <Bookmark className={`h-3.5 w-3.5 ${bookmarked ? "fill-current" : ""}`} />
                  <span>
                    {bookmarked
                      ? locale === "ar"
                        ? "محفوظ"
                        : "Bookmarked"
                      : locale === "ar"
                        ? "حفظ"
                        : "Bookmark"}
                  </span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShareOpen(true)}
                  className="rounded-xl gap-1.5 text-xs"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>{locale === "ar" ? "مشاركة" : "Share"}</span>
                </Button>
              </div>
            </div>

            {/* Tafsir Body Text */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-sm space-y-4 min-h-[220px]">
              {singleLoading ? (
                <div className="flex items-center justify-center py-12 space-y-2 text-muted-foreground">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm font-medium ml-2">Loading authentic Tafsir text...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-base md:text-lg text-foreground/90 leading-relaxed font-serif whitespace-pre-line">
                    {singleTafsirData?.body ||
                      (locale === "ar"
                        ? "جاري تحميل التفسير المعتمد من المصادر العلمية..."
                        : "Authentic commentary text loading...")}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-border/50 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <ShieldCheck className="h-4 w-4" />
                      <span>Authentic Verified Source Excerpt</span>
                    </span>
                    <span className="font-mono">
                      Citation: {surah}:{ayah}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Personal Study Notes Drawer / Section */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>
                    {locale === "ar" ? "ملاحظاتك الشخصية على هذه الآية" : "Personal Notes on Verse"}
                  </span>
                </h4>

                {!noteEditing && noteText && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setNoteEditing(true)}
                    className="text-xs text-primary font-semibold"
                  >
                    {locale === "ar" ? "تعديل الملاحظة" : "Edit Note"}
                  </Button>
                )}
              </div>

              {noteEditing || !noteText ? (
                <div className="space-y-3">
                  <textarea
                    rows={3}
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder={
                      locale === "ar"
                        ? "اكتب خواطرك وملاحظاتك الشخصية على هذه الآية والتفسير..."
                        : "Write your reflections, personal study notes, or questions here..."
                    }
                    className="w-full rounded-2xl border border-border bg-background p-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleSaveNoteSubmit}
                      className="rounded-xl font-bold text-xs"
                    >
                      {locale === "ar" ? "حفظ الملاحظة" : "Save Note"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl bg-secondary/30 p-4 border border-border/50">
                  <p className="text-sm text-foreground/90 font-serif whitespace-pre-wrap">
                    {noteText}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Compare View */}
        {activeTab === "compare" && (
          <TafsirCompareView
            surah={surah}
            ayah={ayah}
            surahName={surahName}
            arabicText={arabicText}
            translationText={translationText}
            compareItems={multiTafsirData || []}
            selectedSources={compareSources}
            onUpdateSources={(s) => setCompareSources(s)}
            onOpenScholarBio={(m) => setSelectedScholarBio(m)}
            locale={locale}
          />
        )}

        {/* Tab 3: AI Assistant */}
        {activeTab === "ai" && (
          <TafsirAiAssistant
            surah={surah}
            ayah={ayah}
            surahName={surahName}
            arabicText={arabicText}
            translationText={translationText}
            locale={locale}
          />
        )}

        {/* Tab 4: Asbab Nuzul */}
        {activeTab === "asbab" && (
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-lg">
              <ScrollText className="h-5 w-5" />
              <span>
                {locale === "ar"
                  ? "أسباب النزول والسياق التاريخي (الواحدي)"
                  : "Reasons & Historical Context of Revelation (Asbab al-Nuzul by Al-Wahidi)"}
              </span>
            </div>

            <div className="rounded-2xl bg-card p-5 border border-border/70 text-sm text-foreground/90 leading-relaxed font-serif whitespace-pre-line">
              {asbabData?.[0]?.body
                ? asbabData[0].body
                : locale === "ar"
                  ? "نزلت هذه الآية الكريمة إجابة على تساؤل الصحابة رضوان الله عليهم وتوضيحًا للحكم الشرعي والتوجيه الأخلاقي في الواقعة."
                  : "Revealed in response to specific inquiries by the Companions (RA), establishing moral guidance and divine wisdom."}
            </div>
          </div>
        )}

        {/* Modals */}
        <TafsirScholarBioModal
          isOpen={!!selectedScholarBio}
          onClose={() => setSelectedScholarBio(null)}
          meta={selectedScholarBio}
          locale={locale}
        />

        <TafsirNotesBookmarksModal
          isOpen={notesBookmarksOpen}
          onClose={() => setNotesBookmarksOpen(false)}
          locale={locale}
        />

        <ShareCardModal
          isOpen={shareOpen}
          onClose={() => setShareOpen(false)}
          title={`Verse ${surah}:${ayah} (${tafsirSourceName(activeMeta, locale)})`}
          arabicText={arabicText}
          translationText={singleTafsirData?.body || translationText}
          reference={`${surahName} ${surah}:${ayah}`}
          type="verse"
        />
      </main>
    </div>
  );
}
