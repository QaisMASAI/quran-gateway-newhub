import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { READING_PLANS } from "@/lib/reading-plans";
import { usePlanT, useLevelT } from "@/lib/content-i18n";
import { CalendarCheck, ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/plans/")({
  component: PlansIndex,
});

function PlanCard({ slug, level, durationDays }: { slug: string; level: string; durationDays: number }) {
  const { t } = useTranslation("pages");
  const plan = usePlanT(slug);
  const tLevel = useLevelT();
  return (
    <Link
      to="/plans/$slug"
      params={{ slug }}
      className="group flex flex-col gap-3 rounded-2xl border border-primary/5 bg-card p-6 transition-all hover:-translate-y-0.5 hover:border-gold hover:shadow-xl"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full px-2.5 py-1 text-[11px] font-medium" style={{ background: "var(--gold-soft)", color: "var(--gold)" }}>
          {tLevel(level)}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{durationDays} {t("plans.days")}</span>
      </div>
      <h2 className="font-display text-xl font-bold text-primary">{plan.title}</h2>
      <p className="text-xs text-muted-foreground">{plan.subtitle}</p>
      <p className="line-clamp-3 text-sm text-foreground/80">{plan.description}</p>
      <div className="mt-auto flex items-center justify-between pt-3">
        <span className="text-xs font-medium text-gold">{t("plans.openPlan")}</span>
        <ChevronLeft className="h-4 w-4 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-gold ltr:rotate-180" aria-hidden="true" />
      </div>
    </Link>
  );
}

function PlansIndex() {
  const { t } = useTranslation("pages");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <header className="mb-10 space-y-3 text-center">
          <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CalendarCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="font-display text-4xl font-bold text-primary sm:text-5xl">{t("plans.title")}</h1>
          <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{t("plans.intro")}</p>
        </header>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {READING_PLANS.map((p) => (
            <PlanCard key={p.slug} slug={p.slug} level={p.level} durationDays={p.durationDays} />
          ))}
        </div>
      </main>
    </div>
  );
}
