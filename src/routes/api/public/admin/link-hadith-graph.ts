import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { linkHadithToGraph } from "@/lib/hadith-graph.functions";

const BodySchema = z.object({
  batch: z.number().int().min(1).max(500).optional(),
  topVerses: z.number().int().min(1).max(10).optional(),
  topEntities: z.number().int().min(0).max(10).optional(),
  minVerseSim: z.number().min(0).max(1).optional(),
  minEntitySim: z.number().min(0).max(1).optional(),
  token: z.string().min(8).optional(),
});

export const Route = createFileRoute("/api/public/admin/link-hadith-graph")({
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
        const { token: _t, ...rest } = parsed.data;
        const result = await linkHadithToGraph({ data: rest });
        return Response.json(result, { status: result.ok ? 200 : 500 });
      },
    },
  },
});