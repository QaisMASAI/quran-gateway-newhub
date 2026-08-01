import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n, { normalizeLocale, type Locale } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Search, UserCheck, ChevronLeft, Loader2, Sparkles, BookOpen } from "lucide-react";
import { listEntitiesByKind, pickLocale, type KnowledgeEntity } from "@/lib/knowledge";

export const Route = createFileRoute("/prophets/")({
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    const title =
      locale === "ar"
        ? "أنبياء القرآن الكريم ورسله - قصص وآيات | نور"
        : locale === "en"
          ? "Prophets & Messengers in the Quran | Noor"
          : "נביאי הקוראן ושליחיו | נור";
    const description =
      locale === "ar"
        ? "تعرّف على قصص أنبياء الله ورسله المذكورين في القرآن الكريم: آدم، نوح، إبراهيم، موسى، عيسى، ومحمد ﷺ."
        : locale === "en"
          ? "Learn about the stories and verse references of Allah's Prophets and Messengers mentioned in the Holy Quran."
          : "למד על סיפוריהם ואזכוריהם בקוראן של נביאי האל ושליחיו.";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "/prophets" },
      ],
      links: [{ rel: "canonical", href: "/prophets" }],
    };
  },
  component: ProphetsIndexPage,
});

export function ProphetsIndexPage() {
  const { i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const [searchQuery, setSearchQuery] = useState("");

  const q = useQuery({
    queryKey: ["entities-by-kind", "prophet"],
    queryFn: () => listEntitiesByKind("prophet"),
    staleTime: 5 * 60_000,
  });

  const prophetsList = useMemo(() => {
    if (!q.data) return [];
    return q.data.map((p, idx) => ({
      ...p,
      order: idx + 1,
      title: pickLocale(p.title_i18n, locale),
      summary: pickLocale(p.summary_i18n, locale),
    }));
  }, [q.data, locale]);

  const filteredProphets = useMemo(() => {
    if (!searchQuery.trim()) return prophetsList;
    const sq = searchQuery.toLowerCase().trim();
    return prophetsList.filter(
      (p) =>
        p.title.toLowerCase().includes(sq) || p.summary.toLowerCase().includes(sq) || p.slug.toLowerCase().includes(sq),
    );
  }, [prophetsList, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Header */}
      <div className="border-b border-border bg-gradient-to-b from-amber-500/10 via-background to-background">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-6 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2">
            <UserCheck className="h-4 w-4" />
            <span>
              {locale === "ar" ? "رسل الله وأنبياؤه" : locale === "he" ? "נביאי האל ושליחיו" : "Prophets & Messengers"}
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {locale === "ar" ? "أنبياء القرآن الكريم" : locale === "he" ? "נביאי הקוראן" : "Prophets of the Quran"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            {locale === "ar"
              ? "استكشف سير الأنبياء المذكورين في كتاب الله، والآيات الكريمة المتعلقة برسالته ودعوته."
              : locale === "he"
                ? "חקור את סיפורי הנביאים המוזכרים בספר האל, ואת הפסוקים הקשורים לשליחותם."
                : "Explore the lives and divine scriptures of the Prophets mentioned in the Holy Quran."}
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
                  ? "ابحث عن نبي (إبراهيم، موسى، عيسى، محمد...)"
                  : locale === "he"
                    ? "חפש נביא (אברהם, משה, ישוע, מוחמד...)"
                    : "Search prophet (Abraham, Moses, Jesus, Muhammad...)"
              }
              className="w-full rounded-2xl border border-border bg-card/80 py-3 start-10 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition shadow-sm"
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
              ? `عرض ${filteredProphets.length} نبياً`
              : locale === "he"
                ? `מציג ${filteredProphets.length} נביאים`
                : `Showing ${filteredProphets.length} prophets`}
          </div>
        </div>

        {q.isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
            <span>Loading prophets data…</span>
          </div>
        )}

        {filteredProphets.length === 0 && !q.isLoading ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {locale === "ar"
                ? "لم يتم العثور على أنبياء يطابقون بحثك."
                : locale === "he"
                  ? "לא נמצאו נביאים התואמים את החיפוש שלך."
                  : "No prophets found matching your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProphets.map((prophet) => (
              <Link
                key={prophet.id}
                to="/learn/$kind/$slug"
                params={{ kind: "prophet", slug: prophet.slug }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card/90 via-card to-amber-500/5 p-5 shadow-xs transition-all duration-300 hover:border-amber-500/50 hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-base shadow-2xs">
                        {prophet.order}
                      </div>
                      <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-amber-600 dark:text-amber-400">
                        {locale === "ar" ? "نبي ورسول" : locale === "he" ? "נביא" : "Prophet"}
                      </span>
                    </div>
                    <ChevronLeft
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-amber-500 ltr:rotate-180"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-4">
                    <h3
                      className="font-display text-lg font-bold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
                      dir="auto"
                    >
                      {prophet.title}
                    </h3>
                    <p
                      className="mt-2 line-clamp-3 text-xs sm:text-sm text-muted-foreground leading-relaxed"
                      dir="auto"
                    >
                      {prophet.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] font-medium text-muted-foreground">
                  <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>{locale === "ar" ? "سيرة وآيات" : locale === "he" ? "סיפור ופסוקים" : "Verses & Story"}</span>
                  </span>
                  <span className="text-primary group-hover:underline font-semibold">
                    {locale === "ar" ? "قراءة المزيد ←" : locale === "he" ? "קרא עוד ←" : "Read Story →"}
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
