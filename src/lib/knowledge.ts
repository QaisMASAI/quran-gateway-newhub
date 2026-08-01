import { supabase } from "@/integrations/supabase/client";
import type { LocaleCode } from "./translations-db";
import seed from "@/lib/seeds/knowledge-seed.json";

export type EntityKind =
  | "topic"
  | "prophet"
  | "story"
  | "event"
  | "place"
  | "nation"
  | "concept"
  | "theme"
  | "scholar"
  | "companion"
  | "book"
  | "dua"
  | "mosque";

const DB_ENTITY_KINDS = new Set<
  "concept" | "event" | "nation" | "person" | "place" | "prophet" | "story" | "theme" | "topic"
>(["concept", "event", "nation", "person", "place", "prophet", "story", "theme", "topic"]);

type DbEntityKind =
  | "concept"
  | "event"
  | "nation"
  | "person"
  | "place"
  | "prophet"
  | "story"
  | "theme"
  | "topic";

function isDbEntityKind(kind: EntityKind): kind is DbEntityKind {
  return DB_ENTITY_KINDS.has(kind as DbEntityKind);
}

export interface I18nText {
  he?: string;
  ar?: string;
  en?: string;
}

export interface TimelineNode {
  year?: string;
  title_i18n: I18nText;
  desc_i18n: I18nText;
}

export interface SourceReference {
  name: string;
  type: string;
  url?: string;
  citation?: string;
}

export interface KnowledgeEntity {
  id: string;
  kind: EntityKind;
  slug: string;
  title_i18n: I18nText;
  summary_i18n: I18nText;
  description_i18n: I18nText;
  hero_image: string | null;
  icon: string | null;
  sort_order: number;
  era?: string;
  timeline?: TimelineNode[];
  sources?: SourceReference[];
  keywords?: string[];
}

type SeedEntity = {
  kind: EntityKind;
  slug: string;
  title: I18nText;
  summary: I18nText;
};

type SeedVerseEntry = {
  slug: string;
  links: [number, number, number][];
};

type SeedRelation = [string, string, string];

const seedEntities: KnowledgeEntity[] = (seed.entities as SeedEntity[]).map((e, idx) => ({
  id: `seed:${e.slug}`,
  kind: e.kind,
  slug: e.slug,
  title_i18n: e.title,
  summary_i18n: e.summary,
  description_i18n: e.summary,
  hero_image: null as string | null,
  icon: null as string | null,
  sort_order: idx,
}));

const seedBySlug = new Map(seedEntities.map((e) => [e.slug, e]));
const seedByKind = new Map<EntityKind, KnowledgeEntity[]>();
for (const e of seedEntities) {
  const arr = seedByKind.get(e.kind) ?? [];
  arr.push(e);
  seedByKind.set(e.kind, arr);
}

const seedVerseEntries = seed.verses as SeedVerseEntry[];
const seedVersesBySlug = new Map(seedVerseEntries.map((v) => [v.slug, v.links]));
const seedRelations = seed.relations as SeedRelation[];

function mergeEntities(primary: KnowledgeEntity[], fallback: KnowledgeEntity[]): KnowledgeEntity[] {
  if (primary.length === 0) return [...fallback];
  const out = [...primary];
  const slugs = new Set(primary.map((p) => p.slug));
  for (const f of fallback) {
    if (!slugs.has(f.slug)) out.push(f);
  }
  return out.sort((a, b) => a.sort_order - b.sort_order);
}

export interface EntityVerseLink {
  id: string;
  entity_id: string;
  surah: number;
  ayah_start: number;
  ayah_end: number;
  relevance: number;
  sort_order: number;
  note_i18n: I18nText;
}

export function pickLocale(t: I18nText | null | undefined, locale: LocaleCode): string {
  if (!t) return "";
  return t[locale] || t.en || t.ar || t.he || "";
}

