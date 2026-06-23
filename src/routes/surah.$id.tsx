import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchChapter, fetchVerses, surahAudioUrl, type ApiLang } from "@/lib/quran-api";
import { surahDisplayName, surahNameHe } from "@/lib/surah-names-he";
import { Header } from "@/components/Header";
import { AyahCard } from "@/components/AyahCard";
import { ReadingSettings } from "@/components/ReadingSettings";
import { ChevronRight, ChevronLeft, Loader2, Play, Pause } from "lucide-react";
import { useReadingProgress } from "@/lib/reading-progress";

export const Route = createFileRoute("/surah/$id")({
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: ({ params }) => {
    const id = Number(params.id);
    const he = id >= 1 && id <= 114 ? surahNameHe(id) : `Surah ${params.id}`;
    const title = `Noor Al Quran | ${he}`;
    const description = `Read ${he} in the original Arabic with translations, AI explanations, occasions of revelation and recitation by Yasser Al-Dosari.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: `/surah/${params.id}` },
        { property: "og:type", content: "article" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: `/surah/${params.id}` }],
    };
  },
  component: SurahPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <p className="text-muted-foreground">Surah not found</p>
        <Link to="/" className="mt-3 inline-block text-sm text-primary">
          Back to list
        </Link>
      </div>
    </div>
  ),
  errorComponent: () => (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-sm text-destructive">An error occurred loading this surah.</p>
    </div>
  ),
});

function SurahPage() {
  const { id } = Route.useParams();
  const { q } = Route.useSearch();
  const surahId = Number(id);
  const { t, i18n } = useTranslation("common");
  const lang = ((i18n.language?.split("-")[0] as ApiLang) || "he");
  const isRtl = i18n.dir() === "rtl";
  if (!surahId || surahId < 1 || surahId > 114) throw notFound();

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

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [surahId]);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(surahAudioUrl(surahId));
      audioRef.current.addEventListener("ended", () => setPlaying(false));
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
    }
  };

  const chapter = chapterQ.data;
  const verses = versesQ.data;

  // Record reading progress (when signed in). Updates as the reader scrolls
  // through verses so "Continue reading" lands on the right ayah.
  const { record } = useReadingProgress();
  const lastRecordedRef = useRef<number>(0);
  useEffect(() => {
    if (!verses || verses.length === 0) return;
    // Record the first ayah immediately on load so the surah itself is tracked.
    record(surahId, 1);
    lastRecordedRef.current = 1;

    const cards = Array.from(document.querySelectorAll<HTMLElement>("article[id^='v-']"));
    if (cards.length === 0) return;

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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surahId, verses?.length]);

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link to="/" className={`inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary ${isRtl ? 'flex-row-reverse' : ''}`}>
          {isRtl ? (
            <ChevronLeft className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          {t("common.back")}
        </Link>

        {chapter && (
          <div className="mt-4 surface-card relative overflow-hidden">
            <div
              className="arabesque-bg relative px-6 py-9 text-center text-white"
              style={{ background: "var(--gradient-hero)" }}
            >
              <div className={`pointer-events-none absolute -top-16 ${isRtl ? '-left-10' : '-right-10'} h-48 w-48 rounded-full bg-white/10 blur-3xl`} />
              <div className={`pointer-events-none absolute -bottom-16 ${isRtl ? '-right-10' : '-left-10'} h-48 w-48 rounded-full bg-olive/30 blur-3xl`} />

              <div className="relative space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-medium backdrop-blur-sm">
                  {`#${chapter.id}`}
                </div>
                <h1 className="font-arabic text-5xl font-semibold leading-none" dir="rtl">
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
          <p className="my-6 text-center font-arabic text-2xl text-foreground/80">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
        )}

        {(chapterQ.isLoading || versesQ.isLoading) && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        <div className={`mt-4 flex items-center ${isRtl ? 'justify-start' : 'justify-end'}`}>
          <ReadingSettings />
        </div>

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
            />
          ))}
        </div>

        {/* Bottom nav */}
        {chapter && (
          <div className={`mt-8 flex items-center justify-between gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
            {surahId > 1 ? (
              <Link
                to="/surah/$id"
                params={{ id: String(surahId - 1) }}
                className={`surface-card inline-flex flex-1 items-center gap-2 px-4 py-3 text-sm hover:border-primary/40 ${isRtl ? 'flex-row-reverse' : ''}`}
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
                className={`surface-card inline-flex flex-1 items-center justify-end gap-2 px-4 py-3 text-sm hover:border-primary/40 ${isRtl ? 'flex-row-reverse' : ''}`}
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
