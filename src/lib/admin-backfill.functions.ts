import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type JobKey =
  | "backfill-quran-chapters"
  | "backfill-asbab-nuzul"
  | "backfill-verse-translations"
  | "embed-hadith"
  | "translate-hadith-hebrew"
  | "translate-tafsir-english"
  | "link-hadith-graph"
  | "translate-tafsir-hebrew";

const JobInputSchema = z.object({
  jobKey: z.enum([
    "backfill-quran-chapters",
    "backfill-asbab-nuzul",
    "backfill-verse-translations",
    "embed-hadith",
    "translate-hadith-hebrew",
    "translate-tafsir-english",
    "link-hadith-graph",
    "translate-tafsir-hebrew",
  ]),
  payload: z.record(z.string(), z.unknown()).optional().default({}),
});

const JobPayloadSchemaMap: Record<JobKey, z.ZodType<Record<string, unknown>>> = {
  "backfill-quran-chapters": z.object({}).strict(),
  "backfill-asbab-nuzul": z
    .object({
      surah: z.number().int().min(1).max(114).optional(),
      page: z.number().int().min(1).max(1000).optional(),
      perPage: z.number().int().min(1).max(100).optional(),
    })
    .strict(),
  "backfill-verse-translations": z.object({}).strict(),
  "embed-hadith": z
    .object({
      batch: z.number().int().min(1).max(500).optional(),
      untilDone: z.boolean().optional(),
      maxRuns: z.number().int().min(1).max(500).optional(),
    })
    .strict(),
  "translate-hadith-hebrew": z
    .object({
      batch: z.number().int().min(1).max(50).optional(),
      model: z.string().min(3).max(120).optional(),
    })
    .strict(),
  "translate-tafsir-english": z
    .object({
      batch: z.number().int().min(1).max(200).optional(),
      model: z.string().min(3).max(120).optional(),
    })
    .strict(),
  "link-hadith-graph": z
    .object({
      batch: z.number().int().min(1).max(500).optional(),
      topVerses: z.number().int().min(1).max(10).optional(),
      topEntities: z.number().int().min(0).max(10).optional(),
      minVerseSim: z.number().min(0).max(1).optional(),
      minEntitySim: z.number().min(0).max(1).optional(),
    })
    .strict(),
  "translate-tafsir-hebrew": z
    .object({
      batch: z.number().int().min(1).max(200).optional(),
      model: z.string().min(3).max(120).optional(),
    })
    .strict(),
};

const CacheSettingsSchema = z.object({
  ttlMinutes: z.number().int().min(5).max(24 * 60),
});

const RegressionSchema = z.object({
  sampleSurahs: z.array(z.number().int().min(1).max(114)).min(1).max(8).optional().default([1, 2, 18, 36]),
});

function routePathForJob(jobKey: JobKey) {
  switch (jobKey) {
    case "backfill-quran-chapters":
      return "/api/public/admin/backfill-quran-chapters";
    case "backfill-asbab-nuzul":
      return "/api/public/admin/backfill-asbab-nuzul";
    case "backfill-verse-translations":
      return "/api/public/admin/backfill-verse-translations";
    case "embed-hadith":
      return "/api/public/admin/embed-hadith";
    case "translate-hadith-hebrew":
      return "/api/public/admin/translate-hadith-hebrew";
    case "translate-tafsir-english":
      return "/api/public/admin/translate-tafsir-english";
    case "link-hadith-graph":
      return "/api/public/admin/link-hadith-graph";
    case "translate-tafsir-hebrew":
      return "/api/public/admin/translate-tafsir-hebrew";
  }
}