export async function listEntitiesByKind(kind: EntityKind): Promise<KnowledgeEntity[]> {
  if (!isDbEntityKind(kind)) {
    return mergeEntities([], seedByKind.get(kind) ?? []);
  }

  const { data } = await supabase
    .from("knowledge_entities")
    .select("*")
    .eq("published", true)
    .eq("kind", kind)
    .order("sort_order", { ascending: true });
  const db = (data as KnowledgeEntity[] | null) ?? [];
  return mergeEntities(db, seedByKind.get(kind) ?? []);
}

export async function listAllEntities(): Promise<KnowledgeEntity[]> {
  const { data } = await supabase
    .from("knowledge_entities")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  const db = (data as KnowledgeEntity[] | null) ?? [];
  return mergeEntities(db, seedEntities);
}

export async function getEntityBySlug(slug: string): Promise<KnowledgeEntity | null> {
  const { data } = await supabase
    .from("knowledge_entities")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as KnowledgeEntity | null) ?? seedBySlug.get(slug) ?? null;
}

export async function getEntityVerses(entityId: string): Promise<EntityVerseLink[]> {
  const seedEntity = entityId.startsWith("seed:") ? seedBySlug.get(entityId.slice(5)) : null;
  if (seedEntity) {
    return (seedVersesBySlug.get(seedEntity.slug) ?? []).map((l, idx) => ({
      id: `seed:${seedEntity.slug}:${idx}`,
      entity_id: seedEntity.id,
      surah: l[0],
      ayah_start: l[1],
      ayah_end: l[2],
      relevance: 7,
      sort_order: idx,
      note_i18n: {},
    }));
  }

  const { data } = await supabase
    .from("knowledge_entity_verses")
    .select("*")
    .eq("entity_id", entityId)
    .order("sort_order", { ascending: true });
  const db = (data as EntityVerseLink[] | null) ?? [];
  if (db.length > 0) return db;

  const bySlug = seedEntities.find((e) => e.id === entityId)?.slug;
  if (!bySlug) return [];
  return (seedVersesBySlug.get(bySlug) ?? []).map((l, idx) => ({
    id: `seed:${bySlug}:${idx}`,
    entity_id: entityId,
    surah: l[0],
    ayah_start: l[1],
    ayah_end: l[2],
    relevance: 7,
    sort_order: idx,
    note_i18n: {},
  }));
}

export async function getRelatedEntities(entityId: string, limit = 16): Promise<KnowledgeEntity[]> {
  const sourceSlug = entityId.startsWith("seed:")
    ? entityId.slice(5)
    : seedEntities.find((e) => e.id === entityId)?.slug;

  const currentEntity = seedEntities.find((e) => e.id === entityId || e.slug === sourceSlug);
  const matchedSlugs = new Set<string>();
  const results: KnowledgeEntity[] = [];

  if (sourceSlug) {
    const directSlugs = seedRelations
      .filter(([from, to]) => from === sourceSlug || to === sourceSlug)
      .map(([from, to]) => (from === sourceSlug ? to : from));

    for (const s of directSlugs) {
      const ent = seedBySlug.get(s);
      if (ent && !matchedSlugs.has(ent.slug) && ent.slug !== sourceSlug) {
        matchedSlugs.add(ent.slug);
        results.push(ent);
      }
    }
  }

  // Try DB relations if needed
  if (results.length < limit) {
    const { data } = await supabase
      .from("knowledge_relations")
      .select("weight, to:knowledge_entities!knowledge_relations_to_id_fkey(*)")
      .eq("from_id", entityId)
      .order("weight", { ascending: false });

    if (data) {
      const dbEntities = (data as Array<{ to: KnowledgeEntity | null }>)
        .map((r) => r.to)
        .filter((e): e is KnowledgeEntity => !!e);
      for (const ent of dbEntities) {
        if (!matchedSlugs.has(ent.slug) && ent.slug !== sourceSlug) {
          matchedSlugs.add(ent.slug);
          results.push(ent);
        }
      }
    }
  }

  // Fill up with same kind entities
  if (currentEntity && results.length < limit) {
    const sameKind = seedEntities.filter(
      (e) =>
        e.kind === currentEntity.kind && e.slug !== currentEntity.slug && !matchedSlugs.has(e.slug),
    );
    for (const ent of sameKind) {
      matchedSlugs.add(ent.slug);
      results.push(ent);
      if (results.length >= limit) break;
    }
  }

  // Fill up with other entities to prevent dead ends
  if (results.length < limit) {
    for (const ent of seedEntities) {
      if (!matchedSlugs.has(ent.slug) && ent.slug !== sourceSlug) {
        matchedSlugs.add(ent.slug);
        results.push(ent);
        if (results.length >= limit) break;
      }
    }
  }

  return results.slice(0, limit);
}

