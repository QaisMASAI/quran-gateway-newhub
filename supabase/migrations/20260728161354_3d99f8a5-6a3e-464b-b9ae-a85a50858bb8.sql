ALTER TABLE public.kids_profile_progress DROP COLUMN IF EXISTS parent_pin_hash;
ALTER TABLE public.kids_profile_progress DROP COLUMN IF EXISTS parent_pin_recovery_hash;
ALTER TABLE public.kids_progress DROP COLUMN IF EXISTS parent_pin_hash;