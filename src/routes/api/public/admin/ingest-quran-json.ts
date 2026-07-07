import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { authorizeAdminRouteRequest } from "@/lib/admin-route-auth";

const EnvelopeSchema = z.object({
  token: z.string().min(8).optional(),
  adminUserId: z.string().uuid().optional(),
  kind: z.enum(["dataset", "words", "audio"]),
  payload: z.unknown(),
});

const ListQuerySchema = z.object({
  token: z.string().min(8).optional(),
  adminUserId: z.string().uuid().optional(),
  status: z.enum(["running", "completed", "failed"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  cursor: z.string().datetime().optional(),
});

export const Route = createFileRoute("/api/public/admin/ingest-quran-json")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = ListQuerySchema.safeParse({
          token: url.searchParams.get("token") ?? undefined,
          adminUserId: url.searchParams.get("adminUserId") ?? undefined,
          status: url.searchParams.get("status") ?? undefined,
          limit: url.searchParams.get("limit") ?? undefined,
          cursor: url.searchParams.get("cursor") ?? undefined,
        });

        if (!parsed.success) {
          return Response.json(
            { ok: false, error: "Bad request", issues: parsed.error.issues },
            { status: 400 },
          );
        }

        const auth = await authorizeAdminRouteRequest(request, {
          token: parsed.data.token,
          adminUserId: parsed.data.adminUserId,
        });
        if (!auth.ok) return auth.response;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        let query = supabaseAdmin
          .from("quran_ingest_reports")
          .select(
            "id, kind, status, dataset_id, reciter_id, received, deduped, written, batches, failed_count, started_at, completed_at, created_at",
          )
          .order("created_at", { ascending: false })
          .limit(parsed.data.limit + 1);

        if (parsed.data.status) query = query.eq("status", parsed.data.status);
        if (parsed.data.cursor) query = query.lt("created_at", parsed.data.cursor);

        const { data, error } = await query;
        if (error) {
          return Response.json({ ok: false, error: error.message }, { status: 500 });
        }

        const rows = data ?? [];
        const hasMore = rows.length > parsed.data.limit;
        const entries = hasMore ? rows.slice(0, parsed.data.limit) : rows;
        const nextCursor = hasMore ? entries[entries.length - 1]?.created_at ?? null : null;

        return Response.json({ ok: true, entries, hasMore, nextCursor });
      },
      POST: async ({ request }) => {
        let bodyRaw: unknown;
        try {
          bodyRaw = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const parsed = EnvelopeSchema.safeParse(bodyRaw);
        if (!parsed.success) {
          return Response.json(
            { ok: false, error: "Bad request", issues: parsed.error.issues },
            { status: 400 },
          );
        }

        const auth = await authorizeAdminRouteRequest(request, {
          token: parsed.data.token,
          adminUserId: parsed.data.adminUserId,
        });
        if (!auth.ok) return auth.response;

        const {
          IngestEnvelopeSchema,
          ingestEnvelope,
        } = await import("@/lib/quran-ingest.server");

        const envelope = IngestEnvelopeSchema.safeParse({
          kind: parsed.data.kind,
          payload: parsed.data.payload,
        });
        if (!envelope.success) {
          return Response.json(
            { ok: false, error: "Invalid payload", issues: envelope.error.issues.slice(0, 20) },
            { status: 422 },
          );
        }

        try {
          const report = await ingestEnvelope(envelope.data, auth.adminUserId);
          return Response.json(report);
        } catch (err) {
          const message = err instanceof Error ? err.message : "Ingest failed";
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});