import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { AdminUserRow, AppRole, AuditLogRow, AuthzSnapshot, RoleRecord, UserAccountStatus } from "./rbac.types";

const ROLE_ORDER: AppRole[] = ["super_admin", "admin", "moderator", "editor", "user"];

const UpdateUserRoleSchema = z.object({
  targetUserId: z.string().uuid(),
  role: z.enum(["super_admin", "admin", "moderator", "editor", "user"]),
});

const SetAccountStatusSchema = z.object({
  targetUserId: z.string().uuid(),
  suspended: z.boolean(),
  reason: z.string().max(300).optional(),
});

const UpsertRoleSchema = z.object({
  slug: z.string().min(2).max(64).regex(/^[a-z0-9_]+$/),
  name: z.string().min(2).max(120),
  level: z.number().int().min(1).max(500),
});

const DeleteRoleSchema = z.object({
  roleId: z.string().uuid(),
});

const SetRolePermissionsSchema = z.object({
  roleId: z.string().uuid(),
  permissionCodes: z.array(z.string().min(3).max(120)).max(200),
});

function normalizeAppRole(value: string | null | undefined): AppRole {
  if (value === "super_admin" || value === "admin" || value === "moderator" || value === "editor" || value === "user") {
    return value;
  }
  return "user";
}

async function logAudit(args: {
  supabaseAdmin: any;
  actorUserId: string;
  targetUserId?: string | null;
  action: string;
  oldValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
}) {
  const req = getRequest();
  const ipAddress = req?.headers.get("x-forwarded-for") ?? req?.headers.get("cf-connecting-ip") ?? null;
  const userAgent = req?.headers.get("user-agent") ?? null;

  await args.supabaseAdmin.from("admin_audit_log").insert({
    actor_user_id: args.actorUserId,
    target_user_id: args.targetUserId ?? null,
    action: args.action,
    old_value: args.oldValue ?? null,
    new_value: args.newValue ?? null,
    ip_address: ipAddress,
    user_agent: userAgent,
    metadata: args.metadata ?? {},
  });
}

async function syncSuperAdminForCurrentUser(context: { supabase: any; userId: string }) {
  const [{ supabaseAdmin }, authUserRes] = await Promise.all([
    import("@/integrations/supabase/client.server"),
    context.supabase.auth.getUser(),
  ]);

  const email = authUserRes.data.user?.email ?? null;
  if (!email) return;

  await supabaseAdmin.rpc("claim_or_sync_super_admin_by_email", {
    _user_id: context.userId,
    _email: email,
  });
}

async function requireSuperAdmin(context: { supabase: any; userId: string }) {
  await syncSuperAdminForCurrentUser(context);
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "super_admin",
  });
  if (error) throw new Error(error.message);
  if (data !== true) throw new Error("Forbidden: super admin access required");
}

async function readAuthzSnapshot(context: { supabase: any; userId: string }): Promise<AuthzSnapshot> {
  await syncSuperAdminForCurrentUser(context);

  const [authUserRes, roleRes, permsRes, statusRes] = await Promise.all([
    context.supabase.auth.getUser(),
    context.supabase.rpc("get_current_user_role", { _user_id: context.userId }),
    context.supabase
      .from("user_roles")
      .select("role,roles!inner(level),roles!inner(role_permissions(permission_id,permissions(code)))")
      .eq("user_id", context.userId),
    context.supabase.from("admin_account_status").select("is_suspended").eq("user_id", context.userId).maybeSingle(),
  ]);

  if (roleRes.error) throw new Error(roleRes.error.message);
  if (permsRes.error) throw new Error(permsRes.error.message);

  const effectiveRole = normalizeAppRole(roleRes.data as string | null);
  const permissions = new Set<string>();

  for (const row of (permsRes.data ?? []) as Array<{ role: string; roles: { role_permissions: Array<{ permissions: { code: string } | null }> } | null }>) {
    for (const rp of row.roles?.role_permissions ?? []) {
      if (rp.permissions?.code) permissions.add(rp.permissions.code);
    }
  }

  return {
    userId: context.userId,
    email: authUserRes.data.user?.email ?? null,
    role: effectiveRole,
    permissions: [...permissions].sort(),
    suspended: Boolean(statusRes.data?.is_suspended),
  };
}

