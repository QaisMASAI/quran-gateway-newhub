import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { Compass, Loader2, ChevronLeft } from "lucide-react";
import { listJourneys, pickLocale } from "@/lib/knowledge";
import type { Locale } from "@/lib/i18n";

export const Route = createFileRoute("/learn/journeys/")({
  head: () => ({
    meta: [
      { title: "Noor Al Quran| Learning Journeys" },
      {
        name: "description",
        content:
          "Guided learning paths through the Quran — curated journeys for beginners and learners ready to go deeper.",
      },
    ],
  }),
  component: JourneysIndex,
});

function JourneysIndex() {
  const { t, i18n } = useTranslation("pages");
  const locale = (i18n.language?.slice(0, 2) as Locale) || "he";

  const q = useQuery({
    queryKey: ["journeys"],
    queryFn: listJourneys,
    staleTime: 5 * 60_000,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="main" className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Link
          to="/learn"
          className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          <ChevronLeft className="h-3 w-3" />
          {t("learn.backToDiscovery")}
        </Link>
        <header className="mb-6">
          <h1 className="flex items-center gap-2 text-3xl font-bold text-foreground">
            <Compass className="h-7 w-7 text-primary" />
            {t("journeys.title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{t("journeys.subtitle")}</p>
        </header>

        {q.isLoading && (
          <p className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {q.data?.map((j) => (
            <Link
              key={j.id}
              to="/learn/journeys/$slug"
              params={{ slug: j.slug }}
              className="group rounded-xl border border-border bg-card p-4 transition hover:border-primary/50 hover:shadow-sm"
            >
              <div className="mb-1 flex items-center justify-between">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  {t("journeys.level", { n: j.level })}
                </div>
                <Compass className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{pickLocale(j.title_i18n, locale)}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{pickLocale(j.summary_i18n, locale)}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
