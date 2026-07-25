CREATE TABLE public.kids_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 80),
  avatar_emoji text NOT NULL DEFAULT '🧒',
  age_group text NOT NULL DEFAULT 'kids' CHECK (age_group IN ('kids', 'young')),
  difficulty_limit smallint NOT NULL DEFAULT 3 CHECK (difficulty_limit BETWEEN 1 AND 3),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX kids_profiles_user_active_idx ON public.kids_profiles (user_id, is_active, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kids_profiles TO authenticated;
GRANT ALL ON public.kids_profiles TO service_role;
ALTER TABLE public.kids_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kids_profiles own select" ON public.kids_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "kids_profiles own insert" ON public.kids_profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kids_profiles own update" ON public.kids_profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kids_profiles own delete" ON public.kids_profiles
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.kids_profile_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES public.kids_profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  rewards jsonb NOT NULL DEFAULT '{"stars":0,"unlocked":[],"spent":0}'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  activity_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  parent_pin_hash text,
  parent_pin_recovery_hash text,
  offline_sync_version bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX kids_profile_progress_user_idx ON public.kids_profile_progress (user_id, updated_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kids_profile_progress TO authenticated;
GRANT ALL ON public.kids_profile_progress TO service_role;
ALTER TABLE public.kids_profile_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kids_profile_progress own select" ON public.kids_profile_progress
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.kids_profiles p
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "kids_profile_progress own insert" ON public.kids_profile_progress
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.kids_profiles p
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "kids_profile_progress own update" ON public.kids_profile_progress
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.kids_profiles p
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.kids_profiles p
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "kids_profile_progress own delete" ON public.kids_profile_progress
  FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.kids_profiles p
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
  );

CREATE TABLE public.kids_pin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.kids_profiles(id) ON DELETE CASCADE,
  attempt_type text NOT NULL CHECK (attempt_type IN ('unlock', 'recover')),
  success boolean NOT NULL,
  failure_reason text,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX kids_pin_audit_logs_profile_time_idx ON public.kids_pin_audit_logs (profile_id, created_at DESC);
CREATE INDEX kids_pin_audit_logs_user_time_idx ON public.kids_pin_audit_logs (user_id, created_at DESC);
GRANT SELECT, INSERT ON public.kids_pin_audit_logs TO authenticated;
GRANT ALL ON public.kids_pin_audit_logs TO service_role;
ALTER TABLE public.kids_pin_audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kids_pin_audit_logs own select" ON public.kids_pin_audit_logs
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.kids_profiles p
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
  );
CREATE POLICY "kids_pin_audit_logs own insert" ON public.kids_pin_audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.kids_profiles p
      WHERE p.id = profile_id AND p.user_id = auth.uid()
    )
  );