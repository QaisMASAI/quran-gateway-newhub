import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  User,
  Scroll,
  Sparkles,
  MapPin,
  Users,
  Lightbulb,
  Layers,
  GraduationCap,
  UserCheck,
  BookMarked,
  Heart,
  Landmark,
} from "lucide-react";
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
  scholar: GraduationCap,
  companion: UserCheck,
  narrator: Users,
  book: BookMarked,
  dua: Heart,
  mosque: Landmark,
};

const KIND_TONE: Record<EntityKind, string> = {
  topic: "from-primary/14 to-primary/0 text-primary",
  prophet: "from-gold/16 to-gold/0 text-foreground",
  story: "from-secondary to-secondary/0 text-foreground",
  event: "from-primary-soft to-primary-soft/0 text-primary",
  place: "from-gold-soft to-gold-soft/0 text-foreground",
  nation: "from-muted to-muted/0 text-foreground",
  concept: "from-secondary to-secondary/0 text-foreground",
  theme: "from-primary/12 to-primary/0 text-primary",
  scholar: "from-amber-500/15 to-amber-500/0 text-amber-600 dark:text-amber-400",
  companion: "from-emerald-500/15 to-emerald-500/0 text-emerald-600 dark:text-emerald-400",
  narrator: "from-muted to-muted/0 text-foreground",
  book: "from-blue-500/15 to-blue-500/0 text-blue-600 dark:text-blue-400",
  dua: "from-rose-500/15 to-rose-500/0 text-rose-600 dark:text-rose-400",
  mosque: "from-purple-500/15 to-purple-500/0 text-purple-600 dark:text-purple-400",
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
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${tone} opacity-60`}
        aria-hidden
      />
      <div className="relative flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-background/70 backdrop-blur">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-70">
            {kindLabel}
          </div>
          <h3 className="line-clamp-1 text-base font-semibold text-foreground" dir="auto">
            {title}
          </h3>
          {summary && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground" dir="auto">
              {summary}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
