import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export interface FavoriteAyah {
  surah: number;
  ayah: number;
  surahName: string;
  arabic: string;
  hebrew: string;
  addedAt: number;
}

interface BookmarkRow {
  surah: number;
  ayah: number;
  surah_name: string | null;
  arabic_snapshot: string | null;
  hebrew_snapshot: string | null;
  created_at: string;
}

function rowToFav(r: BookmarkRow): FavoriteAyah {
  return {
    surah: r.surah,
    ayah: r.ayah,
    surahName: r.surah_name ?? "",
    arabic: r.arabic_snapshot ?? "",
    hebrew: r.hebrew_snapshot ?? "",
    addedAt: new Date(r.created_at).getTime(),
  };
}

/**
 * Cloud-backed bookmarks (replaces the previous localStorage version).
 * When the user is not signed in, `items` is empty and `toggle` triggers
 * a redirect to /auth.
 */
export function useFavorites() {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<FavoriteAyah[]>([]);

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    const { data, error } = await supabase
      .from("bookmarks")
      .select("surah, ayah, surah_name, arabic_snapshot, hebrew_snapshot, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setItems((data as BookmarkRow[]).map(rowToFav));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFav = useCallback((s: number, a: number) => items.some((i) => i.surah === s && i.ayah === a), [items]);

  const toggle = useCallback(
    async (entry: Omit<FavoriteAyah, "addedAt">) => {
      if (!user) {
        if (typeof window !== "undefined") {
          const redirect = encodeURIComponent(window.location.pathname + window.location.hash);
          window.location.href = `/auth?redirect=${redirect}`;
        }
        return;
      }
      const exists = items.some((i) => i.surah === entry.surah && i.ayah === entry.ayah);
      if (exists) {
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("surah", entry.surah)
          .eq("ayah", entry.ayah);
        setItems((prev) => prev.filter((i) => !(i.surah === entry.surah && i.ayah === entry.ayah)));
      } else {
        const optimistic: FavoriteAyah = { ...entry, addedAt: Date.now() };
        setItems((prev) => [optimistic, ...prev]);
        await supabase.from("bookmarks").insert({
          user_id: user.id,
          surah: entry.surah,
          ayah: entry.ayah,
          surah_name: entry.surahName,
          arabic_snapshot: entry.arabic,
          hebrew_snapshot: entry.hebrew,
        });
      }
    },
    [items, user],
  );

  const remove = useCallback(
    async (s: number, a: number) => {
      if (!user) return;
      await supabase.from("bookmarks").delete().eq("user_id", user.id).eq("surah", s).eq("ayah", a);
      setItems((prev) => prev.filter((i) => !(i.surah === s && i.ayah === a)));
    },
    [user],
  );

  return { items, isFav, toggle, remove, isAuthenticated };
}
