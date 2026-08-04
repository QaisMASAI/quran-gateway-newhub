import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { ChevronLeft, Loader2, BookOpen, Quote, ScrollText, Compass } from "lucide-react";
import { getEntityBySlug, getEntityVerses, getRelatedEntities, pickLocale, type EntityKind } from "@/lib/knowledge";
import { getInterconnectedKnowledge } from "@/lib/knowledge-engine";
import { UnifiedKnowledgePanel } from "@/components/discovery/UnifiedKnowledgePanel";
import { EntityCard } from "@/components/discovery/EntityCard";
import { PassageCard } from "@/components/discovery/PassageCard";
import { TopicHadithSection } from "@/components/hadith/TopicHadithSection";
import { PageKnowledgeHub } from "@/components/knowledge/PageKnowledgeHub";
import {
  getAsbabForVerse,
  getTafsirForVerse,
  sourceName,
  type AsbabRow,
  type TafsirPassageRow,
} from "@/lib/tafsir-content";
import { fetchAsbabFromApi, fetchTafsirFromApi } from "@/lib/tafsir-api.functions";
import i18n, { normalizeLocale, type Locale } from "@/lib/i18n";
import { useMemo } from "react";
import { localeTextDir, readingFontClass, tafsirFontClass, uiFontClass } from "@/lib/locale-ui";
import type { ReactNode } from "react";

const VALID: EntityKind[] = [
  "topic",
  "prophet",
  "story",
  "event",
  "place",
  "nation",
  "concept",
  "theme",
  "scholar",
  "companion",
  "narrator",
  "book",
  "dua",
  "mosque",
];

export const Route = createFileRoute("/learn/$kind/$slug")({
  loader: async ({ params }) => {
    if (!VALID.includes(params.kind as EntityKind)) throw notFound();
    const entity = await getEntityBySlug(params.slug);
    if (!entity) throw notFound();
    return { entity };
  },
  head: ({ params, loaderData }) => {
    const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
    const kind = params.kind as EntityKind;
    const kindMap: Record<Locale, Record<EntityKind, string>> = {
      he: {
        topic: "נושא",
        prophet: "נביא",
        story: "סיפור",
        event: "אירוע",
        place: "מקום",
        nation: "עם",
        concept: "מושג",
        theme: "תמה",
        scholar: "חוקר/אימאם",
        companion: "סחאבי",
        narrator: "מספר החדית'",
        book: "ספר מוסמך",
        dua: "תפילה/דועאא",
        mosque: "מסגד קדוש",
      },
      ar: {
        topic: "موضوع",
        prophet: "نبي",
        story: "قصة",
        event: "حدث",
        place: "مكان",
        nation: "أمة",
        concept: "مفهوم",
        theme: "محور",
        scholar: "عالم ومفسر",
        companion: "صحابي جليل",
        narrator: "راوي الحديث",
        book: "مصنف ومؤلف",
        dua: "دعاء ومناجاة",
        mosque: "مسجد وجامع",
      },
      en: {
        topic: "Topic",
        prophet: "Prophet",
        story: "Story",
        event: "Event",
        place: "Place",
        nation: "Nation",
        concept: "Concept",
        theme: "Theme",
        scholar: "Scholar",
        companion: "Companion",
        narrator: "Narrator",
        book: "Book",
        dua: "Du'a & Prayer",
        mosque: "Mosque",
      },
    };
    const kindLabel = (kindMap[locale] && kindMap[locale][kind]) || kind;

    const titleText = pickLocale(loaderData?.entity?.title_i18n, locale);
    const summaryText =
      pickLocale(loaderData?.entity?.summary_i18n, locale) || pickLocale(loaderData?.entity?.description_i18n, locale);
    const rawTitle = titleText
      ? `${titleText} | ${kindLabel} | Noor Quran & Hadith`
      : `Noor Quran & Hadith | ${kindLabel}`;
    const rawDescription =
      summaryText ||
      (locale === "ar"
        ? "اكتشاف قرآني موجّه مع آيات مرتبطة وتفسير وسياق نزول موثّق."
        : locale === "en"
          ? "Guided Quran discovery with connected verses, authentic tafsir, and asbab al-nuzul context."
          : "גילוי קוראני מודרך עם פסוקים קשורים, תפסיר מאומת וסיבות ירידה.");
    const title = rawTitle.length > 60 ? `${rawTitle.slice(0, 57)}…` : rawTitle;
    const description = rawDescription.length > 160 ? `${rawDescription.slice(0, 157)}…` : rawDescription;
    const url = `/learn/${params.kind}/${params.slug}`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
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
            headline: titleText || title,
            description,
            inLanguage: locale,
            url,
          }),
        },
      ],
    };
  },
  component: EntityPage,
});

