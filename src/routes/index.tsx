import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { fetchChapters, type ApiLang } from "@/lib/quran-api";
import {
  surahDisplayName,
  SURAH_NAMES_HE,
  SURAH_NAMES_EN,
  SURAH_NAMES_AR,
} from "@/lib/surah-names-he";
import { Header } from "@/components/Header";
import { Logo } from "@/components/Logo";
import { DailyVerse } from "@/components/DailyVerse";
import { ContinueReading } from "@/components/ContinueReading";
import { TrustBadge } from "@/components/TrustBadge";
import { useServerFn } from "@tanstack/react-start";
import { searchHadith } from "@/lib/hadith.functions";
import { trackHomePromptEvent } from "@/lib/home-prompts.functions";
import { ALL_TOPICS } from "@/lib/topics";
import { listAllEntities, listJourneys, pickLocale } from "@/lib/knowledge";
import {
  BookOpen,
  Sparkles,
  Search as SearchIcon,
  ChevronRight,
  ChevronLeft,
  Loader2,
  MapPin,
  Compass,
  MessageCircle,
  BookMarked,
  Network,
  GraduationCap,
  Clock,
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
  const locale = (normalizeLocale(i18n.language) ?? "he") as "he" | "ar" | "en";
  const isRtl = i18n.dir() === "rtl";
  const navigate = useNavigate();
  const runHadithSearch = useServerFn(searchHadith);
  const trackPrompt = useServerFn(trackHomePromptEvent);
  const { data, isLoading, error } = useQuery({
    queryKey: ["chapters", lang],
    queryFn: () => fetchChapters(lang),
    staleTime: 60 * 60 * 1000,
  });
  const entitiesQ = useQuery({
    queryKey: ["home-entities"],
    queryFn: listAllEntities,
    staleTime: 5 * 60 * 1000,
  });
  const journeysQ = useQuery({
    queryKey: ["home-journeys"],
    queryFn: listJourneys,
    staleTime: 5 * 60 * 1000,
  });
  const todayHadithQ = useQuery({
    queryKey: ["home-today-hadith", locale],
    queryFn: () =>
      runHadithSearch({
        data: {
          q: locale === "ar" ? "رحمة" : locale === "he" ? "רחמים" : "mercy",
          page: 0,
          pageSize: 1,
        },
      }),
    staleTime: 10 * 60 * 1000,
  });

  const [filter, setFilter] = useState("");
  const [assistantPrompt, setAssistantPrompt] = useState("");

  const popularPrompts = useMemo(
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

  const popularQuestions = useMemo(
    () =>
      locale === "ar"
        ? [
            "ما الذي يقوله القرآن عن القلق؟",
            "كيف يفهم القرآن التوبة؟",
            "ما هي آيات العدل؟",
            "كيف يربّي القرآن على الأمل؟",
          ]
        : locale === "he"
          ? [
              "מה הקוראן אומר על חרדה?",
              "איך הקוראן מסביר תשובה?",
              "מהם פסוקי הצדק?",
              "איך הקוראן מחנך לתקווה?",
            ]
          : [
              "What does the Quran say about anxiety?",
              "How does the Quran frame repentance?",
              "Which verses focus on justice?",
              "How does the Quran teach hope?",
            ],
    [locale],
  );

  const featuredProphets = useMemo(
    () =>
      (entitiesQ.data ?? [])
        .filter((entity) => entity.kind === "prophet")
        .slice(0, 6),
    [entitiesQ.data],
  );

  const recentlyAdded = useMemo(
    () => (entitiesQ.data ?? []).slice(-6).reverse(),
    [entitiesQ.data],
  );

  const totalEntities = entitiesQ.data?.length ?? 0;
  const totalTopics = ALL_TOPICS.length;
  const totalJourneys = journeysQ.data?.length ?? 0;
  const todayHadith = todayHadithQ.data?.items?.[0] ?? null;

  function submitAssistantSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = assistantPrompt.trim();
    if (!q) return;
    void trackPrompt({
      data: {
        event: "home_prompt_navigate",
        destination: "/search",
        source: "hero_input",
        q,
      },
    });
    navigate({ to: "/search", search: { q, src: "hero_input" } });
  }
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

      <section className="relative overflow-hidden">
        <div
          className="arabesque-bg relative px-6 pt-16 pb-20 text-center text-primary-foreground shadow-2xl"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div
            className={`pointer-events-none absolute -top-24 ${isRtl ? "-left-16" : "-right-16"} h-72 w-72 rounded-full bg-gold/20 blur-3xl`}
          />
          <div
            className={`pointer-events-none absolute -bottom-24 ${isRtl ? "-right-10" : "-left-10"} h-72 w-72 rounded-full bg-primary-foreground/10 blur-3xl`}
          />
          <span
            className="arabesque-corner"
            style={{ top: 0, [isRtl ? "left" : "right"]: 0 }}
            aria-hidden
          />
          <span
            className="arabesque-corner"
            style={{ bottom: 0, [isRtl ? "right" : "left"]: 0, transform: "rotate(180deg)" }}
            aria-hidden
          />

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

            <h1 className="font-display text-4xl font-bold leading-tight text-primary-foreground sm:text-4xl md:text-7xl">
              {t("home.h1")}
              <span className="mt-3 block font-arabic text-3xl text-gold sm:text-4xl" dir="rtl">
                القُرْآنُ الكَرِيمُ
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
              {t("home.subtitle")}
            </p>

            <div className="mx-auto mt-4 max-w-3xl rounded-2xl border border-white/20 bg-black/20 p-3 backdrop-blur-sm">
              <form onSubmit={submitAssistantSearch} className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
                  <SearchIcon className="h-4 w-4 text-white/80" />
                  <input
                    value={assistantPrompt}
                    onChange={(e) => setAssistantPrompt(e.target.value)}
                    placeholder={
                      locale === "ar"
                        ? "اسأل سؤالك القرآني..."
                        : locale === "he"
                          ? "שאל שאלה קוראנית..."
                          : "Ask a Quran knowledge question..."
                    }
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/60"
                    aria-label="AI search"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-4 py-2 text-sm font-semibold text-primary transition hover:bg-gold/90"
                >
                  <Sparkles className="h-4 w-4" />
                  {locale === "ar" ? "ابحث بذكاء" : locale === "he" ? "חיפוש חכם" : "Intelligent Search"}
                </button>
              </form>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {popularPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => setAssistantPrompt(prompt)}
                    className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] text-white/90 hover:bg-white/20"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

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

      <section className="mx-auto -mt-8 grid max-w-6xl grid-cols-2 gap-3 px-4 sm:grid-cols-4 sm:px-6">
        <StatCard icon={<BookOpen className="h-4 w-4" />} label={t("home.stat1Label")} value="114" />
        <StatCard
          icon={<Network className="h-4 w-4" />}
          label={locale === "ar" ? "عُقد المعرفة" : locale === "he" ? "צמתי ידע" : "Knowledge nodes"}
          value={String(totalEntities)}
        />
        <StatCard
          icon={<Compass className="h-4 w-4" />}
          label={locale === "ar" ? "المحاور" : locale === "he" ? "תמות" : "Themes"}
          value={String(totalTopics)}
        />
        <StatCard
          icon={<GraduationCap className="h-4 w-4" />}
          label={locale === "ar" ? "المسارات" : locale === "he" ? "מסלולים" : "Journeys"}
          value={String(totalJourneys)}
        />
      </section>

      <div className="mt-10">
        <ContinueReading />
      </div>

      <div className="mt-16">
        <DailyVerse />
      </div>

      <main id="main" className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <section className="mb-10">
          <SectionHeader
            title={locale === "ar" ? "أسئلة رائجة" : locale === "he" ? "שאלות פופולריות" : "Popular Questions"}
            subtitle={
              locale === "ar"
                ? "ابدأ مباشرة بسؤال موثّق بالمراجع"
                : locale === "he"
                  ? "התחל עם שאלות שמובילות לתשובות עם מקורות"
                  : "Jump into citation-grounded answers instantly"
            }
            icon={<MessageCircle className="h-4 w-4" />}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {popularQuestions.map((question) => (
              <Link
                key={question}
                to="/ask"
                search={{ q: question, src: "popular_questions" }}
                onClick={() => {
                  void trackPrompt({
                    data: {
                      event: "home_prompt_navigate",
                      destination: "/ask",
                      source: "popular_questions",
                      q: question,
                    },
                  });
                }}
                className="surface-card flex items-start gap-3 p-4 transition hover:border-primary/40"
              >
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{question}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <SectionHeader
            title={locale === "ar" ? "مواضيع مميّزة" : locale === "he" ? "נושאים מובילים" : "Featured Topics"}
            subtitle={
              locale === "ar"
                ? "شبكة موضوعية حيّة تربط الآيات والسياق"
                : locale === "he"
                  ? "רשת נושאית חיה המקשרת פסוקים והקשר"
                  : "Living thematic hubs that connect verses and context"
            }
            icon={<Compass className="h-4 w-4" />}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ALL_TOPICS.slice(0, 8).map((topic) => (
              <Link
                key={topic.slug}
                to="/learn/$kind/$slug"
                params={{ kind: "topic", slug: topic.slug }}
                className="surface-card p-4 transition hover:border-primary/40"
              >
                <h3 className="line-clamp-1 text-sm font-semibold text-foreground" dir="auto">
                  {topic.title}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground" dir="auto">
                  {topic.description}
                </p>
                <div className="mt-2 text-[11px] font-medium text-primary">
                  {topic.refs.length} {locale === "ar" ? "إحالات" : locale === "he" ? "הפניות" : "references"}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <SectionHeader
            title={
              locale === "ar"
                ? "أنبياء مختارون"
                : locale === "he"
                  ? "נביאים נבחרים"
                  : "Featured Prophets"
            }
            subtitle={
              locale === "ar"
                ? "تعلّم عبر القصص والآيات المرتبطة"
                : locale === "he"
                  ? "למידה דרך סיפורים ופסוקים מקושרים"
                  : "Study through connected narratives and verses"
            }
            icon={<BookMarked className="h-4 w-4" />}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProphets.map((entity) => (
              <Link
                key={entity.id}
                to="/learn/$kind/$slug"
                params={{ kind: "prophet", slug: entity.slug }}
                className="surface-card p-4 transition hover:border-primary/40"
              >
                <h3 className="text-base font-semibold text-foreground" dir="auto">
                  {pickLocale(entity.title_i18n, locale)}
                </h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground" dir="auto">
                  {pickLocale(entity.summary_i18n, locale)}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-10 grid gap-4 lg:grid-cols-2">
          <div className="surface-card p-5">
            <SectionHeader
              title={locale === "ar" ? "حديث اليوم" : locale === "he" ? "חדית' היום" : "Today's Hadith"}
              subtitle={
                locale === "ar"
                  ? "مقتطف يومي موثّق من الصحيحين"
                  : locale === "he"
                    ? "קטע יומי מאומת מן הסחיחיין"
                    : "Daily authenticated excerpt from Sahih collections"
              }
              icon={<Clock className="h-4 w-4" />}
            />
            {todayHadithQ.isLoading && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading hadith…
              </p>
            )}
            {todayHadith && (
              <Link
                to="/hadith/$collection/entry/$num"
                params={{ collection: todayHadith.collection_slug, num: String(todayHadith.global_id) }}
                className="block rounded-xl border border-border p-3 transition hover:border-primary/40"
              >
                <div className="text-xs font-semibold text-primary">
                  {todayHadith.collection_slug === "bukhari" ? "Sahih al-Bukhari" : "Sahih Muslim"} · #
                  {todayHadith.id_in_book}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-foreground/85">{todayHadith.english_text ?? ""}</p>
                <p className="mt-1 line-clamp-2 text-right text-sm text-muted-foreground" dir="rtl">
                  {todayHadith.arabic_text}
                </p>
              </Link>
            )}
          </div>

          <div className="surface-card p-5">
            <SectionHeader
              title={
                locale === "ar"
                  ? "أضيف حديثًا"
                  : locale === "he"
                    ? "תוכן שנוסף לאחרונה"
                    : "Recently Added Content"
              }
              subtitle={
                locale === "ar"
                  ? "آخر موضوعات المعرفة الجاهزة للاستكشاف"
                  : locale === "he"
                    ? "הערכים החדשים ביותר במאגר הידע"
                    : "Latest knowledge entries ready for discovery"
              }
              icon={<Sparkles className="h-4 w-4" />}
            />
            <div className="space-y-2">
              {recentlyAdded.map((entity) => (
                <Link
                  key={entity.id}
                  to="/learn/$kind/$slug"
                  params={{ kind: entity.kind, slug: entity.slug }}
                  className="block rounded-lg border border-border px-3 py-2 text-sm transition hover:border-primary/40"
                >
                  <div className="font-medium text-foreground" dir="auto">
                    {pickLocale(entity.title_i18n, locale)}
                  </div>
                  <div className="line-clamp-1 text-xs text-muted-foreground" dir="auto">
                    {pickLocale(entity.summary_i18n, locale)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-10">
          <SectionHeader
            title={locale === "ar" ? "رحلات التعلّم" : locale === "he" ? "מסלולי לימוד" : "Learning Journeys"}
            subtitle={
              locale === "ar"
                ? "ابدأ مسارًا منظّمًا وتتبّع تقدّمك"
                : locale === "he"
                  ? "התחל מסלול מובנה ועקוב אחרי ההתקדמות"
                  : "Start a structured path and track your progress"
            }
            icon={<GraduationCap className="h-4 w-4" />}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(journeysQ.data ?? []).slice(0, 3).map((journey) => (
              <Link
                key={journey.id}
                to="/learn/journeys/$slug"
                params={{ slug: journey.slug }}
                className="surface-card p-4 transition hover:border-primary/40"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                  {locale === "ar" ? "المستوى" : locale === "he" ? "רמה" : "Level"} {journey.level}
                </div>
                <h3 className="mt-1 text-sm font-semibold text-foreground" dir="auto">
                  {pickLocale(journey.title_i18n, locale)}
                </h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground" dir="auto">
                  {pickLocale(journey.summary_i18n, locale)}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-10">
          <SectionHeader
            title={locale === "ar" ? "استكشف حسب الموضوع" : locale === "he" ? "גלו לפי תמה" : "Explore by Theme"}
            subtitle={
              locale === "ar"
                ? "انتقل بسرعة إلى محاورك المعرفية"
                : locale === "he"
                  ? "נווט במהירות לפי תחומי העניין שלך"
                  : "Jump quickly into your knowledge interests"
            }
            icon={<Network className="h-4 w-4" />}
          />
          <div className="flex flex-wrap gap-2">
            {ALL_TOPICS.slice(0, 14).map((topic) => (
              <Link
                key={topic.slug}
                to="/learn/$kind/$slug"
                params={{ kind: "topic", slug: topic.slug }}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                {topic.title}
              </Link>
            ))}
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-border bg-card p-5">
          <SectionHeader
            title={locale === "ar" ? "إحصائيات المنصة" : locale === "he" ? "נתוני הפלטפורמה" : "Platform Statistics"}
            subtitle={
              locale === "ar"
                ? "صورة حيّة لمحتوى المعرفة"
                : locale === "he"
                  ? "תמונת מצב חיה של תוכן הידע"
                  : "A live snapshot of the knowledge platform"
            }
            icon={<BookOpen className="h-4 w-4" />}
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatInline
              label={locale === "ar" ? "السور" : locale === "he" ? "סורות" : "Surahs"}
              value={String(data?.length ?? 114)}
            />
            <StatInline
              label={locale === "ar" ? "كيانات المعرفة" : locale === "he" ? "יישויות ידע" : "Knowledge entities"}
              value={String(totalEntities)}
            />
            <StatInline
              label={locale === "ar" ? "المحاور" : locale === "he" ? "תמות" : "Themes"}
              value={String(totalTopics)}
            />
            <StatInline
              label={locale === "ar" ? "المسارات" : locale === "he" ? "מסלולים" : "Journeys"}
              value={String(totalJourneys)}
            />
          </div>
        </section>

        <section className="scroll-mt-20">
        <div
          className={`mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between ${isRtl ? "md:flex-row-reverse" : ""}`}
        >
          <div className="space-y-1.5">
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">
              {t("home.chaptersTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">{t("home.chaptersSubtitle")}</p>
          </div>
          <div className="relative w-full md:w-96">
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={t("home.filterPlaceholder")}
              className={`w-full rounded-2xl border border-primary/10 bg-card py-3.5 ${isRtl ? "ps-12 pe-4" : "pe-12 ps-4"} text-sm shadow-sm outline-none transition-all focus:ring-2 focus:ring-gold/50 placeholder:text-muted-foreground`}
            />
            <SearchIcon
              className={`absolute top-1/2 ${isRtl ? "start-4" : "end-4"} h-5 w-5 -translate-y-1/2 text-muted-foreground`}
            />
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
                className={`group flex items-center gap-5 rounded-2xl border border-primary/5 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-xl ${isRtl ? "flex-row-reverse" : ""}`}
              >
                <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
                  <div className="absolute inset-0 rotate-45 rounded-lg bg-primary/5 transition-colors group-hover:bg-gold/20" />
                  <span className="relative text-sm font-bold text-primary transition-colors group-hover:text-gold">
                    {c.id}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-base font-bold text-primary">
                    {surahDisplayName(c.id, lang)}
                  </h4>
                  <div
                    className={`mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground ${isRtl ? "flex-row-reverse" : ""}`}
                  >
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
        </section>
      </main>

      <div className="mosque-arch mt-12" aria-hidden />
      <footer className="relative border-t border-border bg-card/40 py-12 text-xs text-muted-foreground">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold text-foreground">Noor Quran & Hadith</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t("home.footerTagline")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {locale === "ar" ? "اكتشف" : locale === "he" ? "גלו" : "Discover"}
            </p>
            <div className="mt-2 space-y-1.5">
              <Link to="/search" className="block hover:text-primary">
                {locale === "ar" ? "بحث ذكي" : locale === "he" ? "חיפוש חכם" : "Intelligent search"}
              </Link>
              <Link to="/learn" className="block hover:text-primary">
                {locale === "ar" ? "مراكز معرفة" : locale === "he" ? "מרכזי ידע" : "Knowledge hubs"}
              </Link>
              <Link to="/learn/journeys" className="block hover:text-primary">
                {locale === "ar" ? "مسارات تعلم" : locale === "he" ? "מסלולי לימוד" : "Learning journeys"}
              </Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {locale === "ar" ? "المصادر" : locale === "he" ? "מקורות" : "Sources"}
            </p>
            <div className="mt-2 space-y-1.5">
              <Link to="/hadith" className="block hover:text-primary">
                {locale === "ar" ? "مكتبة الحديث" : locale === "he" ? "ספריית חדית׳" : "Hadith library"}
              </Link>
              <Link to="/research" className="block hover:text-primary">
                {locale === "ar" ? "بحث موثّق" : locale === "he" ? "מחקר מבוסס ציטוטים" : "Citation-first research"}
              </Link>
              <Link to="/ask" className="block hover:text-primary">
                {locale === "ar" ? "إجابات موثقة" : locale === "he" ? "תשובות מעוגנות" : "Grounded AI answers"}
              </Link>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              {locale === "ar" ? "الثقة" : locale === "he" ? "אמון" : "Trust"}
            </p>
            <p className="mt-2 leading-relaxed">
              {locale === "ar"
                ? "تُفصل الملخصات الذكية بوضوح عن نصوص القرآن والتفسير والحديث الأصلية مع الإحالات."
                : locale === "he"
                  ? "סיכומי AI מופרדים בבירור מטקסטי המקור של קוראן, תפסיר וחדית׳ עם הפניות."
                  : "AI summaries are clearly separated from Quran, Tafsir, and Hadith source text with citations."}
            </p>
          </div>
        </div>
        <p className="mx-auto mt-8 max-w-6xl px-4 text-[11px] opacity-70 sm:px-6">{t("home.footerReciter")}</p>
      </footer>
    </div>
  );
}

function SectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
}) {
  return (
    <div className="mb-4">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
        <span className="text-primary">{icon}</span>
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3 shadow-sm">
      <div className="mb-1 text-primary">{icon}</div>
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}

function StatInline({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2.5">
      <div className="text-lg font-semibold text-foreground">{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
