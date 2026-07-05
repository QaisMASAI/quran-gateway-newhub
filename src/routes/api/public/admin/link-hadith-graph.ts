import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { linkHadithToGraphJob } from "@/lib/hadith-graph.server";
import { authorizeAdminRouteRequest } from "@/lib/admin-route-auth";

const BodySchema = z.object({
  batch: z.number().int().min(1).max(500).optional(),
  topVerses: z.number().int().min(1).max(10).optional(),
  topEntities: z.number().int().min(0).max(10).optional(),
  minVerseSim: z.number().min(0).max(1).optional(),
  minEntitySim: z.number().min(0).max(1).optional(),
  token: z.string().min(8).optional(),
  adminUserId: z.string().uuid().optional(),
});

export const Route = createFileRoute("/api/public/admin/link-hadith-graph")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bodyRaw = await request.json().catch(() => ({}));
        const parsed = BodySchema.safeParse(bodyRaw);
        if (!parsed.success) return new Response("Bad request", { status: 400 });
        const authResult = await authorizeAdminRouteRequest(request, parsed.data);
        if (!authResult.ok) return authResult.response;
        const { token: _t, adminUserId: _adminUserId, ...rest } = parsed.data;
        const result = await linkHadithToGraphJob(rest);
        return Response.json(result, { status: result.ok ? 200 : 500 });
      },
    },
  },
});
