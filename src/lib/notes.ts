import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface AyahNote {
  id: string;
  body: string;
  updatedAt: number;
}

export function useAyahNote(surah: number, ayah: number) {
  const { user } = useAuth();
  const [note, setNote] = useState<AyahNote | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setNote(null);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("notes")
      .select("id, body, updated_at")
      .eq("user_id", user.id)
      .eq("surah", surah)
      .eq("ayah", ayah)
      .maybeSingle();
    if (data) {
      setNote({
        id: data.id as string,
        body: data.body as string,
        updatedAt: new Date(data.updated_at as string).getTime(),
      });
    } else {
      setNote(null);
    }
    setLoading(false);
  }, [user, surah, ayah]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(
    async (body: string) => {
      if (!user) return;
      const trimmed = body.trim();
      if (!trimmed) {
        if (note) {
          await supabase.from("notes").delete().eq("id", note.id);
          setNote(null);
        }
        return;
      }
      if (note) {
        const { data } = await supabase
          .from("notes")
          .update({ body: trimmed })
          .eq("id", note.id)
          .select("id, body, updated_at")
          .single();
        if (data) setNote({ id: data.id as string, body: data.body as string, updatedAt: Date.now() });
      } else {
        const { data } = await supabase
          .from("notes")
          .insert({ user_id: user.id, surah, ayah, body: trimmed })
          .select("id, body, updated_at")
          .single();
        if (data) setNote({ id: data.id as string, body: data.body as string, updatedAt: Date.now() });
      }
    },
    [user, surah, ayah, note],
  );

  return { note, loading, save, isAuthenticated: !!user };
}
