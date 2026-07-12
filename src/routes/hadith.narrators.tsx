import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/Header";
import { listTopNarrators } from "@/lib/hadith.functions";

export const Route = createFileRoute("/hadith/narrators")({
  head: () => ({
    meta: [
      { title: "Hadith Narrators" },
      { name: "description", content: "Top narrators across Sahih al-Bukhari and Sahih Muslim." },
      { property: "og:url", content: "/hadith/narrators" },
    ],
    links: [{ rel: "canonical", href: "/hadith/narrators" }],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData({
      queryKey: ["hadith", "narrators", 100],
      queryFn: () => listTopNarrators({ data: { limit: 100 } }),
    });
  },
  component: NarratorsPage,
});

function NarratorsPage() {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const fn = useServerFn(listTopNarrators);
  const { data = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["hadith", "narrators", 100],
    queryFn: () => fn({ data: { limit: 100 } }),
  });

  return (
    <div className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <Header />
      <main id="main" className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-xl font-bold text-foreground">Top Hadith Narrators</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Most frequent narrators across Bukhari and Muslim.
        </p>
        {isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading narrators…</p>}
        {isError && (
          <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
            Failed to load narrators.
            <button
              type="button"
              onClick={() => void refetch()}
              className="ms-2 underline underline-offset-2"
            >
              Retry
            </button>
          </p>
        )}
        <ol className="mt-6 space-y-2">
          {data.map((n, i) => (
            <li
              key={`${n.narrator}-${i}`}
              className="rounded-xl border border-border bg-card px-4 py-2 text-sm"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-foreground">{n.narrator}</span>
                <span className="text-xs text-muted-foreground">{n.hadith_count}</span>
              </div>
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                {n.collections.join(", ")}
              </div>
            </li>
          ))}
          {!isLoading && !isError && data.length === 0 && (
            <li className="text-sm text-muted-foreground">No narrators found.</li>
          )}
        </ol>
      </main>
    </div>
  );
}
