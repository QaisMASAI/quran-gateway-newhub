import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { TrustBadge } from "@/components/TrustBadge";
import { EMOTIONS } from "@/lib/emotions";
import { useEmotionT } from "@/lib/content-i18n";
import {
  Heart, Shield, Sun, Moon, Sparkles, HandHelping, Scale, Star,
  BookOpen, Users, ChevronLeft, HeartHandshake,
} from "lucide-react";

const ICONS = {
  heart: Heart, shield: Shield, sun: Sun, moon: Moon, sparkles: Sparkles,
  hand: HandHelping, scale: Scale, star: Star, book: BookOpen, users: Users,
} as const;

const ACCENT = {
  calm: "from-primary/5 to-transparent",
  warm: "from-gold/10 to-transparent",
  deep: "from-primary/8 to-transparent",
  soft: "from-secondary/40 to-transparent",
} as const;

export const Route = createFileRoute("/emotions/")({
  component: EmotionsIndex,
});

function EmotionCard({ slug, icon, accent, refsCount }: { slug: string; icon: keyof typeof ICONS; accent: keyof typeof ACCENT; refsCount: number }) {
  const Icon = ICONS[icon];
  const { t } = useTranslation("pages");
  const e = useEmotionT(slug);
  return (
    <Link
      to="/emotions/$slug"
      params={{ slug }}
      className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-primary/5 bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-xl"
    >
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-bl ${ACCENT[accent]} opacity-60`} aria-hidden />
      <div className="relative flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-gold/10 group-hover:text-gold">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <ChevronLeft className="mt-2 h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-gold rtl:rotate-0 ltr:rotate-180" aria-hidden="true" />
      </div>
      <div className="relative min-w-0">
        <h2 className="font-display text-lg font-bold text-primary">{e.title}</h2>
        {e.subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{e.subtitle}</p>}
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{e.description}</p>
        <p className="mt-3 text-[11px] font-medium text-gold">{refsCount} {t("emotions.selectedVerses")}</p>
      </div>
    </Link>
  );
}

function EmotionsIndex() {
  const { t } = useTranslation("pages");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <header className="mb-10 space-y-4 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HeartHandshake className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="font-display text-4xl font-bold text-primary sm:text-5xl">{t("emotions.title")}</h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{t("emotions.intro")}</p>
          <div className="flex justify-center pt-1"><TrustBadge size="md" /></div>
        </header>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {EMOTIONS.map((e) => (
            <EmotionCard key={e.slug} slug={e.slug} icon={e.icon} accent={e.accent} refsCount={e.refs.length} />
          ))}
        </div>
      </main>
    </div>
  );
}