async function invokeAdminRoute(path: string, payload: Record<string, unknown>) {
  const token = process.env.QURAN_ADMIN_TOKEN;
  const req = getRequest();
  if (!token) throw new Error("Missing QURAN_ADMIN_TOKEN");
  if (!req) throw new Error("Request context unavailable");

  const origin = new URL(req.url).origin;
  const res = await fetch(`${origin}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...payload, token }),
  });

  const body = await res.json().catch(() => ({ ok: false, error: `http_${res.status}` }));
  if (!res.ok || body?.ok === false) {
    throw new Error(body?.error ?? `request_failed_${res.status}`);
  }
  return body;
}

async function requireAdminUser(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (data !== true) throw new Error("Forbidden: admin access required");
}

export const getAdminBackfillStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdminUser(context);
    const [{ count: chapterCount }, { count: asbabCount }, { count: ayahCount }, { count: hadithTopicLinkCount }, { data: failedJobs }, { data: settingsRow }, { data: tafsirAuditRows }] =
      await Promise.all([
        context.supabase.from("quran_chapters").select("id", { count: "exact", head: true }),
        context.supabase.from("asbab_nuzul").select("id", { count: "exact", head: true }),
        context.supabase.from("ayah_translations").select("id", { count: "exact", head: true }),
        context.supabase
          .from("hadith_entity_links")
          .select("id", { count: "exact", head: true })
          .not("entity_id", "is", null),
        context.supabase
          .from("admin_job_runs")
          .select("id,job_key,status,error_message,started_at,finished_at,updated_at")
          .eq("requested_by", context.userId)
          .eq("status", "failed")
          .order("started_at", { ascending: false })
          .limit(10),
        context.supabase
          .from("admin_runtime_settings")
          .select("key,value_json,updated_at")
          .eq("key", "research_cache")
          .maybeSingle(),
        context.supabase
          .from("tafsir_passages")
          .select("lang,source_id,source:tafsir_sources!inner(name_en)")
          .order("lang", { ascending: true })
          .limit(20000),
      ]);

    const valueJson = (settingsRow?.value_json ?? {}) as { ttl_minutes?: number; version?: number };

    const tafsirAudit = new Map<string, { sourceName: string; ar: number; he: number; en: number }>();
    for (const row of (tafsirAuditRows ?? []) as Array<{ lang: string; source: { name_en?: string } | null; source_id: string }>) {
      const key = row.source_id;
      const sourceName = row.source?.name_en ?? "Tafsir";
      const current = tafsirAudit.get(key) ?? { sourceName, ar: 0, he: 0, en: 0 };
      if (row.lang === "ar") current.ar += 1;
      if (row.lang === "he") current.he += 1;
      if (row.lang === "en") current.en += 1;
      tafsirAudit.set(key, current);
    }

    return {
      jobs: {
        quranChapters: { complete: (chapterCount ?? 0) >= 114, count: chapterCount ?? 0, target: 114 },
        asbabNuzul: { complete: (asbabCount ?? 0) > 0, count: asbabCount ?? 0 },
        verseTranslations: { complete: (ayahCount ?? 0) >= 12000, count: ayahCount ?? 0 },
        hadithTopics: { complete: (hadithTopicLinkCount ?? 0) > 0, count: hadithTopicLinkCount ?? 0 },
      },
      failedJobs: failedJobs ?? [],
      cache: {
        ttlMinutes: Number(valueJson.ttl_minutes ?? 360),
        version: Number(valueJson.version ?? 1),
        updatedAt: settingsRow?.updated_at ?? null,
      },
      tafsirAudit: [...tafsirAudit.values()].sort((a, b) => a.sourceName.localeCompare(b.sourceName)),
    };
  });

export const listAdminJobRuns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdminUser(context);
    const { data, error } = await context.supabase
      .from("admin_job_runs")
      .select("id,job_key,status,payload,result,error_message,started_at,finished_at,updated_at")
      .eq("requested_by", context.userId)
      .order("started_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const runAdminBackfillJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => JobInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdminUser(context);
    const payload = JobPayloadSchemaMap[data.jobKey].parse(data.payload ?? {});

    const { data: runRow, error: createErr } = await context.supabase
      .from("admin_job_runs")
      .insert({
        job_key: data.jobKey,
        status: "running",
        requested_by: context.userId,
        payload: payload as unknown as never,
      })
      .select("id")
      .single();

    if (createErr || !runRow?.id) throw new Error(createErr?.message ?? "Failed to start job run");

    try {
      const result = await invokeAdminRoute(routePathForJob(data.jobKey), payload);
      await context.supabase
        .from("admin_job_runs")
        .update({
          status: "succeeded",
          result,
          finished_at: new Date().toISOString(),
          error_message: null,
        })
        .eq("id", runRow.id)
        .eq("requested_by", context.userId);
      return { ok: true, runId: runRow.id, result };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await context.supabase
        .from("admin_job_runs")
        .update({
          status: "failed",
          error_message: errorMessage,
          finished_at: new Date().toISOString(),
        })
        .eq("id", runRow.id)
        .eq("requested_by", context.userId);
      return { ok: false, runId: runRow.id, error: errorMessage };
    }
  });

export const updateResearchCacheSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => CacheSettingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requireAdminUser(context);
    const { data: current } = await context.supabase
      .from("admin_runtime_settings")
      .select("value_json")
      .eq("key", "research_cache")
      .maybeSingle();

    const currentJson = (current?.value_json ?? {}) as { version?: number };
    const nextValue = {
      ttl_minutes: data.ttlMinutes,
      version: Number(currentJson.version ?? 1),
    };

    const { error } = await context.supabase.from("admin_runtime_settings").upsert(
      {
        key: "research_cache",
        value_json: nextValue,
        updated_by: context.userId,
      },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true, ...nextValue };
  });

export const invalidateResearchCache = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await requireAdminUser(context);
    const { data: current } = await context.supabase
      .from("admin_runtime_settings")
      .select("value_json")
      .eq("key", "research_cache")
      .maybeSingle();
    const currentJson = (current?.value_json ?? {}) as { ttl_minutes?: number; version?: number };
    const nextValue = {
      ttl_minutes: Number(currentJson.ttl_minutes ?? 360),
      version: Number(currentJson.version ?? 1) + 1,
    };
    const { error } = await context.supabase.from("admin_runtime_settings").upsert(
      {
        key: "research_cache",
        value_json: nextValue,
        updated_by: context.userId,
      },
      { onConflict: "key" },
    );
    if (error) throw new Error(error.message);
    return { ok: true, ...nextValue };
  });

export const runLocaleRegressionCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => RegressionSchema.parse(input ?? {}))
  .handler(async ({ data, context }) => {
    await requireAdminUser(context);
    const { fetchVerseBilingual, fetchSurahBilingual } = await import("@/lib/translations-db");
    const samples = data.sampleSurahs;
    const errors: string[] = [];

    for (const surah of samples) {
      const [enRows, heRows, arRows] = await Promise.all([
        fetchSurahBilingual(surah, "en"),
        fetchSurahBilingual(surah, "he"),
        fetchSurahBilingual(surah, "ar"),
      ]);

      if (enRows.length === 0 || heRows.length === 0 || arRows.length === 0) {
        errors.push(`Surah ${surah}: missing rows for one or more locales`);
        continue;
      }

      const sampleAyahs = [enRows[0]?.ayah, enRows[Math.floor(enRows.length / 2)]?.ayah, enRows.at(-1)?.ayah]
        .filter((v): v is number => Number.isFinite(v));

      for (const ayah of sampleAyahs) {
        const [enVerse, heVerse, arVerse] = await Promise.all([
          fetchVerseBilingual(surah, ayah, "en"),
          fetchVerseBilingual(surah, ayah, "he"),
          fetchVerseBilingual(surah, ayah, "ar"),
        ]);

        if (!enVerse?.arabic || !heVerse?.arabic || !arVerse?.arabic) {
          errors.push(`Surah ${surah}:${ayah}: Arabic missing in one or more locales`);
        }
        if (!enVerse?.translation && !enVerse?.arabic) {
          errors.push(`Surah ${surah}:${ayah}: English translation missing`);
        }
        if (!heVerse?.translation && !heVerse?.arabic) {
          errors.push(`Surah ${surah}:${ayah}: Hebrew translation missing`);
        }
        if (arVerse?.translation !== arVerse?.arabic) {
          errors.push(`Surah ${surah}:${ayah}: Arabic locale should be Arabic-only`);
        }
      }
    }

    const dailySamples = [
      { surah: 1, ayah: 1 },
      { surah: 2, ayah: 255 },
      { surah: 55, ayah: 13 },
      { surah: 112, ayah: 1 },
    ];

    for (const item of dailySamples) {
      const [enV, heV, arV] = await Promise.all([
        fetchVerseBilingual(item.surah, item.ayah, "en"),
        fetchVerseBilingual(item.surah, item.ayah, "he"),
        fetchVerseBilingual(item.surah, item.ayah, "ar"),
      ]);
      if (!enV?.arabic || !heV?.arabic || !arV?.arabic) {
        errors.push(`DailyVerse sample ${item.surah}:${item.ayah}: Arabic missing`);
      }
      if (!enV?.translation && !enV?.arabic) errors.push(`DailyVerse sample ${item.surah}:${item.ayah}: missing English translation`);
      if (!heV?.translation && !heV?.arabic) errors.push(`DailyVerse sample ${item.surah}:${item.ayah}: missing Hebrew translation`);
      if (arV?.translation !== arV?.arabic) {
        errors.push(`DailyVerse sample ${item.surah}:${item.ayah}: Arabic locale not Arabic-only`);
      }
    }

    return {
      ok: errors.length === 0,
      checkedSurahs: samples,
      dailyVerseSamples: dailySamples,
      errors,
    };
  });
