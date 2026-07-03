CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level > 0),
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.roles TO authenticated;
GRANT ALL ON public.roles TO service_role;

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read roles" ON public.roles;
CREATE POLICY "Authenticated can read roles"
ON public.roles
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Super admins can manage roles" ON public.roles;
CREATE POLICY "Super admins can manage roles"
ON public.roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read permissions" ON public.permissions;
CREATE POLICY "Authenticated can read permissions"
ON public.permissions
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Super admins can manage permissions" ON public.permissions;
CREATE POLICY "Super admins can manage permissions"
ON public.permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission_id)
);

GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read role permissions" ON public.role_permissions;
CREATE POLICY "Authenticated can read role permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Super admins can manage role permissions" ON public.role_permissions;
CREATE POLICY "Super admins can manage role permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE IF NOT EXISTS public.admin_account_status (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_suspended BOOLEAN NOT NULL DEFAULT false,
  reason TEXT,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_account_status TO authenticated;
GRANT ALL ON public.admin_account_status TO service_role;

ALTER TABLE public.admin_account_status ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own account status" ON public.admin_account_status;
CREATE POLICY "Users can read own account status"
ON public.admin_account_status
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'super_admin'));

DROP POLICY IF EXISTS "Super admins can manage account status" ON public.admin_account_status;
CREATE POLICY "Super admins can manage account status"
ON public.admin_account_status
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_audit_log TO authenticated;
GRANT ALL ON public.admin_audit_log TO service_role;

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can read audit log" ON public.admin_audit_log;
CREATE POLICY "Super admins can read audit log"
ON public.admin_audit_log
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'));

CREATE INDEX IF NOT EXISTS idx_roles_slug ON public.roles(slug);
CREATE INDEX IF NOT EXISTS idx_roles_level ON public.roles(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_actor_created ON public.admin_audit_log(actor_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_target_created ON public.admin_audit_log(target_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_created ON public.admin_audit_log(created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tg_roles_updated_at'
  ) THEN
    CREATE TRIGGER tg_roles_updated_at
    BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tg_permissions_updated_at'
  ) THEN
    CREATE TRIGGER tg_permissions_updated_at
    BEFORE UPDATE ON public.permissions
    FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'tg_admin_account_status_updated_at'
  ) THEN
    CREATE TRIGGER tg_admin_account_status_updated_at
    BEFORE UPDATE ON public.admin_account_status
    FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
  END IF;
END $$;

INSERT INTO public.roles (slug, name, level, is_system)
VALUES
  ('super_admin', 'Super Admin', 500, true),
  ('admin', 'Admin', 400, true),
  ('moderator', 'Moderator', 300, true),
  ('editor', 'Editor', 200, true),
  ('user', 'User', 100, true)
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name,
    level = EXCLUDED.level,
    is_system = EXCLUDED.is_system,
    updated_at = now();

INSERT INTO public.permissions (code, description)
VALUES
  ('users.read', 'Read users and profile metadata'),
  ('users.write', 'Create or update users roles and status'),
  ('users.delete', 'Delete user records when allowed'),
  ('content.publish', 'Publish content'),
  ('content.edit', 'Edit content'),
  ('content.delete', 'Delete content'),
  ('tafsir.manage', 'Manage tafsir workflows and data'),
  ('hadith.manage', 'Manage hadith workflows and data'),
  ('translations.manage', 'Manage translation workflows and data'),
  ('api.manage', 'Manage API integrations and keys'),
  ('settings.manage', 'Manage system settings'),
  ('analytics.view', 'View analytics'),
  ('logs.view', 'View operational logs')
ON CONFLICT (code) DO UPDATE
SET description = EXCLUDED.description,
    updated_at = now();

WITH role_perm_map AS (
  SELECT * FROM (VALUES
    ('super_admin', 'users.read'),
    ('super_admin', 'users.write'),
    ('super_admin', 'users.delete'),
    ('super_admin', 'content.publish'),
    ('super_admin', 'content.edit'),
    ('super_admin', 'content.delete'),
    ('super_admin', 'tafsir.manage'),
    ('super_admin', 'hadith.manage'),
    ('super_admin', 'translations.manage'),
    ('super_admin', 'api.manage'),
    ('super_admin', 'settings.manage'),
    ('super_admin', 'analytics.view'),
    ('super_admin', 'logs.view'),
    ('admin', 'users.read'),
    ('admin', 'users.write'),
    ('admin', 'content.publish'),
    ('admin', 'content.edit'),
    ('admin', 'content.delete'),
    ('admin', 'tafsir.manage'),
    ('admin', 'hadith.manage'),
    ('admin', 'translations.manage'),
    ('admin', 'analytics.view'),
    ('admin', 'logs.view'),
    ('moderator', 'users.read'),
    ('moderator', 'content.edit'),
    ('moderator', 'content.delete'),
    ('moderator', 'analytics.view'),
    ('editor', 'content.publish'),
    ('editor', 'content.edit'),
    ('user', 'analytics.view')
  ) AS t(role_slug, permission_code)
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM role_perm_map m
JOIN public.roles r ON r.slug = m.role_slug
JOIN public.permissions p ON p.code = m.permission_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.role_level(_role public.app_role)
RETURNS integer
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE _role
    WHEN 'super_admin'::public.app_role THEN 500
    WHEN 'admin'::public.app_role THEN 400
    WHEN 'moderator'::public.app_role THEN 300
    WHEN 'editor'::public.app_role THEN 200
    WHEN 'user'::public.app_role THEN 100
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role(_user_id uuid)
RETURNS public.app_role
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT ur.role
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
  ORDER BY public.role_level(ur.role) DESC
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.has_permission(_user_id uuid, _permission_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.roles assigned_role ON assigned_role.slug = ur.role::text
    JOIN public.role_permissions rp ON true
    JOIN public.roles granted_role ON granted_role.id = rp.role_id
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = _user_id
      AND assigned_role.level >= granted_role.level
      AND p.code = _permission_code
  );
$$;

CREATE OR REPLACE FUNCTION public.can_user(_user_id uuid, _permission_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT public.has_permission(_user_id, _permission_code);
$$;

CREATE OR REPLACE FUNCTION public.claim_or_sync_super_admin_by_email(_user_id uuid, _email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_id IS NULL OR COALESCE(trim(_email), '') = '' THEN
    RETURN false;
  END IF;

  IF lower(trim(_email)) <> 'rismohammad@gmail.com' THEN
    RETURN false;
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('super_admin_bootstrap_lock'));

  DELETE FROM public.user_roles
  WHERE role = 'super_admin'::public.app_role
    AND user_id <> _user_id;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'super_admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(MAX(public.role_level(ur.role)), 0) >= public.role_level(_role)
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id;
$$;

REVOKE EXECUTE ON FUNCTION public.role_level(public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_current_user_role(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_permission(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.can_user(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_or_sync_super_admin_by_email(uuid, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.claim_or_sync_super_admin_by_email(uuid, text) FROM authenticated;

GRANT EXECUTE ON FUNCTION public.role_level(public.app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_user(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_or_sync_super_admin_by_email(uuid, text) TO service_role;

INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'user'::public.app_role
FROM public.profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur WHERE ur.user_id = p.id
)
ON CONFLICT (user_id, role) DO NOTHING;