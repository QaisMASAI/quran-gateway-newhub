-- Gamification Engine 2.0 Database Schema Migration
-- PostgreSQL / Supabase Schema Definition for World-Class Islamic Gamification

-- 1. Core User Gamification Table
CREATE TABLE IF NOT EXISTS public.user_gamification (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp BIGINT NOT NULL DEFAULT 0,
    xp_knowledge BIGINT NOT NULL DEFAULT 0,
    xp_mastery BIGINT NOT NULL DEFAULT 0,
    xp_consistency BIGINT NOT NULL DEFAULT 0,
    xp_challenge BIGINT NOT NULL DEFAULT 0,
    xp_social BIGINT NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 100),
    prestige INTEGER NOT NULL DEFAULT 0,
    gems INTEGER NOT NULL DEFAULT 100,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_completed_date DATE,
    streak_freeze_count INTEGER NOT NULL DEFAULT 2,
    leaderboard_rank INTEGER DEFAULT 0,
    detected_style VARCHAR(32) DEFAULT 'reading',
    difficulty_preference INTEGER DEFAULT 5,
    preferred_time_minutes INTEGER DEFAULT 15,
    recommended_next_path VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Topic Specialization Levels (1-50 per world)
CREATE TABLE IF NOT EXISTS public.user_topic_levels (
    user_id UUID REFERENCES public.user_gamification(user_id) ON DELETE CASCADE,
    world_id VARCHAR(64) NOT NULL,
    topic_level INTEGER NOT NULL DEFAULT 1 CHECK (topic_level >= 1 AND topic_level <= 50),
    progress_percent NUMERIC(5,2) DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, world_id)
);

-- 3. Achievements Catalog & User Achievements
CREATE TABLE IF NOT EXISTS public.achievements_catalog (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(256) NOT NULL,
    description TEXT NOT NULL,
    badge TEXT NOT NULL,
    rarity VARCHAR(32) NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    type VARCHAR(32) NOT NULL CHECK (type IN ('skill', 'habit', 'challenge', 'social', 'discovery')),
    prerequisite_id VARCHAR(128) REFERENCES public.achievements_catalog(id),
    reward_xp INTEGER NOT NULL DEFAULT 100,
    story_context TEXT
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
    user_id UUID REFERENCES public.user_gamification(user_id) ON DELETE CASCADE,
    achievement_id VARCHAR(128) REFERENCES public.achievements_catalog(id) ON DELETE CASCADE,
    progress NUMERIC(5,2) NOT NULL DEFAULT 0.0,
    unlocked_at TIMESTAMPTZ,
    claimed_reward BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (user_id, achievement_id)
);

-- 4. Learning Worlds & Path Progress
CREATE TABLE IF NOT EXISTS public.user_world_progress (
    user_id UUID REFERENCES public.user_gamification(user_id) ON DELETE CASCADE,
    world_id VARCHAR(64) NOT NULL,
    path_id VARCHAR(128) NOT NULL,
    progress_percent NUMERIC(5,2) DEFAULT 0.0,
    milestones_completed INTEGER DEFAULT 0,
    boss_challenge_passed BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, world_id, path_id)
);

-- 5. Daily Challenges & Claims
CREATE TABLE IF NOT EXISTS public.user_daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_gamification(user_id) ON DELETE CASCADE,
    challenge_id VARCHAR(128) NOT NULL,
    difficulty VARCHAR(16) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    xp_reward INTEGER NOT NULL,
    progress NUMERIC(5,2) DEFAULT 0.0,
    completed BOOLEAN DEFAULT FALSE,
    claimed BOOLEAN DEFAULT FALSE,
    claimed_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. XP Audit Ledger
CREATE TABLE IF NOT EXISTS public.xp_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_gamification(user_id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    category VARCHAR(32) NOT NULL,
    source_type VARCHAR(64) NOT NULL,
    source_id VARCHAR(128),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Leaderboards Cache & Praise System
CREATE TABLE IF NOT EXISTS public.leaderboard_cache (
    user_id UUID PRIMARY KEY REFERENCES public.user_gamification(user_id) ON DELETE CASCADE,
    display_name VARCHAR(128) NOT NULL,
    avatar_url TEXT,
    level INTEGER NOT NULL,
    prestige INTEGER NOT NULL,
    total_xp BIGINT NOT NULL,
    weekly_xp BIGINT NOT NULL,
    praise_count INTEGER DEFAULT 0,
    top_topic VARCHAR(64),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.praise_mentions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES public.user_gamification(user_id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.user_gamification(user_id) ON DELETE CASCADE,
    praise_message TEXT,
    social_xp_awarded INTEGER DEFAULT 25,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for lightning fast leaderboard & streak lookup
CREATE INDEX IF NOT EXISTS idx_user_gamification_total_xp ON public.user_gamification (total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_user_gamification_streak ON public.user_gamification (current_streak DESC);
CREATE INDEX IF NOT EXISTS idx_xp_ledger_user ON public.xp_ledger (user_id, created_at DESC);
