import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  Clock,
  Compass,
  Gamepad2,
  GraduationCap,
  LibraryBig,
  MessageCircle,
  Mic,
  ScrollText,
  Search as SearchIcon,
  Sparkles,
} from "lucide-react";

import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";
import { DailyVerse } from "@/components/DailyVerse";
import { DailyAssistantWidget } from "@/components/DailyAssistantWidget";
import { PrayerTimesWidget } from "@/components/PrayerTimesWidget";
import { TrustBadge } from "@/components/TrustBadge";
import { Button } from "@/components/ui/button";
import { trackHomePromptEvent } from "@/lib/home-prompts.functions";
import i18n, { normalizeLocale } from "@/lib/i18n";
import { useReadingProgress } from "@/lib/reading-progress";
import { useRecentlyViewed } from "@/lib/recently-viewed";

const HOME_RECENT_PROMPTS_KEY = "noor:home:recent-prompts:v1";
const HOME_RECENT_PLAN_KEY = "noor.reading-plan-progress.v1";

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
        { property: "og:type", content: "website" },
        { property: "og:title", content: i18n.t("pages:home.ogTitle", { lng: locale }) },
        {
          property: "og:description",
          content: i18n.t("pages:home.ogDescription", { lng: locale }),
        },
        { name: "twitter:card", content: "summary_large_image" },
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

import { Headphones } from "lucide-react";

