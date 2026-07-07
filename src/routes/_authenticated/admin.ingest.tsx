import { createFileRoute } from "@tanstack/react-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { getIngestReportById, listIngestReports } from "@/lib/quran-datasets.functions";
import { Loader2 } from "lucide-react";

type IngestStatus = "running" | "completed" | "failed";

type StatusFilter = IngestStatus | "all";

export const Route = createFileRoute("/_authenticated/admin/ingest")({
  component: AdminIngestPage,
  head: () => ({
    meta: [
      { title: "Admin Ingest Reports" },
      {
        name: "description",
        content: "Browse upload ingest reports, errors, and status in real time.",
      },
    ],
  }),
});

function AdminIngestPage() {
  const listFn = useServerFn(listIngestReports);
  const getFn = useServerFn(getIngestReportById);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [uploadIdInput, setUploadIdInput] = useState("");
  const [selectedUploadId, setSelectedUploadId] = useState<string | null>(null);

  const uploadsQ = useInfiniteQuery({
    queryKey: ["admin", "ingest", "uploads", statusFilter],
    queryFn: ({ pageParam }) =>
      listFn({
        data: {
          limit: 20,
          status: statusFilter === "all" ? undefined : statusFilter,
          cursor: pageParam ?? undefined,
        },
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => (lastPage.hasMore ? lastPage.nextCursor : null),
  });

  const flattenedUploads = useMemo(
    () => uploadsQ.data?.pages.flatMap((p) => p.entries) ?? [],
    [uploadsQ.data],
  );

  const detailQ = useQuery({
    queryKey: ["admin", "ingest", "report", selectedUploadId],
    queryFn: () => getFn({ data: { id: selectedUploadId! } }),
    enabled: Boolean(selectedUploadId),
    refetchInterval: (query) => (query.state.data?.status === "running" ? 2000 : false),
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Ingest reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track uploads, inspect failures, and poll active ingests.
        </p>

        <section className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <article className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              {(["all", "running", "completed", "failed"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`min-h-11 rounded-md border px-3 py-2 text-xs font-medium ${
                    statusFilter === status
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground">
                    <th className="px-2 py-2">Upload ID</th>
                    <th className="px-2 py-2">Kind</th>
                    <th className="px-2 py-2">Status</th>
                    <th className="px-2 py-2">Written / Received</th>
                    <th className="px-2 py-2">Failed</th>
                    <th className="px-2 py-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {uploadsQ.isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-4 text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" /> Loading uploads…
                        </span>
                      </td>
                    </tr>
                  ) : flattenedUploads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-2 py-4 text-muted-foreground">
                        No uploads found.
                      </td>
                    </tr>
                  ) : (
                    flattenedUploads.map((row) => (
                      <tr
                        key={row.id}
                        className="cursor-pointer border-b border-border/70 hover:bg-secondary/50"
                        onClick={() => {
                          setSelectedUploadId(row.id);
                          setUploadIdInput(row.id);
                        }}
                      >
                        <td className="px-2 py-2 font-mono text-xs">{row.id}</td>
                        <td className="px-2 py-2">{row.kind}</td>
                        <td className="px-2 py-2">{row.status}</td>
                        <td className="px-2 py-2">
                          {row.written} / {row.received}
                        </td>
                        <td className="px-2 py-2">{row.failed_count}</td>
                        <td className="px-2 py-2">{new Date(row.created_at).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3">
              <button
                type="button"
                disabled={!uploadsQ.hasNextPage || uploadsQ.isFetchingNextPage}
                onClick={() => uploadsQ.fetchNextPage()}
                className="min-h-11 rounded-md border border-border px-3 py-2 text-sm hover:bg-secondary disabled:opacity-60"
              >
                {uploadsQ.isFetchingNextPage ? "Loading…" : uploadsQ.hasNextPage ? "Load more" : "No more"}
              </button>
            </div>
          </article>

          <article className="rounded-xl border border-border bg-card p-4">
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const trimmed = uploadIdInput.trim();
                if (trimmed) setSelectedUploadId(trimmed);
              }}
            >
              <input
                value={uploadIdInput}
                onChange={(e) => setUploadIdInput(e.target.value)}
                placeholder="Enter upload id"
                className="min-h-11 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="min-h-11 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
              >
                View
              </button>
            </form>

            <div className="mt-4 rounded-lg border border-border bg-background p-3 text-sm">
              {!selectedUploadId ? (
                <p className="text-muted-foreground">Select an upload to view details.</p>
              ) : detailQ.isLoading ? (
                <p className="inline-flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading report…
                </p>
              ) : detailQ.error ? (
                <p className="text-destructive">{detailQ.error.message}</p>
              ) : !detailQ.data ? (
                <p className="text-muted-foreground">Upload not found.</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                    <Metric label="Status" value={detailQ.data.status} />
                    <Metric label="Kind" value={detailQ.data.kind} />
                    <Metric label="Received" value={String(detailQ.data.received)} />
                    <Metric label="Deduped" value={String(detailQ.data.deduped)} />
                    <Metric label="Written" value={String(detailQ.data.written)} />
                    <Metric label="Batches" value={String(detailQ.data.batches)} />
                    <Metric label="Failed" value={String(detailQ.data.failed_count)} />
                  </div>

                  <section>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Batch errors
                    </h3>
                    <pre className="max-h-40 overflow-auto rounded-md border border-border bg-card p-2 text-[11px]">
                      {JSON.stringify(detailQ.data.batch_errors ?? [], null, 2)}
                    </pre>
                  </section>

                  <section>
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Row validation errors
                    </h3>
                    <pre className="max-h-56 overflow-auto rounded-md border border-border bg-card p-2 text-[11px]">
                      {JSON.stringify(detailQ.data.row_errors ?? [], null, 2)}
                    </pre>
                  </section>
                </div>
              )}
            </div>
          </article>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}