function EntityPage() {
  const { kind, slug } = Route.useParams();
  const { entity: loaderEntity } = Route.useLoaderData();
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const uiClass = uiFontClass(locale);
  const readingClass = readingFontClass(locale);
  const tafsirClass = tafsirFontClass(locale);
  const textDir = localeTextDir(locale);
  const tafsirApiFn = useServerFn(fetchTafsirFromApi);
  const asbabApiFn = useServerFn(fetchAsbabFromApi);
  const interconnectedFn = useServerFn(getInterconnectedKnowledge);

  if (!VALID.includes(kind as EntityKind)) throw notFound();

  const entityQ = useQuery({
    queryKey: ["entity", slug],
    queryFn: () => getEntityBySlug(slug),
    initialData: loaderEntity,
    staleTime: 5 * 60_000,
  });
  const entity = entityQ.data;

  const interconnectedQ = useQuery({
    queryKey: ["interconnected-knowledge", kind, slug, locale],
    queryFn: () =>
      interconnectedFn({
        data: {
          kind: kind as
            | "surah"
            | "ayah"
            | "hadith"
            | "tafsir"
            | "prophet"
            | "topic"
            | "story"
            | "event"
            | "place"
            | "scholar"
            | "companion",
          id: slug,
          locale: locale === "ar" ? "ar" : locale === "en" ? "en" : "he",
        },
      }),
    enabled: !!entity,
    staleTime: 5 * 60_000,
  });

  const versesQ = useQuery({
    queryKey: ["entity-verses", entity?.id],
    queryFn: () => getEntityVerses(entity!.id),
    enabled: !!entity,
    staleTime: 5 * 60_000,
  });

  const relatedQ = useQuery({
    queryKey: ["entity-related", entity?.id],
    queryFn: () => getRelatedEntities(entity!.id),
    enabled: !!entity,
    staleTime: 5 * 60_000,
  });

  // Pull Tafsir for the first 3 linked verses to make the
  // "Authentic Tafsir" section meaningful even without explicit pinning.
  const anchorVerses = useMemo(() => (versesQ.data ?? []).slice(0, 3), [versesQ.data]);
  const tafsirQ = useQuery({
    queryKey: ["entity-tafsir", entity?.id, locale, anchorVerses.map((v) => `${v.surah}:${v.ayah_start}`).join(",")],
    queryFn: async () => {
      const out: TafsirPassageRow[] = [];
      for (const v of anchorVerses) {
        const rows = await tafsirApiFn({
          data: { surah: v.surah, ayah: v.ayah_start, lang: locale },
        });
        if ((rows ?? []).length > 0) {
          out.push(...rows);
          continue;
        }
        const dbRows = await getTafsirForVerse(v.surah, v.ayah_start, locale);
        out.push(...dbRows);
      }
      return out;
    },
    enabled: !!entity && anchorVerses.length > 0,
    staleTime: 5 * 60_000,
  });

  const asbabQ = useQuery({
    queryKey: ["entity-asbab", entity?.id, locale, anchorVerses.map((v) => `${v.surah}:${v.ayah_start}`).join(",")],
    queryFn: async () => {
      const out: AsbabRow[] = [];
      for (const v of anchorVerses) {
        const rows = await asbabApiFn({
          data: { surah: v.surah, ayah: v.ayah_start, lang: locale },
        });
        if ((rows ?? []).length > 0) {
          out.push(...rows);
          continue;
        }
        const dbRows = await getAsbabForVerse(v.surah, v.ayah_start, locale);
        out.push(...dbRows);
      }
      return out;
    },
    enabled: !!entity && anchorVerses.length > 0,
    staleTime: 5 * 60_000,
  });

  const kindLabel = (k: EntityKind) => t(`search.kind${k.charAt(0).toUpperCase()}${k.slice(1)}` as const);

  const isProphet = entity?.kind === "prophet";

  // Build TOC
  const sections = useMemo(() => {
    const list: Array<{ id: string; label: string; show: boolean }> = [
      { id: "overview", label: t("learn.toc.overview"), show: true },
      { id: "verses", label: t("learn.toc.verses"), show: (versesQ.data?.length ?? 0) > 0 },
      { id: "tafsir", label: t("learn.toc.tafsir"), show: true },
      { id: "asbab", label: t("learn.toc.asbab"), show: true },
      { id: "hadith", label: "Hadith", show: true },
      { id: "related", label: t("learn.toc.related"), show: (relatedQ.data?.length ?? 0) > 0 },
    ];
    return list.filter((s) => s.show);
  }, [t, versesQ.data, relatedQ.data]);

  return (
    <div className={`min-h-screen bg-background ${uiClass}`}>
      <Header />

      {entity && (
        <section
          className="relative overflow-hidden border-b border-border"
          style={{ background: "var(--gradient-hero)" }}
        >
          <span className="arabesque-corner" style={{ top: 0, right: 0 }} aria-hidden />
          <span className="arabesque-corner" style={{ bottom: 0, left: 0, transform: "rotate(180deg)" }} aria-hidden />
          <div className="relative z-10 mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
            <Link to="/learn" className="inline-flex items-center gap-1 text-xs text-white/70 hover:text-white">
              <ChevronLeft className="h-3 w-3 ltr:rotate-180" />
              {t("learn.backToDiscovery")}
            </Link>
            <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
              {kindLabel(entity.kind)}
            </div>
            <h1 className="mt-2 font-display text-4xl font-bold text-white sm:text-5xl">
              {pickLocale(entity.title_i18n, locale)}
            </h1>
            {pickLocale(entity.summary_i18n, locale) && (
              <p
                className={`mt-3 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg ${readingClass}`}
                dir={textDir}
              >
                {pickLocale(entity.summary_i18n, locale)}
              </p>
            )}
          </div>
        </section>
      )}

      <main id="main" className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-[220px_1fr]">
        {/* Sticky TOC (desktop) */}
        {entity && (
          <aside className="hidden md:block">
            <nav className="sticky top-24 space-y-1 text-sm" aria-label="On this page">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t("learn.toc.title")}
              </div>
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block rounded-md px-2 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {s.label}
                </a>
              ))}
            </nav>
          </aside>
        )}

        <div className="min-w-0 space-y-12">
          {entityQ.isLoading && (
            <p className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
            </p>
          )}

          {!entityQ.isLoading && !entity && (
            <p className="rounded-lg border border-border bg-secondary/40 p-6 text-sm text-muted-foreground">
              {t("learn.notFound")}
            </p>
          )}

          {entity && (
            <>
              {/* Interconnected Knowledge Engine Panel */}
              {interconnectedQ.data && (
                <UnifiedKnowledgePanel
                  bundle={interconnectedQ.data}
                  locale={locale === "ar" ? "ar" : locale === "en" ? "en" : "he"}
                />
              )}

              {/* Overview */}
              <Section id="overview" icon={<BookOpen className="h-4 w-4" />} title={t("learn.overview")}>
                {pickLocale(entity.description_i18n, locale) ? (
                  <p
                    className={`whitespace-pre-line text-base leading-relaxed text-foreground/90 ${tafsirClass}`}
                    dir={textDir}
                  >
                    {pickLocale(entity.description_i18n, locale)}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">{pickLocale(entity.summary_i18n, locale)}</p>
                )}
              </Section>

              {/* Quranic Perspective + Verses */}
              {versesQ.data && versesQ.data.length > 0 && (
                <Section id="verses" icon={<Quote className="h-4 w-4" />} title={t("learn.relatedVerses")}>
                  <div className="space-y-3">
                    {versesQ.data.map((v) => (
                      <PassageCard
                        key={v.id}
                        surah={v.surah}
                        ayahStart={v.ayah_start}
                        ayahEnd={v.ayah_end}
                        locale={locale}
                      />
                    ))}
                  </div>
                </Section>
              )}

              {/* Authentic Tafsir */}
              <Section
                id="tafsir"
                icon={<ScrollText className="h-4 w-4" />}
                title={t("learn.tafsirTitle")}
                subtitle={t("learn.tafsirSubtitle")}
              >
                {tafsirQ.isLoading ? (
                  <Loader />
                ) : tafsirQ.data && tafsirQ.data.length > 0 ? (
                  <div className="space-y-4">
                    {tafsirQ.data.map((p) => (
                      <PassageBlock
                        key={p.id}
                        body={p.body}
                        sourceLabel={sourceName(p.source, locale)}
                        citation={p.citation}
                        locale={locale}
                      />
                    ))}
                  </div>
                ) : (
                  <NoAuthSource t={t} />
                )}
              </Section>

              <Section
                id="asbab"
                icon={<BookOpen className="h-4 w-4" />}
                title={t("learn.asbabTitle")}
                subtitle={t("learn.asbabSubtitle")}
              >
                {asbabQ.isLoading ? (
                  <Loader />
                ) : asbabQ.data && asbabQ.data.length > 0 ? (
                  <div className="space-y-4">
                    {asbabQ.data.map((p) => (
                      <PassageBlock
                        key={p.id}
                        body={p.body}
                        sourceLabel={sourceName(p.source, locale)}
                        citation={p.citation}
                        locale={locale}
                      />
                    ))}
                  </div>
                ) : (
                  <NoAuthSource t={t} />
                )}
              </Section>

              {/* Prophet timeline placeholder section */}
              <Section
                id="hadith"
                icon={<ScrollText className="h-4 w-4" />}
                title={locale === "he" ? "חדית' קשורים" : locale === "ar" ? "أحاديث ذات صلة" : "Related Hadith"}
              >
                <TopicHadithSection slug={slug} locale={locale} />
              </Section>

              {isProphet && (
                <Section id="prophet-extras" icon={<Compass className="h-4 w-4" />} title={t("learn.prophetExtras")}>
                  <p className="text-sm text-muted-foreground">{t("learn.prophetExtrasBody")}</p>
                </Section>
              )}

              {/* Dynamic 10D Knowledge Hub */}
              <PageKnowledgeHub slug={slug} locale={locale} />

              {/* Related */}
              {relatedQ.data && relatedQ.data.length > 0 && (
                <Section id="related" icon={<Compass className="h-4 w-4" />} title={t("learn.continueExploring")}>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {relatedQ.data.map((e) => (
                      <EntityCard key={e.id} entity={e} locale={locale} kindLabel={kindLabel(e.kind)} />
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function Section({
  id,
  icon,
  title,
  subtitle,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24">
      <header className="mb-4 flex items-start gap-3">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold">
          {icon}
        </span>
        <div>
          <h2 className="font-display text-2xl font-bold text-primary">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

function PassageBlock({
  body,
  sourceLabel,
  citation,
  locale,
}: {
  body: string;
  sourceLabel: string;
  citation?: string | null;
  locale: Locale;
}) {
  const textDir = localeTextDir(locale);
  const tafsirClass = tafsirFontClass(locale);
  return (
    <article className="rounded-2xl border border-primary/10 bg-card p-5 shadow-sm">
      <p
        className={`ai-explanation-block whitespace-pre-line text-base leading-relaxed text-foreground/90 ${tafsirClass}`}
        dir={textDir}
      >
        {body}
      </p>
      <footer className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2 py-0.5 font-medium text-gold">
          <ScrollText className="h-3 w-3" /> {sourceLabel}
        </span>
        {citation && <span className="opacity-70">· {citation}</span>}
      </footer>
    </article>
  );
}

function NoAuthSource({ t }: { t: (k: string) => string }) {
  return (
    <p className="rounded-2xl border border-dashed border-border bg-secondary/30 p-5 text-sm text-muted-foreground">
      {t("learn.noAuthSource")}
    </p>
  );
}

function Loader() {
  return (
    <div className="flex items-center justify-center py-6 text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
    </div>
  );
}
