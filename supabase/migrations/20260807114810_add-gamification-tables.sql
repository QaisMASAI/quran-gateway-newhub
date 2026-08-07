-- Migration: Add Gamification Engine 2.0, Learning Analytics, and Classroom Engine Tables
-- File: /supabase/migrations/20260807114810_add-gamification-tables.sql
-- Description: Creates relational database tables for user gamification, achievements, daily challenges, learning events, quiz submissions, topic progress, and learning worlds with full RLS security and index optimizations.

-- ==========================================
-- 1. USER GAMIFICATION TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  prestige INTEGER NOT NULL DEFAULT 0,
  current_streak_days INTEGER NOT NULL DEFAULT 0,
  longest_streak_days INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  learning_style TEXT CHECK (learning_style IN ('visual', 'kinesthetic', 'reading')),
  difficulty_preference TEXT CHECK (difficulty_preference IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_user_gamification_user_id UNIQUE(user_id)
);

-- ==========================================
-- 2. USER ACHIEVEMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  badge TEXT,
  rarity TEXT CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  type TEXT CHECK (type IN ('skill', 'habit', 'challenge', 'social', 'discovery')),
  progress INTEGER DEFAULT 0,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  xp_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_user_achievements UNIQUE(user_id, achievement_id)
);

-- ==========================================
-- 3. LEARNING EVENTS TABLE (ANALYTICS)
-- ==========================================
CREATE TABLE IF NOT EXISTS learning_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'verse_read', 'quiz_completed', 'achievement_unlocked', 
    'tafsir_studied', 'hadith_analyzed', 'social_praise'
  )),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration_seconds INTEGER DEFAULT 0,
  topic_id TEXT,
  accuracy DECIMAL(5,2) CHECK (accuracy >= 0 AND accuracy <= 100),
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
  xp_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 4. DAILY CHALLENGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  duration_minutes INTEGER,
  xp_reward INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  claimed BOOLEAN DEFAULT FALSE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_daily_challenges UNIQUE(user_id, challenge_id)
);

-- ==========================================
-- 5. LEARNING WORLDS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS learning_worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  world_id TEXT NOT NULL,
  progress_percentage DECIMAL(5,2) CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_learning_worlds UNIQUE(user_id, world_id)
);

-- ==========================================
-- 6. QUIZ SUBMISSIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS quiz_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id TEXT NOT NULL,
  topic_id TEXT,
  score DECIMAL(5,2),
  correct_answers INTEGER,
  total_questions INTEGER,
  time_spent_seconds INTEGER,
  difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 10),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- 7. USER TOPIC PROGRESS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS user_topic_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id TEXT NOT NULL,
  mastery_percentage DECIMAL(5,2) CHECK (mastery_percentage >= 0 AND mastery_percentage <= 100),
  quizzes_taken INTEGER DEFAULT 0,
  time_spent_hours DECIMAL(8,2) DEFAULT 0,
  last_studied TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT uq_user_topic_progress UNIQUE(user_id, topic_id)
);

-- ==========================================
-- 8. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_user_id ON learning_events(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_events_timestamp ON learning_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_learning_events_event_type ON learning_events(event_type);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_user_id ON daily_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_worlds_user_id ON learning_worlds(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_submissions_user_id ON quiz_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_topic_progress_user_id ON user_topic_progress(user_id);

-- ==========================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topic_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_gamification
CREATE POLICY "user_gamification_select" ON user_gamification
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "user_gamification_insert" ON user_gamification
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_gamification_update" ON user_gamification
  FOR UPDATE USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

-- RLS Policies for user_achievements
CREATE POLICY "user_achievements_select" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "user_achievements_insert" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_achievements_update" ON user_achievements
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for learning_events
CREATE POLICY "learning_events_select" ON learning_events
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "learning_events_insert" ON learning_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily_challenges
CREATE POLICY "daily_challenges_select" ON daily_challenges
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "daily_challenges_insert" ON daily_challenges
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "daily_challenges_update" ON daily_challenges
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for learning_worlds
CREATE POLICY "learning_worlds_select" ON learning_worlds
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "learning_worlds_insert" ON learning_worlds
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "learning_worlds_update" ON learning_worlds
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for quiz_submissions
CREATE POLICY "quiz_submissions_select" ON quiz_submissions
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "quiz_submissions_insert" ON quiz_submissions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_topic_progress
CREATE POLICY "user_topic_progress_select" ON user_topic_progress
  FOR SELECT USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "user_topic_progress_insert" ON user_topic_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_topic_progress_update" ON user_topic_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- 10. AUTOMATED UPDATED_AT TRIGGERS
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_gamification_updated_at ON user_gamification;
CREATE TRIGGER update_user_gamification_updated_at
BEFORE UPDATE ON user_gamification
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_learning_worlds_updated_at ON learning_worlds;
CREATE TRIGGER update_learning_worlds_updated_at
BEFORE UPDATE ON learning_worlds
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_topic_progress_updated_at ON user_topic_progress;
CREATE TRIGGER update_user_topic_progress_updated_at
BEFORE UPDATE ON user_topic_progress
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