export const getAuthzSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => readAuthzSnapshot(context));

export const getAdminManagementData = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [profilesRes, rolesRes, permsRes, rolePermRes, userRolesRes, statusRes, auditRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("id,display_name,avatar_url,created_at"),
      supabaseAdmin.from("roles").select("id,slug,name,level,is_system").order("level", { ascending: false }),
      supabaseAdmin.from("permissions").select("id,code,description").order("code", { ascending: true }),
      supabaseAdmin.from("role_permissions").select("role_id,permission_id"),
      supabaseAdmin.from("user_roles").select("user_id,role"),
      supabaseAdmin.from("admin_account_status").select("user_id,is_suspended"),
      supabaseAdmin
        .from("admin_audit_log")
        .select("id,actor_user_id,target_user_id,action,old_value,new_value,ip_address,user_agent,created_at")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    const firstErr =
      profilesRes.error || rolesRes.error || permsRes.error || rolePermRes.error || userRolesRes.error || statusRes.error || auditRes.error;
    if (firstErr) throw new Error(firstErr.message);

    const profiles = (profilesRes.data ?? []) as Array<{ id: string; display_name: string | null; avatar_url: string | null; created_at: string | null }>;
    const roleRows = (rolesRes.data ?? []) as Array<{ id: string; slug: string; name: string; level: number; is_system: boolean }>;
    const permRows = (permsRes.data ?? []) as Array<{ id: string; code: string; description: string }>;
    const rolePermRows = (rolePermRes.data ?? []) as Array<{ role_id: string; permission_id: string }>;
    const userRoleRows = (userRolesRes.data ?? []) as Array<{ user_id: string; role: string }>;
    const statusRows = (statusRes.data ?? []) as Array<{ user_id: string; is_suspended: boolean }>;

    const permById = new Map(permRows.map((p) => [p.id, p.code]));
    const permissionsByRoleId = new Map<string, string[]>();
    for (const rp of rolePermRows) {
      const code = permById.get(rp.permission_id);
      if (!code) continue;
      const list = permissionsByRoleId.get(rp.role_id) ?? [];
      list.push(code);
      permissionsByRoleId.set(rp.role_id, list);
    }

    const roles: RoleRecord[] = roleRows.map((r) => ({
      id: r.id,
      slug: normalizeAppRole(r.slug),
      name: r.name,
      level: r.level,
      isSystem: r.is_system,
      permissions: (permissionsByRoleId.get(r.id) ?? []).sort(),
    }));

    const roleByUser = new Map<string, AppRole>();
    for (const row of userRoleRows) {
      const current = roleByUser.get(row.user_id);
      const nextRole = normalizeAppRole(row.role);
      if (!current) {
        roleByUser.set(row.user_id, nextRole);
        continue;
      }
      if (ROLE_ORDER.indexOf(nextRole) < ROLE_ORDER.indexOf(current)) roleByUser.set(row.user_id, nextRole);
    }

    const statusByUser = new Map(statusRows.map((s) => [s.user_id, Boolean(s.is_suspended)]));

    const users: AdminUserRow[] = profiles.map((p) => ({
      id: p.id,
      avatarUrl: p.avatar_url,
      name: p.display_name,
      email: null,
      provider: "email/google",
      createdAt: p.created_at,
      lastLoginAt: null,
      currentRole: roleByUser.get(p.id) ?? "user",
      status: statusByUser.get(p.id) ? "suspended" : "active",
    }));

    const audit: AuditLogRow[] = ((auditRes.data ?? []) as Array<any>).map((a) => ({
      id: a.id,
      actorUserId: a.actor_user_id,
      targetUserId: a.target_user_id,
      action: a.action,
      oldValue: (a.old_value ?? null) as Record<string, unknown> | null,
      newValue: (a.new_value ?? null) as Record<string, unknown> | null,
      ipAddress: a.ip_address,
      userAgent: a.user_agent,
      createdAt: a.created_at,
    }));

    return {
      users,
      roles,
      permissions: permRows,
      audit,
      overview: {
        users: users.length,
        activeUsers: users.filter((u) => u.status === "active").length,
        suspendedUsers: users.filter((u) => u.status === "suspended").length,
        superAdmins: users.filter((u) => u.currentRole === "super_admin").length,
      },
    };
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpdateUserRoleSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireSuperAdmin(context);
    if (context.userId === data.targetUserId && data.role !== "super_admin") {
      throw new Error("You cannot remove your own Super Admin role.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: oldRows, error: oldErr } = await supabaseAdmin
      .from("user_roles")
      .select("id,role")
      .eq("user_id", data.targetUserId);
    if (oldErr) throw new Error(oldErr.message);

    const oldRoles = (oldRows ?? []).map((r: { role: string }) => normalizeAppRole(r.role));

    const { error: delErr } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.targetUserId);
    if (delErr) throw new Error(delErr.message);

    const { error: insErr } = await supabaseAdmin.from("user_roles").insert({
      user_id: data.targetUserId,
      role: data.role,
    });
    if (insErr) throw new Error(insErr.message);

    await logAudit({
      supabaseAdmin,
      actorUserId: context.userId,
      targetUserId: data.targetUserId,
      action: "user.role.changed",
      oldValue: { roles: oldRoles },
      newValue: { roles: [data.role] },
    });

    return { ok: true as const };
  });

