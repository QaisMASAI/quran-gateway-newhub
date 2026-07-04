import { createFileRoute } from "@tanstack/react-router";
import { generateHebrewTafsirJob } from "@/lib/grounded-chunks.server";
import { z } from "zod";
import { authorizeAdminRouteRequest } from "@/lib/admin-route-auth";

const BodySchema = z.object({
  batch: z.number().int().min(1).max(200).optional(),
  model: z.string().min(3).max(120).optional(),
  token: z.string().min(8).optional(),
  adminUserId: z.string().uuid().optional(),
});

export const Route = createFileRoute("/api/public/admin/translate-tafsir-hebrew")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bodyRaw = await request.json().catch(() => ({}));
        const parsed = BodySchema.safeParse(bodyRaw);
        if (!parsed.success) return new Response("Bad request", { status: 400 });

        const authResult = await authorizeAdminRouteRequest(request, parsed.data);
        if (!authResult.ok) return authResult.response;

        const result = await generateHebrewTafsirJob({
          batch: parsed.data.batch,
          model: parsed.data.model,
          token: parsed.data.token,
          adminUserId: parsed.data.adminUserId,
        });
        if (!result.ok) {
          return Response.json(result, { status: 500 });
        }
        return Response.json(result);
      },
    },
  },
});
