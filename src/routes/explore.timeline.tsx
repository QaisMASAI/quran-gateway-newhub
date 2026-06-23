import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Clock } from "lucide-react";
import { Header } from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/explore/timeline")({
  head: () => ({
    meta: [
      { title: "Historical Timeline — Discover Quran" },
      {
        name: "description",
        content:
          "Walk through the Prophets, Nations and Events mentioned in the Quran in chronological order.",
      },
      { property: "og:title", content: "Quran Historical Timeline" },
      {
        property: "og:description",
        content: "Prophets, nations, and pivotal events arranged on a timeline.",
      },
    ],
  }),
  component: TimelinePage,
});

type Row = {
  id: string;
  kind: string;
  slug: string;
  title_i18n: Record<string, string>;
  summary_i18n: Record<string, string>;
  era_start_year: number | null;
  era_end_year: number | null;
  icon: string | null;
};

function TimelinePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["timeline-entities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_entities")
        .select("id,kind,slug,title_i18n,summary_i18n,era_start_year,era_end_year,icon")
        .eq("published", true)
        .in("kind", ["prophet", "person", "event", "nation"])
        .order("era_start_year", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const dated = (data ?? []).filter((r) => r.era_start_year != null);
  const undated = (data ?? []).filter((r) => r.era_start_year == null);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Clock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Historical Timeline</h1>
            <p className="text-sm text-muted-foreground">
              Prophets, nations, and events from the Quran across history.
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="text-muted-foreground text-sm">Loading timeline…</div>
        )}

        {!isLoading && dated.length === 0 && undated.length === 0 && (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            No dated entities found yet. As prophets, nations and events are
            enriched with historical eras they will appear here.
          </div>
        )}

        {dated.length > 0 && (
          <div className="relative pl-6 border-l-2 border-primary/30 space-y-6">
            {dated.map((row) => (
              <TimelineCard key={row.id} row={row} />
            ))}
          </div>
        )}

        {undated.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-3">Undated</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {undated.map((row) => (
                <TimelineCard key={row.id} row={row} flat />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineCard({ row, flat }: { row: Row; flat?: boolean }) {
  const title = row.title_i18n?.he ?? row.title_i18n?.en ?? row.slug;
  const summary = row.summary_i18n?.he ?? row.summary_i18n?.en ?? "";
  const routePath =
    row.kind === "prophet"
      ? "/prophets/$slug"
      : row.kind === "topic"
        ? "/topics/$slug"
        : "/learn/$kind/$slug";
  return (
    <div className={flat ? "" : "relative"}>
      {!flat && (
        <span className="absolute -left-[29px] top-3 w-3 h-3 rounded-full bg-primary ring-4 ring-background" />
      )}
      <Link
        to={routePath as never}
        params={
          row.kind === "prophet" || row.kind === "topic"
            ? ({ slug: row.slug } as never)
            : ({ kind: row.kind, slug: row.slug } as never)
        }
        className="block rounded-xl border border-border bg-card p-4 hover:border-primary transition"
      >
        <div className="flex items-center gap-2 mb-1">
          {row.icon && <span className="text-lg">{row.icon}</span>}
          <span className="font-semibold">{title}</span>
          <span className="ml-auto text-xs text-muted-foreground capitalize">
            {row.kind}
          </span>
        </div>
        {row.era_start_year != null && (
          <div className="text-xs text-primary mb-1">
            {fmtYear(row.era_start_year)}
            {row.era_end_year != null ? ` – ${fmtYear(row.era_end_year)}` : ""}
          </div>
        )}
        {summary && <p className="text-sm text-muted-foreground line-clamp-2">{summary}</p>}
      </Link>
    </div>
  );
}

function fmtYear(y: number) {
  if (y < 0) return `${Math.abs(y)} BCE`;
  return `${y} CE`;
}
