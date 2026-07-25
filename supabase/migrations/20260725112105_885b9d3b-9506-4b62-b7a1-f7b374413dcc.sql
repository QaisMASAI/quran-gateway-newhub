
CREATE TABLE public.kids_progress (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  rewards jsonb NOT NULL DEFAULT '{"stars":0,"unlocked":[],"spent":0}'::jsonb,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  activity_log jsonb NOT NULL DEFAULT '[]'::jsonb,
  parent_pin_hash text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kids_progress TO authenticated;
GRANT ALL ON public.kids_progress TO service_role;
ALTER TABLE public.kids_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kids_progress own select" ON public.kids_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "kids_progress own insert" ON public.kids_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kids_progress own update" ON public.kids_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "kids_progress own delete" ON public.kids_progress FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.kids_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  age_group text NOT NULL CHECK (age_group IN ('kids','young')),
  difficulty smallint NOT NULL DEFAULT 1 CHECK (difficulty BETWEEN 1 AND 3),
  question text NOT NULL,
  options jsonb NOT NULL,
  answer_index smallint NOT NULL,
  hint text,
  related_ref text,
  language_code text NOT NULL DEFAULT 'en',
  published boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX kids_questions_cat_age_idx ON public.kids_questions (category, age_group, published);
GRANT SELECT ON public.kids_questions TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.kids_questions TO authenticated;
GRANT ALL ON public.kids_questions TO service_role;
ALTER TABLE public.kids_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kids_questions public read" ON public.kids_questions FOR SELECT TO anon, authenticated USING (published = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "kids_questions admin insert" ON public.kids_questions FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "kids_questions admin update" ON public.kids_questions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "kids_questions admin delete" ON public.kids_questions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
