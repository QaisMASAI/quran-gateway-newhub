import { createLazyFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Bookmark,
  NotebookPen,
  Compass,
  Sparkles,
  Map as MapIcon,
  LogIn,
} from "lucide-react";
import { Header } from "@/components/Header";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { pickLocale, type KnowledgeEntity } from "@/lib/knowledge";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { surahDisplayName } from "@/lib/surah-names-he";

export const Route = createLazyFileRoute("/profile")({
  component: ProfilePage,
});

interface ProfileSummary {
  bookmarkCount: number;
  noteCount: number;
  readingProgressCount: number;
  journeyProgress: {
    journey_id: string;
    slug: string;
    title_i18n: { he?: string; ar?: string; en?: string };
    done: number;
    total: number;
  }[];
  recommended: KnowledgeEntity[];
  continueReading: { surah: number; ayah: number; last_read_at: string } | null;
  recentBookmarks: {
    surah: number;
    ayah: number;
    surah_name: string | null;
    hebrew_snapshot: string | null;
    created_at: string;
  }[];
  recentNotes: { surah: number; ayah: number; body: string; updated_at: string }[];
}

async function fetchProfileSummary(userId: string): Promise<ProfileSummary> {
  const [bm, nt, rp, prog, journeys, steps, recs, lastRead, recentBm, recentNt] = await Promise.all(
    [
      supabase.from("bookmarks").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("notes").select("id", { count: "exact", head: true }).eq("user_id", userId),
      supabase
        .from("reading_progress")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("knowledge_journey_progress")
        .select("journey_id,step_id")
        .eq("user_id", userId),
      supabase.from("knowledge_journeys").select("id,slug,title_i18n").eq("published", true),
      supabase.from("knowledge_journey_steps").select("id,journey_id"),
      supabase
        .from("knowledge_entities")
        .select("*")
        .eq("published", true)
        .in("kind", ["topic", "story", "concept", "prophet"])
        .limit(60),
      supabase
        .from("reading_progress")
        .select("surah,ayah,last_read_at")
        .eq("user_id", userId)
        .order("last_read_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("bookmarks")
        .select("surah,ayah,surah_name,hebrew_snapshot,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3),
      supabase
        .from("notes")
        .select("surah,ayah,body,updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(3),
    ],
  );

  const stepsByJourney = new Map<string, number>();
  for (const s of (steps.data ?? []) as { id: string; journey_id: string }[]) {
    stepsByJourney.set(s.journey_id, (stepsByJourney.get(s.journey_id) ?? 0) + 1);
  }
  const doneByJourney = new Map<string, number>();
  for (const p of (prog.data ?? []) as { journey_id: string }[]) {
    doneByJourney.set(p.journey_id, (doneByJourney.get(p.journey_id) ?? 0) + 1);
  }

  type J = { id: string; slug: string; title_i18n: { he?: string; en?: string; ar?: string } };
  const journeyProgress = ((journeys.data ?? []) as J[]).map((j) => ({
    journey_id: j.id,
    slug: j.slug,
    title_i18n: j.title_i18n ?? {},
    done: doneByJourney.get(j.id) ?? 0,
    total: stepsByJourney.get(j.id) ?? 0,
  }));

  const pool = ((recs.data ?? []) as KnowledgeEntity[]).slice().sort(() => Math.random() - 0.5);
  const recommended = pool.slice(0, 3);

  return {
    bookmarkCount: bm.count ?? 0,
    noteCount: nt.count ?? 0,
    readingProgressCount: rp.count ?? 0,
    journeyProgress,
    recommended,
    continueReading:
      (lastRead.data as { surah: number; ayah: number; last_read_at: string } | null) ?? null,
    recentBookmarks: (recentBm.data as ProfileSummary["recentBookmarks"] | null) ?? [],
    recentNotes: (recentNt.data as ProfileSummary["recentNotes"] | null) ?? [],
  };
}

function ProfilePage() {
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["profile-summary", user?.id],
    queryFn: () => fetchProfileSummary(user!.id),
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const topJourney = useMemo(
    () =>
      data?.journeyProgress
        .filter((j) => j.total > 0 && j.done < j.total)
        .sort((a, b) => b.done / b.total - a.done / a.total)[0],
    [data?.journeyProgress],
  );

  if (!authLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main id="main" className="mx-auto max-w-2xl px-4 py-16 text-center">
          <h1 className="text-2xl font-bold">{t("profile.signInTitle")}</h1>
          <p className="mt-3 text-muted-foreground">{t("profile.signInBody")}</p>
          <Link
            to="/auth"
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <LogIn className="h-4 w-4" /> {t("profile.signInCta")}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <section
        className="arabesque-bg px-4 pb-10 pt-10 sm:px-6"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="mx-auto max-w-4xl text-white">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs">
            <Sparkles className="h-3 w-3" /> {t("profile.badge")}
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">{t("profile.title")}</h1>
          <p className="mt-2 text-sm text-white/85">{user?.email ?? ""}</p>
        </div>
      </section>

      <main id="main" className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            icon={<Bookmark className="h-4 w-4" />}
            label={t("profile.statBookmarks")}
            value={data?.bookmarkCount ?? 0}
          />
          <StatCard
            icon={<NotebookPen className="h-4 w-4" />}
            label={t("profile.statNotes")}
            value={data?.noteCount ?? 0}
          />
          <StatCard
            icon={<BookOpen className="h-4 w-4" />}
            label={t("profile.statReading")}
            value={data?.readingProgressCount ?? 0}
          />
          <StatCard
            icon={<MapIcon className="h-4 w-4" />}
            label={t("profile.statJourneys")}
            value={data?.journeyProgress.filter((j) => j.done > 0).length ?? 0}
          />
        </div>

        {data?.continueReading && (
          <div className="mt-6 surface-card p-5">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {t("profile.continueReading")}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-semibold">
                {t("profile.continueReadingAt", {
                  surah: data.continueReading.surah,
                  ayah: data.continueReading.ayah,
                })}
              </div>
              <Link
                to="/surah/$id"
                params={{ id: String(data.continueReading.surah) }}
                search={{ q: undefined }}
                hash={`v-${data.continueReading.ayah}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {t("profile.resume")}
              </Link>
            </div>
          </div>
        )}

        {topJourney && (
          <div className="mt-6 surface-card p-5">
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">
              {t("profile.continueLearning")}
            </div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">
                  {pickLocale(topJourney.title_i18n, locale)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {topJourney.done} / {topJourney.total} {t("profile.stepsDone")}
                </div>
              </div>
              <Link
                to="/learn/journeys/$slug"
                params={{ slug: topJourney.slug }}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                {t("profile.resume")}
              </Link>
            </div>
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.round((topJourney.done / topJourney.total) * 100)}%` }}
              />
            </div>
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {data?.recentBookmarks && data.recentBookmarks.length > 0 && (
            <div className="surface-card p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <Bookmark className="h-3 w-3" /> {t("profile.recentBookmarks")}
              </div>
              <ul className="space-y-2">
                {data.recentBookmarks.map((b) => (
                  <li key={`${b.surah}-${b.ayah}`}>
                    <Link
                      to="/surah/$id"
                      params={{ id: String(b.surah) }}
                      search={{ q: undefined }}
                      hash={`v-${b.ayah}`}
                      className="block rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary/40"
                    >
                      <div className="text-xs font-semibold text-primary">
                        {b.surah_name ?? surahDisplayName(b.surah, locale)} {b.surah}:{b.ayah}
                      </div>
                      {b.hebrew_snapshot && (
                        <div className="mt-1 line-clamp-2 text-xs text-muted-foreground" dir="auto">
                          {b.hebrew_snapshot}
                        </div>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data?.recentNotes && data.recentNotes.length > 0 && (
            <div className="surface-card p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                <NotebookPen className="h-3 w-3" /> {t("profile.recentNotes")}
              </div>
              <ul className="space-y-2">
                {data.recentNotes.map((n) => (
                  <li key={`${n.surah}-${n.ayah}-${n.updated_at}`}>
                    <Link
                      to="/surah/$id"
                      params={{ id: String(n.surah) }}
                      search={{ q: undefined }}
                      hash={`v-${n.ayah}`}
                      className="block rounded-lg border border-border bg-background px-3 py-2 text-sm hover:border-primary/40"
                    >
                      <div className="text-xs font-semibold text-primary">
                        {n.surah}:{n.ayah}
                      </div>
                      <div className="mt-1 line-clamp-2 text-xs text-muted-foreground" dir="auto">
                        {n.body}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 surface-card p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <Compass className="h-3 w-3" /> {t("profile.recommendedLabel")}
          </div>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">{t("profile.loading")}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              {(data?.recommended ?? []).map((e) => (
                <Link
                  key={e.slug}
                  to="/learn/$kind/$slug"
                  params={{ kind: e.kind, slug: e.slug }}
                  className="rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40"
                >
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {t(`search.kind${e.kind.charAt(0).toUpperCase()}${e.kind.slice(1)}` as const)}
                  </div>
                  <div className="mt-1 font-semibold text-foreground">
                    {pickLocale(e.title_i18n, locale)}
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {pickLocale(e.summary_i18n, locale)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="surface-card flex flex-col gap-1 p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
    </div>
  );
}