export async function searchEntities(query: string, limit = 12): Promise<KnowledgeEntity[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const safe = q.replace(/[*,()]/g, " ");
  const filter = [
    `slug.ilike.*${safe}*`,
    `title_i18n->>he.ilike.*${safe}*`,
    `title_i18n->>ar.ilike.*${safe}*`,
    `title_i18n->>en.ilike.*${safe}*`,
    `summary_i18n->>he.ilike.*${safe}*`,
    `summary_i18n->>ar.ilike.*${safe}*`,
    `summary_i18n->>en.ilike.*${safe}*`,
  ].join(",");
  const { data } = await supabase
    .from("knowledge_entities")
    .select("*")
    .eq("published", true)
    .or(filter)
    .limit(limit);
  const db = (data as KnowledgeEntity[] | null) ?? [];
  if (db.length >= limit) return db;
  const ql = safe.toLowerCase();
  const fallback = seedEntities.filter((e) => {
    const title =
      `${e.title_i18n.he ?? ""} ${e.title_i18n.ar ?? ""} ${e.title_i18n.en ?? ""}`.toLowerCase();
    const summary =
      `${e.summary_i18n.he ?? ""} ${e.summary_i18n.ar ?? ""} ${e.summary_i18n.en ?? ""}`.toLowerCase();
    return e.slug.includes(ql) || title.includes(ql) || summary.includes(ql);
  });
  return mergeEntities(db, fallback).slice(0, limit);
}

export function groupByKind(entities: KnowledgeEntity[]): Record<EntityKind, KnowledgeEntity[]> {
  const out: Record<string, KnowledgeEntity[]> = {};
  for (const e of entities) {
    (out[e.kind] ||= []).push(e);
  }
  return out as Record<EntityKind, KnowledgeEntity[]>;
}

export interface KnowledgeTextHit {
  id: string;
  kind: "tafsir" | "asbab" | "lesson";
  surah: number | null;
  ayah_start: number | null;
  ayah_end: number | null;
  text: string;
  source_name: string;
}

