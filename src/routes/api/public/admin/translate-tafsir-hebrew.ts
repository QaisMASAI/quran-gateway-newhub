import { createFileRoute } from "@tanstack/react-router";
import { generateHebrewTafsir } from "@/lib/grounded-chunks.functions";
import { z } from "zod";

const BodySchema = z.object({
  batch: z.number().int().min(1).max(200).optional(),
  model: z.string().min(3).max(120).optional(),
});

export const Route = createFileRoute("/api/public/admin/translate-tafsir-hebrew")({
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

        const result = await generateHebrewTafsir({
          data: {
            batch: parsed.data.batch,
            model: parsed.data.model,
          },
        });
        if (!result.ok) {
          return Response.json(result, { status: 500 });
        }
        return Response.json(result);
      },
    },
  },
});
