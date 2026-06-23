/**
 * One-shot knowledge seeder HTTP endpoint.
 * Gated by ?token=<QURAN_ADMIN_TOKEN>.
 */
import { createFileRoute } from "@tanstack/react-router";
import seed from "@/lib/seeds/knowledge-seed.json";

type EntityKind = "concept" | "event" | "nation" | "place" | "prophet" | "story" | "theme" | "topic";
type RelationKind = "child_of" | "happened_in" | "involves" | "mentions" | "part_of" | "related" | "teaches";
type Entity = { kind: EntityKind; slug: string; title: Record<string, string>; summary: Record<string, string>; keywords?: string[] };
type VerseEntry = { slug: string; links: [number, number, number][] };
type Relation = [string, string, RelationKind];

export const Route = createFileRoute("/api/public/seed-knowledge")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const seedToken = process.env.QURAN_ADMIN_TOKEN;
        const url = new URL(request.url);
        if (!seedToken || url.searchParams.get("token") !== seedToken) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const entities = (seed.entities as Entity[]).map((e, i) => ({
          kind: e.kind,
          slug: e.slug,
          title_i18n: e.title,
          summary_i18n: e.summary,
          description_i18n: {},
          keywords_i18n: { en: e.keywords ?? [] },
          sort_order: i,
          published: true,
        }));

        const { error: entErr } = await supabaseAdmin
          .from("knowledge_entities")
          .upsert(entities, { onConflict: "slug" });
        if (entErr) return Response.json({ step: "entities", error: entErr.message }, { status: 500 });

        const { data: rows, error: fetchErr } = await supabaseAdmin
          .from("knowledge_entities")
          .select("id, slug")
          .in("slug", entities.map((e) => e.slug));
        if (fetchErr) return Response.json({ step: "fetch", error: fetchErr.message }, { status: 500 });

        const idBySlug = new Map<string, string>(
          (rows ?? []).map((r: { id: string; slug: string }) => [r.slug, r.id]),
        );

        const verseRows: Array<{ entity_id: string; surah: number; ayah_start: number; ayah_end: number; relevance: number; sort_order: number }> = [];
        for (const v of seed.verses as VerseEntry[]) {
          const id = idBySlug.get(v.slug);
          if (!id) continue;
          v.links.forEach(([surah, a1, a2], k) => {
            verseRows.push({ entity_id: id, surah, ayah_start: a1, ayah_end: a2, relevance: 7, sort_order: k });
          });
        }
        if (verseRows.length > 0) {
          await supabaseAdmin
            .from("knowledge_entity_verses")
            .delete()
            .in("entity_id", Array.from(idBySlug.values()));
          const { error: vErr } = await supabaseAdmin.from("knowledge_entity_verses").insert(verseRows);
          if (vErr) return Response.json({ step: "verses", error: vErr.message }, { status: 500 });
        }

        const relRows: Array<{ from_id: string; to_id: string; relation: RelationKind; weight: number }> = [];
        for (const [from, to, rel] of seed.relations as Relation[]) {
          const f = idBySlug.get(from);
          const t = idBySlug.get(to);
          if (!f || !t) continue;
          relRows.push({ from_id: f, to_id: t, relation: rel, weight: 6 });
        }
        if (relRows.length > 0) {
          const { error: rErr } = await supabaseAdmin
            .from("knowledge_relations")
            .upsert(relRows, { onConflict: "from_id,to_id,relation" });
          if (rErr) return Response.json({ step: "relations", error: rErr.message }, { status: 500 });
        }

        return Response.json({
          ok: true,
          entities: entities.length,
          verses: verseRows.length,
          relations: relRows.length,
        });
      },
    },
  },
});
