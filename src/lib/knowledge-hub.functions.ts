import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ALL_PROPHETS } from "@/lib/prophets";
import { ALL_TOPICS } from "@/lib/topics";
import seed from "@/lib/seeds/knowledge-seed.json";

const HubInput = z.object({
  slug: z.string().min(1).max(120),
  kind: z.enum(["prophet", "topic"]),
  language: z.enum(["he", "ar", "en"]).default("he"),
});

type Locale = "he" | "ar" | "en";

type I18nText = { he?: string; ar?: string; en?: string } | null;

type SeedEntityRow = {
  kind: string;
  slug: string;
  title: { he?: string; ar?: string; en?: string };
  summary: { he?: string; ar?: string; en?: string };
};

const SEED_ENTITIES = (seed.entities as SeedEntityRow[]) ?? [];
const SEED_VERSE_LINKS = new Map(
  ((seed.verses as Array<{ slug: string; links: [number, number, number][] }>) ?? []).map((v) => [
    v.slug,
    v.links,
  ]),
);
const SEED_RELATIONS = (seed.relations as Array<[string, string, string]>) ?? [];

function pickLocale(t: I18nText, lang: Locale): string {
  if (!t) return "";
  return t[lang] || t.he || t.ar || t.en || "";
}

function localeFallback(lang: Locale): Locale[] {
  return [lang, "he", "ar", "en"].filter((v, i, arr): v is Locale => arr.indexOf(v) === i);
}

function excerpt(input: string | null | undefined, size = 260): string {
  const txt = (input ?? "").trim();
  if (!txt) return "";
  return txt.length > size ? `${txt.slice(0, size)}…` : txt;
}

function fallbackRefsFor(slug: string, kind: "prophet" | "topic") {
  const seedLinks = (
    seed.verses as Array<{ slug: string; links: [number, number, number][] }>
  ).find((v) => v.slug === slug)?.links;
  if (seedLinks && seedLinks.length > 0) {
    return seedLinks.map((l, idx) => ({
      id: `seed-fallback:${slug}:${idx}`,
      surah: l[0],
      ayah_start: l[1],
      ayah_end: l[2],
      sort_order: idx,
      note_i18n: {},
    }));
  }

  if (kind === "prophet") {
    const p = ALL_PROPHETS.find((x) => x.slug === slug);
    return (p?.refs ?? []).map((r, idx) => ({
      id: `fallback:${slug}:${idx}`,
      surah: r.surah,
      ayah_start: r.ayah,
      ayah_end: r.to ?? r.ayah,
      sort_order: idx,
      note_i18n: {},
    }));
  }
  const t = ALL_TOPICS.find((x) => x.slug === slug);
  return (t?.refs ?? []).map((r, idx) => ({
    id: `fallback:${slug}:${idx}`,
    surah: r.surah,
    ayah_start: r.ayah,
    ayah_end: r.to ?? r.ayah,
    sort_order: idx,
    note_i18n: {},
  }));
}

export interface KnowledgeHubVerse {
  surah: number;
  ayahStart: number;
  ayahEnd: number;
  sortOrder: number;
  reference: string;
  arabic: string;
  translation: string;
  note: string;
  tafsirPreview: string;
  asbabPreview: string;
  tafsirSources: Array<{ id: string; source: string; sourceArabic: string; text: string }>;
}

export interface KnowledgeHubData {
  entity: {
    id: string;
    slug: string;
    kind: string;
    titleHe: string;
    titleAr: string;
    titleEn: string;
    summary: string;
    description: string;
  } | null;
  verses: KnowledgeHubVerse[];
  chronology: Array<{ title: string; summary: string; evidence: string }>;
  lessons: Array<{ id: string; body: string; source: string }>;
  related: Array<{ id: string; slug: string; kind: string; title: string; summary: string }>;
}

