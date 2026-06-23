// Reading plan progress — cloud-backed when signed in, localStorage otherwise.
// On sign-in we migrate any local progress up to the cloud so the user keeps
// what they already marked off on this device.

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

const KEY = "noor.reading-plan-progress.v1";
const MIGRATED_KEY = "noor.reading-plan-progress.migrated.v1";

type ProgressMap = Record<string, number[]>;

function readLocal(): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function writeLocal(map: ProgressMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(map));
    window.dispatchEvent(new Event("noor:plan-progress"));
  } catch {
    /* ignore */
  }
}

// ---- One-time migration of local progress to cloud on first sign-in ----
async function migrateLocalToCloud(userId: string) {
  if (typeof window === "undefined") return;
  const flag = `${MIGRATED_KEY}:${userId}`;
  if (window.localStorage.getItem(flag)) return;
  const local = readLocal();
  const rows: { user_id: string; plan_slug: string; day: number }[] = [];
  for (const [slug, days] of Object.entries(local)) {
    for (const day of days) rows.push({ user_id: userId, plan_slug: slug, day });
  }
  if (rows.length > 0) {
    // Insert ignoring conflicts (PK already exists from earlier session).
    await supabase.from("reading_plan_progress").upsert(rows, {
      onConflict: "user_id,plan_slug,day",
      ignoreDuplicates: true,
    });
  }
  try {
    window.localStorage.setItem(flag, "1");
  } catch {
    /* ignore */
  }
}

// ---- Per-plan hook used by the plan page ----
export function usePlanProgress(slug: string) {
  const { user } = useAuth();
  const [done, setDone] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setDone(readLocal()[slug] ?? []);
      return;
    }
    setLoading(true);
    await migrateLocalToCloud(user.id);
    const { data } = await supabase
      .from("reading_plan_progress")
      .select("day")
      .eq("user_id", user.id)
      .eq("plan_slug", slug);
    if (data) setDone((data as { day: number }[]).map((r) => r.day).sort((a, b) => a - b));
    setLoading(false);
  }, [user, slug]);

  useEffect(() => {
    refresh();
    const onLocal = () => {
      if (!user) setDone(readLocal()[slug] ?? []);
    };
    window.addEventListener("noor:plan-progress", onLocal);
    return () => window.removeEventListener("noor:plan-progress", onLocal);
  }, [refresh, user, slug]);

  const toggle = useCallback(
    async (day: number) => {
      const isDone = done.includes(day);
      // optimistic update
      setDone((prev) =>
        isDone ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b),
      );

      if (user) {
        if (isDone) {
          await supabase
            .from("reading_plan_progress")
            .delete()
            .eq("user_id", user.id)
            .eq("plan_slug", slug)
            .eq("day", day);
        } else {
          await supabase
            .from("reading_plan_progress")
            .upsert(
              { user_id: user.id, plan_slug: slug, day },
              { onConflict: "user_id,plan_slug,day", ignoreDuplicates: true },
            );
        }
      } else {
        const map = readLocal();
        const cur = new Set(map[slug] ?? []);
        if (isDone) cur.delete(day);
        else cur.add(day);
        map[slug] = Array.from(cur).sort((a, b) => a - b);
        writeLocal(map);
      }
    },
    [user, slug, done],
  );

  const reset = useCallback(async () => {
    setDone([]);
    if (user) {
      await supabase
        .from("reading_plan_progress")
        .delete()
        .eq("user_id", user.id)
        .eq("plan_slug", slug);
    } else {
      const map = readLocal();
      delete map[slug];
      writeLocal(map);
    }
  }, [user, slug]);

  return { done, loading, toggle, reset, isAuthenticated: !!user };
}
