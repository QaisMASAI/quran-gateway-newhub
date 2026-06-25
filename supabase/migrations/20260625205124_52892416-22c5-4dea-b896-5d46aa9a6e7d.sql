DROP POLICY IF EXISTS "own queries readable" ON public.ai_research_queries;
CREATE POLICY "users can read only their own query logs"
ON public.ai_research_queries
FOR SELECT
USING (auth.uid() = user_id);