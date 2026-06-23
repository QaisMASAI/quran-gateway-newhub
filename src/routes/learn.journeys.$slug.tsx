import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { ChevronLeft, Loader2, Check, Circle, Compass } from "lucide-react";
import {
  getJourneyBySlug,
  getJourneyProgress,
  toggleJourneyStep,
  pickLocale,
  type EntityKind,
} from "@/lib/knowledge";
import { supabase } from "@/integrations/supabase/client";
import type { Locale } from "@/lib/i18n";

export const Route = createFileRoute("/learn/journeys/$slug")({
  component: JourneyPage,
});

function JourneyPage() {
  const { slug } = Route.useParams();
  const { t, i18n } = useTranslation("pages");
  const qc = useQueryClient();
  const locale = (i18n.language?.slice(0, 2) as Locale) || "he";
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) =>
      setUserId(session?.user?.id ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const q = useQuery({
    queryKey: ["journey", slug],
    queryFn: () => getJourneyBySlug(slug),
    staleTime: 5 * 60_000,
  });

  const progressQ = useQuery({
    queryKey: ["journey-progress", q.data?.journey.id, userId],
    queryFn: () => getJourneyProgress(userId!, q.data!.journey.id),
    enabled: !!userId && !!q.data?.journey.id,
  });

  if (q.isFetched && !q.data) throw notFound();
  const data = q.data;
  const done = progressQ.data ?? new Set<string>();
  const total = data?.steps.length ?? 0;
  const completed = done.size;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  async function toggle(stepId: string, isDone: boolean) {
    if (!userId || !data) return;
    await toggleJourneyStep(userId, data.journey.id, stepId, !isDone);
    qc.invalidateQueries({ queryKey: ["journey-progress", data.journey.id, userId] });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link
          to="/learn/journeys"
          className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-3 w-3" />
          {t("journeys.backToList")}
        </Link>

        {q.isLoading && (
          <p className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </p>
        )}

        {data && (
          <>
            <header className="mb-6 rounded-2xl border border-border bg-gradient-to-br from-primary-soft/50 to-card p-5">
              <div className="mb-2 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-primary">
                <Compass className="h-3.5 w-3.5" />
                {t("journeys.level", { n: data.journey.level })}
              </div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                {pickLocale(data.journey.title_i18n, locale)}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {pickLocale(data.journey.summary_i18n, locale)}
              </p>
              {userId && (
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{t("journeys.progress", { done: completed, total })}</span>
                    <span className="font-semibold text-primary">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )}
              {!userId && (
                <p className="mt-3 text-xs text-muted-foreground">
                  <Link to="/auth" className="text-primary underline-offset-2 hover:underline">
                    {t("journeys.signInToTrack")}
                  </Link>
                </p>
              )}
            </header>

            <ol className="space-y-2">
              {data.steps.map((s, idx) => {
                const isDone = done.has(s.id);
                const e = s.entity;
                return (
                  <li
                    key={s.id}
                    className="flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-primary/40"
                  >
                    <button
                      type="button"
                      onClick={() => toggle(s.id, isDone)}
                      disabled={!userId}
                      aria-label={isDone ? t("journeys.markUndone") : t("journeys.markDone")}
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        isDone
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background text-muted-foreground hover:border-primary"
                      } ${!userId ? "cursor-not-allowed opacity-50" : ""}`}
                    >
                      {isDone ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {t("journeys.stepN", { n: idx + 1 })}
                        {e && ` • ${t(`search.kind${e.kind.charAt(0).toUpperCase()}${e.kind.slice(1)}` as const)}`}
                      </div>
                      {e ? (
                        <Link
                          to="/learn/$kind/$slug"
                          params={{ kind: e.kind as EntityKind, slug: e.slug }}
                          className="block"
                        >
                          <div className="text-base font-semibold text-foreground hover:text-primary">
                            {pickLocale(e.title_i18n, locale)}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">
                            {pickLocale(e.summary_i18n, locale)}
                          </p>
                        </Link>
                      ) : (
                        <div className="text-sm text-muted-foreground">
                          {pickLocale(s.notes_i18n, locale)}
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </main>
    </div>
  );
}
