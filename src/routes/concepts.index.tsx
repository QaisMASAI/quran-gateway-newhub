import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n, { normalizeLocale, type Locale } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Search, GraduationCap, ChevronLeft, Loader2, BookOpen, Layers, Users } from "lucide-react";
import { listAllEntities, pickLocale, type EntityKind } from "@/lib/knowledge";

export const Route = createFileRoute("/concepts/")({
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    const title =
      locale === "ar"
        ? "المفاهيم القرآنية والمحاور والأمم | نور"
        : locale === "en"
          ? "Quranic Concepts, Themes & Nations | Noor"
          : "מושגים, תמות ועמים בקוראן | נור";
    const description =
      locale === "ar"
        ? "استكشف المفاهيم العقائدية، المحاور الموضوعية والأمم السابقة المذكورة في القرآن الكريم: التوحيد، الأخلاق، الآخرة، والملائكة."
        : locale === "en"
          ? "Explore theological concepts, core themes, and historical nations mentioned in the Quran."
          : "חקור מושגי אמונה, תמות מרכזיות ועמים היסטוריים המוזכרים בקוראן.";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "/concepts" },
      ],
      links: [{ rel: "canonical", href: "/concepts" }],
    };
  },
  component: ConceptsIndexPage,
});

export function ConceptsIndexPage() {
  const { i18n, t } = useTranslation("common");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const [searchQuery, setSearchQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "concept" | "theme" | "nation">("all");

  const q = useQuery({
    queryKey: ["all-entities"],
    queryFn: listAllEntities,
    staleTime: 5 * 60_000,
  });

  const conceptsList = useMemo(() => {
    if (!q.data) return [];
    const validKinds: EntityKind[] = ["concept", "theme", "nation"];
    return q.data
      .filter((e) => validKinds.includes(e.kind))
      .map((c) => ({
        ...c,
        title: pickLocale(c.title_i18n, locale),
        summary: pickLocale(c.summary_i18n, locale),
      }));
  }, [q.data, locale]);

  const filteredConcepts = useMemo(() => {
    let result = conceptsList;
    if (kindFilter !== "all") {
      result = result.filter((c) => c.kind === kindFilter);
    }
    if (searchQuery.trim()) {
      const sq = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(sq) ||
          c.summary.toLowerCase().includes(sq) ||
          c.slug.toLowerCase().includes(sq),
      );
    }
    return result;
  }, [conceptsList, kindFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Header */}
      <div className="border-b border-border bg-gradient-to-b from-purple-500/10 via-background to-background">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-6 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
            <GraduationCap className="h-4 w-4" />
            <span>{t("concepts.headerBadge")}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("concepts.headerTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{t("concepts.headerDesc")}</p>

          {/* Search Box */}
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === "ar"
                  ? "ابحث في المفاهيم والأمم (التوحيد، عاد، ثمود، الآخرة...)"
                  : locale === "he"
                    ? "חפש במושגים ועמים (ייחוד האל, עאד, ת'מוד...)"
                    : "Search concepts & nations (Tawhid, Ad, Thamud...)"
              }
              className="w-full rounded-2xl border border-border bg-card/80 py-3 start-10 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition shadow-sm"
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

          {/* Filter Tabs */}
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setKindFilter("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                kindFilter === "all"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("concepts.all")} ({conceptsList.length})
            </button>
            <button
              type="button"
              onClick={() => setKindFilter("concept")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                kindFilter === "concept"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>{t("concepts.concepts")}</span>
            </button>
            <button
              type="button"
              onClick={() => setKindFilter("theme")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                kindFilter === "theme"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{t("concepts.themes")}</span>
            </button>
            <button
              type="button"
              onClick={() => setKindFilter("nation")}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition flex items-center gap-1.5 ${
                kindFilter === "nation"
                  ? "bg-purple-600 text-white shadow-xs"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>{t("concepts.nations")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">
            {locale === "ar"
              ? `عرض ${filteredConcepts.length} عنصراً`
              : locale === "he"
                ? `מציג ${filteredConcepts.length} פריטים`
                : `Showing ${filteredConcepts.length} items`}
          </div>
        </div>

        {q.isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-purple-500" />
            <span>Loading concepts data…</span>
          </div>
        )}

        {filteredConcepts.length === 0 && !q.isLoading ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {locale === "ar"
                ? "لم يتم العثور على مفاهيم تطابق بحثك."
                : locale === "he"
                  ? "לא נמצאו מושגים התואמים את החיפוש שלך."
                  : "No concepts found matching your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredConcepts.map((item) => (
              <Link
                key={item.id}
                to="/learn/$kind/$slug"
                params={{ kind: item.kind, slug: item.slug }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card/90 via-card to-purple-500/5 p-5 shadow-xs transition-all duration-300 hover:border-purple-500/50 hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 shadow-2xs">
                        {item.kind === "nation" ? (
                          <Users className="h-5 w-5" />
                        ) : item.kind === "theme" ? (
                          <Layers className="h-5 w-5" />
                        ) : (
                          <GraduationCap className="h-5 w-5" />
                        )}
                      </div>
                      <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-purple-600 dark:text-purple-400 capitalize">
                        {item.kind === "nation"
                          ? locale === "ar"
                            ? "أمة وقوم"
                            : locale === "he"
                              ? "עם"
                              : "Nation"
                          : item.kind === "theme"
                            ? locale === "ar"
                              ? "محور"
                              : locale === "he"
                                ? "תמה"
                                : "Theme"
                            : locale === "ar"
                              ? "مفهوم"
                              : locale === "he"
                                ? "מושג"
                                : "Concept"}
                      </span>
                    </div>
                    <ChevronLeft
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-purple-500 ltr:rotate-180"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-4">
                    <h3
                      className="font-display text-lg font-bold text-foreground group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                      dir="auto"
                    >
                      {item.title}
                    </h3>
                    <p
                      className="mt-2 line-clamp-3 text-xs sm:text-sm text-muted-foreground leading-relaxed"
                      dir="auto"
                    >
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] font-medium text-muted-foreground">
                  <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>
                      {locale === "ar"
                        ? "الشرح والآيات"
                        : locale === "he"
                          ? "הסבר ופסוקים"
                          : "Explanation & Verses"}
                    </span>
                  </span>
                  <span className="text-primary group-hover:underline font-semibold">
                    {locale === "ar"
                      ? "اقرأ التفاصيل ←"
                      : locale === "he"
                        ? "קרא פרטים ←"
                        : "Read Details ←"}
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
