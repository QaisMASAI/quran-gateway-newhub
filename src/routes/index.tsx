import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchChapters, type ApiLang } from "@/lib/quran-api";
import { surahDisplayName, SURAH_NAMES_HE, SURAH_NAMES_EN, SURAH_NAMES_AR } from "@/lib/surah-names-he";
import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";
import { DailyVerse } from "@/components/DailyVerse";
// ContinueReading hidden per product decision
import { TrustBadge } from "@/components/TrustBadge";
import {
  BookOpen,
  Sparkles,
  Search as SearchIcon,
  ChevronRight,
  ChevronLeft,
  Loader2,
  MapPin,
} from "lucide-react";
import i18n, { normalizeLocale } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    return {
      meta: [
        { title: i18n.t("pages:home.metaTitle", { lng: locale }) },
        {
          name: "description",
          content: i18n.t("pages:home.metaDescription", { lng: locale }),
        },
        { property: "og:title", content: i18n.t("pages:home.ogTitle", { lng: locale }) },
        {
          property: "og:description",
          content: i18n.t("pages:home.ogDescription", { lng: locale }),
        },
        { property: "og:url", content: "/" },
        { name: "twitter:title", content: i18n.t("pages:home.ogTitle", { lng: locale }) },
        {
          name: "twitter:description",
          content: i18n.t("pages:home.ogDescription", { lng: locale }),
        },
      ],
      links: [{ rel: "canonical", href: "/" }],
    };
  },
  component: Home,
});

