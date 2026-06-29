import { createFileRoute } from "@tanstack/react-router";

type TRow = {
  verse_key: string;
  text: string;
};

type SourceRow = {
  id: string;
  slug: string;
};

function stripHtml(input: string): string {
  return input.replace(/<sup[^>]*>.*?<\/sup>/g, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractAsbabSnippet(text: string): string | null {
  const clean = stripHtml(text);
  if (!clean) return null;
  const re = /(سبب\s+نزول|نزلت\s+في|أسباب\s+النزول)([\s\S]{0,700})/i;
  const m = clean.match(re);
  if (!m) return null;
  const snippet = `${m[1]} ${m[2]}`.trim();
  return snippet.length > 50 ? snippet.slice(0, 900) : null;
}

export const Route = createFileRoute("/api/public/admin/backfill-asbab-nuzul")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const token = process.env.QURAN_ADMIN_TOKEN;
        const auth = request.headers.get("authorization");
        const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
        const body = await request.json().catch(() => ({} as { token?: string; surah?: number; page?: number; perPage?: number }));
        if (!token || (bearer !== token && body.token !== token)) {
          return new Response("Unauthorized", { status: 401 });
        }

        const surah = Number(body.surah ?? 2);
        const page = Number(body.page ?? 1);
        const perPage = Number(body.perPage ?? 50);
        if (!Number.isFinite(surah) || surah < 1 || surah > 114) {
          return Response.json({ ok: false, error: "Invalid surah" }, { status: 400 });
        }

        const tafsirRes = await fetch(
          `https://api.quran.com/api/v4/tafsirs/14/by_chapter/${surah}?page=${page}&per_page=${perPage}`,
        );
        if (!tafsirRes.ok) {
          return Response.json({ ok: false, error: `Quran API failed (${tafsirRes.status})` }, { status: 502 });
        }

        const tafsirJson = (await tafsirRes.json()) as { tafsirs?: TRow[]; pagination?: { next_page?: number | null } };
        const rows = tafsirJson.tafsirs ?? [];

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: sourceRows, error: sourceErr } = await supabaseAdmin
          .from("tafsir_sources")
          .select("id,slug")
          .in("slug", ["al_jalalayn", "al_qurtubi", "al_baghawi", "al_muyassar", "al_saadi"]);
        if (sourceErr) {
          return Response.json({ ok: false, error: sourceErr.message }, { status: 500 });
        }
        const source = ((sourceRows ?? []) as SourceRow[]).find((s) => s.slug !== "al_jalalayn");
        if (!source) {
          return Response.json({ ok: false, error: "No asbab source configured" }, { status: 500 });
        }

        const upserts = rows
          .map((r) => {
            const [sRaw, aRaw] = (r.verse_key ?? "").split(":");
            const s = Number(sRaw);
            const a = Number(aRaw);
            if (!s || !a) return null;
            const snippet = extractAsbabSnippet(r.text ?? "");
            if (!snippet) return null;
            return {
              source_id: source.id,
              surah: s,
              ayah_start: a,
              ayah_end: a,
              lang: "ar",
              body: snippet,
              citation: `Quran.com tafsir 14 ${s}:${a}`,
            };
          })
          .filter((v): v is NonNullable<typeof v> => !!v);

        if (upserts.length > 0) {
          const { error } = await supabaseAdmin.from("asbab_nuzul").upsert(upserts, {
            onConflict: "source_id,surah,ayah_start,ayah_end,lang",
          });
          if (error) {
            return Response.json({ ok: false, error: error.message }, { status: 500 });
          }
        }

        return Response.json({
          ok: true,
          scanned: rows.length,
          inserted: upserts.length,
          nextPage: tafsirJson.pagination?.next_page ?? null,
        });
      },
    },
  },
});
