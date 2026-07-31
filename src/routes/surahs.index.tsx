import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useState, useMemo } from "react";
import { BookOpen, Search, Clock, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { fetchChapters, type ApiLang } from "@/lib/quran-api";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { normalizeLocale } from "@/lib/i18n";
import { uiFontClass } from "@/lib/locale-ui";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/surahs/")({
  component: SurahsIndex,
});

function SurahsIndex() {
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as ApiLang;
  const isRtl = i18n.dir() === "rtl";
  const uiClass = uiFontClass(locale);
  const [filter, setFilter] = useState("");

  const { data: chapters, isLoading } = useQuery({
    queryKey: ["chapters", locale],
    queryFn: () => fetchChapters(locale),
    staleTime: 60 * 60 * 1000,
  });

  const { items: recentViews } = useRecentlyViewed();
  const recentSurahs = useMemo(() => recentViews.filter((v) => v.kind === "surah"), [recentViews]);

  const filteredChapters = useMemo(() => {
    if (!chapters) return [];
    if (!filter.trim()) return chapters;
    const q = filter.toLowerCase().trim();
    return chapters.filter(
      (c) =>
        c.id.toString() === q ||
        c.name_simple.toLowerCase().includes(q) ||
        c.name_arabic.includes(q) ||
        c.translated_name.name.toLowerCase().includes(q),
    );
  }, [chapters, filter]);

  return (
    <div
      className={`min-h-screen bg-background relative overflow-x-hidden ${uiClass}`}
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header />

      {/* Ambient Radial Accent */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-radial from-primary/10 via-gold/5 to-transparent blur-3xl opacity-60"
        aria-hidden
      />

      <div className="border-b border-border/60 bg-gradient-to-b from-card/80 to-background/50 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-4 pt-8 pb-6 sm:px-6">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {locale === "ar"
                ? "القرآن الكريم"
                : locale === "he"
                  ? "הקוראן הקדוש"
                  : "The Holy Quran"}
            </span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {t("home.chaptersTitle")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            {t("home.chaptersSubtitle")}
          </p>
        </div>
        <div className="mosque-arch" aria-hidden />
      </div>

      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {recentSurahs.length > 0 && !filter && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Clock className="h-4 w-4" />
              {locale === "ar"
                ? "شوهدت مؤخراً"
                : locale === "he"
                  ? "נצפו לאחרונה"
                  : "Recently Viewed"}
            </h2>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {recentSurahs.slice(0, 3).map((view) => (
                <Link
                  key={`recent-${view.surah}`}
                  to="/surah/$id"
                  params={{ id: String(view.surah) }}
                  search={{ q: "" }}
                  className="surface-card group flex items-center justify-between p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary font-bold shadow-2xs">
                      {view.surah}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {view.label}
                      </p>
                      {view.ayah && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {locale === "ar"
                            ? `آية ${view.ayah}`
                            : locale === "he"
                              ? `פסוק ${view.ayah}`
                              : `Ayah ${view.ayah}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight
                    className={`h-4 w-4 text-muted-foreground/60 transition-colors group-hover:text-primary ${isRtl ? "rotate-180" : ""}`}
                  />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* SEARCH & FILTER BAR */}
        <div className="mb-8 relative max-w-xl">
          <Search className="absolute start-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t("home.filterPlaceholder")}
            className="ps-10 h-11 rounded-xl border-border/80 bg-card/80 text-sm shadow-2xs focus-visible:ring-primary/20"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <BookOpen className="h-10 w-10 animate-pulse text-primary/30" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChapters.map((c) => (
              <Link
                key={c.id}
                to="/surah/$id"
                params={{ id: String(c.id) }}
                search={{ q: "" }}
                className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/70 p-4 transition-all duration-300 hover:border-primary/50 hover:bg-card hover:-translate-y-0.5 hover:shadow-md backdrop-blur-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary-soft text-sm font-extrabold text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-sm">
                      {c.id}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">
                        {c.translated_name.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {c.verses_count}{" "}
                        {locale === "ar" ? "آية" : locale === "he" ? "פסוקים" : "Verses"} •{" "}
                        {c.revelation_place === "makkah" ? t("home.makkah") : t("home.madinah")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ps-2">
                    <div
                      className="font-arabic text-xl font-bold text-foreground group-hover:text-gold transition-colors"
                      dir="rtl"
                      lang="ar"
                    >
                      {c.name_arabic}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredChapters.length === 0 && !isLoading && (
          <p className="py-20 text-center text-muted-foreground font-medium">
            {t("home.noResults")}
          </p>
        )}
      </main>
    </div>
  );
}
