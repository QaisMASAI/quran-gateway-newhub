import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck, Loader2, CheckCircle2, TriangleAlert } from "lucide-react";
import { Header } from "@/components/Header";
import { claimFirstAdminRole, getAdminSetupStatus } from "@/lib/admin-setup.functions";

export const Route = createFileRoute("/_authenticated/admin/setup")({
  component: AdminSetupPage,
  head: () => ({
    meta: [
      { title: "Admin Setup" },
      {
        name: "description",
        content: "Securely claim the first admin role when your app has no admins yet.",
      },
    ],
  }),
});

function AdminSetupPage() {
  const qc = useQueryClient();
  const statusFn = useServerFn(getAdminSetupStatus);
  const claimFn = useServerFn(claimFirstAdminRole);

  const statusQ = useQuery({
    queryKey: ["admin", "setup", "status"],
    queryFn: () => statusFn(),
    refetchInterval: 10_000,
  });

  const claimM = useMutation({
    mutationFn: () => claimFn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "setup", "status"] });
      qc.invalidateQueries({ queryKey: ["admin", "backfill", "status"] });
    },
  });

  const status = statusQ.data;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-bold text-foreground">Admin setup helper</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Use this once to securely create the very first admin user role.
        </p>

        <section className="mt-6 rounded-xl border border-border bg-card p-5">
          {statusQ.isLoading ? (
            <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking admin status…
            </p>
          ) : (
            <>
              <div className="space-y-2 text-sm">
                <p className="inline-flex items-center gap-2">
                  {status?.hasAnyAdmin ? (
                    <TriangleAlert className="h-4 w-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  )}
                  Any admin exists: <strong>{status?.hasAnyAdmin ? "Yes" : "No"}</strong>
                </p>
                <p className="inline-flex items-center gap-2">
                  {status?.currentUserIsAdmin ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <TriangleAlert className="h-4 w-4 text-amber-600" />
                  )}
                  You are admin: <strong>{status?.currentUserIsAdmin ? "Yes" : "No"}</strong>
                </p>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => claimM.mutate()}
                  disabled={!status?.canClaimFirstAdmin || claimM.isPending}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-60"
                >
                  {claimM.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  Claim first admin role
                </button>

                <Link
                  to="/admin/backfill"
                  className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 py-2 text-sm hover:bg-secondary"
                >
                  Open Admin Backfill
                </Link>
              </div>

              {claimM.data?.ok && (
                <p className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700">
                  Admin role is now active for your account.
                </p>
              )}

              {(claimM.data && !claimM.data.ok) || claimM.error ? (
                <p className="mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {claimM.data && !claimM.data.ok ? claimM.data.error : claimM.error?.message}
                </p>
              ) : null}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