export async function searchKnowledgeTexts(query: string, limit = 10): Promise<KnowledgeTextHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const safe = q.replace(/[*,()]/g, " ");

  const [tafsirRes, asbabRes, lessonRes] = await Promise.all([
    supabase
      .from("tafsir_passages")
      .select("id,surah,ayah_start,ayah_end,body,source:tafsir_sources(name_he,name_en)")
      .ilike("body", `%${safe}%`)
      .order("created_at", { ascending: false })
      .limit(Math.min(6, limit)),
    supabase
      .from("asbab_nuzul")
      .select("id,surah,ayah_start,ayah_end,body,source:tafsir_sources(name_he,name_en)")
      .ilike("body", `%${safe}%`)
      .order("created_at", { ascending: false })
      .limit(Math.min(4, limit)),
    supabase
      .from("topic_lessons")
      .select("id,body,source:tafsir_sources(name_he,name_en)")
      .ilike("body", `%${safe}%`)
      .order("created_at", { ascending: false })
      .limit(Math.min(4, limit)),
  ]);

  const tafsir = (
    (tafsirRes.data as Array<{
      id: string;
      surah: number;
      ayah_start: number;
      ayah_end: number;
      body: string;
      source: { name_he?: string; name_en?: string } | null;
    }> | null) ?? []
  ).map((r) => ({
    id: r.id,
    kind: "tafsir" as const,
    surah: r.surah,
    ayah_start: r.ayah_start,
    ayah_end: r.ayah_end,
    text: r.body,
    source_name: r.source?.name_en ?? r.source?.name_he ?? "Tafsir",
  }));

  const asbab = (
    (asbabRes.data as Array<{
      id: string;
      surah: number;
      ayah_start: number;
      ayah_end: number;
      body: string;
      source: { name_he?: string; name_en?: string } | null;
    }> | null) ?? []
  ).map((r) => ({
    id: r.id,
    kind: "asbab" as const,
    surah: r.surah,
    ayah_start: r.ayah_start,
    ayah_end: r.ayah_end,
    text: r.body,
    source_name: r.source?.name_en ?? r.source?.name_he ?? "Asbab",
  }));

  const lessons = (
    (lessonRes.data as Array<{
      id: string;
      body: string;
      source: { name_he?: string; name_en?: string } | null;
    }> | null) ?? []
  ).map((r) => ({
    id: r.id,
    kind: "lesson" as const,
    surah: null,
    ayah_start: null,
    ayah_end: null,
    text: r.body,
    source_name: r.source?.name_en ?? r.source?.name_he ?? "Lesson",
  }));

  return [...tafsir, ...asbab, ...lessons].slice(0, limit);
}

// ===== Journeys =====

export interface Journey {
  id: string;
  slug: string;
  title_i18n: I18nText;
  summary_i18n: I18nText;
  level: number;
  sort_order: number;
}

export interface JourneyStep {
  id: string;
  journey_id: string;
  step_order: number;
  entity_id: string | null;
  surah: number | null;
  ayah_start: number | null;
  ayah_end: number | null;
  notes_i18n: I18nText;
  entity?: KnowledgeEntity | null;
}

const seedJourneyTemplates: Array<{
  slug: string;
  level: number;
  title_i18n: I18nText;
  summary_i18n: I18nText;
  stepSlugs: string[];
}> = [
  {
    slug: "foundations-of-faith",
    level: 1,
    title_i18n: {
      he: "יסודות האמונה בקוראן",
      ar: "أساسيات الإيمان في القرآن",
      en: "Foundations of Faith in the Quran",
    },
    summary_i18n: {
      he: "מסלול פתיחה: ייחוד, תפילה, סבלנות ורחמים.",
      ar: "مسار افتتاحي: التوحيد، الصلاة، الصبر والرحمة.",
      en: "Starter journey: tawhid, prayer, patience, and mercy.",
    },
    stepSlugs: ["tawhid", "prayer", "patience", "mercy", "afterlife"],
  },
  {
    slug: "prophetic-journey",
    level: 2,
    title_i18n: {
      he: "מסע הנביאים",
      ar: "رحلة الأنبياء",
      en: "Journey of the Prophets",
    },
    summary_i18n: {
      he: "עקבו אחרי שליחותם של אברהם, משה, יוסף ומוחמד.",
      ar: "تتبّع دعوة إبراهيم وموسى ويوسف ومحمد.",
      en: "Follow the missions of Abraham, Moses, Joseph, and Muhammad.",
    },
    stepSlugs: ["ibrahim", "musa", "yusuf", "isa", "muhammad"],
  },
  {
    slug: "quranic-ethics",
    level: 2,
    title_i18n: {
      he: "מוסר ויחסים בקוראן",
      ar: "الأخلاق والعلاقات في القرآن",
      en: "Quranic Ethics and Relationships",
    },
    summary_i18n: {
      he: "צדק, צדקה, כיבוד הורים ותשובה.",
      ar: "العدل، الزكاة، برّ الوالدين والتوبة.",
      en: "Justice, charity, honoring parents, and repentance.",
    },
    stepSlugs: ["justice", "charity", "parents", "repentance", "knowledge"],
  },
];

