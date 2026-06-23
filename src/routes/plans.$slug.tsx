import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { getPlan, type DailyReading } from "@/lib/reading-plans";
import { surahDisplayName } from "@/lib/surah-names-he";
import { usePlanProgress } from "@/lib/reading-plan-progress";
import { usePlanT } from "@/lib/content-i18n";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { ArrowRight, Check, ChevronLeft, Cloud, RotateCcw, CalendarCheck } from "lucide-react";

export const Route = createFileRoute("/plans/$slug")({
  loader: ({ params }) => {
    const plan = getPlan(params.slug);
    if (!plan) throw notFound();
    return { plan };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.plan;
    const title = p ? `Noor Al Quran| ${p.title}` : "Noor Al Quran| Reading plan";
    const desc = p ? `${p.description}` : "Quran reading plan.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
      ],
    };
  },
  notFoundComponent: PlanNotFound,
  errorComponent: PlanError,
  component: PlanPage,
});

function PlanNotFound() {
  const { t } = useTranslation("pages");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="mb-2 font-display text-2xl font-bold text-primary">{t("planDetail.notFound")}</h1>
        <Link to="/plans" className="text-sm text-gold underline">
          {t("planDetail.notFoundLink")}
        </Link>
      </div>
    </div>
  );
}

function PlanError({ reset }: { reset: () => void }) {
  const { t } = useTranslation("pages");
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <p className="mb-4 text-sm text-destructive">{t("planDetail.errorGeneric")}</p>
        <button onClick={() => reset()} className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
          {t("planDetail.tryAgain")}
        </button>
      </div>
    </div>
  );
}

function segmentLabel(
  seg: DailyReading["segments"][number],
  locale: Locale,
  t: (key: string, opts?: Record<string, unknown>) => string,
): { surah: number; ayah: number; label: string } {
  const surahName = surahDisplayName(seg.surah, locale);
  if ("fromAyah" in seg && seg.fromAyah !== undefined && seg.toAyah !== undefined) {
    return {
      surah: seg.surah,
      ayah: seg.fromAyah,
      label: t("planDetail.verseRange", { surah: surahName, from: seg.fromAyah, to: seg.toAyah }),
    };
  }
  return {
    surah: seg.surah,
    ayah: 1,
    label: t("planDetail.fullSurah", { surah: surahName }),
  };
}

function PlanPage() {
  const { plan } = Route.useLoaderData();
  const { t, i18n } = useTranslation("pages");
  const { t: tContent } = useTranslation("content");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const planT = usePlanT(plan.slug);
  const { done, toggle, reset, isAuthenticated } = usePlanProgress(plan.slug);

  const total = plan.days.length;
  const completed = done.length;
  const pct = Math.round((completed / total) * 100);

  const resolveDayTitle = (d: DailyReading) => {
    const translated = tContent(`plans.${plan.slug}.days.${d.day}`, { defaultValue: "" });
    if (translated) return translated;
    if (plan.slug === "short-surahs-30") return t("planDetail.dayOnly", { n: d.day });
    return d.title;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <Link to="/plans" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary">
          <ArrowRight className="h-4 w-4 ltr:rotate-180" />
          {t("planDetail.backToPlans")}
        </Link>

        <header className="mt-6 rounded-3xl border border-primary/10 bg-card p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold text-primary">{planT.title}</h1>
              <p className="text-sm text-muted-foreground">{planT.subtitle}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/80">{planT.description}</p>

          <div className="mt-6 space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>{t("planDetail.progress", { completed, total, pct })}</span>
              {completed > 0 && (
                <button
                  onClick={() => {
                    if (confirm(t("planDetail.resetConfirm"))) reset();
                  }}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <RotateCcw className="h-3 w-3" />
                  {t("planDetail.reset")}
                </button>
              )}
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </header>

        <section className="mt-8">
          <h2 className="mb-4 font-display text-xl font-bold text-primary">{t("planDetail.dailyReading")}</h2>
          <ul className="space-y-2">
            {plan.days.map((d: DailyReading) => {
              const isDone = done.includes(d.day);
              const title = resolveDayTitle(d);
              return (
                <li
                  key={d.day}
                  className={`rounded-xl border p-4 transition-colors ${
                    isDone ? "border-gold/40 bg-gold/5" : "border-primary/5 bg-card"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => toggle(d.day)}
                      aria-label={isDone ? t("planDetail.markUnread") : t("planDetail.markRead")}
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
                        isDone
                          ? "border-gold bg-gold text-primary"
                          : "border-primary/20 bg-background text-transparent hover:border-gold"
                      }`}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h3 className="font-bold text-primary">{t("planDetail.dayHeading", { n: d.day, title })}</h3>
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {t("planDetail.segments", { n: d.segments.length })}
                        </span>
                      </div>
                      <ul className="mt-2 space-y-1.5">
                        {d.segments.map((seg: DailyReading["segments"][number], i: number) => {
                          const info = segmentLabel(seg, locale, t);
                          return (
                            <li key={i}>
                              <Link
                                to="/surah/$id"
                                params={{ id: String(info.surah) }}
                                hash={`v-${info.ayah}`}
                                className="group flex items-center justify-between gap-3 rounded-lg border border-primary/5 bg-background/60 px-3 py-2 text-sm transition-colors hover:border-gold/40 hover:bg-secondary/60"
                              >
                                <span className="truncate text-foreground">{info.label}</span>
                                <ChevronLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-gold ltr:rotate-180" />
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <p className="mt-10 flex items-start gap-2 rounded-xl border border-primary/10 bg-secondary/40 p-4 text-xs leading-relaxed text-muted-foreground">
          <Cloud className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          {isAuthenticated ? (
            <span>{t("planDetail.syncAuthenticated")}</span>
          ) : (
            <span>
              {t("planDetail.syncGuest")}{" "}
              <Link to="/auth" className="font-semibold text-primary underline">
                {t("planDetail.signIn")}
              </Link>{" "}
              {t("planDetail.syncGuestSuffix")}
            </span>
          )}
        </p>
      </main>
    </div>
  );
}
