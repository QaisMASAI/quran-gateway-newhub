import { supabase } from "@/integrations/supabase/client";

export async function trackLearningEvent(
  eventType: "verse_read" | "quiz_completed" | "achievement_unlocked" | "tafsir_studied",
  metadata: {
    userId: string;
    topicId?: string;
    accuracy?: number;
    durationSeconds: number;
    difficulty?: number;
    xpEarned: number;
  }
) {
  if (!metadata.userId) return;

  // Fire and forget - don't block UI
  const { error } = await supabase.from("learning_events").insert({
    user_id: metadata.userId,
    event_type: eventType,
    timestamp: new Date().toISOString(),
    duration_seconds: Math.round(metadata.durationSeconds || 1),
    topic_id: metadata.topicId,
    accuracy: metadata.accuracy,
    difficulty: metadata.difficulty,
    xp_earned: metadata.xpEarned,
  });

  if (error) {
    console.error("Failed to track event:", error);
  }
}
