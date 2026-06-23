
DROP POLICY IF EXISTS "anyone can log query" ON public.ai_research_queries;
CREATE POLICY "log own or anon query" ON public.ai_research_queries
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NULL AND user_id IS NULL)
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );
