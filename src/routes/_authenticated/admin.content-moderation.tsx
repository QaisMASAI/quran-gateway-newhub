import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Check,
  AlertTriangle,
  ArrowLeft,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getModerationQueueFn,
  resolveModerationItemFn,
} from "@/lib/moderation-api.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/content-moderation")({
  component: AdminContentModerationPage,
  head: () => ({
    meta: [
      { title: "AI Content Moderation Queue | Scholar Review" },
      {
        name: "description",
        content: "Review and fact-check AI generated Tafsir and research briefs.",
      },
    ],
  }),
});

function AdminContentModerationPage() {
  const qc = useQueryClient();
  const getQueueFn = useServerFn(getModerationQueueFn);
  const resolveFn = useServerFn(resolveModerationItemFn);

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filterDomain, setFilterDomain] = useState<string>("all");

  const queueQuery = useQuery({
    queryKey: ["admin", "moderation", "queue"],
    queryFn: () => getQueueFn(),
    refetchInterval: 15_000,
  });

  const resolveMutation = useMutation({
    mutationFn: (params: { itemId: string; action: "approved" | "rejected" }) =>
      resolveFn({
        data: {
          itemId: params.itemId,
          action: params.action,
          scholarNotes: notes[params.itemId] || "",
        },
      }),
    onSuccess: (res, variables) => {
      qc.invalidateQueries({ queryKey: ["admin", "moderation", "queue"] });
      toast.success(
        variables.action === "approved"
          ? "AI response approved and published!"
          : "AI response rejected."
      );
    },
    onError: (err) => {
      toast.error(`Failed to update review status: ${err.message}`);
    },
  });

  const items = queueQuery.data || [];
  const filteredItems = items.filter((item) =>
    filterDomain === "all" ? true : item.domain === filterDomain
  );

  return (
    <div className="min-h-screen bg-background pb-16">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link
            to="/"
            className="hover:text-primary transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-foreground">Scholar Moderation Queue</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <span>AI Content Moderation Queue</span>
                  <Badge variant="outline" className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">
                    Scholar Review
                  </Badge>
                </h1>
                <p className="text-sm text-muted-foreground">
                  Verify grounded AI explanations and fact-check citations before public publication.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => queueQuery.refetch()}
              className="rounded-xl gap-2"
            >
              <Clock className="h-4 w-4" />
              <span>Refresh Queue</span>
            </Button>
          </div>
        </div>

        {/* Queue Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Pending Scholar Review
              </span>
              <p className="text-2xl font-bold text-foreground">{items.length}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Grounded Threshold
              </span>
              <p className="text-2xl font-bold text-foreground">≥ 80%</p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-600">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Active Prompt Version
              </span>
              <p className="text-2xl font-bold text-foreground">v1.4.2</p>
            </div>
          </div>
        </div>

        {/* Moderation Items List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Pending Review Items ({filteredItems.length})</span>
            </h2>
          </div>

          {queueQuery.isLoading ? (
            <div className="rounded-2xl border border-border p-12 text-center text-muted-foreground animate-pulse">
              Loading moderation queue items...
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center space-y-3">
              <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
              <h3 className="font-bold text-base text-foreground">Moderation Queue Clear!</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                All AI-generated responses meet confidence thresholds or have been verified by scholars.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredItems.map((item) => {
                const confScorePct = Math.round(item.confidenceScore * 100);
                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-5"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 pb-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 font-mono text-xs">
                          Pending Scholar Review
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">
                          ID: {item.id}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground font-medium uppercase">
                          {item.domain}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Confidence:</span>
                        <Badge
                          variant="outline"
                          className={
                            confScorePct >= 80
                              ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                              : confScorePct >= 50
                              ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                              : "bg-rose-500/10 text-rose-600 border-rose-500/30"
                          }
                        >
                          {confScorePct}%
                        </Badge>
                      </div>
                    </div>

                    {/* Query Prompt */}
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase">
                        User Query / Topic
                      </span>
                      <p className="text-sm font-bold text-foreground bg-secondary/40 p-3 rounded-xl border border-border/50">
                        "{item.rawQuery}"
                      </p>
                    </div>

                    {/* AI Generated Text */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span>AI Generated Explanation (For Scholar Review)</span>
                      </span>
                      <div className="rounded-2xl border border-border/80 bg-background p-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                        {item.aiGeneratedText}
                      </div>
                    </div>

                    {/* Verification Flags */}
                    {item.flags.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">
                          Verification Flags
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.flags.map((flag) => (
                            <Badge
                              key={flag}
                              variant="outline"
                              className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 text-[11px] gap-1"
                            >
                              <AlertTriangle className="h-3 w-3" />
                              <span>{flag}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Scholar Notes & Actions */}
                    <div className="pt-4 border-t border-border/60 space-y-4">
                      <div className="space-y-1.5">
                        <label
                          htmlFor={`notes-${item.id}`}
                          className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5"
                        >
                          <MessageSquare className="h-3.5 w-3.5 text-primary" />
                          <span>Scholar Reviewer Notes (Optional)</span>
                        </label>
                        <input
                          id={`notes-${item.id}`}
                          type="text"
                          value={notes[item.id] || ""}
                          onChange={(e) =>
                            setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))
                          }
                          placeholder="Add notes explaining approval or correction reasons..."
                          className="w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-end gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            resolveMutation.mutate({ itemId: item.id, action: "rejected" })
                          }
                          disabled={resolveMutation.isPending}
                          className="rounded-xl border-rose-500/30 text-rose-600 hover:bg-rose-500/10 hover:text-rose-700 dark:text-rose-400 text-xs gap-1.5"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject Content</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            resolveMutation.mutate({ itemId: item.id, action: "approved" })
                          }
                          disabled={resolveMutation.isPending}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm"
                        >
                          <Check className="h-4 w-4" />
                          <span>Approve & Publish</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