export const getKnowledgeHub = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => HubInput.parse(input))
  .handler(async ({ data }): Promise<KnowledgeHubData> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: dbEntity } = await supabaseAdmin
      .from("knowledge_entities")
      .select("id,slug,kind,title_i18n,summary_i18n,description_i18n,published")
      .eq("slug", data.slug)
      .eq("kind", data.kind)
      .eq("published", true)
      .maybeSingle();

    const seedEntity = SEED_ENTITIES.find((e) => e.slug === data.slug && e.kind === data.kind);
    const fallbackFromList =
      data.kind === "prophet"
        ? ALL_PROPHETS.find((p) => p.slug === data.slug)
        : ALL_TOPICS.find((t) => t.slug === data.slug);

    const entity =
      dbEntity ??
      (seedEntity
        ? {
            id: `seed:${seedEntity.slug}`,
            slug: seedEntity.slug,
            kind: seedEntity.kind,
            title_i18n: {
              he: seedEntity.title.he,
              ar: seedEntity.title.ar,
              en: seedEntity.title.en,
            },
            summary_i18n: {
              he: seedEntity.summary.he,
              ar: seedEntity.summary.ar,
              en: seedEntity.summary.en,
            },
            description_i18n: {
              he: seedEntity.summary.he,
              ar: seedEntity.summary.ar,
              en: seedEntity.summary.en,
            },
            published: true,
          }
        : null);

    if (!entity && !fallbackFromList) {
      return { entity: null, verses: [], chronology: [], lessons: [], related: [] };
    }

    const entityResolved = entity as NonNullable<typeof entity>;

    const links = dbEntity
      ? (
          await supabaseAdmin
            .from("knowledge_entity_verses")
            .select("id,surah,ayah_start,ayah_end,sort_order,relevance,note_i18n")
            .eq("entity_id", dbEntity.id)
            .order("sort_order", { ascending: true })
        ).data
      : [];

    const seedLinksForSlug = (SEED_VERSE_LINKS.get(data.slug) ?? []).map((l, idx) => ({
      id: `seed:${data.slug}:${idx}`,
      surah: l[0],
      ayah_start: l[1],
      ayah_end: l[2],
      sort_order: idx,
      relevance: 7,
      note_i18n: {},
    }));

    const fallbackLinksFromList =
      data.kind === "prophet"
        ? (fallbackFromList?.refs ?? []).map((r, idx) => ({
            id: `fallback:${data.slug}:${idx}`,
            surah: r.surah,
            ayah_start: r.ayah,
            ayah_end: r.to ?? r.ayah,
            sort_order: idx,
            relevance: 6,
            note_i18n: {},
          }))
        : (fallbackFromList?.refs ?? []).map((r, idx) => ({
            id: `fallback:${data.slug}:${idx}`,
            surah: r.surah,
            ayah_start: r.ayah,
            ayah_end: r.to ?? r.ayah,
            sort_order: idx,
            relevance: 6,
            note_i18n: {},
          }));

    const verseLinks =
      (links ?? []).length > 0
        ? (links ?? [])
        : seedLinksForSlug.length > 0
          ? seedLinksForSlug
          : fallbackLinksFromList;
    const surahs = [...new Set(verseLinks.map((l) => l.surah))];
    const localeOrder = localeFallback(data.language);

    const sourceCodeByLocale: Record<Locale, string> = {
      he: "ben-shemesh",
      ar: "arabic-original",
      en: "saheeh-international",
    };

    const wantedCodes = [...new Set(["arabic-original", sourceCodeByLocale[data.language]])];
    const { data: translationSources } = await supabaseAdmin
      .from("translation_sources")
      .select("id,code")
      .in("code", wantedCodes);

    const sourceIdByCode = new Map((translationSources ?? []).map((r) => [r.code, r.id]));
    const arabicSourceId = sourceIdByCode.get("arabic-original");
    const localeSourceId = sourceIdByCode.get(sourceCodeByLocale[data.language]);
    const selectedSourceIds = [arabicSourceId, localeSourceId].filter(Boolean) as string[];

    const versePayload = await Promise.all(
      verseLinks.map(async (link) => {
        const { data: rangeRows } = selectedSourceIds.length
          ? await supabaseAdmin
              .from("ayah_translations")
              .select("source_id,surah,ayah,text")
              .eq("surah", link.surah)
              .gte("ayah", link.ayah_start)
              .lte("ayah", link.ayah_end)
              .in("source_id", selectedSourceIds)
              .order("ayah", { ascending: true })
          : { data: [] as Array<{ source_id: string; surah: number; ayah: number; text: string }> };

        const firstAyah = link.ayah_start;
        let ar =
          (rangeRows ?? []).find((r) => r.ayah === firstAyah && r.source_id === arabicSourceId)
            ?.text ?? "";
        let tr =
          (rangeRows ?? []).find((r) => r.ayah === firstAyah && r.source_id === localeSourceId)
            ?.text ??
          (rangeRows ?? []).find((r) => r.ayah === firstAyah && r.source_id === arabicSourceId)
            ?.text ??
          "";

        if (!ar || !tr) {
          try {
            const trId = data.language === "he" ? 233 : data.language === "en" ? 20 : 0;
            const remote = await fetch(
              `https://api.quran.com/api/v4/verses/by_key/${link.surah}:${firstAyah}?words=false${
                trId ? `&translations=${trId}` : ""
              }`,
            );
            if (remote.ok) {
              const remoteJson = (await remote.json()) as {
                verse?: { text_uthmani?: string; translations?: Array<{ text?: string }> };
              };
              ar = ar || remoteJson.verse?.text_uthmani || "";
              tr =
                tr ||
                (data.language === "ar"
                  ? remoteJson.verse?.text_uthmani || ""
                  : (remoteJson.verse?.translations?.[0]?.text ?? "")
                      .replace(/<[^>]+>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim());
            }
          } catch {
            // keep DB values if remote fallback fails
          }
        }

        return {
          link,
          arabic: ar,
          translation: tr,
        };
      }),
    );

    const { data: tafsirRows } = surahs.length
      ? await supabaseAdmin
          .from("tafsir_passages")
          .select(
            "id,surah,ayah_start,ayah_end,lang,body,source:tafsir_sources(name_he,name_ar,name_en)",
          )
          .in("surah", surahs)
          .order("created_at", { ascending: false })
          .limit(600)
      : { data: [] as Array<Record<string, never>> };

    const { data: asbabRowsBase } = surahs.length
      ? await supabaseAdmin
          .from("asbab_nuzul")
          .select("id,surah,ayah_start,ayah_end,lang,body")
          .in("surah", surahs)
          .order("created_at", { ascending: false })
          .limit(300)
      : { data: [] as Array<Record<string, never>> };

    const asbabRows = (asbabRowsBase ?? []) as Array<{
      id: string;
      surah: number;
      ayah_start: number;
      ayah_end: number;
      lang: string;
      body: string;
    }>;

    const asbabFromTafsir = asbabRows.length
      ? []
      : (
          (tafsirRows ?? []) as Array<{
            id: string;
            surah: number;
            ayah_start: number;
            ayah_end: number;
            lang: string;
            body: string;
          }>
        )
          .filter((t) => /سبب\s*النزول|نزلت/i.test(t.body ?? ""))
          .map((t) => ({
            id: `tafsir-asbab:${t.id}`,
            surah: t.surah,
            ayah_start: t.ayah_start,
            ayah_end: t.ayah_end,
            lang: t.lang,
            body: t.body,
          }));

    const allAsbabRows = [...asbabRows, ...asbabFromTafsir];

    const lessonRows = dbEntity
      ? (
          await supabaseAdmin
            .from("topic_lessons")
            .select("id,lang,body,source:tafsir_sources(name_he,name_ar,name_en)")
            .eq("entity_id", dbEntity.id)
            .order("created_at", { ascending: false })
            .limit(60)
        ).data
      : [];

    const lessonByLang = new Map<string, typeof lessonRows>();
    for (const lang of localeOrder) {
      lessonByLang.set(
        lang,
        (lessonRows ?? []).filter((r) => r.lang === lang),
      );
    }
    let selectedLessons =
      localeOrder.map((lang) => lessonByLang.get(lang) ?? []).find((arr) => arr.length > 0) ?? [];

    if (selectedLessons.length === 0) {
      selectedLessons = [
        {
          id: `fallback-lesson:${entityResolved.id}`,
          lang: data.language,
          body:
            pickLocale(entityResolved.description_i18n as I18nText, data.language) ||
            pickLocale(entityResolved.summary_i18n as I18nText, data.language),
          source: {
            name_he: "מאגר ידע",
            name_ar: "قاعدة المعرفة",
            name_en: "Knowledge Base",
          },
        },
      ].filter((l) => l.body && l.body.trim().length > 0);
    }

    const relationRows = dbEntity
      ? (
          await supabaseAdmin
            .from("knowledge_relations")
            .select(
              "weight,to:knowledge_entities!knowledge_relations_to_id_fkey(id,slug,kind,title_i18n,summary_i18n,published)",
            )
            .eq("from_id", dbEntity.id)
            .order("weight", { ascending: false })
            .limit(12)
        ).data
      : null;

    const verses: KnowledgeHubVerse[] = versePayload.map(({ link, arabic, translation }) => {
      const overlapTafsir = (tafsirRows ?? []).filter(
        (t) =>
          Number(t.surah) === Number(link.surah) &&
          Number(t.ayah_start) <= Number(link.ayah_end) &&
          Number(t.ayah_end) >= Number(link.ayah_start),
      );

      const jalalaynOnly = overlapTafsir.filter((t) => t.source?.name_ar === "تفسير الجلالين");

      const preferredTafsir =
        localeOrder
          .map((lang) =>
            (jalalaynOnly.length > 0 ? jalalaynOnly : overlapTafsir).find((t) => t.lang === lang),
          )
          .find(Boolean) ??
        jalalaynOnly[0] ??
        overlapTafsir[0];

      const overlapAsbab = allAsbabRows.filter(
        (a) =>
          Number(a.surah) === Number(link.surah) &&
          Number(a.ayah_start) <= Number(link.ayah_end) &&
          Number(a.ayah_end) >= Number(link.ayah_start),
      );

      const preferredAsbab =
        localeOrder.map((lang) => overlapAsbab.find((a) => a.lang === lang)).find(Boolean) ??
        overlapAsbab[0];

      return {
        surah: Number(link.surah),
        ayahStart: Number(link.ayah_start),
        ayahEnd: Number(link.ayah_end),
        sortOrder: Number(link.sort_order ?? 0),
        reference: `${link.surah}:${link.ayah_start}${link.ayah_end > link.ayah_start ? `-${link.ayah_end}` : ""}`,
        arabic,
        translation,
        note: pickLocale(link.note_i18n as I18nText, data.language),
        tafsirPreview: excerpt(preferredTafsir?.body, 320),
        asbabPreview: excerpt(preferredAsbab?.body, 220),
        tafsirSources: (jalalaynOnly.length > 0 ? jalalaynOnly : overlapTafsir)
          .slice(0, 3)
          .map((item) => ({
            id: String(item.id),
            source: item.source?.name_en ?? item.source?.name_he ?? "Tafsir",
            sourceArabic: item.source?.name_ar ?? "",
            text: excerpt(item.body, 420),
          })),
      };
    });

    const chronology = verses.slice(0, 16).map((v) => ({
      title: `(${v.reference})`,
      summary: excerpt(v.note || v.translation || v.arabic, 240),
      evidence: excerpt(v.tafsirPreview || v.asbabPreview, 220),
    }));

    const lessons = selectedLessons.slice(0, 10).map((l) => ({
      id: l.id,
      body: l.body,
      source: pickLocale(l.source as I18nText, data.language) || "Tafsir",
    }));

    const relatedFromDb = (relationRows ?? [])
      .map((r) => r.to)
      .filter((r): r is NonNullable<typeof r> => !!r && r.published)
      .map((r) => ({
        id: r.id,
        slug: r.slug,
        kind: r.kind,
        title: pickLocale(r.title_i18n as I18nText, data.language) || r.slug,
        summary: pickLocale(r.summary_i18n as I18nText, data.language),
      }));

    const relatedFromSeed = SEED_RELATIONS.filter(([from]) => from === data.slug)
      .map(([, to]) => {
        const target = SEED_ENTITIES.find((e) => e.slug === to);
        if (!target) return null;
        return {
          id: `seed:${target.slug}`,
          slug: target.slug,
          kind: target.kind,
          title:
            pickLocale(
              { he: target.title.he, ar: target.title.ar, en: target.title.en },
              data.language,
            ) || target.slug,
          summary: pickLocale(
            { he: target.summary.he, ar: target.summary.ar, en: target.summary.en },
            data.language,
          ),
        };
      })
      .filter(
        (r): r is { id: string; slug: string; kind: string; title: string; summary: string } => !!r,
      );

    const related = relatedFromDb.length > 0 ? relatedFromDb : relatedFromSeed;

    return {
      entity: {
        id: entityResolved.id,
        slug: entityResolved.slug,
        kind: entityResolved.kind,
        titleHe: pickLocale(entityResolved.title_i18n as I18nText, "he") || entityResolved.slug,
        titleAr: pickLocale(entityResolved.title_i18n as I18nText, "ar") || entityResolved.slug,
        titleEn: pickLocale(entityResolved.title_i18n as I18nText, "en") || entityResolved.slug,
        summary: pickLocale(entityResolved.summary_i18n as I18nText, data.language),
        description: pickLocale(entityResolved.description_i18n as I18nText, data.language),
      },
      verses,
      chronology,
      lessons,
      related,
    };
  });
