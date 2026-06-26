import { createFileRoute } from "@tanstack/react-router";
import { rebuildGroundedChunksJob } from "@/lib/grounded-chunks.server";
import { z } from "zod";

const BodySchema = z.object({
  limit: z.number().int().min(1).max(10000).optional(),
  offset: z.number().int().min(0).optional(),
  token: z.string().min(8).optional(),
});

export const Route = createFileRoute("/api/public/admin/rebuild-grounded-index")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.QURAN_ADMIN_TOKEN;
        const bodyRaw = await request.json().catch(() => ({}));
        const parsed = BodySchema.safeParse(bodyRaw);
        if (!parsed.success) return new Response("Bad request", { status: 400 });

        const authHeader = request.headers.get("authorization");
        const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
        const bodyToken = parsed.data.token ?? null;
        if (!token || (bearerToken !== token && bodyToken !== token)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const result = await rebuildGroundedChunksJob({ limit: parsed.data.limit, offset: parsed.data.offset });
        if (!result.ok) {
          return Response.json(result, { status: 500 });
        }
        return Response.json(result);
      },
    },
  },
});
