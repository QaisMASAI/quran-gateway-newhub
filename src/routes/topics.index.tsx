import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { TOPICS } from "@/lib/topics";
import { useTopicT } from "@/lib/content-i18n";
import {
  Heart, Scale, BookOpen, Sun, Moon, Shield, Users, Sparkles,
  HandHelping, Star, ChevronLeft, Compass,
} from "lucide-react";

const ICONS = {
  heart: Heart, scale: Scale, book: BookOpen, sun: Sun, moon: Moon,
  shield: Shield, users: Users, sparkles: Sparkles, hand: HandHelping, star: Star,
} as const;

export const Route = createFileRoute("/topics/")({
  component: TopicsIndex,
});

function TopicCard({ slug, icon, refsCount }: { slug: string; icon: keyof typeof ICONS; refsCount: number }) {
  const Icon = ICONS[icon];
  const { t } = useTranslation("pages");
  const topic = useTopicT(slug);
  return (
    <Link
      to="/topics/$slug"
      params={{ slug }}
      className="group flex flex-col gap-3 rounded-2xl border border-primary/5 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-gold/10 group-hover:text-gold">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <ChevronLeft className="mt-2 h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-gold ltr:rotate-180" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h2 className="font-display text-lg font-bold text-primary">{topic.title}</h2>
        {topic.subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{topic.subtitle}</p>}
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{topic.description}</p>
        <p className="mt-3 text-[11px] font-medium text-gold">{refsCount} {t("topics.refsLabel")}</p>
      </div>
    </Link>
  );
}

function TopicsIndex() {
  const { t } = useTranslation("pages");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <header className="mb-10 space-y-3 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Compass className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="font-display text-4xl font-bold text-primary sm:text-5xl">{t("topics.title")}</h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{t("topics.intro")}</p>
        </header>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TOPICS.map((tp) => (
            <TopicCard key={tp.slug} slug={tp.slug} icon={tp.icon} refsCount={tp.refs.length} />
          ))}
        </div>
      </main>
    </div>
  );
}
