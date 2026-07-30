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
  const recentSurahs = useMemo(
    () => recentViews.filter((v) => v.kind === "surah"),
    [recentViews]
  );

  const filteredChapters = useMemo(() => {
    if (!chapters) return [];
    if (!filter.trim()) return chapters;
    const q = filter.toLowerCase().trim();
    return chapters.filter(
      (c) =>
        c.id.toString() === q ||
        c.name_simple.toLowerCase().includes(q) ||
        c.name_arabic.includes(q) ||
        c.translated_name.name.toLowerCase().includes(q)
    );
  }, [chapters, filter]);

  return (
    <div className={`min-h-screen bg-background ${uiClass}`} dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <div className="border-b border-border bg-gradient-to-b from-primary-soft/40 to-transparent">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-3 sm:px-6">
          <h1 className="text-3xl font-bold text-foreground">{t("home.chaptersTitle")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("home.chaptersSubtitle")}</p>
        </div>
        <div className="mosque-arch" aria-hidden />
      </div>

      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {recentSurahs.length > 0 && !filter && (
          <section className="mb-10">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
              <Clock className="h-4 w-4" />
              {locale === "ar" ? "شوهدت مؤخراً" : locale === "he" ? "נצפו לאחרונה" : "Recently Viewed"}
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentSurahs.slice(0, 3).map((view) => (
                <Link
                  key={`recent-${view.surah}`}
                  to="/surah/$id"
                  params={{ id: String(view.surah) }}
                  search={{ q: "" }}
                  className="surface-card flex items-center justify-between p-4 hover:border-primary/40"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary font-bold">
                      {view.surah}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{view.label}</p>
                      {view.ayah && (
                        <p className="text-xs text-muted-foreground">
                          {locale === "ar" ? `آية ${view.ayah}` : locale === "he" ? `פסוק ${view.ayah}` : `Ayah ${view.ayah}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight className={`h-4 w-4 text-muted-foreground ${isRtl ? "rotate-180" : ""}`} />
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t("home.filterPlaceholder")}
            className="pl-10"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <BookOpen className="h-8 w-8 animate-pulse text-primary/20" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredChapters.map((c) => (
              <Link
                key={c.id}
                to="/surah/$id"
                params={{ id: String(c.id) }}
                search={{ q: "" }}
                className="group surface-card flex items-center justify-between p-4 transition-all hover:border-primary/40 hover:shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-sm font-bold text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    {c.id}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary">
                      {c.translated_name.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {c.verses_count} {locale === "ar" ? "آية" : locale === "he" ? "פסוקים" : "Verses"} • {c.revelation_place === "makkah" ? t("home.makkah") : t("home.madinah")}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-arabic text-xl font-medium text-foreground" dir="rtl">
                    {c.name_arabic}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {filteredChapters.length === 0 && !isLoading && (
          <p className="py-20 text-center text-muted-foreground">{t("home.noResults")}</p>
        )}
      </main>
    </div>
  );
}
