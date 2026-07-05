import { createFileRoute } from "@tanstack/react-router";
import { authorizeAdminRouteRequest } from "@/lib/admin-route-auth";

type TranslationVerse = {
  verse_key?: string;
  text: string;
};

type ArabicVerse = {
  verse_key: string;
};

type SourceSpec = {
  code: "ben-shemesh" | "saheeh-international";
  language: "he" | "en";
  name_en: string;
  name_he: string;
  resourceId: number;
};

const SOURCES: SourceSpec[] = [
  {
    code: "ben-shemesh",
    language: "he",
    name_en: "Ben Shemesh",
    name_he: "בן שמש",
    resourceId: 233,
  },
  {
    code: "saheeh-international",
    language: "en",
    name_en: "Sahih International",
    name_he: "סחיח אינטרנשיונל",
    resourceId: 20,
  },
];

function cleanHtml(input: string): string {
  return input
    .replace(/<sup[^>]*>.*?<\/sup>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const Route = createFileRoute("/api/public/admin/backfill-verse-translations")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request
          .json()
          .catch(() => ({}) as { token?: string; adminUserId?: string });
        const authResult = await authorizeAdminRouteRequest(request, body);
        if (!authResult.ok) return authResult.response;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const sourceIds = new Map<string, string>();
        for (const source of SOURCES) {
          const { data: src, error: srcErr } = await supabaseAdmin
            .from("translation_sources")
            .upsert(
              {
                code: source.code,
                name_he: source.name_he,
                name_en: source.name_en,
                language: source.language,
                author: source.name_en,
                license: "Quran.com API",
                source_url: "https://api.quran.com/api/v4",
                is_default: true,
              },
              { onConflict: "code" },
            )
            .select("id")
            .single();
          if (srcErr || !src?.id) {
            return Response.json(
              { ok: false, error: srcErr?.message ?? `Failed source ${source.code}` },
              { status: 500 },
            );
          }
          sourceIds.set(source.code, src.id);
        }

        let upserted = 0;
        const arabicRes = await fetch("https://api.quran.com/api/v4/quran/verses/uthmani");
        if (!arabicRes.ok) {
          return Response.json(
            { ok: false, error: `Quran API failed for verse keys (${arabicRes.status})` },
            { status: 502 },
          );
        }
        const arabicJson = (await arabicRes.json()) as { verses?: ArabicVerse[] };
        const verseKeys = (arabicJson.verses ?? []).map((v) => v.verse_key);

        for (const source of SOURCES) {
          const res = await fetch(
            `https://api.quran.com/api/v4/quran/translations/${source.resourceId}`,
          );
          if (!res.ok) {
            return Response.json(
              { ok: false, error: `Quran API failed for ${source.code} (${res.status})` },
              { status: 502 },
            );
          }

          const json = (await res.json()) as { translations?: TranslationVerse[] };
          const sourceId = sourceIds.get(source.code);
          if (!sourceId) {
            return Response.json(
              { ok: false, error: `Missing source id for ${source.code}` },
              { status: 500 },
            );
          }

          const rows = (json.translations ?? [])
            .map((v, idx) => {
              const key = v.verse_key ?? verseKeys[idx] ?? "";
              const [surahRaw, ayahRaw] = key.split(":");
              const surah = Number(surahRaw);
              const ayah = Number(ayahRaw);
              const text = cleanHtml(v.text ?? "");
              if (!surah || !ayah || !text) return null;
              return { source_id: sourceId, surah, ayah, text };
            })
            .filter(
              (r): r is { source_id: string; surah: number; ayah: number; text: string } => !!r,
            );

          if (rows.length > 0) {
            const { error } = await supabaseAdmin.from("ayah_translations").upsert(rows, {
              onConflict: "source_id,surah,ayah",
            });
            if (error) {
              return Response.json({ ok: false, error: error.message }, { status: 500 });
            }
          }

          upserted += rows.length;
        }

        return Response.json({ ok: true, upserted });
      },
    },
  },
});
