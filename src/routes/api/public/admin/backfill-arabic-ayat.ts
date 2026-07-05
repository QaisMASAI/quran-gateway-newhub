import { createFileRoute } from "@tanstack/react-router";
import { authorizeAdminRouteRequest } from "@/lib/admin-route-auth";

type QuranVerse = {
  verse_key: string;
  text_uthmani: string;
};

export const Route = createFileRoute("/api/public/admin/backfill-arabic-ayat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request
          .json()
          .catch(() => ({}) as { token?: string; adminUserId?: string });
        const authResult = await authorizeAdminRouteRequest(request, body);
        if (!authResult.ok) return authResult.response;

        const quranRes = await fetch("https://api.quran.com/api/v4/quran/verses/uthmani");
        if (!quranRes.ok) {
          return Response.json(
            { ok: false, error: `Quran API failed (${quranRes.status})` },
            { status: 502 },
          );
        }

        const quranJson = (await quranRes.json()) as { verses?: QuranVerse[] };
        const verses = quranJson.verses ?? [];
        if (verses.length === 0) {
          return Response.json(
            { ok: false, error: "No verses returned from Quran API" },
            { status: 502 },
          );
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: src, error: srcErr } = await supabaseAdmin
          .from("translation_sources")
          .upsert(
            {
              code: "arabic-original",
              name_he: "הטקסט הערבי המקורי",
              name_en: "Arabic Original",
              language: "ar",
              author: "Quran.com",
              license: "Public API",
              source_url: "https://api.quran.com/api/v4",
              is_default: true,
            },
            { onConflict: "code" },
          )
          .select("id")
          .single();

        if (srcErr || !src?.id) {
          return Response.json(
            { ok: false, error: srcErr?.message ?? "Failed to upsert translation source" },
            { status: 500 },
          );
        }

        const rows = verses
          .map((v) => {
            const [surahRaw, ayahRaw] = (v.verse_key ?? "").split(":");
            const surah = Number(surahRaw);
            const ayah = Number(ayahRaw);
            const text = (v.text_uthmani ?? "").trim();
            if (!surah || !ayah || !text) return null;
            return { source_id: src.id, surah, ayah, text };
          })
          .filter(
            (r): r is { source_id: string; surah: number; ayah: number; text: string } => !!r,
          );

        const { error: upErr } = await supabaseAdmin
          .from("ayah_translations")
          .upsert(rows, { onConflict: "source_id,surah,ayah" });

        if (upErr) {
          return Response.json({ ok: false, error: upErr.message }, { status: 500 });
        }

        return Response.json({
          ok: true,
          sourceCode: "arabic-original",
          upserted: rows.length,
          note: "Arabic ayat imported from Quran.com and saved to DB",
        });
      },
    },
  },
});
