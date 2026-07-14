import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Header } from "@/components/Header";
import {
  getHadithDiagnostics,
  getHadithTelemetrySnapshot,
  testSunnahConnection,
  updateSunnahApiKey,
} from "@/lib/hadith.functions";

export const Route = createFileRoute("/_authenticated/admin/hadith-api")({
  component: AdminHadithApiPage,
  head: () => ({
    meta: [
      { title: "Hadith API Admin" },
      { name: "description", content: "Diagnostics, key validation, and telemetry for Sunnah API." },
    ],
  }),
});

function AdminHadithApiPage() {
  const [draftKey, setDraftKey] = useState("");

  const diagnosticsFn = useServerFn(getHadithDiagnostics);
  const telemetryFn = useServerFn(getHadithTelemetrySnapshot);
  const testFn = useServerFn(testSunnahConnection);
  const saveFn = useServerFn(updateSunnahApiKey);

  const diagnosticsQ = useQuery({
    queryKey: ["admin", "hadith", "diagnostics"],
    queryFn: () => diagnosticsFn(),
    refetchInterval: 30_000,
  });

  const telemetryQ = useQuery({
    queryKey: ["admin", "hadith", "telemetry"],
    queryFn: () => telemetryFn(),
    refetchInterval: 60_000,
  });

  const testM = useMutation({
    mutationFn: (apiKey: string) => testFn({ data: { apiKey } }),
  });

  const saveM = useMutation({
    mutationFn: (apiKey: string) => saveFn({ data: { apiKey } }),
    onSuccess: () => diagnosticsQ.refetch(),
  });

  const testResult = testM.data;
  const diagnostics = diagnosticsQ.data;
  const telemetry = telemetryQ.data;

  const canSave =
    !!testResult &&
    testResult.connectionOk &&
    draftKey.trim().length >= 16 &&
    !saveM.isPending &&
    !testM.isPending;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Hadith API diagnostics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Validate Sunnah connectivity, inspect 403s by endpoint, and monitor Hadith route health.
        </p>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Current connection status</h2>
          {!diagnostics ? (
            <p className="mt-2 text-sm text-muted-foreground">Loading diagnostics…</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                API key configured: <strong>{diagnostics.apiConfigured ? "Yes" : "No"}</strong> · Connection:
                <strong className={diagnostics.connectionOk ? "text-emerald-600" : "text-destructive"}>
                  {diagnostics.connectionOk ? " OK" : " Failed"}
                </strong>
              </p>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-1 pe-3">Endpoint</th>
                      <th className="py-1 pe-3">Status</th>
                      <th className="py-1 pe-3">Request ID</th>
                      <th className="py-1">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnostics.endpoints.map((row) => (
                      <tr key={row.endpoint} className="border-t border-border align-top">
                        <td className="py-2 pe-3 font-medium">{row.endpoint}</td>
                        <td className="py-2 pe-3">{row.status || "-"}</td>
                        <td className="py-2 pe-3 text-xs text-muted-foreground">{row.requestId || "-"}</td>
                        <td className="py-2 text-xs text-muted-foreground">{row.error || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Update SUNNAH_API_KEY</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Test the key first. Save is enabled only after a successful connection test.
          </p>
          <div className="mt-3 space-y-3">
            <input
              type="password"
              value={draftKey}
              onChange={(e) => setDraftKey(e.target.value)}
              placeholder="Paste a Sunnah API key"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
              autoComplete="off"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => testM.mutate(draftKey)}
                disabled={draftKey.trim().length < 16 || testM.isPending}
                className="rounded-lg border border-border px-4 py-2 text-sm disabled:opacity-50"
              >
                {testM.isPending ? "Testing…" : "Test connection"}
              </button>
              <button
                type="button"
                onClick={() => saveM.mutate(draftKey)}
                disabled={!canSave}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                {saveM.isPending ? "Saving…" : "Save key"}
              </button>
            </div>
            {testM.data && (
              <p className={`text-sm ${testM.data.connectionOk ? "text-emerald-700" : "text-destructive"}`}>
                {testM.data.connectionOk
                  ? "Connection test passed. You can now save this key."
                  : "Connection test failed. Check endpoint statuses above."}
              </p>
            )}
            {saveM.data?.ok && <p className="text-sm text-emerald-700">Key saved successfully.</p>}
            {saveM.error && <p className="text-sm text-destructive">Failed to save key: {saveM.error.message}</p>}
          </div>
        </section>

        <section className="mt-6 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground">Hadith telemetry (24h)</h2>
          {!telemetry ? (
            <p className="mt-2 text-sm text-muted-foreground">Loading telemetry…</p>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Topic clicks: <strong>{telemetry.totalTopicClicks24h}</strong> · Learn not-found:
                <strong> {telemetry.totalLearnNotFound24h}</strong> · Not-found rate:
                <strong> {telemetry.notFoundRatePercent}%</strong>
              </p>
              {telemetry.alerts.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {telemetry.alerts.map((alert) => (
                    <li
                      key={alert.key}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        alert.level === "critical"
                          ? "border-destructive/30 bg-destructive/10 text-destructive"
                          : "border-amber-400/30 bg-amber-100/40 text-amber-900"
                      }`}
                    >
                      {alert.message}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-muted-foreground">
                      <th className="py-1 pe-3">Topic slug</th>
                      <th className="py-1">Clicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {telemetry.topicClicksBySlug.map((row) => (
                      <tr key={row.slug} className="border-t border-border">
                        <td className="py-2 pe-3">{row.slug}</td>
                        <td className="py-2">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
