// Onboarding state — works for both signed-out (localStorage) and
// signed-in (user_preferences) users. The 12 canonical interest tags are
// stable slugs we filter knowledge_entities by.

import { supabase } from "@/integrations/supabase/client";

export const INTEREST_TAGS = [
  "prophets",
  "family",
  "ethics",
  "prayer",
  "mercy",
  "justice",
  "women",
  "children",
  "spirituality",
  "history",
  "interfaith",
  "stories",
] as const;
export type InterestTag = (typeof INTEREST_TAGS)[number];

const LS_KEY = "noor:onboarding:v1";

interface LocalState {
  completed: boolean;
  interests: InterestTag[];
  skippedAt?: number;
}

export function readLocal(): LocalState {
  if (typeof window === "undefined") return { completed: false, interests: [] };
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (!raw) return { completed: false, interests: [] };
    const parsed = JSON.parse(raw) as Partial<LocalState>;
    return {
      completed: !!parsed.completed,
      interests: Array.isArray(parsed.interests) ? (parsed.interests as InterestTag[]) : [],
      skippedAt: parsed.skippedAt,
    };
  } catch {
    return { completed: false, interests: [] };
  }
}

export function writeLocal(state: LocalState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LS_KEY, JSON.stringify(state));
  } catch {
    /* ignore quota errors */
  }
}

export function hasSeenOnboarding(): boolean {
  const s = readLocal();
  return s.completed || !!s.skippedAt;
}

export async function saveOnboarding(interests: InterestTag[]) {
  writeLocal({ completed: true, interests });
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  await supabase.from("user_preferences").upsert(
    {
      user_id: uid,
      interests,
      onboarded_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
}

export async function skipOnboarding() {
  writeLocal({ completed: false, interests: [], skippedAt: Date.now() });
}
