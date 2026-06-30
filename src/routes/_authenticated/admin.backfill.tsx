import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/Header";
import {
  getAdminBackfillStatus,
  invalidateResearchCache,
  listAdminJobRuns,
  runAdminBackfillJob,
  runLocaleRegressionCheck,
  updateResearchCacheSettings,
} from "@/lib/admin-backfill.functions";
import { Loader2, PlayCircle, RotateCcw, TriangleAlert, CheckCircle2, RefreshCw } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/backfill")({
  component: AdminBackfillPage,
  head: () => ({
    meta: [
      { title: "Admin Backfill Dashboard" },
      {
        name: "description",
        content: "Track and safely re-run data backfill jobs, manage cache controls, and run locale regressions.",
      },
    ],
  }),
});

type AdminJobKey =
  | "backfill-quran-chapters"
  | "backfill-asbab-nuzul"
  | "backfill-verse-translations"
  | "embed-hadith"
  | "translate-hadith-hebrew"
  | "translate-tafsir-english"
  | "translate-tafsir-hebrew"
  | "link-hadith-graph";

const JOBS: Array<{ key: AdminJobKey; title: string; defaultPayload: Record<string, unknown> }> = [
  { key: "backfill-quran-chapters", title: "Surah names backfill", defaultPayload: {} },
  { key: "backfill-asbab-nuzul", title: "Asbab al-Nuzul backfill", defaultPayload: { surah: 2, page: 1, perPage: 50 } },
  { key: "backfill-verse-translations", title: "Verse translations backfill", defaultPayload: {} },
  { key: "embed-hadith", title: "Hadith embedding batches", defaultPayload: { batch: 200, untilDone: false, maxRuns: 1 } },
  { key: "translate-hadith-hebrew", title: "Hadith Hebrew translation", defaultPayload: { batch: 20 } },
  { key: "translate-tafsir-english", title: "Tafsir English translation", defaultPayload: { batch: 80 } },
  { key: "translate-tafsir-hebrew", title: "Tafsir Hebrew translation", defaultPayload: { batch: 80 } },
  { key: "link-hadith-graph", title: "Hadith topics linking", defaultPayload: { batch: 150 } },
];

