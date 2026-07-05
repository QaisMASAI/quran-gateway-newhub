import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { embedHadithBatchJob } from "@/lib/hadith-graph.server";
import { authorizeAdminRouteRequest } from "@/lib/admin-route-auth";

const BodySchema = z.object({
  batch: z.number().int().min(1).max(500).optional(),
  untilDone: z.boolean().optional(),
  maxRuns: z.number().int().min(1).max(500).optional(),
  token: z.string().min(8).optional(),
  adminUserId: z.string().uuid().optional(),
});

export const Route = createFileRoute("/api/public/admin/embed-hadith")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bodyRaw = await request.json().catch(() => ({}));
        const parsed = BodySchema.safeParse(bodyRaw);
        if (!parsed.success) return new Response("Bad request", { status: 400 });
        const authResult = await authorizeAdminRouteRequest(request, parsed.data);
        if (!authResult.ok) return authResult.response;
        try {
          const result = await embedHadithBatchJob({
            batch: parsed.data.batch,
            untilDone: parsed.data.untilDone,
            maxRuns: parsed.data.maxRuns,
          });
          return Response.json(result, { status: result.ok ? 200 : 500 });
        } catch (error) {
          const message = error instanceof Error ? error.message : "unknown_error";
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
