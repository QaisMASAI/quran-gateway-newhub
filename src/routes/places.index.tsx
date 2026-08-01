import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n, { normalizeLocale, type Locale } from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Search, MapPin, ChevronLeft, Loader2, BookOpen, Navigation } from "lucide-react";
import { listEntitiesByKind, pickLocale } from "@/lib/knowledge";

export const Route = createFileRoute("/places/")({
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    const title =
      locale === "ar"
        ? "الأماكن المقدسة والجغرافيا القرآنية | نور"
        : locale === "en"
          ? "Sacred Places & Quranic Geography | Noor"
          : "מקומות קדושים וגיאוגרפיה קוראנית | נור";
    const description =
      locale === "ar"
        ? "استكشف المعالم والأماكن المقدسة المذكورة في القرآن الكريم: مكة المكرمة، المدينة المنورة، المسجد الأقصى، طور سيناء وبكة."
        : locale === "en"
          ? "Discover sacred places and historical geography in the Quran: Makkah, Madinah, Al-Aqsa, Mount Sinai, and Bakkah."
          : "גלה מקומות קדושים וגאוגרפיה היסטורית בקוראן: מכה, מדינה, אל-אקצא, הר סיני ובכּה.";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "/places" },
      ],
      links: [{ rel: "canonical", href: "/places" }],
    };
  },
  component: PlacesIndexPage,
});

export function PlacesIndexPage() {
  const { i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const [searchQuery, setSearchQuery] = useState("");

  const q = useQuery({
    queryKey: ["entities-by-kind", "place"],
    queryFn: () => listEntitiesByKind("place"),
    staleTime: 5 * 60_000,
  });

  const placesList = useMemo(() => {
    if (!q.data) return [];
    return q.data.map((p) => ({
      ...p,
      title: pickLocale(p.title_i18n, locale),
      summary: pickLocale(p.summary_i18n, locale),
    }));
  }, [q.data, locale]);

  const filteredPlaces = useMemo(() => {
    if (!searchQuery.trim()) return placesList;
    const sq = searchQuery.toLowerCase().trim();
    return placesList.filter(
      (p) =>
        p.title.toLowerCase().includes(sq) ||
        p.summary.toLowerCase().includes(sq) ||
        p.slug.toLowerCase().includes(sq),
    );
  }, [placesList, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Header */}
      <div className="border-b border-border bg-gradient-to-b from-rose-500/10 via-background to-background">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-6 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 mb-2">
              <MapPin className="h-4 w-4" />
              <span>
                {locale === "ar"
                  ? "الجغرافيا والأماكن"
                  : locale === "he"
                    ? "מקומות קדושים"
                    : "Sacred Geography"}
              </span>
            </div>
            <Link
              to="/explore/map"
              className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>
                {locale === "ar"
                  ? "خريطة المعالم التفاعلية ←"
                  : locale === "he"
                    ? "מפה אינטראקטיבית ←"
                    : "Interactive Map →"}
              </span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {locale === "ar"
              ? "الأماكن المقدسة والمعالم القرآنية"
              : locale === "he"
                ? "מקומות קדושים בקוראן"
                : "Sacred Places & Quranic Geography"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            {locale === "ar"
              ? "استكشف مكة والمدينة والمسجد الأقصى وطور سيناء وبكة وغيرها من الأماكن المباركة المذكورة في القرآن الكريم."
              : locale === "he"
                ? "חקור את מכה, מדינה, מסגד אל-אקצא, הר סיני ומקומות מבורכים המוזכרים בקוראן."
                : "Explore sacred sanctuaries, blessed mountains, and ancient cities highlighted in the Holy Quran."}
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
                  ? "ابحث عن مكان (مكة، المدينة، الأقصى، طور سيناء...)"
                  : locale === "he"
                    ? "חפש מקום (מכה, מדינה, אל-אקצא, הר סיני...)"
                    : "Search place (Mecca, Madinah, Al-Aqsa, Mount Sinai...)"
              }
              className="w-full rounded-2xl border border-border bg-card/80 py-3 start-10 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition shadow-sm"
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
              ? `عرض ${filteredPlaces.length} مكانًا`
              : locale === "he"
                ? `מציג ${filteredPlaces.length} מקומות`
                : `Showing ${filteredPlaces.length} places`}
          </div>
        </div>

        {q.isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
            <span>Loading places data…</span>
          </div>
        )}

        {filteredPlaces.length === 0 && !q.isLoading ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {locale === "ar"
                ? "لم يتم العثور على أماكن تطابق بحثك."
                : locale === "he"
                  ? "לא נמצאו מקומות התואמים את החיפוש שלך."
                  : "No places found matching your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPlaces.map((place) => (
              <Link
                key={place.id}
                to="/learn/$kind/$slug"
                params={{ kind: "place", slug: place.slug }}
                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card/90 via-card to-rose-500/5 p-5 shadow-xs transition-all duration-300 hover:border-rose-500/50 hover:shadow-md hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 shadow-2xs">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <span className="rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-0.5 text-[10.5px] font-semibold text-rose-600 dark:text-rose-400">
                        {locale === "ar"
                          ? "مكان مقدس"
                          : locale === "he"
                            ? "מקום קדוש"
                            : "Sacred Site"}
                      </span>
                    </div>
                    <ChevronLeft
                      className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-rose-500 ltr:rotate-180"
                      aria-hidden="true"
                    />
                  </div>

                  <div className="mt-4">
                    <h3
                      className="font-display text-lg font-bold text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors"
                      dir="auto"
                    >
                      {place.title}
                    </h3>
                    <p
                      className="mt-2 line-clamp-3 text-xs sm:text-sm text-muted-foreground leading-relaxed"
                      dir="auto"
                    >
                      {place.summary}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] font-medium text-muted-foreground">
                  <span className="text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>
                      {locale === "ar"
                        ? "أحداث وآيات المكان"
                        : locale === "he"
                          ? "אירועים ופסוקים"
                          : "Events & Verses"}
                    </span>
                  </span>
                  <span className="text-primary group-hover:underline font-semibold">
                    {locale === "ar"
                      ? "استكشف المكان ←"
                      : locale === "he"
                        ? "חקור מקום ←"
                        : "Explore Place ←"}
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
