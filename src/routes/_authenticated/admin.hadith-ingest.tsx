import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Loader2, Play, RotateCcw, Square, Workflow } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { Header } from "@/components/Header";
import {
  cancelHadithImportJob,
  getHadithAdminDashboard,
  retryHadithImportJob,
  runHadithEmbeddingsWorker,
  runHadithImport,
} from "@/lib/hadith.functions";

export const Route = createFileRoute("/_authenticated/admin/hadith-ingest")({
  component: HadithIngestAdminPage,
  head: () => ({
    meta: [
      { title: "Hadith Import Queue" },
      {
        name: "description",
        content: "Resumable hadith importer queue, embedding status, and retry/cancel controls.",
      },
    ],
    links: [{ rel: "canonical", href: "/admin/hadith-ingest" }],
  }),
});

function HadithIngestAdminPage() {
  const [collection, setCollection] = useState<"bukhari" | "muslim">("bukhari");
  const [maxBooks, setMaxBooks] = useState(2);
  const [maxPagesPerBook, setMaxPagesPerBook] = useState(3);
  const [pageSize, setPageSize] = useState(100);

  const dashboardFn = useServerFn(getHadithAdminDashboard);
  const runImportFn = useServerFn(runHadithImport);
  const cancelFn = useServerFn(cancelHadithImportJob);
  const retryFn = useServerFn(retryHadithImportJob);
  const embedFn = useServerFn(runHadithEmbeddingsWorker);

  const dashboardQ = useQuery({
    queryKey: ["admin", "hadith", "ingest-dashboard"],
    queryFn: () => dashboardFn(),
    refetchInterval: (q) => {
      const imports = q.state.data?.imports ?? [];
      return imports.some((job) => job.status === "running" || job.status === "queued" || job.status === "retrying")
        ? 2500
        : 15_000;
    },
  });

  const runImportM = useMutation({
    mutationFn: () =>
      runImportFn({
        data: {
          collection,
          maxBooks,
          maxPagesPerBook,
          pageSize,
        },
      }),
    onSuccess: () => dashboardQ.refetch(),
  });

  const runEmbeddingM = useMutation({
    mutationFn: () => embedFn({ data: { batch: 200, untilDone: false, maxRuns: 8 } }),
    onSuccess: () => dashboardQ.refetch(),
  });

  const cancelM = useMutation({
    mutationFn: (id: string) => cancelFn({ data: { id } }),
    onSuccess: () => dashboardQ.refetch(),
  });

  const retryM = useMutation({
    mutationFn: (id: string) => retryFn({ data: { id } }),
    onSuccess: () => dashboardQ.refetch(),
  });

  const jobs = dashboardQ.data?.imports ?? [];
  const embeddings = dashboardQ.data?.embeddings;
  const embeddingProgress = useMemo(() => {
    if (!embeddings || embeddings.total <= 0) return 0;
    return Math.min(100, Math.round((embeddings.embedded / embeddings.total) * 100));
  }, [embeddings]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Hadith importer</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Run resumable imports, monitor per-batch failures, and keep multilingual embeddings up to date.
        </p>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <article className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">Start / continue import</h2>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <select
                value={collection}
                onChange={(e) => setCollection(e.target.value as "bukhari" | "muslim")}
                className="min-h-11 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="bukhari">Sahih al-Bukhari</option>
                <option value="muslim">Sahih Muslim</option>
              </select>
              <NumberField label="Books per run" value={maxBooks} onChange={setMaxBooks} min={1} max={20} />
              <NumberField
                label="Pages per book"
                value={maxPagesPerBook}
                onChange={setMaxPagesPerBook}
                min={1}
                max={20}
              />
              <NumberField label="Page size" value={pageSize} onChange={setPageSize} min={10} max={200} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => runImportM.mutate()}
                disabled={runImportM.isPending}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
              >
                {runImportM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                Run import step
              </button>
              <button
                type="button"
                onClick={() => runEmbeddingM.mutate()}
                disabled={runEmbeddingM.isPending}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary disabled:opacity-60"
              >
                {runEmbeddingM.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Workflow className="h-4 w-4" />
                )}
                Run embeddings worker
              </button>
            </div>
          </article>

          <article className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground">Embeddings status</h2>
            {!embeddings ? (
              <p className="mt-3 text-sm text-muted-foreground">Loading status…</p>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full bg-primary transition-all" style={{ width: `${embeddingProgress}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                  <Metric label="Total" value={String(embeddings.total)} />
                  <Metric label="Embedded" value={String(embeddings.embedded)} />
                  <Metric label="Pending" value={String(embeddings.pending)} />
                  <Metric
                    label="Latest run"
                    value={embeddings.latestEmbeddedAt ? new Date(embeddings.latestEmbeddedAt).toLocaleString() : "—"}
                  />
                </div>
              </div>
            )}
          </article>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Import queue</h2>
          {dashboardQ.isLoading ? (
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading jobs…
            </p>
          ) : jobs.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">No hadith import jobs yet.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-2 py-2">Job</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Received</th>
                    <th className="px-2 py-2">Written</th>
                    <th className="px-2 py-2">Failed rows</th>
                    <th className="px-2 py-2">Failed batches</th>
                    <th className="px-2 py-2">Updated</th>
                    <th className="px-2 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => {
                    const stats = asObject(job.stats);
                    const failedBatches = Array.isArray(job.failed_batches) ? job.failed_batches : [];
                    const canRetry = job.status === "failed" || job.status === "cancelled";
                    const canCancel = job.status === "running" || job.status === "queued" || job.status === "retrying";

                    return (
                      <tr key={job.id} className="border-b border-border/70 align-top">
                        <td className="px-2 py-2">
                          <p className="font-medium text-foreground">{job.job_name.replace("hadith_import:", "")}</p>
                          <p className="font-mono text-[11px] text-muted-foreground">{job.id}</p>
                          {job.error_message ? (
                            <p className="mt-1 text-[11px] text-destructive">{job.error_message}</p>
                          ) : null}
                        </td>
                        <td className="px-2 py-2 text-xs">{job.status}</td>
                        <td className="px-2 py-2 text-xs">{numStat(stats, "rowsReceived")}</td>
                        <td className="px-2 py-2 text-xs">{numStat(stats, "rowsWritten")}</td>
                        <td className="px-2 py-2 text-xs">{numStat(stats, "failedRows")}</td>
                        <td className="px-2 py-2 text-xs">
                          {failedBatches.length}
                          {failedBatches.length > 0 ? (
                            <details className="mt-1 max-w-[280px]">
                              <summary className="cursor-pointer text-primary">Inspect</summary>
                              <pre className="mt-1 max-h-36 overflow-auto rounded-md border border-border bg-background p-2 text-[10px]">
                                {JSON.stringify(failedBatches.slice(0, 20), null, 2)}
                              </pre>
                            </details>
                          ) : null}
                        </td>
                        <td className="px-2 py-2 text-xs text-muted-foreground">
                          {new Date(job.updated_at).toLocaleString()}
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => retryM.mutate(job.id)}
                              disabled={!canRetry || retryM.isPending}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] disabled:opacity-50"
                            >
                              <RotateCcw className="h-3 w-3" /> Retry
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelM.mutate(job.id)}
                              disabled={!canCancel || cancelM.isPending}
                              className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] disabled:opacity-50"
                            >
                              <Square className="h-3 w-3" /> Cancel
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  min: number;
  max: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-muted-foreground">
      {label}
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
        className="min-h-11 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
      />
    </label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function numStat(obj: Record<string, unknown> | null, key: string): string {
  if (!obj) return "0";
  const value = obj[key];
  return typeof value === "number" ? String(value) : "0";
}
