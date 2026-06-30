import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { translateHadithHebrewBatchJob } from "@/lib/hadith-graph.server";
import { authorizeAdminRouteRequest } from "@/lib/admin-route-auth";

const BodySchema = z.object({
  batch: z.number().int().min(1).max(50).optional(),
  model: z.string().min(3).max(120).optional(),
  token: z.string().min(8).optional(),
  adminUserId: z.string().uuid().optional(),
});

export const Route = createFileRoute("/api/public/admin/translate-hadith-hebrew")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bodyRaw = await request.json().catch(() => ({}));
        const parsed = BodySchema.safeParse(bodyRaw);
        if (!parsed.success) return new Response("Bad request", { status: 400 });
        const authResult = await authorizeAdminRouteRequest(request, parsed.data);
        if (!authResult.ok) return authResult.response;
        const result = await translateHadithHebrewBatchJob({
          batch: parsed.data.batch,
          model: parsed.data.model,
        });
        return Response.json(result, { status: result.ok ? 200 : 500 });
      },
    },
  },
});