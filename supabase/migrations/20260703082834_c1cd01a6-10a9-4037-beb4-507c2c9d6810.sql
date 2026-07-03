REVOKE ALL ON FUNCTION public.claim_next_translation_job(text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_next_embedding_job(text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.log_knowledge_job_event(text, uuid, public.knowledge_job_status, text, text, jsonb, uuid) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_next_translation_job(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.claim_next_embedding_job(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.log_knowledge_job_event(text, uuid, public.knowledge_job_status, text, text, jsonb, uuid) TO service_role;