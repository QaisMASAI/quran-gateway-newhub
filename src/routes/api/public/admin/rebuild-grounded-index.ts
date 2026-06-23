import { createFileRoute } from "@tanstack/react-router";
import { rebuildGroundedChunks } from "@/lib/grounded-chunks.functions";
import { z } from "zod";

const BodySchema = z.object({
  limit: z.number().int().min(1).max(10000).optional(),
});

export const Route = createFileRoute("/api/public/admin/rebuild-grounded-index")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.QURAN_ADMIN_TOKEN;
        const url = new URL(request.url);
        if (!token || url.searchParams.get("token") !== token) {
          return new Response("Unauthorized", { status: 401 });
        }

        const parsed = BodySchema.safeParse(await request.json().catch(() => ({})));
        if (!parsed.success) return new Response("Bad request", { status: 400 });

        const result = await rebuildGroundedChunks({ data: { limit: parsed.data.limit } });
        if (!result.ok) {
          return Response.json(result, { status: 500 });
        }
        return Response.json(result);
      },
    },
  },
});
