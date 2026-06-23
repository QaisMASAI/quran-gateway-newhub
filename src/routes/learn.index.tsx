import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { Header } from "@/components/Header";
import { Loader2, Compass, Network, Clock, MapPin, ChevronLeft, Heart, Scale, BookOpen, Sun, Moon, Shield, Users, Sparkles, HandHelping, Star } from "lucide-react";
import { listAllEntities, groupByKind, type EntityKind } from "@/lib/knowledge";
import { EntityCard } from "@/components/discovery/EntityCard";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { ALL_TOPICS } from "@/lib/topics";
import { useTopicT } from "@/lib/content-i18n";

export const Route = createFileRoute("/learn/")({
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    return {
      meta: [
        { title: i18n.t("pages:learn.metaTitle", { lng: locale }) },
        {
          name: "description",
          content: i18n.t("pages:learn.metaDescription", { lng: locale }),
        },
        { property: "og:title", content: i18n.t("pages:learn.metaTitle", { lng: locale }) },
        { property: "og:description", content: i18n.t("pages:learn.metaDescription", { lng: locale }) },
        { property: "og:url", content: "/learn" },
      ],
      links: [{ rel: "canonical", href: "/learn" }],
    };
  },
  component: LearnIndex,
});

const ORDER: EntityKind[] = ["topic", "prophet", "story", "event", "place", "nation", "concept", "theme"];

const TOPIC_ICONS = {
  heart: Heart,
  scale: Scale,
  book: BookOpen,
  sun: Sun,
  moon: Moon,
  shield: Shield,
  users: Users,
  sparkles: Sparkles,
  hand: HandHelping,
  star: Star,
} as const;

function LearnIndex() {
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;

  const q = useQuery({
    queryKey: ["all-entities"],
    queryFn: listAllEntities,
    staleTime: 5 * 60_000,
  });

  const kindLabel = (k: EntityKind) => t(`search.kind${k.charAt(0).toUpperCase()}${k.slice(1)}` as const);
  const sectionLabel = (k: EntityKind) => {
    if (k === "topic") return t("learn.browseTopics");
    if (k === "prophet") return t("learn.browseProphets");
    if (k === "story") return t("learn.browseStories");
    return kindLabel(k);
  };

  const grouped = q.data ? groupByKind(q.data) : ({} as Record<EntityKind, never[]>);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="border-b border-border bg-gradient-to-b from-primary-soft/40 to-transparent">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-3 sm:px-6">
          <h1 className="text-3xl font-bold text-foreground">{t("learn.title")}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("learn.subtitle")}</p>
        </div>
        <div className="mosque-arch" aria-hidden />
      </div>

      <main id="main" className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        {q.isLoading && (
          <p className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </p>
        )}

        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to="/learn/journeys"
            className="group flex items-start gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary-soft/40 to-card p-4 transition hover:border-primary/60 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Compass className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-foreground group-hover:text-primary">
                {t("learn.openJourneys")}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("learn.openJourneysHint")}</p>
            </div>
          </Link>
          <Link
            to="/learn/graph"
            className="group flex items-start gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary-soft/40 to-card p-4 transition hover:border-primary/60 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Network className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-foreground group-hover:text-primary">
                {t("learn.openGraph")}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("learn.openGraphHint")}</p>
            </div>
          </Link>
          <Link
            to="/explore/timeline"
            className="group flex items-start gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary-soft/40 to-card p-4 transition hover:border-primary/60 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Clock className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-foreground group-hover:text-primary">{t("learn.openTimeline")}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("learn.openTimelineHint")}</p>
            </div>
          </Link>
          <Link
            to="/explore/map"
            className="group flex items-start gap-3 rounded-2xl border border-border bg-gradient-to-br from-primary-soft/40 to-card p-4 transition hover:border-primary/60 hover:shadow-sm"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-base font-semibold text-foreground group-hover:text-primary">{t("learn.openMap")}</div>
              <p className="mt-0.5 text-xs text-muted-foreground">{t("learn.openMapHint")}</p>
            </div>
          </Link>
        </div>

        <section id="topics-library" className="mb-10">
          <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <span className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
            <span>{t("topics.title")}</span>
            <span className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">{t("topics.intro")}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ALL_TOPICS.map((topic) => (
              <LearnTopicCard key={topic.slug} slug={topic.slug} icon={topic.icon} refsCount={topic.refs.length} />
            ))}
          </div>
        </section>

        {ORDER.map((kind) => {
          const list = grouped[kind];
          if (!list || list.length === 0) return null;
          return (
            <section key={kind} className="mb-8">
              <h2 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <span className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
                <span>{sectionLabel(kind)}</span>
                <span className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((e) => (
                  <EntityCard key={e.id} entity={e} locale={locale} kindLabel={kindLabel(e.kind)} />
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}

function LearnTopicCard({
  slug,
  icon,
  refsCount,
}: {
  slug: string;
  icon: keyof typeof TOPIC_ICONS;
  refsCount: number;
}) {
  const Icon = TOPIC_ICONS[icon];
  const { t } = useTranslation("pages");
  const topic = useTopicT(slug);

  return (
    <Link
      to="/learn/$kind/$slug"
      params={{ kind: "topic", slug }}
      className="group surface-card flex flex-col gap-3 p-4 transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-gold/10 group-hover:text-gold">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <ChevronLeft className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-gold ltr:rotate-180" aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <h3 className="line-clamp-1 font-display text-lg font-bold text-primary" dir="auto">{topic.title}</h3>
        {topic.subtitle && <p className="mt-0.5 text-xs text-muted-foreground" dir="auto">{topic.subtitle}</p>}
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground" dir="auto">{topic.description}</p>
        <p className="mt-3 text-[11px] font-medium text-gold">
          {refsCount} {t("topics.refsLabel")}
        </p>
      </div>
    </Link>
  );
}
