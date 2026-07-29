import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  Compass,
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

function Home() {
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
        setRecentPrompts(parsed.filter((item): item is string => typeof item === "string").slice(0, 6));
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
        Object.entries(parsed).find(([, days]) => Array.isArray(days) && days.length > 0)?.[0] ?? null;
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
        ? ["ما هي رحمة الله في القرآن؟", "آيات عن الصبر وقت الابتلاء", "ما معنى التوكل؟", "قصص موسى في القرآن"]
        : locale === "he"
          ? ["מה הקוראן אומר על רחמים?", "פסוקים על סבלנות בזמן קושי", "מה משמעות התווכל?", "סיפורי משה בקוראן"]
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
    ],
    [locale],
  );

  const discoverCards = useMemo(
    () => [
      {
        label: locale === "ar" ? "المحادثات الأخيرة" : locale === "he" ? "שיחות אחרונות" : "Recent AI Conversations",
        description:
          locale === "ar"
            ? "ارجع إلى آخر الأسئلة التي طرحتها"
            : locale === "he"
              ? "חזרו לשאלות האחרונות שלכם"
              : "Return to your most recent prompts",
        to: "/recent-ai" as const,
        icon: MessageCircle,
      },
      {
        label: locale === "ar" ? "التأمل اليومي" : locale === "he" ? "השראה יומית" : "Daily Reflections",
        description:
          locale === "ar"
            ? "آية اليوم مع انتقال مباشر للقراءة"
            : locale === "he"
              ? "פסוק היום עם מעבר מהיר לקריאה"
              : "Verse of the day with a fast path to reading",
        to: "/daily-reflections" as const,
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
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />

      <main id="main" className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card to-background px-5 py-10 sm:px-8 sm:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto inline-flex items-center justify-center rounded-2xl border border-border bg-background p-3 shadow-sm">
              <Logo className="h-10 w-10 text-primary" />
            </div>

            <span className="mt-5 inline-block rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
              {t("home.badge")}
            </span>

            <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl">
              {t("home.h1")}
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("home.subtitle")}
            </p>

            <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-border bg-card p-4 shadow-sm">
              <form onSubmit={submitAssistantSearch} className="space-y-3">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl border border-input bg-background px-3 py-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <SearchIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <input
                      ref={inputRef}
                      value={assistantPrompt}
                      onChange={(e) => setAssistantPrompt(e.target.value)}
                      placeholder={suggestedQuestions[0]}
                      className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                      aria-label="AI search"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={locale === "ar" ? "بحث صوتي" : locale === "he" ? "חיפוש קולי" : "Voice search"}
                    className="h-9 w-9 rounded-lg"
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
                      const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
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
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                  <div className="flex min-w-0 flex-wrap gap-1.5">
                    {suggestedQuestions.map((example) => (
                      <Button
                        key={example}
                        type="button"
                        onClick={() => setAssistantPrompt(example)}
                        variant="outline"
                        className="h-8 rounded-full px-3 text-xs"
                      >
                        {example}
                      </Button>
                    ))}
                  </div>
                  <Button type="submit" className="min-h-11 rounded-xl px-5">
                    <SearchIcon className="h-4 w-4" />
                    {locale === "ar" ? "ابدأ البحث" : locale === "he" ? "התחל לחפש" : "Start searching"}
                  </Button>
                </div>
              </form>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>{locale === "ar" ? "اضغط / للتركيز" : locale === "he" ? "לחצו / למיקוד" : "Press / to focus"}</span>
                <TrustBadge size="sm" className="border-border bg-background" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/search" search={{ q: "", qState: "missing", src: "unknown" }}>
                  {locale === "ar" ? "بحث" : locale === "he" ? "חיפוש" : "Search"}
                </Link>
              </Button>
              <Button asChild className="rounded-full">
                <Link to="/ask" search={{ q: "", qState: "missing", src: "unknown" }}>
                  <Sparkles className="h-4 w-4" />
                  {locale === "ar" ? "اسأل" : locale === "he" ? "שאלו" : "Ask"}
                </Link>
              </Button>
              <Button asChild variant="ghost" className="rounded-full">
                <Link to="/learn">
                  <Compass className="h-4 w-4" />
                  {locale === "ar" ? "اكتشف" : locale === "he" ? "גלו" : "Discover"}
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {hasContinue && (
          <section className="mt-10 space-y-4">
            <h2 className="text-2xl font-semibold text-foreground">
              {locale === "ar" ? "تابع" : locale === "he" ? "המשך" : "Continue"}
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {progress && (
                <Link
                  to="/surah/$id"
                  params={{ id: String(progress.surah) }}
                  search={{ q: undefined }}
                  hash={progress.ayah ? `v-${progress.ayah}` : undefined}
                  className="surface-card flex items-center justify-between p-4 hover:border-primary/40"
                >
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {locale === "ar" ? "متابعة القراءة" : locale === "he" ? "המשך קריאה" : "Continue reading"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {locale === "ar"
                        ? `سورة ${progress.surah} • آية ${progress.ayah}`
                        : locale === "he"
                          ? `סורה ${progress.surah} • פסוק ${progress.ayah}`
                          : `Surah ${progress.surah} • Ayah ${progress.ayah}`}
                    </p>
                  </div>
                  {isRtl ? <ArrowLeft className="h-4 w-4 text-muted-foreground" /> : <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </Link>
              )}

              {recentPlanSlug && (
                <Link
                  to="/plans/$slug"
                  params={{ slug: recentPlanSlug }}
                  className="surface-card flex items-center justify-between p-4 hover:border-primary/40"
                >
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {locale === "ar" ? "متابعة الرحلة" : locale === "he" ? "המשך מסלול" : "Continue journey"}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{recentPlanSlug.replace(/-/g, " ")}</p>
                  </div>
                  {isRtl ? <ArrowLeft className="h-4 w-4 text-muted-foreground" /> : <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </Link>
              )}

              {recentPrompts[0] && (
                <Link
                  to="/ask"
                  search={{ q: recentPrompts[0], qState: "ok", src: "home_continue_ai" }}
                  className="surface-card flex items-center justify-between p-4 hover:border-primary/40"
                >
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {locale === "ar" ? "متابعة محادثة AI" : locale === "he" ? "המשך שיחת AI" : "Continue AI conversation"}
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">{recentPrompts[0]}</p>
                  </div>
                  {isRtl ? <ArrowLeft className="h-4 w-4 text-muted-foreground" /> : <ArrowRight className="h-4 w-4 text-muted-foreground" />}
                </Link>
              )}
            </div>
          </section>
        )}
        {recentViews.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 text-2xl font-semibold text-foreground">
              {locale === "ar" ? "شوهدت مؤخراً" : locale === "he" ? "נצפו לאחרונה" : "Recently Viewed"}
            </h2>
            <div className="flex flex-wrap gap-2">
              {recentViews.slice(0, 8).map((view, idx) => (
                <Link
                  key={`home-recent-${idx}`}
                  to={view.kind === "surah" ? "/surah/$id" : view.kind === "entity" ? "/learn/$kind/$slug" : "/hadith/$collection/entry/$num"}
                  params={view.kind === "surah" ? { id: String(view.surah) } : view.kind === "entity" ? { kind: view.entityKind, slug: view.slug } : { collection: view.collection, num: String(view.num) }}
                  className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium hover:border-primary/40"
                >
                  {view.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            {locale === "ar" ? "إلهام اليوم" : locale === "he" ? "השראה יומית" : "Daily Inspiration"}
          </h2>
          <DailyVerse />
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            {locale === "ar" ? "استكشف" : locale === "he" ? "גלו" : "Explore"}
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {exploreCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  to={card.to}
                  className="surface-card flex min-h-28 flex-col items-start justify-between p-4 transition hover:border-primary/40"
                >
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{card.label}</span>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            {locale === "ar" ? "اكتشف" : locale === "he" ? "גלו עוד" : "Discover"}
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {discoverCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.label}
                  to={card.to}
                  className="surface-card flex items-start gap-3 p-4 transition hover:border-primary/40"
                >
                  <div className="rounded-lg bg-primary-soft p-2 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{card.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/40 py-8 text-xs text-muted-foreground">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
          <p>{t("home.footerTagline")}</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/topics" className="hover:text-primary">
              {locale === "ar" ? "المواضيع" : locale === "he" ? "נושאים" : "Topics"}
            </Link>
            <Link to="/prophets" className="hover:text-primary">
              {locale === "ar" ? "الأنبياء" : locale === "he" ? "נביאים" : "Prophets"}
            </Link>
            <Link to="/learn/journeys" className="hover:text-primary">
              {locale === "ar" ? "الرحلات" : locale === "he" ? "מסלולים" : "Journeys"}
            </Link>
            <Link to="/recent-ai" className="hover:text-primary">
              {locale === "ar" ? "جلسات AI" : locale === "he" ? "שיחות AI" : "AI Sessions"}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}