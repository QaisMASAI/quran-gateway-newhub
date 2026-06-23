import { createFileRoute } from "@tanstack/react-router";
import { generateHebrewTafsir } from "@/lib/grounded-chunks.functions";

export const Route = createFileRoute("/api/public/admin/translate-tafsir-hebrew")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.QURAN_ADMIN_TOKEN;
        const url = new URL(request.url);
        if (!token || url.searchParams.get("token") !== token) {
          return new Response("Unauthorized", { status: 401 });
        }

        const body = (await request.json().catch(() => ({}))) as {
          batch?: number;
          model?: string;
        };
        const result = await generateHebrewTafsir({
          data: {
            batch: body.batch,
            model: body.model,
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
