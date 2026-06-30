import { z } from "zod";

const AdminAuthSchema = z.object({
  token: z.string().min(8).optional(),
  adminUserId: z.string().uuid().optional(),
});

export async function authorizeAdminRouteRequest(
  request: Request,
  input: unknown,
): Promise<{ ok: true; adminUserId: string } | { ok: false; response: Response }> {
  const parsed = AdminAuthSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return { ok: false, response: new Response("Bad request", { status: 400 }) };
  }

  const token = process.env.QURAN_ADMIN_TOKEN;
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  const bodyToken = parsed.data.token ?? null;

  if (!token || (bearerToken !== token && bodyToken !== token)) {
    return { ok: false, response: new Response("Unauthorized", { status: 401 }) };
  }

  if (!parsed.data.adminUserId) {
    return { ok: false, response: new Response("Forbidden", { status: 403 }) };
  }

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: isAdmin, error } = await supabaseAdmin.rpc("has_role" as never, {
    _user_id: parsed.data.adminUserId,
    _role: "admin",
  } as never);

  if (error) {
    return { ok: false, response: Response.json({ ok: false, error: error.message }, { status: 500 }) };
  }

  if (isAdmin !== true) {
    return { ok: false, response: new Response("Forbidden", { status: 403 }) };
  }

  return { ok: true, adminUserId: parsed.data.adminUserId };
}