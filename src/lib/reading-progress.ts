import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface ReadingProgress {
  surah: number;
  ayah: number;
  lastReadAt: number;
}

export function useReadingProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ReadingProgress | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!user) {
      setProgress(null);
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
      if (!user) return;
      const next: ReadingProgress = { surah, ayah, lastReadAt: Date.now() };
      setProgress(next);
      await supabase.from("reading_progress").upsert(
        { user_id: user.id, surah, ayah, last_read_at: new Date().toISOString() },
        { onConflict: "user_id" },
      );
    },
    [user],
  );

  return { progress, record };
}
