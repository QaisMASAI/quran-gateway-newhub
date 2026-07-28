import { useCallback, useEffect, useMemo, useState } from "react";
import type { EntityKind } from "@/lib/knowledge";

const RECENT_VIEWS_KEY = "noor:recent-views:v1";
const RECENT_VIEWS_LIMIT = 10;

type BaseView = {
  label: string;
  subtitle?: string;
  at: number;
};

export type RecentView =
  | (BaseView & { kind: "surah"; surah: number; ayah?: number })
  | (BaseView & { kind: "entity"; entityKind: EntityKind; slug: string })
  | (BaseView & { kind: "hadith"; collection: string; num: number });

type RecentViewInput = Omit<RecentView, "at">;

function getId(view: RecentViewInput | RecentView): string {
  if (view.kind === "surah") return `surah:${view.surah}:${view.ayah ?? ""}`;
  if (view.kind === "entity") return `entity:${view.entityKind}:${view.slug}`;
  return `hadith:${view.collection}:${view.num}`;
}

function readRecentViews(): RecentView[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_VIEWS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is RecentView => !!v && typeof v === "object");
  } catch {
    return [];
  }
}

function writeRecentViews(items: RecentView[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_VIEWS_KEY, JSON.stringify(items));
  } catch {
    // ignore local storage failures
  }
}

export function useRecentlyViewed(current?: RecentViewInput) {
  const [items, setItems] = useState<RecentView[]>([]);

  useEffect(() => {
    setItems(readRecentViews());
  }, []);

  const add = useCallback((view: RecentViewInput) => {
    const nextView: RecentView = { ...view, at: Date.now() } as RecentView;
    setItems((prev) => {
      const id = getId(nextView);
      const next = [nextView, ...prev.filter((item) => getId(item) !== id)].slice(0, RECENT_VIEWS_LIMIT);
      writeRecentViews(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!current) return;
    add(current);
  }, [add, current]);

  const sorted = useMemo(() => [...items].sort((a, b) => b.at - a.at), [items]);

  return { items: sorted, add };
}
