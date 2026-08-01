import { createFileRoute } from "@tanstack/react-router";
import { authorizeAdminRouteRequest } from "@/lib/admin-route-auth";
import { validateQuranDataset } from "@/lib/quran-validator";
import { z } from "zod";

const BodySchema = z.object({
  token: z.string().min(8).optional(),
  adminUserId: z.string().uuid().optional(),
  sampleOnly: z.boolean().optional().default(false),
});

export const Route = createFileRoute("/api/public/admin/validate-quran-certification")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bodyRaw = await request.json().catch(() => ({}));
        const body = BodySchema.safeParse(bodyRaw);
        if (!body.success) return new Response("Bad request", { status: 400 });

        const authResult = await authorizeAdminRouteRequest(request, body.data);
        if (!authResult.ok) return authResult.response;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Fetch verses from quran_verses_text table or remote Uthmani API
        const { data: dbVerses } = await supabaseAdmin
          .from("quran_verses_text" as never)
          .select("surah, ayah, text_uthmani")
          .order("surah", { ascending: true })
          .order("ayah", { ascending: true });

        let versesToAudit: Array<{ surah: number; ayah: number; arabic: string }> = [];

        if (dbVerses && Array.isArray(dbVerses) && dbVerses.length > 0) {
          versesToAudit = (dbVerses as Array<{ surah: number; ayah: number; text_uthmani: string }>).map((v) => ({
            surah: v.surah,
            ayah: v.ayah,
            arabic: v.text_uthmani ?? "",
          }));
        } else {
          // Fallback: fetch directly from official Quran.com Uthmani endpoint
          const res = await fetch("https://api.quran.com/api/v4/quran/verses/uthmani");
          if (!res.ok) {
            return Response.json({ ok: false, error: "Unable to fetch Uthmani verses for audit" }, { status: 502 });
          }
          const json = (await res.json()) as { verses?: Array<{ verse_key: string; text_uthmani: string }> };
          const verses = json.verses ?? [];
          versesToAudit = verses.map((v) => {
            const [s, a] = v.verse_key.split(":").map(Number);
            return {
              surah: s,
              ayah: a,
              arabic: v.text_uthmani,
            };
          });
        }

        if (body.data.sampleOnly) {
          versesToAudit = versesToAudit.slice(0, 50);
        }

        const report = validateQuranDataset(versesToAudit);

        return Response.json({
          ok: true,
          report,
        });
      },
    },
  },
});