function Home() {
  const { t, i18n } = useTranslation("pages");
  const lang = (normalizeLocale(i18n.language) ?? "he") as ApiLang;
  const isRtl = i18n.dir() === "rtl";
  const { data, isLoading, error } = useQuery({
    queryKey: ["chapters", lang],
    queryFn: () => fetchChapters(lang),
    staleTime: 60 * 60 * 1000,
  });

  const [filter, setFilter] = useState("");
  const filtered = useMemo(() => {
    if (!data) return [];
    const q = filter.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) =>
        c.name_arabic.includes(q) ||
        c.name_simple.toLowerCase().includes(q) ||
        c.translated_name?.name?.toLowerCase().includes(q) ||
        (SURAH_NAMES_HE[c.id] ?? "").toLowerCase().includes(q) ||
        (SURAH_NAMES_EN[c.id] ?? "").toLowerCase().includes(q) ||
        (SURAH_NAMES_AR[c.id] ?? "").includes(q) ||
        String(c.id) === q,
    );
  }, [data, filter]);

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      {/* ============== HERO ============== */}
      <section className="relative overflow-hidden">
        <div
          className="arabesque-bg relative px-6 pt-16 pb-28 text-center text-primary-foreground shadow-2xl"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div
            className={`pointer-events-none absolute -top-24 ${isRtl ? "-left-16" : "-right-16"} h-72 w-72 rounded-full bg-gold/20 blur-3xl`}
          />
          <div
            className={`pointer-events-none absolute -bottom-24 ${isRtl ? "-right-10" : "-left-10"} h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl`}
          />
          <span className="arabesque-corner" style={{ top: 0, [isRtl ? 'left' : 'right']: 0 }} aria-hidden />
          <span className="arabesque-corner" style={{ bottom: 0, [isRtl ? 'right' : 'left']: 0, transform: "rotate(180deg)" }} aria-hidden />

          <div className="relative z-10 mx-auto max-w-4xl space-y-6">
            <div className="mx-auto inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-3 shadow-inner backdrop-blur-sm">
              <Logo className="h-12 w-12 text-gold drop-shadow-lg" />
            </div>

            <p
              className="font-arabic text-3xl text-gold sm:text-4xl"
              dir="rtl"
              style={{ textShadow: "0 2px 18px rgba(0,0,0,0.3)" }}
            >
              بِّسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ
            </p>

            <span className="inline-block rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-wider text-white/80">
              {t("home.badge")}
            </span>

            <h1 className="font-display text-4xl font-bold leading-tight text-primary-foreground sm:text-6xl md:text-7xl">
              {t("home.h1")}
              <span className="mt-3 block font-arabic text-3xl text-gold sm:text-5xl" dir="rtl">
                ٱلْقُرْآنُ ٱلْكَرِيمُ
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              {t("home.subtitle")}
            </p>
            <div className="flex justify-center">
              <TrustBadge size="md" className="border-gold/60 bg-card text-foreground shadow-sm" />
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-3">
              <a
                href="#main"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground px-7 py-3.5 text-sm font-bold text-primary shadow-lg transition-all hover:-translate-y-1 active:translate-y-0"
              >
                <BookOpen className="h-4 w-4" />
                {t("home.ctaStart")}
              </a>
              <Link
                to="/ask"
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold px-7 py-3.5 text-sm font-bold text-primary shadow-lg transition-all hover:-translate-y-1 active:translate-y-0"
              >
                <Sparkles className="h-4 w-4" />
                {t("home.ctaAsk")}
              </Link>
              <Link
                to="/search"
                className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-primary-foreground/10 px-7 py-3.5 text-sm font-bold text-primary-foreground backdrop-blur-md transition-colors hover:bg-primary-foreground/20"
              >
                <SearchIcon className="h-4 w-4" />
                {t("home.ctaSearch")}
              </Link>
            </div>
          </div>
        </div>

      </section>

      <div className="mt-16">
        <DailyVerse />
      </div>

      <main id="main" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 scroll-mt-20">
        <div className={`mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between ${isRtl ? "md:flex-row-reverse" : ""}`}>
          <div className="space-y-1.5">
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">{t("home.chaptersTitle")}</h2>
            <p className="text-sm text-muted-foreground">{t("home.chaptersSubtitle")}</p>
          </div>
          <div className="relative w-full md:w-96">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t("home.filterPlaceholder")}
              className={`w-full rounded-2xl border border-primary/10 bg-card py-3.5 ${isRtl ? 'ps-12 pe-4' : 'pe-12 ps-4'} text-sm shadow-sm outline-none transition-all focus:ring-2 focus:ring-gold/50 placeholder:text-muted-foreground`}
            />
            <SearchIcon className={`absolute top-1/2 ${isRtl ? 'start-4' : 'end-4'} h-5 w-5 -translate-y-1/2 text-muted-foreground`} />
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {error && (
          <p className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {t("home.loadError")}
          </p>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => {
            const isMakkah = c.revelation_place === "makkah";
            return (
              <Link
                key={c.id}
                to="/surah/$id"
                params={{ id: String(c.id) }}
                className={`group flex items-center gap-5 rounded-2xl border border-primary/5 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-xl ${isRtl ? 'flex-row-reverse' : ''}`}
              >
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                  <div className="absolute inset-0 rotate-45 rounded-lg bg-primary/5 transition-colors group-hover:bg-gold/20" />
                  <span className="relative text-sm font-bold text-primary transition-colors group-hover:text-gold">
                    {c.id}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-base font-bold text-primary">{surahDisplayName(c.id, lang)}</h4>
                  <div className={`mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-medium"
                      style={{
                        background: isMakkah ? "var(--gold-soft)" : "var(--olive-soft)",
                        color: isMakkah ? "var(--gold)" : "var(--olive)",
                      }}
                    >
                      <MapPin className="h-2.5 w-2.5" />
                      {isMakkah ? t("home.makkah") : t("home.madinah")}
                    </span>
                    <span className="font-medium">
                      {c.verses_count} {t("home.verseShort")}
                    </span>
                  </div>
                </div>

                <div
                  className="text-left font-arabic text-xl text-primary transition-colors group-hover:text-gold"
                  dir="rtl"
                >
                  {c.name_arabic}
                </div>

                {isRtl ? (
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-gold" />
                ) : (
                  <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-gold" />
                )}
              </Link>
            );
          })}
        </div>

        {filtered.length === 0 && !isLoading && (
          <p className="py-10 text-center text-sm text-muted-foreground">{t("home.noResults")}</p>
        )}
      </main>

      <div className="mosque-arch mt-12" aria-hidden />
      <footer className="relative border-t border-border py-10 text-center text-xs text-muted-foreground">
        <span className="arabesque-corner" style={{ top: 0, [isRtl ? 'left' : 'right']: 0 }} aria-hidden />
        <span className="arabesque-corner" style={{ top: 0, [isRtl ? 'right' : 'left']: 0, transform: isRtl ? "scaleX(1)" : "scaleX(-1)" }} aria-hidden />
        <p className="relative">{t("home.footerTagline")}</p>
        <p className="relative mt-1 opacity-70">{t("home.footerOwner")}</p>
        <p className="relative mt-1 opacity-70">{t("home.footerReciter")}</p>
      </footer>
    </div>
  );
}