export const setUserAccountStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SetAccountStatusSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireSuperAdmin(context);
    if (context.userId === data.targetUserId && data.suspended) {
      throw new Error("You cannot suspend your own account.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: oldRow } = await supabaseAdmin
      .from("admin_account_status")
      .select("is_suspended,reason")
      .eq("user_id", data.targetUserId)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("admin_account_status").upsert(
      {
        user_id: data.targetUserId,
        is_suspended: data.suspended,
        reason: data.reason ?? null,
        updated_by: context.userId,
      },
      { onConflict: "user_id" },
    );
    if (error) throw new Error(error.message);

    await logAudit({
      supabaseAdmin,
      actorUserId: context.userId,
      targetUserId: data.targetUserId,
      action: data.suspended ? "user.suspended" : "user.reactivated",
      oldValue: oldRow ? { status: oldRow.is_suspended ? "suspended" : "active", reason: oldRow.reason } : null,
      newValue: { status: data.suspended ? "suspended" : "active", reason: data.reason ?? null },
    });

    return { ok: true as const };
  });

export const upsertRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => UpsertRoleSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: oldRow } = await supabaseAdmin
      .from("roles")
      .select("id,slug,name,level,is_system")
      .eq("slug", data.slug)
      .maybeSingle();

    const { error } = await supabaseAdmin.from("roles").upsert(
      { slug: data.slug, name: data.name, level: data.level, is_system: oldRow?.is_system ?? false },
      { onConflict: "slug" },
    );
    if (error) throw new Error(error.message);

    await logAudit({
      supabaseAdmin,
      actorUserId: context.userId,
      action: oldRow ? "role.updated" : "role.created",
      oldValue: oldRow ?? null,
      newValue: { slug: data.slug, name: data.name, level: data.level },
      metadata: { roleSlug: data.slug },
    });

    return { ok: true as const };
  });

