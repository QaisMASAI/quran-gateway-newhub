import { createFileRoute } from "@tanstack/react-router";
import { SURAH_NAMES_HE } from "@/lib/surah-names-he";

type QuranChapter = {
  id: number;
  revelation_place: string;
  name_simple: string;
  name_arabic: string;
  verses_count: number;
  translated_name?: { name?: string };
};

export const Route = createFileRoute("/api/public/admin/backfill-quran-chapters")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.QURAN_ADMIN_TOKEN;
        const auth = request.headers.get("authorization");
        const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
        const body = await request.json().catch(() => ({} as { token?: string }));
        if (!token || (bearer !== token && body.token !== token)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const chaptersRes = await fetch("https://api.quran.com/api/v4/chapters?language=en");
        if (!chaptersRes.ok) {
          return Response.json({ ok: false, error: `Quran API failed (${chaptersRes.status})` }, { status: 502 });
        }

        const chaptersJson = (await chaptersRes.json()) as { chapters?: QuranChapter[] };
        const chapters = chaptersJson.chapters ?? [];
        if (chapters.length !== 114) {
          return Response.json({ ok: false, error: "Unexpected chapter payload" }, { status: 502 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const rows = chapters.map((c) => ({
          chapter_number: c.id,
          name_ar: c.name_arabic,
          name_simple_en: c.name_simple,
          name_translated_en: c.translated_name?.name ?? null,
          name_he: SURAH_NAMES_HE[c.id] ?? null,
          revelation_place: c.revelation_place,
          verses_count: c.verses_count,
        }));

        const { error } = await supabaseAdmin.from("quran_chapters").upsert(rows, {
          onConflict: "chapter_number",
        });

        if (error) {
          return Response.json({ ok: false, error: error.message }, { status: 500 });
        }

        return Response.json({ ok: true, upserted: rows.length });
      },
    },
  },
});
