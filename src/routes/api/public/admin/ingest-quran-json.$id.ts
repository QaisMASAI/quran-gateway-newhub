import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { authorizeAdminRouteRequest } from "@/lib/admin-route-auth";

const IdSchema = z.string().uuid();

export const Route = createFileRoute("/api/public/admin/ingest-quran-json/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const parsedId = IdSchema.safeParse(params.id);
        if (!parsedId.success) {
          return Response.json({ ok: false, error: "Invalid id" }, { status: 400 });
        }
        const url = new URL(request.url);
        const token = url.searchParams.get("token") ?? undefined;
        const adminUserId = url.searchParams.get("adminUserId") ?? undefined;

        const auth = await authorizeAdminRouteRequest(request, { token, adminUserId });
        if (!auth.ok) return auth.response;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("quran_ingest_reports")
          .select(
            "id, kind, dataset_id, reciter_id, received, deduped, written, batches, actor_user_id, metadata, created_at",
          )
          .eq("id", parsedId.data)
          .maybeSingle();

        if (error) {
          return Response.json({ ok: false, error: error.message }, { status: 500 });
        }
        if (!data) {
          return Response.json({ ok: false, error: "Not found" }, { status: 404 });
        }
        return Response.json({ ok: true, report: data });
      },
    },
  },
});