import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchChapter, fetchVerses, surahAudioUrls, type ApiLang } from "@/lib/quran-api";
import { surahDisplayName, surahNameHe, loadSurahNamesFromDb } from "@/lib/surah-names-he";
import { Header } from "@/components/Header";
import { AyahCard } from "@/components/AyahCard";
import { ReadingSettings } from "@/components/ReadingSettings";
import { ChevronRight, ChevronLeft, Loader2, Play, Pause } from "lucide-react";
import { useReadingProgress } from "@/lib/reading-progress";
import { normalizeLocale } from "@/lib/i18n";
import { useRecentlyViewed } from "@/lib/recently-viewed";
import { uiFontClass } from "@/lib/locale-ui";
import { PageKnowledgeHub } from "@/components/knowledge/PageKnowledgeHub";

function SurahNotFound() {
  const { t } = useTranslation("common");
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">{t("errors.notFoundTitle")}</p>
        <Link to="/surahs" className="mt-3 inline-block text-sm text-primary">
          {t("common.home")}
        </Link>
      </div>
    </div>
  );
}

function SurahError() {
  const { t } = useTranslation("common");
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-destructive">{t("errors.genericBody")}</p>
    </div>
  );
}

export const Route = createFileRoute("/surah/$id")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: ({ params }) => {
    const id = Number(params.id);
    const he = id >= 1 && id <= 114 ? surahNameHe(id) : `Surah ${params.id}`;
    const title = `Noor Al Quran | ${he}`;
    const description = `Read ${he} in the original Arabic with translations, AI explanations, occasions of revelation and recitation by Yasser Al-Dosari.`;
    const url = `/surah/${params.id}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: url },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: he,
            description,
            url,
          }),
        },
      ],
    };
  },
  component: SurahPage,
  notFoundComponent: SurahNotFound,
  errorComponent: SurahError,
});

function SurahPage() {
  const { id } = Route.useParams();
  const { q } = Route.useSearch();
  const surahId = Number(id);
  const { t, i18n } = useTranslation("common");
  const lang = (normalizeLocale(i18n.language) ?? "he") as ApiLang;
  const isRtl = i18n.dir() === "rtl";
  const { add: recordView } = useRecentlyViewed();
  const uiClass = uiFontClass(lang);
  if (!surahId || surahId < 1 || surahId > 114) throw notFound();

  const [viewMode, setViewMode] = useState<"card" | "mushaf">("card");

  const chapterQ = useQuery({
    queryKey: ["chapter", surahId, lang],
    queryFn: () => fetchChapter(surahId, lang),
    staleTime: 60 * 60 * 1000,
  });
  const versesQ = useQuery({
    queryKey: ["verses", surahId, lang],
    queryFn: () => fetchVerses(surahId, lang),
    staleTime: 60 * 60 * 1000,
  });

  useEffect(() => {
    void loadSurahNamesFromDb(fetch);
  }, []);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  const audioUrls = useMemo(() => surahAudioUrls(surahId), [surahId]);
  const urlIndexRef = useRef(0);

  useEffect(() => {
    urlIndexRef.current = 0;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [surahId]);

  const togglePlay = () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }

    if (!audioRef.current) {
      const url = audioUrls[urlIndexRef.current] ?? audioUrls[0];
      const audio = new Audio(url);
      audio.addEventListener("ended", () => setPlaying(false));
      audio.addEventListener("error", () => {
        // Try next audio mirror if one fails
        if (urlIndexRef.current + 1 < audioUrls.length) {
          urlIndexRef.current += 1;
          const fallbackUrl = audioUrls[urlIndexRef.current];
          audio.src = fallbackUrl;
          audio.play().catch(() => setPlaying(false));
        } else {
          setPlaying(false);
        }
      });
      audioRef.current = audio;
    }

    audioRef.current
      .play()
      .then(() => setPlaying(true))
      .catch(() => {
        if (urlIndexRef.current + 1 < audioUrls.length) {
          urlIndexRef.current += 1;
          const fallbackUrl = audioUrls[urlIndexRef.current];
          if (audioRef.current) {
            audioRef.current.src = fallbackUrl;
            audioRef.current
              .play()
              .then(() => setPlaying(true))
              .catch(() => setPlaying(false));
          }
        } else {
          setPlaying(false);
        }
      });
  };

  const chapter = chapterQ.data;
  const verses = versesQ.data;

  // Record reading progress (when signed in). Updates as the reader scrolls
  // through verses so "Continue reading" lands on the right ayah.
  const { record } = useReadingProgress();
  const lastRecordedRef = useRef<number>(0);
  useEffect(() => {
    if (!verses || verses.length === 0) return;
    // Do NOT record the first ayah on mount — that would overwrite the user's
    // existing reading progress the moment they open a different surah for a
    // quick look. Progress is only advanced once the IntersectionObserver
    // detects the reader has actually paused on a verse below.
    lastRecordedRef.current = 0;

    const cards = Array.from(document.querySelectorAll<HTMLElement>("article[id^='v-']"));
    if (cards.length === 0) return;

    // Guard against accidental progress overwrite when merely opening a surah:
    // only start persisting after explicit reader interaction/scroll intent.
    let hasReaderInteraction = false;
    const markInteraction = () => {
      hasReaderInteraction = true;
    };
    const markInteractionOnScroll = () => {
      if (window.scrollY > 48) hasReaderInteraction = true;
    };
    window.addEventListener("wheel", markInteraction, { passive: true });
    window.addEventListener("touchmove", markInteraction, { passive: true });
    window.addEventListener("keydown", markInteraction);
    window.addEventListener("scroll", markInteractionOnScroll, { passive: true });

    let pending: number | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible verse — that's "where the reader is".
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length === 0) return;
        const topId = visible[0].target.id; // "v-12"
        const n = Number(topId.slice(2));
        if (!n || n === lastRecordedRef.current) return;
        if (!hasReaderInteraction) return;
        pending = n;
        if (timer) clearTimeout(timer);
        // Debounce: only record after the reader has paused on the ayah.
        timer = setTimeout(() => {
          if (pending && pending !== lastRecordedRef.current) {
            lastRecordedRef.current = pending;
            record(surahId, pending);
          }
        }, 800);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 },
    );

    for (const c of cards) observer.observe(c);
    return () => {
      observer.disconnect();
      if (timer) clearTimeout(timer);
      window.removeEventListener("wheel", markInteraction);
      window.removeEventListener("touchmove", markInteraction);
      window.removeEventListener("keydown", markInteraction);
      window.removeEventListener("scroll", markInteractionOnScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahId, verses?.length]);

  useEffect(() => {
    if (chapter) {
      recordView({
        kind: "surah",
        surah: chapter.id,
        label: surahDisplayName(chapter.id, lang),
      });
    }
  }, [chapter, lang, recordView]);

  return (
    <div className={`min-h-screen bg-background ${uiClass}`} dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link
          to="/surahs"
          className={`inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary ${isRtl ? "flex-row-reverse" : ""}`}
        >
          {isRtl ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
          {t("common.back")}
        </Link>

        {chapter && (
          <div className="mt-4 surface-card relative overflow-hidden">
            <div
              className="arabesque-bg relative px-6 py-9 text-center text-white"
              style={{ background: "var(--gradient-hero)" }}
            >
              <div
                className={`pointer-events-none absolute -top-16 ${isRtl ? "-left-10" : "-right-10"} h-48 w-48 rounded-full bg-white/10 blur-3xl`}
              />
              <div
                className={`pointer-events-none absolute -bottom-16 ${isRtl ? "-right-10" : "-left-10"} h-48 w-48 rounded-full bg-olive/30 blur-3xl`}
              />

              <div className="relative space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-medium backdrop-blur-sm">
                  {`#${chapter.id}`}
                </div>
                <h1 className="font-quran text-5xl font-semibold leading-none" dir="rtl">
                  {chapter.name_arabic}
                </h1>
                <div className="text-lg font-semibold text-white/95" dir={lang === "en" ? "ltr" : "rtl"}>
                  {surahDisplayName(chapter.id, lang)}
                </div>
                <div className="text-sm text-white/80">
                  {chapter.verses_count} •{" "}
                  {chapter.revelation_place === "makkah" ? t("ui.surah.makkah") : t("ui.surah.madinah")}
                </div>

                <button
                  type="button"
                  onClick={togglePlay}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-primary shadow-glow transition-transform hover:-translate-y-0.5"
                >
                  {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {playing ? t("ui.surah.stopReciter") : t("ui.surah.playReciter")}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bismillah (except Tawbah=9; and Fatihah=1 includes it as ayah 1) */}
        {chapter && chapter.id !== 1 && chapter.id !== 9 && (
          <p className="my-6 text-center font-quran text-2xl text-foreground/80">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        )}

        {(chapterQ.isLoading || versesQ.isLoading) && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        <div className={`mt-4 flex flex-wrap items-center justify-between gap-2`}>
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`rounded-full px-3 py-1 font-semibold transition-all ${
                viewMode === "card"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang === "ar" ? "بطاقات دراسية" : lang === "he" ? "תצוגת כרטיסים" : "Study Cards"}
            </button>
            <button
              type="button"
              onClick={() => setViewMode("mushaf")}
              className={`rounded-full px-3 py-1 font-semibold transition-all ${
                viewMode === "mushaf"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {lang === "ar" ? "قراءة مصحف" : lang === "he" ? "קריאת מצחף" : "Mushaf View"}
            </button>
          </div>
          <ReadingSettings />
        </div>

        {viewMode === "mushaf" ? (
          <div className="mt-6 rounded-3xl border border-gold/30 bg-card/90 p-6 sm:p-10 shadow-xl backdrop-blur-xl">
            <div
              className="font-quran text-2xl sm:text-3xl leading-[2.6] text-foreground text-justify"
              dir="rtl"
              lang="ar"
            >
              {verses?.map((v) => (
                <span key={`mushaf-${v.id}`} className="inline">
                  {v.text_uthmani}{" "}
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-sans text-xs font-bold text-gold mx-1 align-middle">
                    {v.verse_number}
                  </span>{" "}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            {verses?.map((v) => (
              <AyahCard
                key={v.id}
                surah={surahId}
                surahName={chapter?.name_arabic ?? ""}
                ayah={v.verse_number}
                arabic={v.text_uthmani}
                hebrew={v.translations?.[0]?.text ?? ""}
                highlight={q}
                maxAyahInSurah={chapter?.verses_count}
              />
            ))}
          </div>
        )}

        {/* Dynamic 10D Knowledge Hub */}
        <PageKnowledgeHub
          slug={`surah-${surahId}`}
          locale={lang === "ar" ? "ar" : lang === "he" ? "he" : "en"}
          title={
            lang === "ar"
              ? `شبكة المعرفة والإحالات المتقاطعة لسورة ${chapter?.name_arabic ?? surahId}`
              : `Knowledge Hub & Cross-References for Surah ${chapter?.name_simple ?? surahId}`
          }
        />

        {/* Bottom nav */}
        {chapter && (
          <div className={`mt-8 flex items-center justify-between gap-2 ${isRtl ? "flex-row-reverse" : ""}`}>
            {surahId > 1 ? (
              <Link
                to="/surah/$id"
                params={{ id: String(surahId - 1) }}
                search={{ q: undefined }}
                className={`surface-card inline-flex flex-1 items-center gap-2 px-4 py-3 text-sm hover:border-primary/40 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                {isRtl ? (
                  <ChevronLeft className="h-4 w-4 text-primary" />
                ) : (
                  <ChevronRight className="h-4 w-4 rotate-180 text-primary" />
                )}
                <span className="text-muted-foreground">{t("common.previous")}</span>
              </Link>
            ) : (
              <div className="flex-1" />
            )}
            {surahId < 114 ? (
              <Link
                to="/surah/$id"
                params={{ id: String(surahId + 1) }}
                search={{ q: undefined }}
                className={`surface-card inline-flex flex-1 items-center justify-end gap-2 px-4 py-3 text-sm hover:border-primary/40 ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <span className="text-muted-foreground">{t("common.next")}</span>
                <ChevronRight className="h-4 w-4 text-primary" />
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
