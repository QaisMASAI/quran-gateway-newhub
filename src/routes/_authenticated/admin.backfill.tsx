import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/Header";
import {
  getAdminBackfillStatus,
  invalidateResearchCache,
  listAdminJobRuns,
  runAllAdminBackfills,
  runAdminBackfillJob,
  runLocaleRegressionCheck,
  updateResearchCacheSettings,
} from "@/lib/admin-backfill.functions";
import {
  Loader2,
  PlayCircle,
  RotateCcw,
  TriangleAlert,
  CheckCircle2,
  RefreshCw,
  Download,
  Clock3,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/admin/backfill")({
  component: AdminBackfillPage,
  head: () => ({
    meta: [
      { title: "Admin Backfill Dashboard" },
      {
        name: "description",
        content:
          "Track and safely re-run data backfill jobs, manage cache controls, and run locale regressions.",
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

type BackfillCounts = {
  tafsir: { ar: number; en: number; he: number };
  asbab: { ar: number; en: number; he: number };
  hadithEntityLinks: number;
};

type RunReport = {
  countsBefore: BackfillCounts;
  countsAfter: BackfillCounts;
  durationMs: number;
  failedBatches: string[];
};

type RunRow = {
  id: string;
  job_key: string;
  status: "running" | "failed" | "succeeded";
  payload: Record<string, unknown> | null;
  result: unknown;
  error_message: string | null;
  started_at: string;
  finished_at: string | null;
  updated_at: string;
};

const JOBS: Array<{ key: AdminJobKey; title: string; defaultPayload: Record<string, unknown> }> = [
  { key: "backfill-quran-chapters", title: "Surah names backfill", defaultPayload: {} },
  {
    key: "backfill-asbab-nuzul",
    title: "Asbab al-Nuzul backfill",
    defaultPayload: { startSurah: 1, page: 1, perPage: 50, batch: 1200 },
  },
  { key: "backfill-verse-translations", title: "Verse translations backfill", defaultPayload: {} },
  {
    key: "embed-hadith",
    title: "Hadith embedding batches",
    defaultPayload: { batch: 200, untilDone: false, maxRuns: 1 },
  },
  {
    key: "translate-hadith-hebrew",
    title: "Hadith Hebrew translation",
    defaultPayload: { batch: 20 },
  },
  {
    key: "translate-tafsir-english",
    title: "Tafsir English translation",
    defaultPayload: { batch: 80 },
  },
  {
    key: "translate-tafsir-hebrew",
    title: "Tafsir Hebrew translation",
    defaultPayload: { batch: 80 },
  },
  { key: "link-hadith-graph", title: "Hadith topics linking", defaultPayload: { batch: 150 } },
];

function AdminBackfillPage() {
  const htmlLang = typeof document !== "undefined" ? document.documentElement.lang : "en";
  const uiFontClass = htmlLang.startsWith("ar")
    ? "font-ui-ar"
    : htmlLang.startsWith("he")
      ? "font-ui-he"
      : "font-ui-en";
  const qc = useQueryClient();
  const [ttlInput, setTtlInput] = useState(360);
  const [resumeFromFailed, setResumeFromFailed] = useState(true);
  const statusFn = useServerFn(getAdminBackfillStatus);
  const listRunsFn = useServerFn(listAdminJobRuns);
  const runJobFn = useServerFn(runAdminBackfillJob);
  const runAllFn = useServerFn(runAllAdminBackfills);
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
    refetchInterval: 10_000,
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

  const runAllM = useMutation({
    mutationFn: () => runAllFn({ data: { resumeFromFailed } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "backfill", "status"] });
      qc.invalidateQueries({ queryKey: ["admin", "backfill", "runs"] });
    },
  });

  const status = statusQ.data;
  const runs = (runsQ.data ?? []) as RunRow[];
  const runningRuns = runs.filter((run) => run.status === "running");
  const nowMs = Date.now();

  const successfulDurationsByJob = runs
    .filter((run) => run.status === "succeeded")
    .reduce<Record<string, number[]>>((acc, run) => {
      const report = readRunReport(run);
      const durationMs = report?.durationMs ?? inferDurationMs(run);
      if (!durationMs || durationMs <= 0) return acc;
      if (!acc[run.job_key]) acc[run.job_key] = [];
      acc[run.job_key].push(durationMs);
      return acc;
    }, {});

  const avgDurationByJob = Object.fromEntries(
    Object.entries(successfulDurationsByJob).map(([jobKey, values]) => [
      jobKey,
      Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    ]),
  ) as Record<string, number>;

  function exportRunReport(run: RunRow) {
    const report = readRunReport(run);
    if (!report) return;
    const payload = {
      runId: run.id,
      jobKey: run.job_key,
      status: run.status,
      startedAt: run.started_at,
      finishedAt: run.finished_at,
      durationMs: report.durationMs,
      countsBefore: report.countsBefore,
      countsAfter: report.countsAfter,
      failedBatches: report.failedBatches,
      errorMessage: run.error_message,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `backfill-report-${run.job_key}-${run.id}.json`;
    a.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className={`min-h-screen bg-background ${uiFontClass}`}>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Admin backfill dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Monitor backfills, resume failed batches, and manage MCP cache controls safely.
        </p>
        <div className="mt-3">
          <Link
            to="/admin/ingest"
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary"
          >
            Open ingest reports
          </Link>
        </div>

        {statusQ.isLoading ? (
          <div className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading status…
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Surah names"
              value={`${status?.jobs.quranChapters.count ?? 0}/114`}
              ok={Boolean(status?.jobs.quranChapters.complete)}
            />
            <MetricCard
              title="Asbab entries"
              value={String(status?.jobs.asbabNuzul.count ?? 0)}
              ok={Boolean(status?.jobs.asbabNuzul.complete)}
            />
            <MetricCard
              title="Verse translations"
              value={String(status?.jobs.verseTranslations.count ?? 0)}
              ok={Boolean(status?.jobs.verseTranslations.complete)}
            />
            <MetricCard
              title="Hadith topic links"
              value={String(status?.jobs.hadithTopics.count ?? 0)}
              ok={Boolean(status?.jobs.hadithTopics.complete)}
            />
          </div>
        )}

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Backfill data counts</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Tafsir (AR)"
              value={String(status?.counts.tafsir.ar ?? 0)}
              ok={(status?.counts.tafsir.ar ?? 0) > 0}
            />
            <MetricCard
              title="Tafsir (EN)"
              value={String(status?.counts.tafsir.en ?? 0)}
              ok={(status?.counts.tafsir.en ?? 0) > 0}
            />
            <MetricCard
              title="Tafsir (HE)"
              value={String(status?.counts.tafsir.he ?? 0)}
              ok={(status?.counts.tafsir.he ?? 0) > 0}
            />
            <MetricCard
              title="Asbab (AR)"
              value={String(status?.counts.asbab.ar ?? 0)}
              ok={(status?.counts.asbab.ar ?? 0) > 0}
            />
            <MetricCard
              title="Asbab (EN)"
              value={String(status?.counts.asbab.en ?? 0)}
              ok={(status?.counts.asbab.en ?? 0) > 0}
            />
            <MetricCard
              title="Asbab (HE)"
              value={String(status?.counts.asbab.he ?? 0)}
              ok={(status?.counts.asbab.he ?? 0) > 0}
            />
            <MetricCard
              title="hadith_entity_links"
              value={String(status?.counts.hadithEntityLinks ?? 0)}
              ok={(status?.counts.hadithEntityLinks ?? 0) > 0}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Counts refresh automatically every 10 seconds after each backfill run.
          </p>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Latest run timestamps</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <article className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Asbab al-Nuzul backfill</p>
              <p className="mt-1 text-sm text-foreground">
                {formatLastRun(status?.lastRuns?.asbab)}
              </p>
            </article>
            <article className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Jalalayn English translation</p>
              <p className="mt-1 text-sm text-foreground">
                {formatLastRun(status?.lastRuns?.jalalaynEnglish)}
              </p>
            </article>
            <article className="rounded-lg border border-border bg-background p-3">
              <p className="text-xs text-muted-foreground">Jalalayn Hebrew translation</p>
              <p className="mt-1 text-sm text-foreground">
                {formatLastRun(status?.lastRuns?.jalalaynHebrew)}
              </p>
            </article>
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Backfill jobs</h2>
            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={resumeFromFailed}
                  onChange={(e) => setResumeFromFailed(e.target.checked)}
                  className="h-4 w-4"
                />
                Safe resume
              </label>
              <button
                type="button"
                onClick={() => runAllM.mutate()}
                disabled={runAllM.isPending}
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {runAllM.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="h-4 w-4" />
                )}
                Run All Backfills
              </button>
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
                      onClick={() =>
                        runJobM.mutate({ jobKey: job.key, payload: job.defaultPayload })
                      }
                      disabled={runJobM.isPending || runAllM.isPending}
                      className="inline-flex min-h-11 items-center gap-1 rounded-md border border-border px-2.5 py-2 text-xs font-medium hover:bg-secondary"
                    >
                      <PlayCircle className="h-3.5 w-3.5" /> Run
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        runJobM.mutate({ jobKey: job.key, payload: job.defaultPayload })
                      }
                      disabled={runJobM.isPending || runAllM.isPending}
                      className="inline-flex min-h-11 items-center gap-1 rounded-md border border-border px-2.5 py-2 text-xs font-medium hover:bg-secondary"
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Re-run
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {runAllM.data && (
            <div className="mt-3 rounded-lg border border-border bg-background p-3 text-sm">
              {runAllM.data.ok ? (
                <p className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Run All completed successfully.
                </p>
              ) : (
                <p className="inline-flex items-center gap-1 text-destructive">
                  <TriangleAlert className="h-4 w-4" />
                  Run All stopped at {runAllM.data.stoppedAt}.
                </p>
              )}
            </div>
          )}
          {runAllM.error && (
            <p className="mt-2 text-sm text-destructive">{runAllM.error.message}</p>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Progress + logs</h2>
            <p className="text-xs text-muted-foreground">
              Streaming by polling every 10s{" "}
              {statusQ.isFetching || runsQ.isFetching ? "· updating now" : ""}
            </p>
          </div>

          <div className="mt-3 space-y-2">
            {runningRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active batches right now.</p>
            ) : (
              runningRuns.map((run) => {
                const elapsedMs = Math.max(0, nowMs - new Date(run.started_at).getTime());
                const expectedMs = avgDurationByJob[run.job_key] ?? 0;
                const etaMs = expectedMs > elapsedMs ? expectedMs - elapsedMs : 0;
                return (
                  <article
                    key={run.id}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium">{run.job_key}</p>
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        <Loader2 className="h-3 w-3 animate-spin" /> running
                      </span>
                    </div>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock3 className="h-3 w-3" /> Elapsed {formatDuration(elapsedMs)} · ETA{" "}
                      {expectedMs ? formatDuration(etaMs) : "learning"}
                    </p>
                  </article>
                );
              })
            )}
          </div>

          <div className="mt-4 rounded-lg border border-border bg-background p-3">
            <h3 className="text-sm font-medium">Latest events</h3>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {runs.slice(0, 12).map((run) => {
                const report = readRunReport(run);
                const failedSuffix =
                  report && report.failedBatches.length > 0
                    ? ` · failed batches: ${report.failedBatches.length}`
                    : "";
                return (
                  <li key={`log-${run.id}`}>
                    {new Date(run.updated_at).toLocaleTimeString()} · {run.job_key} · {run.status}
                    {run.error_message ? ` · ${run.error_message}` : failedSuffix}
                  </li>
                );
              })}
              {runs.length === 0 && <li>No logs yet.</li>}
            </ul>
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Quran.ai MCP cache controls</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <label className="text-sm text-muted-foreground" htmlFor="cache-ttl">
              TTL (minutes)
            </label>
            <input
              id="cache-ttl"
              type="number"
              min={5}
              max={1440}
              value={ttlInput}
              onChange={(e) =>
                setTtlInput(Math.max(5, Math.min(1440, Number(e.target.value || 360))))
              }
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
                    <td colSpan={4} className="py-3 text-muted-foreground">
                      No tafsir rows found.
                    </td>
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
                <p className="inline-flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  All locale rendering checks passed.
                </p>
              ) : (
                <div>
                  <p className="inline-flex items-center gap-1 text-destructive">
                    <TriangleAlert className="h-4 w-4" />
                    Regression found issues:
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                    {regressionM.data.errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-lg font-semibold">Recent runs</h2>
          <div className="mt-3 space-y-2">
            {runs.map((run) => {
              const report = readRunReport(run);
              return (
                <article key={run.id} className="rounded-lg border border-border bg-background p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{run.job_key}</p>
                    <div className="flex items-center gap-2">
                      {report && (
                        <button
                          type="button"
                          onClick={() => exportRunReport(run)}
                          className="inline-flex min-h-11 items-center gap-1 rounded-md border border-border px-2.5 py-2 text-xs font-medium hover:bg-secondary"
                        >
                          <Download className="h-3.5 w-3.5" /> Export report
                        </button>
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${run.status === "succeeded" ? "bg-emerald-500/10 text-emerald-700" : run.status === "failed" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}
                      >
                        {run.status}
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Started: {new Date(run.started_at).toLocaleString()}{" "}
                    {run.finished_at
                      ? `· Finished: ${new Date(run.finished_at).toLocaleString()}`
                      : ""}
                  </p>
                  {report && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Duration: {formatDuration(report.durationMs)} · Tafsir EN{" "}
                      {report.countsBefore.tafsir.en}→{report.countsAfter.tafsir.en} · Tafsir HE{" "}
                      {report.countsBefore.tafsir.he}→{report.countsAfter.tafsir.he} · Tafsir AR{" "}
                      {report.countsBefore.tafsir.ar}→{report.countsAfter.tafsir.ar} · Asbab EN{" "}
                      {report.countsBefore.asbab.en}→{report.countsAfter.asbab.en} · Asbab HE{" "}
                      {report.countsBefore.asbab.he}→{report.countsAfter.asbab.he} · Asbab AR{" "}
                      {report.countsBefore.asbab.ar}→{report.countsAfter.asbab.ar} ·
                      hadith_entity_links {report.countsBefore.hadithEntityLinks}→
                      {report.countsAfter.hadithEntityLinks}
                    </p>
                  )}
                  {readRunValidationSkipped(run) !== null && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Hebrew quality-gate skipped rows: {readRunValidationSkipped(run)}
                    </p>
                  )}
                  {report && report.failedBatches.length > 0 && (
                    <p className="mt-1 text-xs text-destructive">
                      Failed batches: {report.failedBatches.join(" | ")}
                    </p>
                  )}
                  {run.error_message && (
                    <p className="mt-1 text-xs text-destructive">{run.error_message}</p>
                  )}
                </article>
              );
            })}
            {runs.length === 0 && <p className="text-sm text-muted-foreground">No runs yet.</p>}
          </div>
          {runJobM.error && (
            <p className="mt-2 text-sm text-destructive">{runJobM.error.message}</p>
          )}
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
        {ok ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        ) : (
          <TriangleAlert className="h-4 w-4 text-amber-600" />
        )}
      </div>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </article>
  );
}

function inferDurationMs(run: RunRow) {
  if (!run.finished_at) return null;
  const start = new Date(run.started_at).getTime();
  const finish = new Date(run.finished_at).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(finish) || finish <= start) return null;
  return finish - start;
}

function readRunReport(run: RunRow): RunReport | null {
  if (!run.result || typeof run.result !== "object") return null;
  const data = run.result as { report?: RunReport };
  if (!data.report) return null;
  return data.report;
}

function readRunValidationSkipped(run: RunRow): number | null {
  if (!run.result || typeof run.result !== "object") return null;
  const maybeRaw = run.result as { raw?: { validation_skipped_rows?: unknown } };
  const value = maybeRaw.raw?.validation_skipped_rows;
  return typeof value === "number" ? value : null;
}

function formatLastRun(
  run: { started_at: string; finished_at: string | null; status: string } | null | undefined,
) {
  if (!run) return "No run yet";
  const end = run.finished_at ? new Date(run.finished_at).toLocaleString() : "still running";
  return `${run.status} · ${end}`;
}

function formatDuration(ms: number) {
  const totalSec = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}