export const deleteRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => DeleteRoleSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: role, error: roleErr } = await supabaseAdmin
      .from("roles")
      .select("id,slug,name,is_system")
      .eq("id", data.roleId)
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!role) throw new Error("Role not found.");
    if (role.is_system) throw new Error("System roles cannot be deleted.");

    const { count: usageCount, error: usageErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", role.slug);
    if (usageErr) throw new Error(usageErr.message);
    if ((usageCount ?? 0) > 0) throw new Error("Cannot delete a role that is currently assigned to users.");

    const { error: delErr } = await supabaseAdmin.from("roles").delete().eq("id", data.roleId);
    if (delErr) throw new Error(delErr.message);

    await logAudit({
      supabaseAdmin,
      actorUserId: context.userId,
      action: "role.deleted",
      oldValue: role as Record<string, unknown>,
      newValue: null,
      metadata: { roleId: data.roleId },
    });

    return { ok: true as const };
  });

export const setRolePermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SetRolePermissionsSchema.parse(input))
  .handler(async ({ context, data }) => {
    await requireSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: role, error: roleErr } = await supabaseAdmin.from("roles").select("id,slug").eq("id", data.roleId).maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!role) throw new Error("Role not found.");

    const { data: permRows, error: permErr } = await supabaseAdmin
      .from("permissions")
      .select("id,code")
      .in("code", data.permissionCodes);
    if (permErr) throw new Error(permErr.message);

    const wantedCodes = new Set(data.permissionCodes);
    const foundCodes = new Set((permRows ?? []).map((p: { code: string }) => p.code));
    const missing = [...wantedCodes].filter((code) => !foundCodes.has(code));
    if (missing.length > 0) throw new Error(`Unknown permissions: ${missing.join(", ")}`);

    const { data: oldRows, error: oldErr } = await supabaseAdmin
      .from("role_permissions")
      .select("permission_id")
      .eq("role_id", data.roleId);
    if (oldErr) throw new Error(oldErr.message);

    const oldIds = new Set((oldRows ?? []).map((r: { permission_id: string }) => r.permission_id));
    const newIds = new Set((permRows ?? []).map((r: { id: string }) => r.id));

    const toDelete = [...oldIds].filter((id) => !newIds.has(id));
    const toInsert = [...newIds].filter((id) => !oldIds.has(id));

    if (toDelete.length > 0) {
      const { error: delErr } = await supabaseAdmin
        .from("role_permissions")
        .delete()
        .eq("role_id", data.roleId)
        .in("permission_id", toDelete);
      if (delErr) throw new Error(delErr.message);
    }

    if (toInsert.length > 0) {
      const { error: insErr } = await supabaseAdmin.from("role_permissions").insert(toInsert.map((pid) => ({ role_id: data.roleId, permission_id: pid })));
      if (insErr) throw new Error(insErr.message);
    }

    await logAudit({
      supabaseAdmin,
      actorUserId: context.userId,
      action: "role.permissions.updated",
      oldValue: { permissionIds: [...oldIds] },
      newValue: { permissionIds: [...newIds] },
      metadata: { roleId: data.roleId, roleSlug: role.slug },
    });

    return { ok: true as const };
  });

export const getPermissionHelpers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const snapshot = await readAuthzSnapshot(context);
    return {
      ...snapshot,
      isSuperAdmin: snapshot.role === "super_admin",
      isAdmin: ROLE_ORDER.indexOf(snapshot.role) <= ROLE_ORDER.indexOf("admin"),
      hasRole: (role: AppRole) => ROLE_ORDER.indexOf(snapshot.role) <= ROLE_ORDER.indexOf(role),
      hasPermission: (permission: string) => snapshot.permissions.includes(permission),
      can: (permission: string) => snapshot.permissions.includes(permission),
      getCurrentUserRole: () => snapshot.role,
      syncRoles: () => null,
    };
  });

export function isRoleAtLeast(current: AppRole, required: AppRole) {
  return ROLE_ORDER.indexOf(current) <= ROLE_ORDER.indexOf(required);
}

export function hasPermissionCode(currentPermissions: string[], code: string) {
  return currentPermissions.includes(code);
}
