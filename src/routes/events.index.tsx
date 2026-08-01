import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n, { normalizeLocale, type Locale } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Search, Clock, ChevronLeft, Loader2, BookOpen, Calendar } from "lucide-react";
import { listEntitiesByKind, pickLocale } from "@/lib/knowledge";

export const Route = createFileRoute("/events/")({
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    const title =
      locale === "ar"
        ? "الأحداث التاريخية في الإسلام والسيرة النبوية | نور"
        : locale === "en"
          ? "Historic & Prophetic Events | Noor"
          : "אירועים היסטוריים באסלאם ובסירה | נור";
    const description =
      locale === "ar"
        ? "استكشف الأحداث والتأريخ النبوي المذكور في كتاب الله: الهجرة، غزة بدر، أحد، الخندق، فتح مكة والإسراء والمعراج."
        : locale === "en"
          ? "Explore historical milestones in Islamic history: Hijrah, Battle of Badr, Uhud, Conquest of Mecca, and Night Journey."
          : "חקור אבני דרך היסטוריות באסלאם: ההג'רה, קרב בדר, אוחוד, כיבוש מכה ומסע הלילה.";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "/events" },
      ],
      links: [{ rel: "canonical", href: "/events" }],
    };
  },
  component: EventsIndexPage,
});

export function EventsIndexPage() {
  const { i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const [searchQuery, setSearchQuery] = useState("");

  const q = useQuery({
    queryKey: ["entities-by-kind", "event"],
    queryFn: () => listEntitiesByKind("event"),
    staleTime: 5 * 60_000,
  });

  const eventsList = useMemo(() => {
    if (!q.data) return [];
    return q.data.map((e, idx) => ({
      ...e,
      indexOrder: idx + 1,
      title: pickLocale(e.title_i18n, locale),
      summary: pickLocale(e.summary_i18n, locale),
    }));
  }, [q.data, locale]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return eventsList;
    const sq = searchQuery.toLowerCase().trim();
    return eventsList.filter(
      (e) =>
        e.title.toLowerCase().includes(sq) ||
        e.summary.toLowerCase().includes(sq) ||
        e.slug.toLowerCase().includes(sq),
    );
  }, [eventsList, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Header */}
      <div className="border-b border-border bg-gradient-to-b from-blue-500/10 via-background to-background">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
              <Clock className="h-4 w-4" />
              <span>
                {locale === "ar"
                  ? "السيرة والأحداث"
                  : locale === "he"
                    ? "אירועים היסטוריים"
                    : "Historic Events"}
              </span>
            </div>
            <Link
              to="/explore/timeline"
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 transition"
            >
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {locale === "ar"
                  ? "الخط الزمني الكامل ←"
                  : locale === "he"
                    ? "ציר זמן מלא ←"
                    : "Full Timeline →"}
              </span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {locale === "ar"
              ? "أحداث السيرة والتاريخ الإسلامي"
              : locale === "he"
                ? "אירועים היסטוריים וקוראניים"
                : "Islamic & Prophetic Events"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            {locale === "ar"
              ? "محطات تاريخية فارقة في الإسلام المذكورة في القرآن الكريم وسياق أساب النزول."
              : locale === "he"
                ? "אירועים היסטוריים משמעותיים המוזכרים בקוראן ובהקשר סיבות הירידה."
                : "Significant prophetic and historical milestones recorded in the Quran and Islamic tradition."}
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
                  ? "ابحث عن حدث (الهجرة، بدر، أحد، الإسراء...)"
                  : locale === "he"
                    ? "חפש אירוע (הג'רה, בדר, אוחוד...)"
                    : "Search event (Hijrah, Badr, Uhud, Night Journey...)"
              }
              className="w-full rounded-2xl border border-border bg-card/80 py-3 start-10 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition shadow-sm"
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
              ? `عرض ${filteredEvents.length} حدثاً`
              : locale === "he"
                ? `מציג ${filteredEvents.length} אירועים`
                : `Showing ${filteredEvents.length} events`}
          </div>
        </div>

        {q.isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <span>Loading historical events…</span>
          </div>
        )}

        {filteredEvents.length === 0 && !q.isLoading ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {locale === "ar"
                ? "لم يتم العثور على أحداث تطابق بحثك."
                : locale === "he"
                  ? "לא נמצאו אירועים התואמים את החיפוש שלך."
                  : "No events found matching your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <Link
                key={event.id}
                to="/learn/$kind/$slug"
                params={{ kind: "event", slug: event.slug }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card/90 via-card to-blue-500/5 p-5 shadow-xs transition-all duration-300 hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-sm shadow-2xs">
                        <Clock className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-blue-600 dark:text-blue-400">
                        {locale === "ar" ? "حدث تاريخي" : locale === "he" ? "אירוע" : "Event"}
                      </span>
                    </div>
                    <ChevronLeft
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-blue-500 ltr:rotate-180"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-4">
                    <h3
                      className="font-display text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                      dir="auto"
                    >
                      {event.title}
                    </h3>
                    <p
                      className="mt-2 line-clamp-3 text-xs sm:text-sm text-muted-foreground leading-relaxed"
                      dir="auto"
                    >
                      {event.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] font-medium text-muted-foreground">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>
                      {locale === "ar"
                        ? "سياق النزول والآيات"
                        : locale === "he"
                          ? "הקשר הפסוקים"
                          : "Context & Verses"}
                    </span>
                  </span>
                  <span className="text-primary group-hover:underline font-semibold">
                    {locale === "ar"
                      ? "تفاصيل الحدث ←"
                      : locale === "he"
                        ? "פרטי אירוע ←"
                        : "Event Details ←"}
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
