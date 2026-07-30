import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { BookOpen, Search, Clock, ArrowRight } from "lucide-react";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { fetchChapters, type ApiLang } from "@/lib/quran-api";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { useReadingProgress } from "@/lib/reading-progress";
import { normalizeLocale } from "@/lib/i18n";
import { uiFontClass } from "@/lib/locale-ui";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Surah Library — Browse All 114 Chapters" },
      {
        name: "description",
        content:
          "Browse the complete Surah library: search all 114 chapters, filter by Meccan or Medinan revelation, revisit recently opened surahs, and continue reading.",
      },
      { property: "og:title", content: "Surah Library — Browse All 114 Chapters" },
      {
        property: "og:description",
        content: "Search, filter and continue reading across all 114 chapters of the Quran.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Surah Library" },
      { name: "twitter:description", content: "Search and filter all 114 Quran chapters." },
    ],
    links: [{ rel: "canonical", href: "/library" }],
  }),
  component: LibraryPage,
});

type PlaceFilter = "all" | "makkah" | "madinah";
type LengthFilter = "all" | "short" | "medium" | "long";

function LibraryPage() {
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as ApiLang;
  const isRtl = i18n.dir() === "rtl";
  const [filter, setFilter] = useState("");
  const [place, setPlace] = useState<PlaceFilter>("all");
  const [len, setLen] = useState<LengthFilter>("all");

  const { data: chapters, isLoading } = useQuery({
    queryKey: ["chapters", locale],
    queryFn: () => fetchChapters(locale),
    staleTime: 60 * 60 * 1000,
  });

  const { items: recentViews } = useRecentlyViewed();
  const { progress } = useReadingProgress();
  const recentSurahs = useMemo(
    () => recentViews.filter((v) => v.kind === "surah").slice(0, 6),
    [recentViews],
  );

  const results = useMemo(() => {
    const q = filter.toLowerCase().trim();
    return (chapters ?? []).filter((c) => {
      if (place !== "all" && c.revelation_place !== place) return false;
      if (len === "short" && c.verses_count > 20) return false;
      if (len === "medium" && (c.verses_count <= 20 || c.verses_count > 100)) return false;
      if (len === "long" && c.verses_count <= 100) return false;
      if (!q) return true;
      return (
        c.id.toString() === q ||
        c.name_simple.toLowerCase().includes(q) ||
        c.name_arabic.includes(q) ||
        c.translated_name.name.toLowerCase().includes(q)
      );
    });
  }, [chapters, filter, place, len]);

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border text-muted-foreground hover:bg-secondary"
    }`;

  return (
    <div className={`min-h-screen bg-background ${uiFontClass(locale)}`} dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <div className="border-b border-border bg-gradient-to-b from-primary-soft/40 to-transparent">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-4 sm:px-6">
          <h1 className="text-3xl font-bold text-foreground">
            {locale === "ar" ? "مكتبة السور" : locale === "he" ? "ספריית הסורות" : "Surah Library"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("home.chaptersSubtitle")}</p>
        </div>
      </div>

      <main id="main" className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {progress && (
          <Link
            to="/surah/$id"
            params={{ id: String(progress.surah) }}
            search={{ q: "" }}
            className="surface-card mb-8 flex items-center justify-between gap-3 px-5 py-4 hover:border-primary/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {t("continueReading.label")}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-foreground">
                  {t("continueReading.surahN", { n: progress.surah })} · {progress.ayah}
                </div>
              </div>
            </div>
            <ArrowRight className={`h-4 w-4 text-muted-foreground ${isRtl ? "rotate-180" : ""}`} />
          </Link>
        )}

        {recentSurahs.length > 0 && (
          <section className="mb-8">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
              <Clock className="h-4 w-4" />
              {locale === "ar" ? "فُتحت مؤخراً" : locale === "he" ? "נפתחו לאחרונה" : "Recently opened"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {recentSurahs.map((v) => (
                <Link
                  key={`r-${v.surah}-${v.ayah ?? 0}`}
                  to="/surah/$id"
                  params={{ id: String(v.surah) }}
                  search={{ q: "" }}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-foreground hover:border-primary/40"
                >
                  {v.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="relative mb-4">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={t("home.filterPlaceholder")}
            className="ps-10"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {(["all", "makkah", "madinah"] as PlaceFilter[]).map((p) => (
            <button key={p} type="button" className={chip(place === p)} onClick={() => setPlace(p)}>
              {p === "all" ? "All" : p === "makkah" ? t("home.makkah") : t("home.madinah")}
            </button>
          ))}
          {(["all", "short", "medium", "long"] as LengthFilter[]).map((l) => (
            <button key={l} type="button" className={chip(len === l)} onClick={() => setLen(l)}>
              {l === "all" ? "Any length" : l === "short" ? "≤20 verses" : l === "medium" ? "21–100" : "100+"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <BookOpen className="h-8 w-8 animate-pulse text-primary/20" />
          </div>
        ) : results.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">{t("home.noResults")}</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {results.map((c) => (
              <li key={c.id}>
                <Link
                  to="/surah/$id"
                  params={{ id: String(c.id) }}
                  search={{ q: "" }}
                  className="group flex items-center justify-between gap-4 px-4 py-3 transition-colors hover:bg-secondary/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-xs font-bold text-primary">
                      {c.id}
                    </span>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
                        {c.translated_name.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {c.verses_count}{" "}
                        {locale === "ar" ? "آية" : locale === "he" ? "פסוקים" : "verses"} ·{" "}
                        {c.revelation_place === "makkah" ? t("home.makkah") : t("home.madinah")}
                      </div>
                    </div>
                  </div>
                  <span className="font-arabic text-lg text-foreground" dir="rtl">
                    {c.name_arabic}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
