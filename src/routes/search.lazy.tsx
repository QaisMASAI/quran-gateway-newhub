import { createLazyFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useDeferredValue, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import {
  Search as SearchIcon,
  Loader2,
  BookOpen,
  Sparkles,
  Library,
  Brain,
  Users,
  Compass,
  MapPin,
  Bookmark,
  History,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Filter,
} from "lucide-react";
import { performUnifiedSearch, type KnowledgeCategory, type UnifiedSearchResultItem } from "@/lib/search-unified";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { localeTextDir, tafsirFontClass, uiFontClass } from "@/lib/locale-ui";
import { useQueryPrefillInput } from "@/hooks/useQueryPrefillInput";
import { useServerFn } from "@tanstack/react-start";
import { trackHomePromptEvent } from "@/lib/home-prompts.functions";

export const Route = createLazyFileRoute("/search")({
  component: UnifiedKnowledgeSearchPage,
});

const CATEGORY_ICONS: Record<KnowledgeCategory, React.ReactNode> = {
  quran: <BookOpen className="h-4 w-4" />,
  hadith: <Brain className="h-4 w-4" />,
  tafsir: <Library className="h-4 w-4" />,
  topics: <Compass className="h-4 w-4" />,
  prophets: <Users className="h-4 w-4" />,
  stories: <History className="h-4 w-4" />,
  narrators: <Bookmark className="h-4 w-4" />,
  places: <MapPin className="h-4 w-4" />,
};

function UnifiedKnowledgeSearchPage() {
  const { q, qState, src } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const { i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const isRtl = i18n.dir() === "rtl";
  const uiClass = uiFontClass(locale);
  const tafsirClass = tafsirFontClass(locale);
  const textDir = localeTextDir(locale);

  const { input, setInput, trimmed } = useQueryPrefillInput({ initialQ: q });
  const deferred = useDeferredValue(input);
  const deferredTrimmed = deferred.trim();

  const [activeTab, setActiveTab] = useState<"all" | KnowledgeCategory>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const trackPrompt = useServerFn(trackHomePromptEvent);

  // Execute single, unified knowledge search
  const {
    data: searchResults,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["unified-knowledge-search", deferredTrimmed, locale, activeTab],
    queryFn: () => performUnifiedSearch(deferredTrimmed, locale, activeTab),
    enabled: deferredTrimmed.length >= 2,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (src !== "hero_input" && src !== "popular_questions") return;
    if (qState !== "ok" || !q) return;
    void trackPrompt({
      data: {
        event: "prefill_applied",
        destination: "/search",
        source: src,
        q,
        qState,
      },
    });
  }, [q, qState, src, trackPrompt]);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQ = trimmed;
    if (nextQ.length < 2) return;
    void navigate({
      to: "/search",
      search: {
        q: nextQ,
        qState: "ok",
        src,
      },
      replace: true,
    });
  }

  const quickSuggestions = useMemo(() => {
    return locale === "ar"
      ? ["الرحمة", "الصبر", "موسى", "إبراهيم", "أبو هريرة", "مكة", "التوبة", "خلق آدم"]
      : locale === "he"
        ? ["רחמים", "סבלנות", "משה", "אברהם", "אבו הוריירה", "מכה", "תשובה", "בריאת אדם"]
        : ["mercy", "patience", "Musa", "Abraham", "Abu Hurairah", "Mecca", "repentance", "Creation of Adam"];
  }, [locale]);

  const categoryLabels: Record<KnowledgeCategory, { ar: string; he: string; en: string }> = {
    quran: { ar: "القرآن الكريم", he: "קוראן", en: "Quran" },
    hadith: { ar: "الحديث الشريف", he: "חדית'", en: "Hadith" },
    tafsir: { ar: "التفسير", he: "תפסיר", en: "Tafsir" },
    topics: { ar: "المواضيع", he: "נושאים", en: "Topics" },
    prophets: { ar: "الأنبياء", he: "נביאים", en: "Prophets" },
    stories: { ar: "القصص", he: "סיפורים", en: "Stories" },
    narrators: { ar: "الرواة", he: "מוסרים", en: "Narrators" },
    places: { ar: "الأماكن", he: "מקומות", en: "Places" },
  };

  const getCategoryTitle = (cat: KnowledgeCategory) => {
    return categoryLabels[cat][locale] || categoryLabels[cat].en;
  };

  const handleCopy = (item: UnifiedSearchResultItem) => {
    const textToCopy = `${item.title}\n${item.arabicSnippet ? item.arabicSnippet + "\n" : ""}${item.snippet}`;
    void navigator.clipboard.writeText(textToCopy);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`min-h-screen bg-background ${uiClass}`} dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      {/* Header Banner */}
      <div className="border-b border-border bg-gradient-to-b from-primary-soft/40 via-background to-background">
        <div className="mx-auto max-w-5xl px-4 pb-4 pt-8 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Sparkles className="h-4 w-4" />
            <span>
              {locale === "ar"
                ? "محرك البحث المعرفي الموحد"
                : locale === "he"
                  ? "מנוע החיפוש המאוחד לידע איסלאמי"
                  : "Unified Knowledge Search Engine"}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">
            {locale === "ar"
              ? "ابحث في القرآن، الحديث، التفسير، الأنبياء والمزيد"
              : locale === "he"
                ? "חפש בקוראן, חדית', תפסיר, נביאים ועוד"
                : "Search across Quran, Hadith, Tafsir, Prophets, & more"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "ar"
              ? "محرك بحث موحد مع التصنيف والترتيب الذكي عبر كافة المصادر الإسلامية."
              : locale === "he"
                ? "מנוע חיפוש יחיד המקשר בין כל מקורות הידע באיסלאם עם דירוג חכם וחלוקה לפי קטגוריות."
                : "Single unified search engine connecting all Islamic knowledge collections with smart ranking."}
          </p>
        </div>
      </div>

      <main id="main" className="mx-auto max-w-5xl px-4 py-6 sm:px-6 space-y-6">
        {/* Search Input Card */}
        <div className="surface-card border-primary/20 bg-gradient-to-br from-card to-primary-soft/20 p-4 sm:p-6 shadow-md">
          <form onSubmit={submitSearch} className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  locale === "ar"
                    ? "ابحث عن آية، حديث، نبي، موضوع، أو راوٍ (بالعربية، العبرية، أو الإنجليزية)..."
                    : locale === "he"
                      ? "חפש פסוק, חדית', נביא, נושא או מוסר (בעברית, ערבית או אנגלית)..."
                      : "Search verse, Hadith, prophet, topic, or narrator (in Arabic, Hebrew, or English)..."
                }
                className="w-full rounded-xl border border-border bg-background py-3 pl-11 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                dir="auto"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <SearchIcon className="h-5 w-5" />}
              <span>{locale === "ar" ? "بحث" : locale === "he" ? "חפש" : "Search"}</span>
            </button>
          </form>

          {/* Quick Suggestions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Compass className="h-3.5 w-3.5" />
              {locale === "ar" ? "مقترحات:" : locale === "he" ? "הצעות:" : "Suggestions:"}
            </span>
            {quickSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setInput(s);
                  void navigate({
                    to: "/search",
                    search: { q: s, qState: "ok", src },
                    replace: true,
                  });
                }}
                className="rounded-full border border-border bg-background/80 px-3 py-1 text-xs text-foreground hover:border-primary/40 hover:bg-primary-soft transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        {deferredTrimmed.length >= 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all border ${
                activeTab === "all"
                  ? "border-primary bg-primary text-primary-foreground shadow-xs"
                  : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{locale === "ar" ? "الكل" : locale === "he" ? "הכל" : "All Results"}</span>
              {searchResults && (
                <span className="rounded-full bg-background/20 px-2 py-0.5 text-[10px]">
                  {searchResults.totalResults}
                </span>
              )}
            </button>

            {(
              [
                "quran",
                "hadith",
                "tafsir",
                "topics",
                "prophets",
                "stories",
                "narrators",
                "places",
              ] as KnowledgeCategory[]
            ).map((cat) => {
              const count = searchResults?.categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveTab(cat)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition-all border ${
                    activeTab === cat
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                >
                  {CATEGORY_ICONS[cat]}
                  <span>{getCategoryTitle(cat)}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      activeTab === cat
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm">
              {locale === "ar"
                ? "جاري البحث في كافة مجموعات المعرفة..."
                : locale === "he"
                  ? "מחפש בכל מאגרי הידע האיסלאמיים..."
                  : "Searching across all knowledge collections..."}
            </p>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {locale === "ar"
              ? "حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى."
              : locale === "he"
                ? "אירעה שגיאה במהלך החיפوش. אנא נסה שוב."
                : "An error occurred while searching. Please try again."}
          </div>
        )}

        {/* Search Results Display */}
        {searchResults && deferredTrimmed.length >= 2 && !isLoading && (
          <div className="space-y-8">
            {/* When "ALL" tab is selected: show category grouped sections */}
            {activeTab === "all" ? (
              (
                [
                  "quran",
                  "hadith",
                  "tafsir",
                  "topics",
                  "prophets",
                  "stories",
                  "narrators",
                  "places",
                ] as KnowledgeCategory[]
              ).map((cat) => {
                const items = searchResults.categoryResults[cat];
                if (!items || items.length === 0) return null;

                return (
                  <section key={cat} className="space-y-3">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{CATEGORY_ICONS[cat]}</div>
                        <h2 className="text-lg font-bold text-foreground">{getCategoryTitle(cat)}</h2>
                        <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                          {searchResults.categoryCounts[cat]}
                        </span>
                      </div>
                      {items.length > 3 && (
                        <button
                          type="button"
                          onClick={() => setActiveTab(cat)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <span>{locale === "ar" ? "عرض الكل" : locale === "he" ? "הצג הכל" : "View All"}</span>
                          {isRtl ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {items.slice(0, 4).map((item) => (
                        <SearchResultCard
                          key={item.id}
                          item={item}
                          locale={locale}
                          textDir={textDir}
                          tafsirClass={tafsirClass}
                          copiedId={copiedId}
                          onCopy={() => handleCopy(item)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })
            ) : (
              /* When specific Category tab is selected */
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <div className="p-1.5 rounded-lg bg-primary/10 text-primary">{CATEGORY_ICONS[activeTab]}</div>
                  <h2 className="text-xl font-bold text-foreground">{getCategoryTitle(activeTab)}</h2>
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {searchResults.categoryCounts[activeTab]}
                  </span>
                </div>

                {searchResults.categoryResults[activeTab].length === 0 ? (
                  <p className="rounded-xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
                    {locale === "ar"
                      ? "لا توجد نتائج في هذه الفئة."
                      : locale === "he"
                        ? "לא נמצאו תוצאות בקטגוריה זו."
                        : "No results found in this category."}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {searchResults.categoryResults[activeTab].map((item) => (
                      <SearchResultCard
                        key={item.id}
                        item={item}
                        locale={locale}
                        textDir={textDir}
                        tafsirClass={tafsirClass}
                        copiedId={copiedId}
                        onCopy={() => handleCopy(item)}
                      />
                    ))}
                  </div>
                )}
              </section>
            )}

            {searchResults.totalResults === 0 && (
              <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
                <Compass className="mx-auto h-10 w-10 text-muted-foreground/60" />
                <h3 className="text-base font-semibold text-foreground">
                  {locale === "ar"
                    ? `لم يتم العثور على نتائج لـ "${deferredTrimmed}"`
                    : locale === "he"
                      ? `לא נמצאו תוצאות עבור "${deferredTrimmed}"`
                      : `No results found for "${deferredTrimmed}"`}
                </h3>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  {locale === "ar"
                    ? "جرب البحث باستخدام كلمات مفتاحية أخرى أو أسماء أنبياء أو مواضيع باللغات العربية، العبرية، أو الإنجليزية."
                    : locale === "he"
                      ? "נסה לחפש באמצעות מילות מפתח אחרות, שמות נביאים או נושאים בעברית, ערבית או אנגלית."
                      : "Try searching with different keywords, prophet names, or topics in Arabic, Hebrew, or English."}
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function SearchResultCard({
  item,
  locale,
  textDir,
  tafsirClass,
  copiedId,
  onCopy,
}: {
  item: UnifiedSearchResultItem;
  locale: Locale;
  textDir: string;
  tafsirClass: string;
  copiedId: string | null;
  onCopy: () => void;
}) {
  const isCopied = copiedId === item.id;

  return (
    <article className="surface-card flex flex-col justify-between border-primary/10 bg-gradient-to-br from-card via-card to-primary-soft/10 p-4 transition-all hover:border-primary/40 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
            {item.badge || item.category}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onCopy}
              title="Copy"
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
            <Link
              to={item.url}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <Link to={item.url} className="group block space-y-1">
          <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
            {item.title}
          </h3>

          {item.subtitle && (
            <p className="text-xs font-semibold text-primary/90" dir="rtl" lang="ar">
              {item.subtitle}
            </p>
          )}

          {item.arabicSnippet && (
            <p className="mt-1 text-right font-quran text-base text-foreground/90 leading-relaxed" dir="rtl" lang="ar">
              {item.arabicSnippet.slice(0, 160)}
              {item.arabicSnippet.length > 160 ? "…" : ""}
            </p>
          )}

          <p className={`mt-1 text-sm text-foreground/80 leading-relaxed ${tafsirClass}`} dir={textDir}>
            {item.snippet.slice(0, 180)}
            {item.snippet.length > 180 ? "…" : ""}
          </p>
        </Link>
      </div>

      <div className="mt-3 pt-2 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
        <span className="text-[11px] font-medium text-primary/80">
          {locale === "ar" ? "افتح في القسم" : locale === "he" ? "פתח בקטע" : "Open Section"}
        </span>
        <Link
          to={item.url}
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>{locale === "ar" ? "عرض" : locale === "he" ? "צפה" : "View"}</span>
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        </Link>
      </div>
    </article>
  );
}