function buildSeedJourneys(): Journey[] {
  return seedJourneyTemplates.map((j, idx) => ({
    id: `seed-journey:${j.slug}`,
    slug: j.slug,
    title_i18n: j.title_i18n,
    summary_i18n: j.summary_i18n,
    level: j.level,
    sort_order: idx,
  }));
}

function buildSeedJourneySteps(journeySlug: string): JourneyStep[] {
  const template = seedJourneyTemplates.find((j) => j.slug === journeySlug);
  if (!template) return [];
  const steps: JourneyStep[] = [];
  for (let idx = 0; idx < template.stepSlugs.length; idx += 1) {
    const slug = template.stepSlugs[idx];
    const entity = seedBySlug.get(slug);
    if (!entity) continue;
    steps.push({
      id: `seed-step:${journeySlug}:${idx}`,
      journey_id: `seed-journey:${journeySlug}`,
      step_order: idx + 1,
      entity_id: entity.id,
      surah: null,
      ayah_start: null,
      ayah_end: null,
      notes_i18n: entity.summary_i18n,
      entity,
    });
  }
  return steps;
}

export async function listJourneys(): Promise<Journey[]> {
  const { data } = await supabase
    .from("knowledge_journeys")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  const db = (data as Journey[] | null) ?? [];
  if (db.length > 0) return db;
  return buildSeedJourneys();
}

export async function getJourneyBySlug(
  slug: string,
): Promise<{ journey: Journey; steps: JourneyStep[] } | null> {
  const { data: j } = await supabase
    .from("knowledge_journeys")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (!j) {
    const seedJourney = buildSeedJourneys().find((x) => x.slug === slug);
    if (!seedJourney) return null;
    return { journey: seedJourney, steps: buildSeedJourneySteps(slug) };
  }
  const { data: steps } = await supabase
    .from("knowledge_journey_steps")
    .select("*, entity:knowledge_entities(*)")
    .eq("journey_id", (j as Journey).id)
    .order("step_order", { ascending: true });
  return { journey: j as Journey, steps: (steps as JourneyStep[] | null) ?? [] };
}

export async function getJourneyProgress(userId: string, journeyId: string): Promise<Set<string>> {
  const { data } = await supabase
    .from("knowledge_journey_progress")
    .select("step_id")
    .eq("user_id", userId)
    .eq("journey_id", journeyId);
  return new Set(((data as Array<{ step_id: string }> | null) ?? []).map((r) => r.step_id));
}

export async function toggleJourneyStep(
  userId: string,
  journeyId: string,
  stepId: string,
  done: boolean,
): Promise<void> {
  if (done) {
    await supabase
      .from("knowledge_journey_progress")
      .upsert(
        { user_id: userId, journey_id: journeyId, step_id: stepId },
        { onConflict: "user_id,step_id" },
      );
  } else {
    await supabase
      .from("knowledge_journey_progress")
      .delete()
      .eq("user_id", userId)
      .eq("step_id", stepId);
  }
}

// ===== Graph =====

export interface GraphRelation {
  from_id: string;
  to_id: string;
  relation: string;
  weight: number;
}

export async function listRelations(): Promise<GraphRelation[]> {
  const { data } = await supabase
    .from("knowledge_relations")
    .select("from_id,to_id,relation,weight");
  const db = (data as GraphRelation[] | null) ?? [];
  if (db.length > 0) return db;
  return seedRelations
    .map(([from, to, relation]) => {
      const fromEntity = seedBySlug.get(from);
      const toEntity = seedBySlug.get(to);
      if (!fromEntity || !toEntity) return null;
      return {
        from_id: fromEntity.id,
        to_id: toEntity.id,
        relation,
        weight: 6,
      } satisfies GraphRelation;
    })
    .filter((r): r is GraphRelation => !!r);
}
