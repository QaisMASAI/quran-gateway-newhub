import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { authorizeAdminRouteRequest } from "@/lib/admin-route-auth";

const EnvelopeSchema = z.object({
  token: z.string().min(8).optional(),
  adminUserId: z.string().uuid().optional(),
  kind: z.enum(["dataset", "words", "audio"]),
  payload: z.unknown(),
});

export const Route = createFileRoute("/api/public/admin/ingest-quran-json")({
  server: {
    handlers: {
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