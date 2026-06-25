import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { embedHadithBatchJob } from "@/lib/hadith-graph.server";

const BodySchema = z.object({
  batch: z.number().int().min(1).max(500).optional(),
  token: z.string().min(8).optional(),
});

export const Route = createFileRoute("/api/public/admin/embed-hadith")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.QURAN_ADMIN_TOKEN;
        const bodyRaw = await request.json().catch(() => ({}));
        const parsed = BodySchema.safeParse(bodyRaw);
        if (!parsed.success) return new Response("Bad request", { status: 400 });
        const auth = request.headers.get("authorization");
        const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
        if (!token || (bearer !== token && parsed.data.token !== token)) {
          return new Response("Unauthorized", { status: 401 });
        }
        const result = await embedHadithBatchJob({ batch: parsed.data.batch });
        return Response.json(result, { status: result.ok ? 200 : 500 });
      },
    },
  },
});