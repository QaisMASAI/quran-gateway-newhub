import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { getTopic, type AyahRef } from "@/lib/topics";
import { useTopicT } from "@/lib/content-i18n";
import { surahDisplayName } from "@/lib/surah-names-he";
import { ArrowRight, ChevronLeft, BookOpen, Sparkles, Loader2 } from "lucide-react";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { getEntityBySlug, pickLocale } from "@/lib/knowledge";
import { getLessonsForEntity, sourceName } from "@/lib/tafsir-content";

export const Route = createFileRoute("/topics/$slug")({
  loader: ({ params }) => {
    const topic = getTopic(params.slug);
    if (!topic) throw notFound();
    return { topic };
  },
  head: ({ params, loaderData }) => {
    const topic = loaderData?.topic;
    const title = topic ? `${topic.title} — נושא בקוראן` : "נושא בקוראן";
    const description = topic?.description ?? "נושאים מתוך הקוראן הקדוש.";
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

  const entityQ = useQuery({
    queryKey: ["topic-entity", topic.slug],
    queryFn: () => getEntityBySlug(topic.slug),
    staleTime: 5 * 60_000,
  });

  const lessonsQ = useQuery({
    queryKey: ["topic-lessons", entityQ.data?.id, locale],
    queryFn: () => getLessonsForEntity(entityQ.data!.id, locale as Locale),
    enabled: !!entityQ.data?.id,
    staleTime: 5 * 60_000,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link to="/topics" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowRight className="h-4 w-4 ltr:rotate-180" aria-hidden="true" />
          {t("detail.backToTopics")}
        </Link>

        <header className="mt-6 rounded-3xl border border-primary/10 bg-card p-8 text-center shadow-sm">
          <h1 className="font-display text-4xl font-bold text-primary">{tp.title}</h1>
          {tp.subtitle && <p className="mt-2 text-sm text-muted-foreground">{tp.subtitle}</p>}
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-foreground/80">{tp.description}</p>
        </header>

        <section className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-primary">
            <BookOpen className="h-5 w-5 text-gold" aria-hidden="true" />
            {t("detail.verseReferences")}
          </h2>

          <ul className="space-y-2">
            {topic.refs.map((ref: AyahRef, i: number) => {
              const surahName = surahDisplayName(ref.surah, locale) ?? t("detail.surahFallback", { n: ref.surah });
              const label = ref.to ? t("detail.rangeVerses", { from: ref.ayah, to: ref.to }) : t("detail.singleVerse", { n: ref.ayah });
              return (
                <li key={i}>
                  <Link
                    to="/surah/$id"
                    params={{ id: String(ref.surah) }}
                    hash={`v-${ref.ayah}`}
                    className="group flex items-center justify-between gap-4 rounded-xl border border-primary/5 bg-card p-4 transition-all hover:border-gold hover:shadow-md"
                  >
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-primary">{surahName}</div>
                      <div className="text-xs text-muted-foreground">{label}</div>
                    </div>
                    <ChevronLeft className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-gold ltr:rotate-180" aria-hidden="true" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {entityQ.isLoading && (
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}

        {entityQ.data && (
          <section className="mt-10 space-y-4">
            <h2 className="flex items-center gap-2 font-display text-xl font-bold text-primary">
              <Sparkles className="h-5 w-5 text-gold" aria-hidden="true" />
              {t("learn.overview")}
            </h2>
            <p className="rounded-xl border border-primary/10 bg-card p-4 text-sm leading-relaxed text-foreground/90">
              {pickLocale(entityQ.data.description_i18n, locale as Locale) || pickLocale(entityQ.data.summary_i18n, locale as Locale)}
            </p>

            {lessonsQ.data && lessonsQ.data.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-primary">{t("learn.lessonsTitle")}</h3>
                {lessonsQ.data.slice(0, 3).map((lesson) => (
                  <article key={lesson.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-sm leading-relaxed text-foreground/90" dir={locale === "en" ? "ltr" : "rtl"}>
                      {lesson.body}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">{sourceName(lesson.source, locale as Locale)}</p>
                  </article>
                ))}
              </div>
            )}

            <Link
              to="/learn/$kind/$slug"
              params={{ kind: "topic", slug: topic.slug }}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              {t("learn.continueExploring")}
            </Link>
          </section>
        )}

        <p className="mt-10 rounded-xl border border-primary/10 bg-secondary/40 p-4 text-xs leading-relaxed text-muted-foreground">
          {t("detail.topicsNote")}
        </p>
      </main>
    </div>
  );
}
