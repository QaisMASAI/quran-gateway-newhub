import { createFileRoute } from "@tanstack/react-router";
import { authorizeAdminRouteRequest } from "@/lib/admin-route-auth";

type TRow = {
  verse_key: string;
  text: string;
};

type SourceRow = {
  id: string;
  slug: string;
};

type AsbabInsertRow = {
  source_id: string;
  surah: number;
  ayah_start: number;
  ayah_end: number;
  lang: string;
  body: string;
  citation: string;
};

type QuranTafsirResource = {
  id: number;
  slug?: string;
  name?: string;
};

function stripHtml(input: string): string {
  return input
    .replace(/<sup[^>]*>.*?<\/sup>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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

async function resolveArabicAsbabResourceId(): Promise<number | null> {
  const [arRes, allRes] = await Promise.all([
    fetch("https://api.quran.com/api/v4/resources/tafsirs?language=ar"),
    fetch("https://api.quran.com/api/v4/resources/tafsirs"),
  ]);

  if (!arRes.ok || !allRes.ok) return null;

  const arJson = (await arRes.json().catch(() => ({}))) as { tafsirs?: QuranTafsirResource[] };
  const allJson = (await allRes.json().catch(() => ({}))) as { tafsirs?: QuranTafsirResource[] };

  const arRows = arJson.tafsirs ?? [];
  const allRows = allJson.tafsirs ?? [];
  const byName = (rows: QuranTafsirResource[], re: RegExp) =>
    rows.find((r) => re.test(`${r.slug ?? ""} ${r.name ?? ""}`));

  return (
    byName(arRows, /asbab|nuzul|سبب|أسباب\s*النزول/i)?.id ??
    byName(allRows, /asbab|nuzul|سبب|أسباب\s*النزول/i)?.id ??
    null
  );
}

export const Route = createFileRoute("/api/public/admin/backfill-asbab-nuzul")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = await request.json().catch(
          () =>
            ({}) as {
              token?: string;
              adminUserId?: string;
              surah?: number;
              page?: number;
              perPage?: number;
              batch?: number;
              startSurah?: number;
              resourceId?: number;
            },
        );
        const authResult = await authorizeAdminRouteRequest(request, body);
        if (!authResult.ok) return authResult.response;

        const batch = Number(body.batch ?? 400);
        const startSurah = Number(body.startSurah ?? body.surah ?? 1);
        const page = Number(body.page ?? 1);
        const perPage = Number(body.perPage ?? 50);
        const explicitResourceId = Number(body.resourceId ?? 0);

        if (!Number.isFinite(startSurah) || startSurah < 1 || startSurah > 114) {
          return Response.json({ ok: false, error: "Invalid startSurah" }, { status: 400 });
        }
        if (!Number.isFinite(batch) || batch < 1 || batch > 5000) {
          return Response.json({ ok: false, error: "Invalid batch" }, { status: 400 });
        }

        const resourceId =
          explicitResourceId > 0
            ? explicitResourceId
            : ((await resolveArabicAsbabResourceId()) ?? 14);

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: sourceRows, error: sourceErr } = await supabaseAdmin
          .from("tafsir_sources")
          .select("id,slug")
          .in("slug", ["al_jalalayn", "al_qurtubi", "al_baghawi", "al_muyassar", "al_saadi"]);
        if (sourceErr) {
          return Response.json({ ok: false, error: sourceErr.message }, { status: 500 });
        }
        const source =
          ((sourceRows ?? []) as SourceRow[]).find((s) => s.slug === "al_jalalayn") ??
          ((sourceRows ?? []) as SourceRow[]).find((s) => s.slug !== "al_jalalayn");
        if (!source) {
          return Response.json({ ok: false, error: "No asbab source configured" }, { status: 500 });
        }

        const upserts: AsbabInsertRow[] = [];
        const perSurahDeleted = new Set<number>();
        let scanned = 0;
        let inserted = 0;
        let nextPage: number | null = null;
        let stop = false;

        for (let surah = startSurah; surah <= 114 && !stop; surah += 1) {
          let localPage = surah === Number(body.surah ?? NaN) ? page : 1;
          while (!stop) {
            const tafsirRes = await fetch(
              `https://api.quran.com/api/v4/tafsirs/${resourceId}/by_chapter/${surah}?page=${localPage}&per_page=${perPage}`,
            );
            if (!tafsirRes.ok) {
              return Response.json(
                { ok: false, error: `Quran API failed (${tafsirRes.status})` },
                { status: 502 },
              );
            }

            const tafsirJson = (await tafsirRes.json()) as {
              tafsirs?: TRow[];
              pagination?: { next_page?: number | null };
            };
            const rows = tafsirJson.tafsirs ?? [];
            scanned += rows.length;

            for (const r of rows) {
              const [sRaw, aRaw] = (r.verse_key ?? "").split(":");
              const s = Number(sRaw);
              const a = Number(aRaw);
              if (!s || !a) continue;
              const snippet = extractAsbabSnippet(r.text ?? "");
              if (!snippet) continue;
              upserts.push({
                source_id: source.id,
                surah: s,
                ayah_start: a,
                ayah_end: a,
                lang: "ar",
                body: snippet,
                citation: `Quran.com authenticated asbab ${resourceId} ${s}:${a}`,
              });
              inserted += 1;
              if (inserted >= batch) {
                stop = true;
                break;
              }
            }

            if (stop) {
              nextPage = tafsirJson.pagination?.next_page ?? null;
              break;
            }

            if (!tafsirJson.pagination?.next_page) {
              nextPage = null;
              break;
            }

            localPage = tafsirJson.pagination.next_page;
            nextPage = localPage;
          }
        }

        if (upserts.length > 0) {
          const groupedBySurah = new Map<number, number[]>();
          for (const row of upserts) {
            const existing = groupedBySurah.get(row.surah) ?? [];
            existing.push(row.ayah_start);
            groupedBySurah.set(row.surah, existing);
          }

          for (const [surah, ayahStartsRaw] of groupedBySurah) {
            if (perSurahDeleted.has(surah)) continue;
            const ayahStarts = [...new Set(ayahStartsRaw)];
            await supabaseAdmin
              .from("asbab_nuzul")
              .delete()
              .eq("source_id", source.id)
              .eq("surah", surah)
              .eq("lang", "ar")
              .in("ayah_start", ayahStarts);
            perSurahDeleted.add(surah);
          }

          const { error } = await supabaseAdmin.from("asbab_nuzul").insert(upserts);
          if (error) {
            return Response.json({ ok: false, error: error.message }, { status: 500 });
          }
        }

        return Response.json({
          ok: true,
          scanned,
          inserted,
          resourceId,
          nextPage,
        });
      },
    },
  },
});