export function Home() {
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as "he" | "ar" | "en";
  const isRtl = i18n.dir() === "rtl";
  const navigate = useNavigate();
  const { items: recentViews } = useRecentlyViewed();
  const { progress } = useReadingProgress();
  const trackPrompt = useServerFn(trackHomePromptEvent);

  const [assistantPrompt, setAssistantPrompt] = useState("");
  const [recentPrompts, setRecentPrompts] = useState<string[]>([]);
  const [recentPlanSlug, setRecentPlanSlug] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(HOME_RECENT_PROMPTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setRecentPrompts(
          parsed.filter((item): item is string => typeof item === "string").slice(0, 6),
        );
      }
    } catch {
      // ignore malformed local cache
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(HOME_RECENT_PLAN_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, number[]>;
      const slug =
        Object.entries(parsed).find(([, days]) => Array.isArray(days) && days.length > 0)?.[0] ??
        null;
      setRecentPlanSlug(slug);
    } catch {
      setRecentPlanSlug(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = !!target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
      if (isTyping || event.key !== "/") return;
      event.preventDefault();
      inputRef.current?.focus();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const pushRecentPrompt = (prompt: string) => {
    const trimmed = prompt.trim();
    if (!trimmed || typeof window === "undefined") return;
    setRecentPrompts((prev) => {
      const next = [trimmed, ...prev.filter((p) => p !== trimmed)].slice(0, 6);
      try {
        window.localStorage.setItem(HOME_RECENT_PROMPTS_KEY, JSON.stringify(next));
      } catch {
        // ignore storage failures
      }
      return next;
    });
  };

  const suggestedQuestions = useMemo(
    () =>
      locale === "ar"
        ? [
            "ما هي رحمة الله في القرآن؟",
            "آيات عن الصبر وقت الابتلاء",
            "ما معنى التوكل؟",
            "قصص موسى في القرآن",
          ]
        : locale === "he"
          ? [
              "מה הקוראן אומר על רחמים?",
              "פסוקים על סבלנות בזמן קושי",
              "מה משמעות התווכל?",
              "סיפורי משה בקוראן",
            ]
          : [
              "What does the Quran teach about mercy?",
              "Verses about patience during hardship",
              "What is tawakkul?",
              "Stories of Musa in the Quran",
            ],
    [locale],
  );

  const exploreCards = useMemo(
    () => [
      {
        label: locale === "ar" ? "السور" : locale === "he" ? "סורות" : "Surahs",
        to: "/surahs" as const,
        icon: BookOpen,
      },
      {
        label: locale === "ar" ? "المواضيع" : locale === "he" ? "נושאים" : "Topics",
        to: "/topics" as const,
        icon: Compass,
      },
      {
        label: locale === "ar" ? "الأنبياء" : locale === "he" ? "נביאים" : "Prophets",
        to: "/prophets" as const,
        icon: BookMarked,
      },
      {
        label: locale === "ar" ? "القصص" : locale === "he" ? "סיפורים" : "Stories",
        to: "/learn" as const,
        icon: ScrollText,
      },
      {
        label: locale === "ar" ? "الرحلات" : locale === "he" ? "מסלולים" : "Journeys",
        to: "/learn/journeys" as const,
        icon: GraduationCap,
      },
      {
        label: locale === "ar" ? "الحديث" : locale === "he" ? "חדית׳" : "Hadith",
        to: "/hadith" as const,
        icon: LibraryBig,
      },
      {
        label: locale === "ar" ? "الأطفال" : locale === "he" ? "ילדים" : "Kids",
        to: "/kids" as const,
        icon: Gamepad2,
      },
    ],
    [locale],
  );

  const discoverCards = useMemo(
    () => [
      {
        label:
          locale === "ar"
            ? "المحادثات الأخيرة"
            : locale === "he"
              ? "שיחות אחרונות"
              : "Recent AI Conversations",
        description:
          locale === "ar"
            ? "ارجع إلى آخر الأسئلة التي طرحتها"
            : locale === "he"
              ? "חזרו לשאלות האחרונות שלכם"
              : "Return to your most recent prompts",
        to: "/ask" as const,
        icon: MessageCircle,
      },
      {
        label:
          locale === "ar" ? "التأمل اليومي" : locale === "he" ? "השראה יומית" : "Daily Reflections",
        description:
          locale === "ar"
            ? "آية اليوم مع انتقال مباشر للقراءة"
            : locale === "he"
              ? "פסוק היום עם מעבר מהיר לקריאה"
              : "Verse of the day with a fast path to reading",
        to: "/surahs" as const,
        icon: BookOpen,
      },
      {
        label: locale === "ar" ? "المحفوظات" : locale === "he" ? "שמורים" : "Bookmarks",
        description:
          locale === "ar"
            ? "كل الآيات المحفوظة في صفحة مخصصة"
            : locale === "he"
              ? "כל הפסוקים השמורים בדף ייעודי"
              : "All saved verses in a dedicated destination",
        to: "/favorites" as const,
        icon: Sparkles,
      },
    ],
    [locale],
  );

  const hasContinue = Boolean(progress || recentPlanSlug || recentPrompts.length > 0);

  function submitAssistantSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = assistantPrompt.trim();
    if (!q) return;
    pushRecentPrompt(q);
    void trackPrompt({
      data: {
        event: "home_prompt_navigate",
        destination: "/search",
        source: "hero_input",
        q,
      },
    });
    navigate({ to: "/search", search: { q, qState: "ok", src: "hero_input" } });
  }

  return (
    <div
      className="min-h-screen bg-background relative overflow-x-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <Header />

      {/* Hero Ambient Background Lighting */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-radial from-primary/15 via-gold/5 to-transparent blur-3xl opacity-70"
        aria-hidden
      />

      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card/90 via-card/60 to-background p-6 sm:p-10 lg:p-14 shadow-2xl backdrop-blur-xl">
          <span className="arabesque-corner top-0 left-0" aria-hidden />
          <span className="arabesque-corner bottom-0 right-0 rotate-180" aria-hidden />

          <div className="mx-auto max-w-3xl text-center relative z-10">
            {/* Prominent Featured Brand Logo Emblem */}
            <div className="mb-6 flex justify-center">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gold/40 via-primary/30 to-gold/40 blur-lg opacity-70 group-hover:opacity-100 transition duration-500" />
                <Logo className="relative h-24 w-24 sm:h-28 sm:w-28 drop-shadow-2xl transition-transform duration-500 group-hover:scale-110" />
              </div>
            </div>

            {/* Arabic Basmala Calligraphy Badge */}
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 backdrop-blur-md shadow-xs">
              <Sparkles className="h-4 w-4 text-gold animate-pulse" />
              <span
                className="font-arabic text-base sm:text-lg font-semibold text-gold tracking-wide"
                dir="rtl"
                lang="ar"
              >
                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </span>
            </div>

            <h1 className="mt-6 text-balance font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:leading-tight">
              {t("home.h1")}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("home.subtitle")}
            </p>

            {/* AI SEARCH & DISCOVERY BAR */}
            <div className="mx-auto mt-8 max-w-3xl glass-panel p-4 sm:p-5 shadow-xl transition-all duration-300">
              <form onSubmit={submitAssistantSearch} className="space-y-3">
                <div className="relative flex items-center rounded-xl border border-border/80 bg-background/90 px-3.5 py-3 shadow-inner focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <SearchIcon className="h-5 w-5 shrink-0 text-primary" />
                  <input
                    ref={inputRef}
                    value={assistantPrompt}
                    onChange={(e) => setAssistantPrompt(e.target.value)}
                    placeholder={suggestedQuestions[0]}
                    className="w-full bg-transparent px-3 text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground/70"
                    aria-label="AI search"
                  />
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={
                        locale === "ar"
                          ? "بحث صوتي"
                          : locale === "he"
                            ? "חיפוש קולי"
                            : "Voice search"
                      }
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary-soft/50"
                      onClick={() => {
                        if (typeof window === "undefined") return;
                        const speechWindow = window as Window & {
                          SpeechRecognition?: new () => {
                            lang: string;
                            onresult: ((event: SpeechRecognitionEvent) => void) | null;
                            start: () => void;
                          };
                          webkitSpeechRecognition?: new () => {
                            lang: string;
                            onresult: ((event: SpeechRecognitionEvent) => void) | null;
                            start: () => void;
                          };
                        };
                        const Recognition =
                          speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
                        if (!Recognition) return;
                        const recognition = new Recognition();
                        recognition.lang = locale === "ar" ? "ar" : locale === "he" ? "he" : "en";
                        recognition.onresult = (resultEvent: SpeechRecognitionEvent) => {
                          const text = resultEvent.results[0]?.[0]?.transcript?.trim();
                          if (text) setAssistantPrompt(text);
                        };
                        recognition.start();
                      }}
                    >
                      <Mic className="h-4 w-4" />
                    </Button>

                    <kbd className="hidden sm:inline-flex h-5 items-center rounded border border-border/80 bg-muted/60 px-1.5 text-[10px] font-mono font-medium text-muted-foreground">
                      /
                    </kbd>
                  </div>
                </div>

                {/* SUGGESTED PROMPT CHIPS */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex min-w-0 flex-wrap gap-1.5">
                    {suggestedQuestions.map((example) => (
                      <button
                        key={example}
                        type="button"
                        onClick={() => setAssistantPrompt(example)}
                        className="rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
                      >
                        {example}
                      </button>
                    ))}
                  </div>

                  <Button
                    type="submit"
                    className="min-h-10 w-full sm:w-auto rounded-xl px-5 bg-primary text-primary-foreground font-semibold shadow-md hover:bg-primary/90 transition-all"
                  >
                    <Sparkles className="h-4 w-4 text-gold" />
                    {locale === "ar"
                      ? "بحث بالذكاء الاصطناعي"
                      : locale === "he"
                        ? "חיפוש בינה מלאכותית"
                        : "Ask Grounded AI"}
                  </Button>
                </div>
              </form>

              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  {locale === "ar"
                    ? "تفسير الجلالين • أحاديث صحيحة"
                    : locale === "he"
                      ? "תפסיר אל-ג'לאלין • חדית'ים מוסמכים"
                      : "Jalalayn Tafsir • Verified Sahih Hadith"}
                </span>
                <TrustBadge size="sm" className="border-border/60 bg-background/50" />
              </div>
            </div>

            {/* QUICK LINK BUTTONS */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                asChild
                type="button"
                variant="outline"
                className="rounded-full border-gold/40 bg-gold/10 px-5 font-semibold text-gold hover:bg-gold/20 hover:border-gold"
              >
                <Link to="/prayer-times">
                  <Clock className="h-4 w-4 text-gold" />
                  {locale === "ar"
                    ? "أوقات الصلاة والقبلة"
                    : locale === "he"
                      ? "זמני תפילה וקיבלה"
                      : "Prayer Times & Qibla"}
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-full border-border/80 px-5 font-semibold hover:border-primary/40"
              >
                <Link to="/surahs">
                  <BookOpen className="h-4 w-4 text-primary" />
                  {locale === "ar"
                    ? "قراءة السور (114)"
                    : locale === "he"
                      ? "קריאת סורות (114)"
                      : "Read Quran (114 Surahs)"}
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="rounded-full border-border/80 px-5 font-semibold hover:border-primary/40"
              >
                <Link to="/hadith">
                  <LibraryBig className="h-4 w-4 text-olive" />
                  {locale === "ar"
                    ? "مكتبة الحديث"
                    : locale === "he"
                      ? "ספריית החדית'"
                      : "Hadith Library"}
                </Link>
              </Button>

              <Button
                asChild
                className="rounded-full bg-gradient-to-r from-primary to-olive px-5 font-semibold text-primary-foreground shadow-md hover:opacity-95"
              >
                <Link to="/ask" search={{ q: undefined, qState: "missing", src: "unknown" }}>
                  <Sparkles className="h-4 w-4 text-gold" />
                  {locale === "ar"
                    ? "مساعد AI"
                    : locale === "he"
                      ? "סייען AI"
                      : "Grounded AI Research"}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* FEATURE 5: DAILY ISLAMIC ASSISTANT ECOSYS WIDGET */}
        <div className="mt-8 space-y-8">
          <PrayerTimesWidget locale={locale} />
          <DailyAssistantWidget locale={locale} />
        </div>

        {/* RESUME & CONTINUATION BAR */}
        {hasContinue && (
          <section className="mt-10 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                {locale === "ar"
                  ? "تابع من حيث توقفت"
                  : locale === "he"
                    ? "המשך מהנקודה האחרונה"
                    : "Continue Activity"}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-3.5 md:grid-cols-3">
              {progress && (
                <Link
                  to="/surah/$id"
                  params={{ id: String(progress.surah) }}
                  search={{ q: undefined }}
                  hash={progress.ayah ? `v-${progress.ayah}` : undefined}
                  className="surface-card group flex items-center justify-between p-4 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary-soft text-primary font-bold">
                      {progress.surah}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                        {locale === "ar"
                          ? "متابعة القراءة"
                          : locale === "he"
                            ? "המשך קريאה"
                            : "Continue Reading"}
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-foreground">
                        {locale === "ar"
                          ? `سورة ${progress.surah} • آية ${progress.ayah}`
                          : locale === "he"
                            ? `סורה ${progress.surah} • פסוק ${progress.ayah}`
                            : `Surah ${progress.surah} • Ayah ${progress.ayah}`}
                      </p>
                    </div>
                  </div>
                  {isRtl ? (
                    <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </Link>
              )}

              {recentPlanSlug && (
                <Link
                  to="/plans/$slug"
                  params={{ slug: recentPlanSlug }}
                  className="surface-card group flex items-center justify-between p-4 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gold-soft text-gold font-bold">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                        {locale === "ar"
                          ? "متابعة الخطة"
                          : locale === "he"
                            ? "המשך מסלול"
                            : "Learning Journey"}
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-foreground capitalize">
                        {recentPlanSlug.replace(/-/g, " ")}
                      </p>
                    </div>
                  </div>
                  {isRtl ? (
                    <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </Link>
              )}

              {recentPrompts[0] && (
                <Link
                  to="/ask"
                  search={{ q: recentPrompts[0], qState: "ok", src: "home_continue_ai" }}
                  className="surface-card group flex items-center justify-between p-4 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-primary font-bold">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                        {locale === "ar"
                          ? "متابعة البحث"
                          : locale === "he"
                            ? "המשך שיחת AI"
                            : "AI Research Prompt"}
                      </p>
                      <p className="mt-0.5 line-clamp-1 text-sm font-bold text-foreground">
                        {recentPrompts[0]}
                      </p>
                    </div>
                  </div>
                  {isRtl ? (
                    <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  ) : (
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </Link>
              )}
            </div>
          </section>
        )}

        {/* RECENTLY VIEWED SLIDER */}
        {recentViews.length > 0 && (
          <section className="mt-8">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {locale === "ar"
                ? "نصفي حديثاً"
                : locale === "he"
                  ? "נצפו לאחרונה"
                  : "Recently Opened"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {recentViews.slice(0, 8).map((view, idx) => (
                <Link
                  key={`home-recent-${idx}`}
                  to={
                    view.kind === "surah"
                      ? "/surah/$id"
                      : view.kind === "entity"
                        ? "/learn/$kind/$slug"
                        : "/hadith/$collection/entry/$num"
                  }
                  params={
                    view.kind === "surah"
                      ? { id: String(view.surah) }
                      : view.kind === "entity"
                        ? { kind: view.entityKind, slug: view.slug }
                        : { collection: view.collection, num: String(view.num) }
                  }
                  className="rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary-soft/40 hover:text-primary shadow-2xs"
                >
                  {view.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* DAILY INSPIRATION SECTION */}
        <section className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-gold" />
                {locale === "ar"
                  ? "إلهام آية اليوم"
                  : locale === "he"
                    ? "השראת היום"
                    : "Verse of the Day"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {locale === "ar"
                  ? "آية متجددة يومياً مع ترجمة وتفسير الجلالين"
                  : locale === "he"
                    ? "פסוק יומי מתחלף עם תרגום ותפסיר"
                    : "Daily rotating Quranic verse with bilingual translations and tafsir"}
              </p>
            </div>
          </div>
          <DailyVerse />
        </section>

        {/* BENTO GRID EXPLORE SECTION */}
        <section className="mt-14">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Compass className="h-6 w-6 text-primary" />
              {locale === "ar"
                ? "استكشف بوابة المعرفة"
                : locale === "he"
                  ? "חקרו את שער הידע"
                  : "Explore Knowledge Gateway"}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {locale === "ar"
                ? "تصفح السور والحديث والمواضيع والأنبياء عبر خرائط تفاعلية"
                : locale === "he"
                  ? "עיינו בסורות, חדית', נושאים ונביאים במפות אינטראקטיביות"
                  : "Browse Surahs, Hadith, Topics, Prophets, and interactive maps"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {exploreCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  to={card.to}
                  className="surface-card group relative overflow-hidden p-5 transition-all duration-300 hover:border-primary/60 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft text-primary transition-transform duration-300 group-hover:scale-110">
                      <Icon className="h-6 w-6" />
                    </div>
                    {isRtl ? (
                      <ArrowLeft className="h-5 w-5 text-muted-foreground/50 transition-colors group-hover:text-primary" />
                    ) : (
                      <ArrowRight className="h-5 w-5 text-muted-foreground/50 transition-colors group-hover:text-primary" />
                    )}
                  </div>

                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                      {card.label}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground/80 line-clamp-2">
                      {card.to === "/surahs"
                        ? locale === "ar"
                          ? "114 سورة برسم عثماني وتلاوة ممتازة"
                          : locale === "he"
                            ? "114 סורות בכתב עות'מאני והקראה"
                            : "114 Surahs with Uthmanic script & audio"
                        : card.to === "/topics"
                          ? locale === "ar"
                            ? "شجرة مفاهيم تفاعلية وربط بالآيات"
                            : locale === "he"
                              ? "עץ קונספטים אינטראקטיבי"
                              : "Interactive concept graph & cross-references"
                          : card.to === "/hadith"
                            ? locale === "ar"
                              ? "كتب الحديث الصحيحة مع دراسة الإسناد"
                              : locale === "he"
                                ? "ספרי חדית' מוסמכים עם חקר סנד"
                                : "Authentic Hadith collections & narrators"
                            : card.to === "/kids"
                              ? locale === "ar"
                                ? "أسئلة تفاعلية وممتعة للأطفال"
                                : locale === "he"
                                  ? "שאלות ותשובות אינטראקטיביות לילדים"
                                  : "Interactive Q&A hub for kids"
                              : locale === "ar"
                                ? "استكشف المحتوى التعليمي والتفاعلي"
                                : locale === "he"
                                  ? "חקרו תוכן לימודי אינטראקטיבי"
                                  : "Explore educational learning content"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* DISCOVER & SPECIALIZED MODULES SECTION */}
        <section className="mt-14">
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <BookMarked className="h-6 w-6 text-gold" />
              {locale === "ar"
                ? "أدوات وميزات مميزة"
                : locale === "he"
                  ? "כלים ותכונות מיוחדות"
                  : "Featured Research Tools"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {discoverCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  to={card.to}
                  className="surface-card group flex items-start gap-3.5 p-5 transition-all duration-300 hover:border-gold/60 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-soft text-gold transition-transform duration-300 group-hover:scale-110">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-gold transition-colors">
                      {card.label}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      {card.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="mt-20 border-t border-border/60 bg-card/60 py-10 text-xs text-muted-foreground backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo className="h-6 w-6 text-primary" />
            <p className="font-semibold text-foreground/80">{t("home.footerTagline")}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <Link to="/topics" className="hover:text-primary transition-colors">
              {locale === "ar" ? "المواضيع" : locale === "he" ? "נושאים" : "Topics"}
            </Link>
            <Link to="/prophets" className="hover:text-primary transition-colors">
              {locale === "ar" ? "الأنبياء" : locale === "he" ? "נביאים" : "Prophets"}
            </Link>
            <Link to="/learn/journeys" className="hover:text-primary transition-colors">
              {locale === "ar" ? "الرحلات" : locale === "he" ? "מסלולים" : "Journeys"}
            </Link>
            <Link to="/research" className="hover:text-primary transition-colors">
              {locale === "ar" ? "جلسات AI" : locale === "he" ? "שיחות AI" : "AI Sessions"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
