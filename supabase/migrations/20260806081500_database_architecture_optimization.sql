-- =============================================================================
-- Quran Gateway Platform — Database Architecture & High-Scale Optimization Migration
-- Target Workload: 1M+ Active Users, 1B+ Monthly Verse Views
-- Engine: PostgreSQL 15+ / Supabase
-- Version: 2.0.0
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SECTION 1: EXTENSIONS & SCHEMAS
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Create dedicated audit schema for security and compliance separation
CREATE SCHEMA IF NOT EXISTS audit;
CREATE SCHEMA IF NOT EXISTS analytics;

-- -----------------------------------------------------------------------------
-- SECTION 2: AUDIT LOGGING INFRASTRUCTURE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    table_name TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'TRUNCATE')),
    record_id TEXT,
    old_data JSONB,
    new_data JSONB,
    changed_fields JSONB,
    actor_id UUID,
    client_ip INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index audit logs for rapid security investigations
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_created 
    ON audit.audit_logs (actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record 
    ON audit.audit_logs (table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at 
    ON audit.audit_logs (created_at DESC);

-- Generic Audit Trigger Function
CREATE OR REPLACE FUNCTION audit.fn_process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_record_id TEXT;
    v_old_json JSONB := NULL;
    v_new_json JSONB := NULL;
    v_changed_fields JSONB := NULL;
    v_actor_id UUID;
BEGIN
    -- Extract actor from session or record
    BEGIN
        v_actor_id := NULLIF(current_setting('app.current_user_id', true), '')::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_actor_id := NULL;
    END;

    IF (TG_OP = 'DELETE') THEN
        v_record_id := OLD.id::TEXT;
        v_old_json := to_jsonb(OLD);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_record_id := NEW.id::TEXT;
        v_old_json := to_jsonb(OLD);
        v_new_json := to_jsonb(NEW);
        
        -- Compute delta of changed fields
        SELECT jsonb_object_agg(key, value)
        INTO v_changed_fields
        FROM jsonb_each(v_new_json)
        WHERE value IS DISTINCT FROM v_old_json->key;
    ELSIF (TG_OP = 'INSERT') THEN
        v_record_id := NEW.id::TEXT;
        v_new_json := to_jsonb(NEW);
    END IF;

    INSERT INTO audit.audit_logs (
        table_name,
        action,
        record_id,
        old_data,
        new_data,
        changed_fields,
        actor_id,
        created_at
    ) VALUES (
        TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
        TG_OP,
        v_record_id,
        v_old_json,
        v_new_json,
        v_changed_fields,
        v_actor_id,
        NOW()
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- SECTION 3: CORE TABLES ENHANCEMENTS (SOFT DELETES & METADATA)
-- -----------------------------------------------------------------------------

-- Ensure profiles table has soft delete and indexing
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- User Bookmarks Table
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    surah_number INTEGER NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    verse_number INTEGER NOT NULL CHECK (verse_number >= 1),
    verse_key TEXT NOT NULL,
    folder_name TEXT DEFAULT 'General',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- User Notes Table
CREATE TABLE IF NOT EXISTS public.user_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    verse_key TEXT NOT NULL,
    surah_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    note_title TEXT,
    note_body TEXT NOT NULL,
    tags TEXT[] DEFAULT '{}',
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Active Records Views for Soft Delete Isolation
CREATE OR REPLACE VIEW public.v_active_bookmarks AS
SELECT * FROM public.user_bookmarks WHERE deleted_at IS NULL;

CREATE OR REPLACE VIEW public.v_active_notes AS
SELECT * FROM public.user_notes WHERE deleted_at IS NULL;

-- Attach Audit Triggers to Critical User Tables
DROP TRIGGER IF EXISTS trg_audit_user_bookmarks ON public.user_bookmarks;
CREATE TRIGGER trg_audit_user_bookmarks
    AFTER INSERT OR UPDATE OR DELETE ON public.user_bookmarks
    FOR EACH ROW EXECUTE FUNCTION audit.fn_process_audit_log();

DROP TRIGGER IF EXISTS trg_audit_user_notes ON public.user_notes;
CREATE TRIGGER trg_audit_user_notes
    AFTER INSERT OR UPDATE OR DELETE ON public.user_notes
    FOR EACH ROW EXECUTE FUNCTION audit.fn_process_audit_log();

-- -----------------------------------------------------------------------------
-- SECTION 4: PARTITIONED HIGH-THROUGHPUT TABLES
-- -----------------------------------------------------------------------------

-- 4.1 User Reading History Partitioned Table (RANGE Partitioned by Month)
CREATE TABLE IF NOT EXISTS public.user_reading_history_partitioned (
    id UUID NOT NULL DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    surah_number INTEGER NOT NULL,
    verse_number INTEGER NOT NULL,
    verse_key TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    session_id TEXT,
    device_type TEXT,
    read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (read_at, id, user_id)
) PARTITION BY RANGE (read_at);

-- Pre-create partitions for 2025, 2026, and 2027 quarters
CREATE TABLE IF NOT EXISTS public.user_reading_history_y2025m01_m06 
    PARTITION OF public.user_reading_history_partitioned
    FOR VALUES FROM ('2025-01-01 00:00:00+00') TO ('2025-07-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS public.user_reading_history_y2025m07_m12 
    PARTITION OF public.user_reading_history_partitioned
    FOR VALUES FROM ('2025-07-01 00:00:00+00') TO ('2026-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS public.user_reading_history_y2026m01_m06 
    PARTITION OF public.user_reading_history_partitioned
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS public.user_reading_history_y2026m07_m12 
    PARTITION OF public.user_reading_history_partitioned
    FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS public.user_reading_history_y2027m01_m06 
    PARTITION OF public.user_reading_history_partitioned
    FOR VALUES FROM ('2027-01-01 00:00:00+00') TO ('2027-07-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS public.user_reading_history_default 
    PARTITION OF public.user_reading_history_partitioned DEFAULT;

-- Partitioned Indexing
CREATE INDEX IF NOT EXISTS idx_urh_part_user_read_at 
    ON public.user_reading_history_partitioned (user_id, read_at DESC);
CREATE INDEX IF NOT EXISTS idx_urh_part_surah_verse 
    ON public.user_reading_history_partitioned (surah_number, verse_number);

-- 4.2 Search Logs Partitioned Table (RANGE Partitioned by Month)
CREATE TABLE IF NOT EXISTS analytics.search_logs_partitioned (
    id BIGSERIAL,
    user_id UUID,
    query_text TEXT NOT NULL,
    normalized_query TEXT,
    mode TEXT NOT NULL DEFAULT 'hybrid',
    results_count INTEGER NOT NULL DEFAULT 0,
    execution_time_ms INTEGER NOT NULL,
    client_ip INET,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (created_at, id)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS analytics.search_logs_y2026m01_m06 
    PARTITION OF analytics.search_logs_partitioned
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS analytics.search_logs_y2026m07_m12 
    PARTITION OF analytics.search_logs_partitioned
    FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS analytics.search_logs_default 
    PARTITION OF analytics.search_logs_partitioned DEFAULT;

CREATE INDEX IF NOT EXISTS idx_search_logs_trgm_query 
    ON analytics.search_logs_partitioned USING GIN (query_text gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_search_logs_user_created 
    ON analytics.search_logs_partitioned (user_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- SECTION 5: ADVANCED HIGH-PERFORMANCE INDEXES
-- -----------------------------------------------------------------------------

-- 5.1 Covering Indexes & Partial Indexes for User Bookmarks
CREATE UNIQUE INDEX IF NOT EXISTS idx_active_user_verse_bookmark 
    ON public.user_bookmarks (user_id, verse_key) 
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_covering_user_bookmarks_folder 
    ON public.user_bookmarks (user_id, folder_name) 
    INCLUDE (surah_number, verse_number, created_at)
    WHERE deleted_at IS NULL;

-- 5.2 GIN Trigram & Text Search Indexes for Quranic Verses
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quran_verses') THEN
        CREATE INDEX IF NOT EXISTS idx_quran_verses_trgm_uthmani 
            ON quran_verses USING GIN (text_uthmani gin_trgm_ops);
        CREATE INDEX IF NOT EXISTS idx_quran_verses_surah_verse 
            ON quran_verses (surah_number, verse_number);
    END IF;
END $$;

-- 5.3 Verse Translations Covering Index
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'verse_translations') THEN
        CREATE INDEX IF NOT EXISTS idx_covering_verse_translations_lookup 
            ON verse_translations (verse_key, language, source_code) 
            INCLUDE (translation_text);
    END IF;
END $$;

-- 5.4 Gamification & Habit Streaks Indexing
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_streaks') THEN
        CREATE INDEX IF NOT EXISTS idx_user_streaks_active_leaderboard 
            ON user_streaks (current_streak DESC, last_read_date DESC) 
            WHERE current_streak > 0;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- SECTION 6: MATERIALIZED VIEWS & CONCURRENT REFRESH
-- -----------------------------------------------------------------------------

-- 6.1 Daily Reading Aggregate Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_daily_user_reading_summary AS
SELECT 
    user_id,
    DATE_TRUNC('day', read_at)::DATE AS reading_date,
    COUNT(*) AS total_verses_read,
    COUNT(DISTINCT surah_number) AS distinct_surahs_read,
    SUM(duration_seconds) AS total_seconds_spent
FROM public.user_reading_history_partitioned
GROUP BY user_id, DATE_TRUNC('day', read_at)::DATE
WITH DATA;

-- Unique index required for CONCURRENT REFRESH
CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_daily_reading_summary_pk 
    ON analytics.mv_daily_user_reading_summary (user_id, reading_date);

-- 6.2 Global Surah Popularity Materialized View
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.mv_surah_popularity_30d AS
SELECT 
    surah_number,
    COUNT(*) AS view_count_30d,
    COUNT(DISTINCT user_id) AS unique_readers_30d,
    SUM(duration_seconds) AS total_study_seconds
FROM public.user_reading_history_partitioned
WHERE read_at >= NOW() - INTERVAL '30 days'
GROUP BY surah_number
WITH DATA;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mv_surah_pop_surah 
    ON analytics.mv_surah_popularity_30d (surah_number);

-- Stored Procedure to safely refresh all Materialized Views Concurrently
CREATE OR REPLACE PROCEDURE analytics.refresh_all_materialized_views()
LANGUAGE plpgsql AS $$
BEGIN
    RAISE NOTICE 'Starting Concurrent Refresh of Materialized Views...';
    
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_daily_user_reading_summary;
    REFRESH MATERIALIZED VIEW CONCURRENTLY analytics.mv_surah_popularity_30d;
    
    RAISE NOTICE 'Materialized Views Refreshed Successfully at %', NOW();
END;
$$;

-- -----------------------------------------------------------------------------
-- SECTION 7: DATA ARCHIVAL PROCEDURE (AUTOMATED DATA RETENTION)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION analytics.fn_archive_old_reading_history(p_cutoff_months INTEGER DEFAULT 24)
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
    v_cutoff_date TIMESTAMPTZ;
    v_archived_count INTEGER := 0;
BEGIN
    v_cutoff_date := NOW() - (p_cutoff_months || ' months')::INTERVAL;
    
    -- Log archival execution start
    RAISE NOTICE 'Archiving reading history data older than % (%)', p_cutoff_months, v_cutoff_date;
    
    -- In production, partitions older than 24 months can be DETACHED and DUMPED to S3/GCS cold storage
    -- e.g. ALTER TABLE user_reading_history_partitioned DETACH PARTITION user_reading_history_y2023...
    
    RETURN v_archived_count;
END;
$$;

-- -----------------------------------------------------------------------------
-- END OF MIGRATION
-- -----------------------------------------------------------------------------
