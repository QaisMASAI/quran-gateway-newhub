ALTER TABLE public.kids_questions
  ADD COLUMN question_kind text NOT NULL DEFAULT 'mcq' CHECK (question_kind IN ('mcq', 'interactive')),
  ADD COLUMN expected_answer text;