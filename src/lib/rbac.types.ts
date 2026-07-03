export type AppRole = "super_admin" | "admin" | "moderator" | "editor" | "user";

export type UserAccountStatus = "active" | "suspended";

export type PermissionCode =
  | "users.read"
  | "users.write"
  | "users.delete"
  | "content.publish"
  | "content.edit"
  | "content.delete"
  | "tafsir.manage"
  | "hadith.manage"
  | "translations.manage"
  | "api.manage"
  | "settings.manage"
  | "analytics.view"
  | "logs.view";

export interface AuthzSnapshot {
  userId: string;
  email: string | null;
  role: AppRole;
  permissions: string[];
  suspended: boolean;
}

export interface RoleRecord {
  id: string;
  slug: AppRole;
  name: string;
  level: number;
  isSystem: boolean;
  permissions: string[];
}

export interface AdminUserRow {
  id: string;
  avatarUrl: string | null;
  name: string | null;
  email: string | null;
  provider: string;
  createdAt: string | null;
  lastLoginAt: string | null;
  currentRole: AppRole;
  status: UserAccountStatus;
}

export interface AuditLogRow {
  id: string;
  actorUserId: string;
  targetUserId: string | null;
  action: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}
