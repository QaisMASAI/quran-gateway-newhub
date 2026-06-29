DROP POLICY IF EXISTS "Authenticated can read admin runtime settings" ON public.admin_runtime_settings;
DROP POLICY IF EXISTS "Authenticated can insert admin runtime settings" ON public.admin_runtime_settings;
DROP POLICY IF EXISTS "Authenticated can update admin runtime settings" ON public.admin_runtime_settings;

CREATE POLICY "Users can read own or shared admin runtime settings"
ON public.admin_runtime_settings
FOR SELECT
TO authenticated
USING (updated_by IS NULL OR updated_by = auth.uid());

CREATE POLICY "Users can insert their own admin runtime settings"
ON public.admin_runtime_settings
FOR INSERT
TO authenticated
WITH CHECK (updated_by = auth.uid());

CREATE POLICY "Users can update their own admin runtime settings"
ON public.admin_runtime_settings
FOR UPDATE
TO authenticated
USING (updated_by = auth.uid())
WITH CHECK (updated_by = auth.uid());