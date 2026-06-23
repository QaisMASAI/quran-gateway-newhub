import { Link } from "@tanstack/react-router";
import { BookOpen, User, Scroll, Sparkles, MapPin, Users, Lightbulb, Layers } from "lucide-react";
import type { EntityKind, KnowledgeEntity } from "@/lib/knowledge";
import { pickLocale } from "@/lib/knowledge";
import type { LocaleCode } from "@/lib/translations-db";

const KIND_ICON: Record<EntityKind, typeof BookOpen> = {
  topic: Sparkles,
  prophet: User,
  story: Scroll,
  event: BookOpen,
  place: MapPin,
  nation: Users,
  concept: Lightbulb,
  theme: Layers,
};

const KIND_TONE: Record<EntityKind, string> = {
  topic: "from-emerald-500/10 to-emerald-500/0 text-emerald-700 dark:text-emerald-300",
  prophet: "from-amber-500/10 to-amber-500/0 text-amber-700 dark:text-amber-300",
  story: "from-sky-500/10 to-sky-500/0 text-sky-700 dark:text-sky-300",
  event: "from-rose-500/10 to-rose-500/0 text-rose-700 dark:text-rose-300",
  place: "from-violet-500/10 to-violet-500/0 text-violet-700 dark:text-violet-300",
  nation: "from-indigo-500/10 to-indigo-500/0 text-indigo-700 dark:text-indigo-300",
  concept: "from-teal-500/10 to-teal-500/0 text-teal-700 dark:text-teal-300",
  theme: "from-fuchsia-500/10 to-fuchsia-500/0 text-fuchsia-700 dark:text-fuchsia-300",
};

export function EntityCard({
  entity,
  locale,
  kindLabel,
}: {
  entity: KnowledgeEntity;
  locale: LocaleCode;
  kindLabel: string;
}) {
  const Icon = KIND_ICON[entity.kind] ?? BookOpen;
  const tone = KIND_TONE[entity.kind] ?? "";
  const title = pickLocale(entity.title_i18n, locale);
  const summary = pickLocale(entity.summary_i18n, locale);

  return (
    <Link
      to="/learn/$kind/$slug"
      params={{ kind: entity.kind, slug: entity.slug }}
      className="surface-card group relative block overflow-hidden p-4 transition hover:border-primary/40 hover:shadow-md"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tone} opacity-60`} aria-hidden />
      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/70 backdrop-blur">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-70">
            {kindLabel}
          </div>
          <h3 className="line-clamp-1 text-base font-semibold text-foreground" dir="auto">{title}</h3>
          {summary && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground" dir="auto">{summary}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
