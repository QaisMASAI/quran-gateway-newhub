import { createFileRoute } from "@tanstack/react-router";
import { generateHebrewTafsirJob } from "@/lib/grounded-chunks.server";
import { z } from "zod";

const BodySchema = z.object({
  batch: z.number().int().min(1).max(200).optional(),
  model: z.string().min(3).max(120).optional(),
  token: z.string().min(8).optional(),
});

export const Route = createFileRoute("/api/public/admin/translate-tafsir-hebrew")({
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

        const result = await generateHebrewTafsirJob({
          batch: parsed.data.batch,
          model: parsed.data.model,
        });
        if (!result.ok) {
          return Response.json(result, { status: 500 });
        }
        return Response.json(result);
      },
    },
  },
});