function AdminBackfillPage() {
  const qc = useQueryClient();
  const [ttlInput, setTtlInput] = useState(360);
  const statusFn = useServerFn(getAdminBackfillStatus);
  const listRunsFn = useServerFn(listAdminJobRuns);
  const runJobFn = useServerFn(runAdminBackfillJob);
  const updateCacheFn = useServerFn(updateResearchCacheSettings);
  const invalidateCacheFn = useServerFn(invalidateResearchCache);
  const runRegressionFn = useServerFn(runLocaleRegressionCheck);

  const statusQ = useQuery({
    queryKey: ["admin", "backfill", "status"],
    queryFn: () => statusFn(),
    refetchInterval: 10_000,
  });

  const runsQ = useQuery({
    queryKey: ["admin", "backfill", "runs"],
    queryFn: () => listRunsFn(),
    refetchInterval: 12_000,
  });

  const runJobM = useMutation({
    mutationFn: (args: { jobKey: AdminJobKey; payload: Record<string, unknown> }) =>
      runJobFn({ data: { jobKey: args.jobKey, payload: args.payload } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "backfill", "status"] });
      qc.invalidateQueries({ queryKey: ["admin", "backfill", "runs"] });
    },
  });

  const saveTtlM = useMutation({
    mutationFn: (ttl: number) => updateCacheFn({ data: { ttlMinutes: ttl } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "backfill", "status"] }),
  });

  const invalidateM = useMutation({
    mutationFn: () => invalidateCacheFn(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "backfill", "status"] }),
  });

  const regressionM = useMutation({
    mutationFn: () => runRegressionFn({ data: { sampleSurahs: [1, 2, 18, 36, 55, 112] } }),
  });

  const status = statusQ.data;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Admin backfill dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor backfills, resume failed batches, and manage MCP cache controls safely.
        </p>

        {statusQ.isLoading ? (
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading status…
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Surah names" value={`${status?.jobs.quranChapters.count ?? 0}/114`} ok={Boolean(status?.jobs.quranChapters.complete)} />
            <MetricCard title="Asbab entries" value={String(status?.jobs.asbabNuzul.count ?? 0)} ok={Boolean(status?.jobs.asbabNuzul.complete)} />
            <MetricCard title="Verse translations" value={String(status?.jobs.verseTranslations.count ?? 0)} ok={Boolean(status?.jobs.verseTranslations.complete)} />
            <MetricCard title="Hadith topic links" value={String(status?.jobs.hadithTopics.count ?? 0)} ok={Boolean(status?.jobs.hadithTopics.complete)} />
          </div>
        )}

        <section className="mt-8 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Backfill jobs</h2>
            <button
              type="button"
              onClick={() => {
                qc.invalidateQueries({ queryKey: ["admin", "backfill", "status"] });
                qc.invalidateQueries({ queryKey: ["admin", "backfill", "runs"] });
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"
            >
              <RefreshCw className="h-4 w-4" /> Refresh
            </button>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {JOBS.map((job) => (
              <div key={job.key} className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium text-foreground">{job.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{job.key}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => runJobM.mutate({ jobKey: job.key, payload: job.defaultPayload })}
                      className="inline-flex min-h-11 items-center gap-1 rounded-md border border-border px-2.5 py-2 text-xs font-medium hover:bg-secondary"
                    >
                      <PlayCircle className="h-3.5 w-3.5" /> Run
                    </button>
                    <button
                      type="button"
                      onClick={() => runJobM.mutate({ jobKey: job.key, payload: job.defaultPayload })}
                      className="inline-flex min-h-11 items-center gap-1 rounded-md border border-border px-2.5 py-2 text-xs font-medium hover:bg-secondary"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Re-run
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Quran.ai MCP cache controls</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="text-sm text-muted-foreground" htmlFor="cache-ttl">TTL (minutes)</label>
            <input
              id="cache-ttl"
              type="number"
              min={5}
              max={1440}
              value={ttlInput}
              onChange={(e) => setTtlInput(Math.max(5, Math.min(1440, Number(e.target.value || 360))))}
              className="h-11 w-28 rounded-md border border-border bg-background px-2 text-sm"
            />
            <button
              type="button"
              onClick={() => saveTtlM.mutate(ttlInput)}
              className="inline-flex min-h-11 items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Save TTL
            </button>
            <button
              type="button"
              onClick={() => invalidateM.mutate()}
              className="inline-flex min-h-11 items-center rounded-md border border-border px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              Invalidate cache now
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Current: {status?.cache.ttlMinutes ?? 360}m · Version {status?.cache.version ?? 1}
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Tafsir source audit</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="py-2">Source</th>
                  <th className="py-2">Arabic</th>
                  <th className="py-2">Hebrew</th>
                  <th className="py-2">English</th>
                </tr>
              </thead>
              <tbody>
                {(status?.tafsirAudit ?? []).map((row) => (
                  <tr key={row.sourceName} className="border-t border-border">
                    <td className="py-2 pr-3">{row.sourceName}</td>
                    <td className="py-2">{row.ar}</td>
                    <td className="py-2">{row.he}</td>
                    <td className="py-2">{row.en}</td>
                  </tr>
                ))}
                {(status?.tafsirAudit ?? []).length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-3 text-muted-foreground">No tafsir rows found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Locale regression checks</h2>
            <button
              type="button"
              onClick={() => regressionM.mutate()}
              className="inline-flex min-h-11 items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
            >
              Run regression
            </button>
          </div>
          {regressionM.data && (
            <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm">
              {regressionM.data.ok ? (
                <p className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-4 w-4" />All locale rendering checks passed.</p>
              ) : (
                <div>
                  <p className="inline-flex items-center gap-1 text-destructive"><TriangleAlert className="h-4 w-4" />Regression found issues:</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                    {regressionM.data.errors.map((e) => <li key={e}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Recent runs</h2>
          <div className="mt-3 space-y-2">
            {(runsQ.data ?? []).map((run) => (
              <article key={run.id} className="rounded-lg border border-border bg-background p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{run.job_key}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${run.status === "succeeded" ? "bg-emerald-500/10 text-emerald-700" : run.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                    {run.status}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Started: {new Date(run.started_at).toLocaleString()} {run.finished_at ? `· Finished: ${new Date(run.finished_at).toLocaleString()}` : ""}
                </p>
                {run.error_message && <p className="mt-1 text-xs text-destructive">{run.error_message}</p>}
              </article>
            ))}
            {(runsQ.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No runs yet.</p>}
          </div>
          {runJobM.error && <p className="mt-2 text-sm text-destructive">{runJobM.error.message}</p>}
        </section>
      </main>
    </div>
  );
}

function MetricCard({ title, value, ok }: { title: string; value: string; ok: boolean }) {
  return (
    <article className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{title}</p>
        {ok ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <TriangleAlert className="h-4 w-4 text-amber-600" />}
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </article>
  );
}
