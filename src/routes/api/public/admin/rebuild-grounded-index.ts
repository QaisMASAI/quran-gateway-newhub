import { createFileRoute } from "@tanstack/react-router";
import { rebuildGroundedChunks } from "@/lib/grounded-chunks.functions";

export const Route = createFileRoute("/api/public/admin/rebuild-grounded-index")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.QURAN_ADMIN_TOKEN;
        const url = new URL(request.url);
        if (!token || url.searchParams.get("token") !== token) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = (await request.json().catch(() => ({}))) as { limit?: number };
        const result = await rebuildGroundedChunks({ data: { limit: body.limit } });
        if (!result.ok) {
          return Response.json(result, { status: 500 });
        }
        return Response.json(result);
      },
    },
  },
});
