import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface ReadingProgress {
  surah: number;
  ayah: number;
  lastReadAt: number;
}

const LOCAL_KEY = "qc:reading-progress";

function readLocalProgress(): ReadingProgress | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReadingProgress;
    if (!parsed?.surah || !parsed?.ayah) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLocalProgress(progress: ReadingProgress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(progress));
  } catch {
    // ignore local storage write failures
  }
}

export function useReadingProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ReadingProgress | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setProgress(readLocalProgress());
      return;
    }
    supabase
      .from("reading_progress")
      .select("surah, ayah, last_read_at")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setProgress({
          surah: data.surah as number,
          ayah: data.ayah as number,
          lastReadAt: new Date(data.last_read_at as string).getTime(),
        });
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const record = useCallback(
    async (surah: number, ayah: number) => {
      const next: ReadingProgress = { surah, ayah, lastReadAt: Date.now() };
      setProgress(next);
      writeLocalProgress(next);
      if (!user) return;
      await supabase
        .from("reading_progress")
        .upsert(
          { user_id: user.id, surah, ayah, last_read_at: new Date().toISOString() },
          { onConflict: "user_id" },
        );
    },
    [user],
  );

  return { progress, record };
}
