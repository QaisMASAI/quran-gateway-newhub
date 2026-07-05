import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AdminSetupStatus = {
  hasAnyAdmin: boolean;
  currentUserIsAdmin: boolean;
  canClaimFirstAdmin: boolean;
};

async function readAdminSetupStatus(context: {
  supabase: any;
  userId: string;
}): Promise<AdminSetupStatus> {
  const [{ supabaseAdmin }, currentRole] = await Promise.all([
    import("@/integrations/supabase/client.server"),
    context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    }),
  ]);

  const [{ count: adminCount }, currentRoleErr] = await Promise.all([
    supabaseAdmin
      .from("user_roles")
      .select("id", { head: true, count: "exact" })
      .eq("role", "admin"),
    Promise.resolve(currentRole.error),
  ]);

  if (currentRoleErr) throw new Error(currentRoleErr.message);

  const hasAnyAdmin = (adminCount ?? 0) > 0;
  const currentUserIsAdmin = currentRole.data === true;

  return {
    hasAnyAdmin,
    currentUserIsAdmin,
    canClaimFirstAdmin: !hasAnyAdmin,
  };
}

export const getAdminSetupStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return readAdminSetupStatus(context);
  });

export const claimFirstAdminRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const status = await readAdminSetupStatus(context);
    if (status.currentUserIsAdmin) {
      return { ok: true as const, alreadyAdmin: true as const, status };
    }
    if (status.hasAnyAdmin) {
      return {
        ok: false as const,
        error: "An admin already exists. Ask an existing admin to grant your role.",
        status,
      };
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: claimed, error } = await supabaseAdmin.rpc("claim_first_admin", {
      _user_id: context.userId,
    });

    if (error || claimed !== true) {
      return {
        ok: false as const,
        error: error?.message ?? "Failed to claim the first admin role.",
        status,
      };
    }

    const updatedStatus = await readAdminSetupStatus(context);
    return { ok: true as const, alreadyAdmin: false as const, status: updatedStatus };
  });
