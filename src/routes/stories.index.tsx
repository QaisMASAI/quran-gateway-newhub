import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n, { normalizeLocale, type Locale } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Search, ScrollText, ChevronLeft, Loader2, BookOpen, Sparkles } from "lucide-react";
import { listEntitiesByKind, pickLocale } from "@/lib/knowledge";

export const Route = createFileRoute("/stories/")({
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    const title =
      locale === "ar"
        ? "قصص القرآن الكريم والدروس والعبر | نور"
        : locale === "en"
          ? "Quranic Stories & Narratives | Noor"
          : "סיפורי הקוראן והלקחים | נור";
    const description =
      locale === "ar"
        ? "استكشف القصص العظيمة في القرآن الكريم: أصحاب الكهف، ذو القرنين، لقمان، أصحاب الفيل، ومريم بنت عمران."
        : locale === "en"
          ? "Explore memorable Quranic stories and timeless lessons: People of the Cave, Dhul-Qarnayn, Luqman, and Mary."
          : "חקור סיפורים קוראניים מרתקים ולקחים לחיים: אנשי המערה, דול-קרניין, לוקמאן ומרים.";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "/stories" },
      ],
      links: [{ rel: "canonical", href: "/stories" }],
    };
  },
  component: StoriesIndexPage,
});

export function StoriesIndexPage() {
  const { i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const [searchQuery, setSearchQuery] = useState("");

  const q = useQuery({
    queryKey: ["entities-by-kind", "story"],
    queryFn: () => listEntitiesByKind("story"),
    staleTime: 5 * 60_000,
  });

  const storiesList = useMemo(() => {
    if (!q.data) return [];
    return q.data.map((s) => ({
      ...s,
      title: pickLocale(s.title_i18n, locale),
      summary: pickLocale(s.summary_i18n, locale),
    }));
  }, [q.data, locale]);

  const filteredStories = useMemo(() => {
    if (!searchQuery.trim()) return storiesList;
    const sq = searchQuery.toLowerCase().trim();
    return storiesList.filter(
      (s) =>
        s.title.toLowerCase().includes(sq) ||
        s.summary.toLowerCase().includes(sq) ||
        s.slug.toLowerCase().includes(sq),
    );
  }, [storiesList, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Header */}
      <div className="border-b border-border bg-gradient-to-b from-emerald-500/10 via-background to-background">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-6 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
            <ScrollText className="h-4 w-4" />
            <span>
              {locale === "ar"
                ? "قصص القرآن والدروس"
                : locale === "he"
                  ? "סיפורי הקוראן"
                  : "Quranic Stories"}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {locale === "ar"
              ? "أحسن القصص في القرآن"
              : locale === "he"
                ? "סיפורי הקוראן והלקחים"
                : "Quranic Stories & Lessons"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            {locale === "ar"
              ? "قصص قرآنية مليئة بالعبر والدروس: أصحاب الكهف، ذو القرنين، صاحب الجنتين، قارون ولقمان الحكيم."
              : locale === "he"
                ? "סיפורים קוראניים מלאי לקחים ומוסר השכל: אנשי המערה, דול-קרניין, לוקמאן ועוד."
                : "Captivating narratives from the Holy Quran providing wisdom, moral guidance, and spiritual strength."}
          </p>

          {/* Search Box */}
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === "ar"
                  ? "ابحث في القصص القرآنية (أصحاب الكهف، الفيل، ذو القرنين...)"
                  : locale === "he"
                    ? "חפש בסיפורי הקוראן (אנשי המערה, הפילי...)"
                    : "Search stories (Cave dwellers, Elephant, Dhul-Qarnayn...)"
              }
              className="w-full rounded-2xl border border-border bg-card/80 py-3 start-10 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 end-3 my-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">
            {locale === "ar"
              ? `عرض ${filteredStories.length} قصة`
              : locale === "he"
                ? `מציג ${filteredStories.length} סיפורים`
                : `Showing ${filteredStories.length} stories`}
          </div>
        </div>

        {q.isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />
            <span>Loading stories…</span>
          </div>
        )}

        {filteredStories.length === 0 && !q.isLoading ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {locale === "ar"
                ? "لم يتم العثور على قصص تطابق بحثك."
                : locale === "he"
                  ? "לא נמצאו סיפורים התואמים את החיפוש שלך."
                  : "No stories found matching your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map((story) => (
              <Link
                key={story.id}
                to="/learn/$kind/$slug"
                params={{ kind: "story", slug: story.slug }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card/90 via-card to-emerald-500/5 p-5 shadow-xs transition-all duration-300 hover:border-emerald-500/50 hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-2xs">
                        <ScrollText className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {locale === "ar"
                          ? "قصة قرآنية"
                          : locale === "he"
                            ? "סיפור קוראני"
                            : "Quranic Story"}
                      </span>
                    </div>
                    <ChevronLeft
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-emerald-500 ltr:rotate-180"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-4">
                    <h3
                      className="font-display text-lg font-bold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                      dir="auto"
                    >
                      {story.title}
                    </h3>
                    <p
                      className="mt-2 line-clamp-3 text-xs sm:text-sm text-muted-foreground leading-relaxed"
                      dir="auto"
                    >
                      {story.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] font-medium text-muted-foreground">
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>
                      {locale === "ar"
                        ? "تفاصيل القصة والآيات"
                        : locale === "he"
                          ? "פרטי הסיפור והפסוקים"
                          : "Full Story & Verses"}
                    </span>
                  </span>
                  <span className="text-primary group-hover:underline font-semibold">
                    {locale === "ar"
                      ? "اقرأ القصة ←"
                      : locale === "he"
                        ? "קרא סיפור ←"
                        : "Read Story ←"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
