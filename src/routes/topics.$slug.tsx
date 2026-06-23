import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { Header } from "@/components/Header";
import { getTopic, type AyahRef } from "@/lib/topics";
import { useTopicT } from "@/lib/content-i18n";
import { surahDisplayName } from "@/lib/surah-names-he";
import { ArrowRight, ChevronLeft, BookOpen, Sparkles, Loader2, ScrollText, Network, Milestone } from "lucide-react";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { useServerFn } from "@tanstack/react-start";
import { getKnowledgeHub } from "@/lib/knowledge-hub.functions";

export const Route = createFileRoute("/topics/$slug")({
  loader: ({ params }) => {
    const topic = getTopic(params.slug);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ params, loaderData }) => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    const topic = loaderData?.topic;
    const localizedTitle = topic ? i18n.t(`content:topics.${topic.slug}.title`, { lng: locale, defaultValue: topic.title }) : "";
    const localizedDescription = topic ? i18n.t(`content:topics.${topic.slug}.description`, { lng: locale, defaultValue: topic.description ?? "" }) : "";
    const title = topic ? `${localizedTitle} — ${i18n.t("pages:topics.title", { lng: locale })}` : i18n.t("pages:topics.title", { lng: locale });
    const description = localizedDescription || i18n.t("pages:topics.intro", { lng: locale });
    const url = `/topics/${params.slug}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: NotFound,
  errorComponent: ErrorView,
  component: TopicPage,
});


function NotFound() {
  const { t } = useTranslation("pages");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="mb-2 font-display text-2xl font-bold text-primary">{t("detail.notFoundTopic")}</h1>
        <Link to="/topics" className="text-sm text-gold underline">{t("detail.backToTopics")}</Link>
      </div>
    </div>
  );
}
function ErrorView({ reset }: { reset: () => void }) {
  const { t } = useTranslation("pages");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="mb-4 text-sm text-destructive">{t("detail.errorGeneric")}</p>
        <button onClick={() => reset()} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">{t("detail.retry")}</button>
      </div>
    </div>
  );
}

function TopicPage() {
  const { topic } = Route.useLoaderData();
  const { t, i18n } = useTranslation("pages");
  const tp = useTopicT(topic.slug);
  const locale = normalizeLocale(i18n.language) ?? "he";
  const isRtl = locale !== "en";
  const fetchHub = useServerFn(getKnowledgeHub);

  const hubQ = useQuery({
    queryKey: ["topic-hub", topic.slug, locale],
    queryFn: () => fetchHub({ data: { slug: topic.slug, kind: "topic", language: locale as Locale } }),
    staleTime: 10 * 60_000,
  });

  const entity = hubQ.data?.entity;
  const verses = hubQ.data?.verses ?? [];
  const chronology = hubQ.data?.chronology ?? [];
  const lessons = hubQ.data?.lessons ?? [];
  const related = hubQ.data?.related ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 py-10 sm:px-6" dir={isRtl ? "rtl" : "ltr"}>
        <Link to="/topics" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowRight className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
          {t("detail.backToTopics")}
        </Link>

        <header className="mt-6 rounded-3xl border border-primary/10 bg-card p-8 text-center shadow-sm">
          <h1 className="font-display text-4xl font-bold text-primary">{entity?.titleHe || tp.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground" dir="ltr">{entity?.titleEn || topic.slug}</p>
          <p className="mt-1 font-arabic text-lg text-primary" dir="rtl">{entity?.titleAr || ""}</p>
          {tp.subtitle && <p className="mt-2 text-sm text-muted-foreground">{tp.subtitle}</p>}
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-foreground/80">{entity?.description || entity?.summary || tp.description}</p>
        </header>

        <nav className="sticky top-16 z-20 mt-6 rounded-2xl border border-border bg-background/90 p-2 backdrop-blur">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <a href="#overview" className="rounded-full border border-border px-3 py-1.5 hover:border-primary/40 hover:text-primary">{t("learn.toc.overview")}</a>
            <a href="#verses" className="rounded-full border border-border px-3 py-1.5 hover:border-primary/40 hover:text-primary">{t("learn.toc.verses")}</a>
            <a href="#tafsir" className="rounded-full border border-border px-3 py-1.5 hover:border-primary/40 hover:text-primary">{t("learn.toc.tafsir")}</a>
            <a href="#lessons" className="rounded-full border border-border px-3 py-1.5 hover:border-primary/40 hover:text-primary">{t("learn.toc.lessons")}</a>
            <a href="#related" className="rounded-full border border-border px-3 py-1.5 hover:border-primary/40 hover:text-primary">{t("learn.toc.related")}</a>
          </div>
        </nav>

        {hubQ.isLoading && (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        {hubQ.isError && (
          <p className="mt-8 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {t("detail.errorGeneric")}
          </p>
        )}

        <section id="overview" className="mt-10 space-y-4">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-primary">
            <Milestone className="h-5 w-5 text-gold" aria-hidden="true" />
            {t("learn.overview")}
          </h2>
          {chronology.length > 0 ? (
            <ol className="space-y-3">
              {chronology.slice(0, 8).map((step, idx) => (
                <li key={`${step.title}-${idx}`} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs font-semibold text-primary">{idx + 1}. {step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-foreground/90">{step.summary}</p>
                  {step.evidence && <p className="mt-2 text-xs text-muted-foreground">{step.evidence}</p>}
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-xl border border-primary/10 bg-card p-4 text-sm leading-relaxed text-muted-foreground">{t("learn.noAuthSource")}</p>
          )}
        </section>

        <section id="verses" className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-primary">
            <BookOpen className="h-5 w-5 text-gold" aria-hidden="true" />
            {t("detail.verseReferences")}
          </h2>

          <ul className="space-y-2">
            {((verses.length
              ? verses
              : topic.refs.map((ref: AyahRef) => ({
                surah: ref.surah,
                ayahStart: ref.ayah,
                ayahEnd: ref.to ?? ref.ayah,
                reference: `${ref.surah}:${ref.ayah}${ref.to ? `-${ref.to}` : ""}`,
                translation: "",
                tafsirPreview: "",
              }))) as Array<{ surah: number; ayahStart: number; ayahEnd: number; reference: string; translation?: string; tafsirPreview?: string }>).map((ref, i: number) => {
              const surahName = surahDisplayName(ref.surah, locale) ?? t("detail.surahFallback", { n: ref.surah });
              const label = ref.ayahEnd > ref.ayahStart
                ? t("detail.rangeVerses", { from: ref.ayahStart, to: ref.ayahEnd })
                : t("detail.singleVerse", { n: ref.ayahStart });
              return (
                <li key={i}>
                  <article className="rounded-xl border border-primary/5 bg-card p-4">
                    <Link
                      to="/surah/$id"
                      params={{ id: String(ref.surah) }}
                      hash={`v-${ref.ayahStart}`}
                      className="group flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-primary">{surahName}</div>
                        <div className="text-xs text-muted-foreground">{label}</div>
                      </div>
                      <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-gold ltr:rotate-180" aria-hidden="true" />
                    </Link>
                    {ref.translation && (
                      <p className="mt-3 text-sm leading-relaxed text-foreground/90" dir={locale === "en" ? "ltr" : "rtl"}>
                        {ref.translation}
                      </p>
                    )}
                    {ref.tafsirPreview && (
                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ref.tafsirPreview}</p>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        <section id="tafsir" className="mt-10 space-y-4">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-primary">
            <ScrollText className="h-5 w-5 text-gold" aria-hidden="true" />
            {t("learn.tafsirTitle")}
          </h2>
          {verses.some((v) => v.tafsirSources.length > 0) ? (
            <div className="space-y-3">
              {verses.filter((v) => v.tafsirSources.length > 0).slice(0, 6).map((v) => (
                <details key={v.reference} className="rounded-xl border border-border bg-card p-4">
                  <summary className="cursor-pointer text-sm font-semibold text-primary">{v.reference}</summary>
                  <div className="mt-2 space-y-2">
                    {v.tafsirSources.map((src) => (
                      <article key={src.id} className="rounded-lg border border-border/60 bg-background/60 p-3">
                        <p className="text-xs font-semibold text-primary">{src.source} <span dir="rtl" className="font-arabic">{src.sourceArabic}</span></p>
                        <p className="mt-1 text-sm leading-relaxed text-foreground/90">{src.text}</p>
                      </article>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-primary/10 bg-card p-4 text-sm leading-relaxed text-muted-foreground">{t("learn.noAuthSource")}</p>
          )}
        </section>

        <section id="lessons" className="mt-10 space-y-4">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-primary">
            <Sparkles className="h-5 w-5 text-gold" aria-hidden="true" />
            {t("learn.lessonsTitle")}
          </h2>
          {lessons.length > 0 ? (
            <div className="space-y-3">
              {lessons.map((lesson) => (
                <article key={lesson.id} className="rounded-xl border border-border bg-card p-4">
                  <p className="text-sm leading-relaxed text-foreground/90" dir={locale === "en" ? "ltr" : "rtl"}>{lesson.body}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{lesson.source}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-primary/10 bg-card p-4 text-sm leading-relaxed text-muted-foreground">{t("learn.noAuthSource")}</p>
          )}
        </section>

        <section id="related" className="mt-10 space-y-4">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold text-primary">
            <Network className="h-5 w-5 text-gold" aria-hidden="true" />
            {t("learn.relatedEntities")}
          </h2>
          {related.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to={r.kind === "prophet" ? "/prophets/$slug" : "/topics/$slug"}
                  params={{ slug: r.slug }}
                  className="rounded-xl border border-border bg-card p-4 hover:border-primary/40"
                >
                  <p className="font-semibold text-primary">{r.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{r.summary}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-primary/10 bg-card p-4 text-sm leading-relaxed text-muted-foreground">{t("learn.noAuthSource")}</p>
          )}

          <Link
            to="/learn/$kind/$slug"
            params={{ kind: "topic", slug: topic.slug }}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            {t("learn.continueExploring")}
          </Link>
        </section>

        <p className="mt-10 rounded-xl border border-primary/10 bg-secondary/40 p-4 text-xs leading-relaxed text-muted-foreground">
          {t("detail.topicsNote")}
        </p>
      </main>
    </div>
  );
}
