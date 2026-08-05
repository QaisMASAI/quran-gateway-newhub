/**
 * Gamification Backend API Architecture & Database Schema Specification
 * Designed for Cross-Platform Compatibility (Web, Android, iOS)
 * Powered by PostgreSQL / Supabase with API-Driven Event Architecture
 */

export interface DatabaseTablesSpec {
  /**
   * Core User Gamification State
   * Table: user_gamification_profiles
   */
  user_gamification_profiles: {
    user_id: string; // UUID references auth.users(id)
    xp_total: number;
    current_level: number; // 1 to 100
    current_streak: number;
    longest_streak: number;
    streak_freeze_count: number;
    vacation_mode_active: boolean;
    vacation_end_date: string | null;
    last_active_date: string; // ISO Date YYYY-MM-DD
    last_active_timestamp: string; // ISO Timestamp
    hearts_remaining: number; // Max 5
    last_heart_refill: string;
    selected_title: string;
    selected_theme: string;
    preferred_locale: "ar" | "en" | "he";
    created_at: string;
    updated_at: string;
  };

  /**
   * XP Ledger Transactions for Auditability & Anti-Abuse
   * Table: xp_transactions
   */
  xp_transactions: {
    id: string; // UUID
    user_id: string;
    amount: number;
    source_type:
      | "verse_read"
      | "tafsir_study"
      | "hadith_research"
      | "ai_inquiry"
      | "quiz_complete"
      | "quest_checkpoint"
      | "daily_mission"
      | "weekly_challenge"
      | "reflection_journal"
      | "spaced_repetition";
    source_id: string; // ID of the verse, quiz, quest, or mission
    idempotency_key: string; // Anti-duplicate reward hash
    metadata: Record<string, unknown>;
    created_at: string;
  };

  /**
   * User Achievements Ledger
   * Table: user_achievements
   */
  user_achievements: {
    user_id: string;
    achievement_id: string;
    unlocked_at: string;
    progress_value: number;
    claimed_reward: boolean;
  };

  /**
   * User Quest Progress
   * Table: user_quests
   */
  user_quests: {
    user_id: string;
    quest_id: string;
    status: "not_started" | "in_progress" | "completed";
    current_checkpoint_index: number;
    completed_checkpoints: string[];
    certificate_url: string | null;
    completed_at: string | null;
    updated_at: string;
  };

  /**
   * Daily Dynamic Missions
   * Table: user_daily_missions
   */
  user_daily_missions: {
    id: string;
    user_id: string;
    mission_id: string;
    mission_date: string; // YYYY-MM-DD
    current_progress: number;
    target_goal: number;
    completed: boolean;
    claimed_xp: boolean;
    expires_at: string;
  };

  /**
   * Private Reflections Journal
   * Table: user_reflections
   */
  user_reflections: {
    id: string;
    user_id: string;
    reference_type: "surah_ayah" | "hadith" | "topic" | "prophet";
    reference_id: string;
    content_ciphertext: string; // Encrypted private user notes
    tags: string[];
    is_private: boolean; // Always true by default
    created_at: string;
    updated_at: string;
  };

  /**
   * Collaborative Study Circles (Non-Competitive Groups)
   * Table: study_circles
   */
  study_circles: {
    id: string;
    name: string;
    description: string;
    created_by: string;
    circle_code: string; // Invite code
    collaborative_goal: string;
    target_xp: number;
    current_xp: number;
    member_count: number;
    is_private: boolean;
    created_at: string;
  };
}

/**
 * REST & GraphQL API Endpoints Architecture
 */
export const GAMIFICATION_API_ROUTES = {
  // GET User Gamification Summary
  GET_PROFILE: "/api/v1/gamification/profile",

  // POST XP Action Event (Validated on Server)
  AWARD_XP: "/api/v1/gamification/award-xp",

  // GET Daily Missions & Claim
  GET_DAILY_MISSIONS: "/api/v1/gamification/missions/daily",
  CLAIM_MISSION_REWARD: "/api/v1/gamification/missions/claim",

  // GET Quest Catalog & Progress
  GET_QUESTS: "/api/v1/gamification/quests",
  UPDATE_QUEST_CHECKPOINT: "/api/v1/gamification/quests/checkpoint",

  // GET 300+ Achievements Catalog & Status
  GET_ACHIEVEMENTS: "/api/v1/gamification/achievements",

  // STREAK Protection & Vacation Mode
  TOGGLE_VACATION_MODE: "/api/v1/gamification/streak/vacation",
  BUY_STREAK_FREEZE: "/api/v1/gamification/streak/freeze/buy",
  RECOVER_LOST_STREAK: "/api/v1/gamification/streak/recover",

  // PRIVATE REFLECTION JOURNAL
  SAVE_REFLECTION: "/api/v1/gamification/reflections/save",
  GET_REFLECTIONS: "/api/v1/gamification/reflections/list",

  // STUDY CIRCLES (Collaborative)
  GET_CIRCLES: "/api/v1/gamification/circles/list",
  CREATE_CIRCLE: "/api/v1/gamification/circles/create",
  JOIN_CIRCLE: "/api/v1/gamification/circles/join",
  SEND_BARAKAH_DUA: "/api/v1/gamification/circles/send-dua",

  // CROSS-PLATFORM MOBILE SYNC
  SYNC_OFFLINE_EVENTS: "/api/v1/gamification/sync-offline",
};

/**
 * Event-Driven Push Notification Triggers (Web & Mobile Push)
 */
export interface PushNotificationSpec {
  event_type:
    | "streak_reminder"
    | "daily_mission_complete"
    | "level_up"
    | "quest_unlocked"
    | "spaced_repetition_due"
    | "ramadan_special_mission";
  title_ar: string;
  title_en: string;
  title_he: string;
  body_ar: string;
  body_en: string;
  body_he: string;
  payload: Record<string, string>;
}
