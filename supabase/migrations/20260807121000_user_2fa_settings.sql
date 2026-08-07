-- Migration: Create user_2fa_settings table for TOTP Two-Factor Authentication

CREATE TABLE IF NOT EXISTS public.user_2fa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT false,
  secret TEXT,
  backup_codes TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT user_2fa_settings_user_id_key UNIQUE (user_id)
);

-- RLS Policies
ALTER TABLE public.user_2fa_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own 2FA settings"
  ON public.user_2fa_settings
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 2FA settings"
  ON public.user_2fa_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own 2FA settings"
  ON public.user_2fa_settings
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own 2FA settings"
  ON public.user_2fa_settings
  FOR DELETE
  USING (auth.uid() = user_id);
