import { createFileRoute } from "@tanstack/react-router";
import { rebuildGroundedChunksJob } from "@/lib/grounded-chunks.server";
import { z } from "zod";
import { authorizeAdminRouteRequest } from "@/lib/admin-route-auth";

const BodySchema = z.object({
  limit: z.number().int().min(1).max(10000).optional(),
  offset: z.number().int().min(0).optional(),
  token: z.string().min(8).optional(),
  adminUserId: z.string().uuid().optional(),
});

export const Route = createFileRoute("/api/public/admin/rebuild-grounded-index")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bodyRaw = await request.json().catch(() => ({}));
        const parsed = BodySchema.safeParse(bodyRaw);
        if (!parsed.success) return new Response("Bad request", { status: 400 });

        const authResult = await authorizeAdminRouteRequest(request, parsed.data);
        if (!authResult.ok) return authResult.response;

        const result = await rebuildGroundedChunksJob({ limit: parsed.data.limit, offset: parsed.data.offset });
        const securedResult = await rebuildGroundedChunksJob({
          limit: parsed.data.limit,
          offset: parsed.data.offset,
          token: parsed.data.token,
          adminUserId: parsed.data.adminUserId,
        });
        if (!securedResult.ok) {
          return Response.json(securedResult, { status: 500 });
        }
        return Response.json(securedResult);
      },
    },
  },
});
