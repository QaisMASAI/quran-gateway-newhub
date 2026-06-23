import { supabase } from "@/integrations/supabase/client";
import type { LocaleCode } from "./translations-db";

export type EntityKind =
  | "topic"
  | "prophet"
  | "story"
  | "event"
  | "place"
  | "nation"
  | "concept"
  | "theme";

export interface I18nText {
  he?: string;
  ar?: string;
  en?: string;
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
  const { data } = await supabase
    .from("knowledge_entities")
    .select("*")
    .eq("published", true)
    .eq("kind", kind)
    .order("sort_order", { ascending: true });
  return (data as KnowledgeEntity[] | null) ?? [];
}

export async function listAllEntities(): Promise<KnowledgeEntity[]> {
  const { data } = await supabase
    .from("knowledge_entities")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return (data as KnowledgeEntity[] | null) ?? [];
}

export async function getEntityBySlug(slug: string): Promise<KnowledgeEntity | null> {
  const { data } = await supabase
    .from("knowledge_entities")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  return (data as KnowledgeEntity | null) ?? null;
}

export async function getEntityVerses(entityId: string): Promise<EntityVerseLink[]> {
  const { data } = await supabase
    .from("knowledge_entity_verses")
    .select("*")
    .eq("entity_id", entityId)
    .order("sort_order", { ascending: true });
  return (data as EntityVerseLink[] | null) ?? [];
}

export async function getRelatedEntities(entityId: string): Promise<KnowledgeEntity[]> {
  const { data, error } = await supabase
    .from("knowledge_relations")
    .select("weight, to:knowledge_entities!knowledge_relations_to_id_fkey(*)")
    .eq("from_id", entityId)
    .order("weight", { ascending: false });
  if (error || !data) return [];
  return (data as Array<{ to: KnowledgeEntity | null }>)
    .map((r) => r.to)
    .filter((e): e is KnowledgeEntity => !!e);
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
  return (data as KnowledgeEntity[] | null) ?? [];
}

export function groupByKind(
  entities: KnowledgeEntity[],
): Record<EntityKind, KnowledgeEntity[]> {
  const out: Record<string, KnowledgeEntity[]> = {};
  for (const e of entities) {
    (out[e.kind] ||= []).push(e);
  }
  return out as Record<EntityKind, KnowledgeEntity[]>;
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

export async function listJourneys(): Promise<Journey[]> {
  const { data } = await supabase
    .from("knowledge_journeys")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return (data as Journey[] | null) ?? [];
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
  if (!j) return null;
  const { data: steps } = await supabase
    .from("knowledge_journey_steps")
    .select("*, entity:knowledge_entities(*)")
    .eq("journey_id", (j as Journey).id)
    .order("step_order", { ascending: true });
  return { journey: j as Journey, steps: (steps as JourneyStep[] | null) ?? [] };
}

export async function getJourneyProgress(
  userId: string,
  journeyId: string,
): Promise<Set<string>> {
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
      .upsert({ user_id: userId, journey_id: journeyId, step_id: stepId }, { onConflict: "user_id,step_id" });
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
  return (data as GraphRelation[] | null) ?? [];
}
