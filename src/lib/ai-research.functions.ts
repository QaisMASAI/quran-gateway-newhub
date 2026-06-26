// AI Research Assistant — Quran-grounded RAG.
// Returns answer + verse citations + tafsir refs + confidence score.
// Logs each query to ai_research_queries for history/analytics.
import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { embedTexts } from "./embeddings.server";

const ResearchSchema = z.object({
  question: z.string().min(2).max(500),
  language: z.enum(["he", "en", "ar"]).optional().default("he"),
  k: z.number().int().min(1).max(15).optional().default(8),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(1200),
      }),
    )
    .max(12)
    .optional()
    .default([]),
});

export interface VerseCitation {
  surah: number;
  ayah: number;
  arabic: string;
  hebrew: string;
  translation_source?: string | null;
  translator?: string | null;
  similarity: number;
}

export interface TafsirCitation {
  source: string;
  translator?: string | null;
  surah: number;
  ayah: number;
  text: string;
}

export interface HadithCitation {
  collection: string;
  collection_label: string;
  book_id: number;
  id_in_book: number;
  global_id: number;
  narrator: string | null;
  arabic: string;
  english: string;
}

export interface ResearchResult {
  answer: string;
  verses: VerseCitation[];
  tafsir: TafsirCitation[];
  hadith: HadithCitation[];
  confidence: number; // 0..1
  language: string;
  error?: string;
}

function sanitize(s: string, max = 600) {
  return s
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, " ")
    .replace(/```+/g, "'''")
    .replace(/\b(ignore|disregard)\s+(previous|prior)\s+(instructions?)\b/gi, "[filtered]")
    .slice(0, max);
}

function cleanHtml(input: string) {
  return input.replace(/<sup[^>]*>.*?<\/sup>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

async function fetchFallbackVerses(
  question: string,
  language: "he" | "en" | "ar",
  k: number,
): Promise<VerseCitation[]> {
  try {
    const searchRes = await fetch(
      `https://api.quran.com/api/v4/search?q=${encodeURIComponent(question)}&size=${Math.max(4, k * 2)}&page=1&language=en`,
    );
    if (!searchRes.ok) return [];
    const searchJson = (await searchRes.json()) as {
      search?: { results?: Array<{ verse_key: string }> };
    };
    const keys = Array.from(
      new Set((searchJson.search?.results ?? []).map((r) => r.verse_key).filter(Boolean)),
    ).slice(0, k);
    if (keys.length === 0) return [];

    const trId = language === "he" ? 233 : language === "en" ? 20 : 0;
    const out: VerseCitation[] = [];

    for (const key of keys) {
      const [s, a] = key.split(":").map(Number);
      if (!s || !a) continue;
      const verseRes = await fetch(
        `https://api.quran.com/api/v4/verses/by_key/${s}:${a}?words=false${trId ? `&translations=${trId}` : ""}`,
      );
      if (!verseRes.ok) continue;
      const verseJson = (await verseRes.json()) as {
        verse?: {
          text_uthmani?: string;
          translations?: Array<{ text: string; resource_name?: string }>;
        };
      };
      const arabic = verseJson.verse?.text_uthmani ?? "";
      const translation =
        language === "ar"
          ? arabic
          : cleanHtml(verseJson.verse?.translations?.[0]?.text ?? "") || arabic;
      out.push({
        surah: s,
        ayah: a,
        arabic,
        hebrew: translation,
        similarity: 0.2,
        translation_source: verseJson.verse?.translations?.[0]?.resource_name ?? null,
      });
    }

    return out;
  } catch {
    return [];
  }
}

function normalizeForSearch(input: string, language: "he" | "en" | "ar") {
  let out = input.toLowerCase();
  if (language === "he") {
    out = out
      .replace(/[\u0591-\u05C7]/g, "")
      .replace(/[\u05BE\u05C0\u05C3\u05F3\u05F4"'.,!?;:()\[\]{}\-_/\\]/g, " ");
  }
  if (language === "ar") {
    out = out
      .replace(/[\u064B-\u065F\u0670]/g, "")
      .replace(/[\u0622\u0623\u0625]/g, "ا")
      .replace(/ى/g, "ي")
      .replace(/ة/g, "ه")
      .replace(/["'.,!?;:()\[\]{}\-_/\\]/g, " ");
  }
  return out.replace(/\s+/g, " ").trim();
}

function lexicalOverlapScore(query: string, text: string, language: "he" | "en" | "ar") {
  const normalizedQuery = normalizeForSearch(query, language);
  const normalizedText = normalizeForSearch(text, language);
  if (!normalizedQuery || !normalizedText) return 0;
  const terms = [...new Set(normalizedQuery.split(" ").filter((t) => t.length >= 2))];
  if (!terms.length) return 0;
  const hits = terms.reduce((acc, term) => (normalizedText.includes(term) ? acc + 1 : acc), 0);
  return hits / terms.length;
}

const NO_SOURCE_MESSAGE = "No authenticated Islamic source was found in the database for this question.";

const SYSTEM_BY_LANG: Record<string, string> = {
  he: `אתה עוזר מחקר על הקוראן. ענה אך ורק על בסיס הפסוקים והתפסירים המסופקים. אם המידע לא קיים — אמור זאת בכנות. צטט פסוקים בפורמט [סורה:איה]. כתוב בעברית בצורה נגישה לקוראים בני 9-70, מוסלמים ולא-מוסלמים כאחד. אסור להמציא פסוקים או מקורות.`,
  en: `You are a Quran research assistant. Answer ONLY based on the supplied verses and tafsir. If information is missing, say so honestly. Cite verses as [Surah:Ayah]. Write accessibly for ages 9-70, Muslim and non-Muslim alike. Never fabricate verses or sources.`,
  ar: `أنت مساعد بحث قرآني. أجب فقط بناءً على الآيات والتفاسير المقدمة. إذا لم يتوفر المعلومة قل ذلك بصراحة. استشهد بالآيات بصيغة [السورة:الآية]. لا تختلق آيات أو مصادر.`,
};

export const askQuranResearch = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResearchSchema.parse(input))
  .handler(async ({ data }): Promise<ResearchResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    const base: ResearchResult = {
      answer: "",
      verses: [],
      tafsir: [],
      hadith: [],
      confidence: 0,
      language: data.language,
    };
    if (!apiKey) return { ...base, error: "ai_not_configured" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1) Embed the question
    let embedding: number[] | null = null;
    try {
      const [vec] = await embedTexts({ apiKey, input: data.question });
      embedding = vec ?? null;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429")) return { ...base, error: "rate_limit" };
      if (msg.includes("402")) return { ...base, error: "credits_exhausted" };
      return { ...base, error: "embedding_failed" };
    }
    if (!embedding) return { ...base, error: "no_embedding" };

    // 2) Strictly grounded retrieval from local database only.
    let { data: chunkRows } = await supabaseAdmin.rpc("match_grounded_chunks", {
      query_embedding: embedding as unknown as string,
      match_count: Math.max(20, data.k * 4),
      min_similarity: 0.12,
      language_filter: data.language,
      surah_filter: undefined,
    });

    if (!chunkRows || chunkRows.length === 0) {
      const retry = await supabaseAdmin.rpc("match_grounded_chunks", {
        query_embedding: embedding as unknown as string,
        match_count: Math.max(20, data.k * 4),
        min_similarity: 0.12,
        language_filter: undefined,
        surah_filter: undefined,
      });
      chunkRows = retry.data;
    }

    type ChunkRow = {
      content_type: string;
      language: "he" | "en" | "ar";
      source_name: string | null;
      translator_name: string | null;
      surah: number | null;
      ayah_start: number | null;
      chunk_text: string | null;
      similarity: number | null;
    };

    const reranked = ((chunkRows ?? []) as ChunkRow[])
      .map((row) => {
        const semantic = row.similarity ?? 0;
        const lexical = lexicalOverlapScore(data.question, row.chunk_text ?? "", data.language);
        const languageBoost = row.language === data.language ? 0.06 : row.language === "ar" ? 0.03 : 0;
        return {
          ...row,
          rankScore: semantic * 0.75 + lexical * 0.25 + languageBoost,
        };
      })
      .sort((a, b) => b.rankScore - a.rankScore);

    const chunkVerses = reranked.filter((r) => r.content_type === "quran_ayah");
    const chunkTafsir = reranked.filter((r) => r.content_type !== "quran_ayah");

    const verses: VerseCitation[] = [];
    if (chunkVerses.length > 0) {
      for (const row of chunkVerses.slice(0, data.k)) {
        verses.push({
          surah: Number(row.surah ?? 0),
          ayah: Number(row.ayah_start ?? 0),
          arabic: "",
          hebrew: (row.chunk_text ?? "").slice(0, 800),
          translation_source: row.source_name ?? "Quran",
          translator: row.translator_name,
          similarity: row.similarity ?? 0,
        });
      }

      const surahs = [...new Set(verses.map((v) => v.surah).filter((s) => Number.isFinite(s) && s > 0))];
      if (surahs.length > 0) {
        const { data: verseRows } = await supabaseAdmin
          .from("verse_embeddings")
          .select("surah,ayah,arabic,hebrew")
          .in("surah", surahs);
        const byKey = new Map<string, { arabic: string; hebrew: string | null }>();
        for (const r of verseRows ?? []) {
          byKey.set(`${r.surah}:${r.ayah}`, { arabic: r.arabic ?? "", hebrew: r.hebrew ?? null });
        }
        for (const v of verses) {
          const match = byKey.get(`${v.surah}:${v.ayah}`);
          if (!match) continue;
          if (!v.arabic) v.arabic = match.arabic;
          if (!v.hebrew && match.hebrew) v.hebrew = match.hebrew;
        }
      }
    } else {
      const { data: verseRows } = await supabaseAdmin.rpc("match_verses", {
        query_embedding: embedding as unknown as string,
        match_count: data.k,
        min_similarity: 0.15,
      });
      for (const r of verseRows ?? []) {
        verses.push({
          surah: r.surah as number,
          ayah: r.ayah as number,
          arabic: r.arabic,
          hebrew: r.hebrew,
          similarity: r.similarity ?? 0,
        });
      }
    }

    const tafsir: TafsirCitation[] = [];
    if (chunkTafsir.length > 0) {
      for (const row of chunkTafsir.slice(0, 12)) {
        tafsir.push({
          source: row.source_name ?? "Tafsir",
          translator: row.translator_name,
          surah: Number(row.surah ?? 0),
          ayah: Number(row.ayah_start ?? 0),
          text: (row.chunk_text ?? "").slice(0, 600),
        });
      }
    } else if (verses.length > 0) {
      const surahs = [...new Set(verses.map((v) => v.surah))];
      const { data: tafRows } = await supabaseAdmin
        .from("tafsir_passages")
        .select("surah,ayah_start,ayah_end,lang,body,source_id,tafsir_sources!inner(slug,name_en,author)")
        .in("surah", surahs)
        .eq("lang", data.language)
        .eq("tafsir_sources.slug", "al_jalalayn")
        .limit(10);

      for (const t of tafRows ?? []) {
        const matchVerse = verses.find(
          (v) =>
            v.surah === t.surah && v.ayah >= (t.ayah_start ?? 0) && v.ayah <= (t.ayah_end ?? 9999),
        );
        if (!matchVerse) continue;
        tafsir.push({
          source:
            (t as { tafsir_sources?: { name_en?: string } }).tafsir_sources?.name_en ?? "Tafsir",
          translator:
            (t as { tafsir_sources?: { author?: string | null } }).tafsir_sources?.author ?? null,
          surah: t.surah as number,
          ayah: matchVerse.ayah,
          text: (t.body ?? "").slice(0, 600),
        });
      }
    }

    if (verses.length === 0 && tafsir.length === 0) {
      const fallbackVerses = await fetchFallbackVerses(data.question, data.language, data.k);
      if (fallbackVerses.length > 0) {
        const surahs = [...new Set(fallbackVerses.map((v) => v.surah))];
        const { data: tafRows } = await supabaseAdmin
          .from("tafsir_passages")
          .select("surah,ayah_start,ayah_end,lang,body,source_id,tafsir_sources!inner(slug,name_en,author)")
          .in("surah", surahs)
          .eq("tafsir_sources.slug", "al_jalalayn")
          .limit(10);
        for (const t of tafRows ?? []) {
          const matchVerse = fallbackVerses.find(
            (v) =>
              v.surah === t.surah && v.ayah >= (t.ayah_start ?? 0) && v.ayah <= (t.ayah_end ?? 9999),
          );
          if (!matchVerse) continue;
          tafsir.push({
            source:
              (t as { tafsir_sources?: { name_en?: string } }).tafsir_sources?.name_en ?? "Tafsir",
            translator:
              (t as { tafsir_sources?: { author?: string | null } }).tafsir_sources?.author ?? null,
            surah: t.surah as number,
            ayah: matchVerse.ayah,
            text: (t.body ?? "").slice(0, 600),
          });
        }
        verses.push(...fallbackVerses);
      } else {
        // continue; hadith may still provide grounding
      }
    }

    // 3b) Hadith retrieval (FTS, language-agnostic — Arabic + English indexed)
    const hadithList: HadithCitation[] = [];
    try {
      const { data: hRows } = await supabaseAdmin.rpc("search_hadith_hybrid" as never, {
        q: data.question,
        collections: null,
        match_count: 6,
      } as never);
      const labelMap: Record<string, string> = {
        bukhari: "Sahih al-Bukhari",
        muslim: "Sahih Muslim",
      };
      for (const r of (hRows ?? []) as Array<{
        collection_slug: string;
        book_id: number;
        id_in_book: number;
        global_id: number;
        narrator: string | null;
        arabic_text: string;
        english_text: string | null;
      }>) {
        hadithList.push({
          collection: r.collection_slug,
          collection_label: labelMap[r.collection_slug] ?? r.collection_slug,
          book_id: r.book_id,
          id_in_book: r.id_in_book,
          global_id: r.global_id,
          narrator: r.narrator,
          arabic: (r.arabic_text ?? "").slice(0, 600),
          english: (r.english_text ?? "").slice(0, 600),
        });
      }
    } catch {
      // non-fatal
    }

    if (verses.length === 0 && tafsir.length === 0 && hadithList.length === 0) {
      return { ...base, answer: NO_SOURCE_MESSAGE };
    }

    // 4) Build grounded prompt
    const historyBlock = (data.history ?? [])
      .slice(-8)
      .map((m) => `${m.role === "user" ? "User" : "Assistant"}: ${sanitize(m.content, 320)}`)
      .join("\n");

    const versesBlock = verses
      .map(
        (v, i) =>
          `[${i + 1}] (${v.surah}:${v.ayah}) AR: ${sanitize(v.arabic, 400)}\nHE: ${sanitize(v.hebrew, 400)}`,
      )
      .join("\n\n");
    const tafsirBlock = tafsir
      .map((t) => `(${t.source} on ${t.surah}:${t.ayah}) ${sanitize(t.text, 400)}`)
      .join("\n\n");
    const hadithBlock = hadithList
      .map(
        (h, i) =>
          `[H${i + 1}] (${h.collection_label} #${h.id_in_book}) ${h.narrator ? `Narrator: ${sanitize(h.narrator, 120)} — ` : ""}EN: ${sanitize(h.english, 360)}\nAR: ${sanitize(h.arabic, 360)}`,
      )
      .join("\n\n");

    const userMsg = `${SYSTEM_BY_LANG[data.language]}\n\n=== Conversation Memory ===\n${historyBlock || "(none)"}\n\n=== Current Question ===\n${sanitize(data.question)}\n\n=== Retrieved Evidence (LOCAL DATABASE ONLY) ===\nVerses:\n${versesBlock || "(none)"}\n\nTafsir:\n${tafsirBlock || "(none)"}\n\nHadith:\n${hadithBlock || "(none)"}\n\nRules:\n- Use only the evidence above (verses, tafsir, and hadith).\n- If evidence is insufficient, output exactly: ${NO_SOURCE_MESSAGE}\n- Cite verses as [surah:ayah]. Cite hadith as [Bukhari #N] or [Muslim #N].\n- Keep answer concise, structured, and faithful to sources.\n\nProduce a concise, well-cited answer.`;

    const gateway = createLovableAiGatewayProvider(apiKey);
    let answer = "";
    const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
      return await Promise.race([
        promise,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("generation_timeout")), timeoutMs),
        ),
      ]);
    };
    try {
      const { text } = await withTimeout(
        generateText({
          model: gateway("google/gemini-2.5-flash"),
          prompt: userMsg,
          temperature: 0,
          maxOutputTokens: 700,
        }),
        20_000,
      );
      answer = text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429")) return { ...base, verses, tafsir, hadith: hadithList, error: "rate_limit" };
      if (msg.includes("402")) return { ...base, verses, tafsir, hadith: hadithList, error: "credits_exhausted" };
      return { ...base, verses, tafsir, hadith: hadithList, error: "generation_failed" };
    }

    // 5) Confidence = avg of top-3 similarities clamped + tafsir boost
    const topSims = verses.slice(0, 3).map((v) => v.similarity);
    const avgSim = topSims.length ? topSims.reduce((a, b) => a + b, 0) / topSims.length : 0;
    const tafsirBoost = Math.min(0.15, tafsir.length * 0.05);
    const confidence = Math.max(0, Math.min(1, avgSim + tafsirBoost));

    // 6) Log the query (best-effort)
    try {
      await supabaseAdmin.from("ai_research_queries").insert({
        question: data.question.slice(0, 500),
        answer: answer.slice(0, 4000),
        citations: { verses, tafsir, hadith: hadithList } as never,
        confidence,
        language: data.language,
      });
    } catch {
      // non-fatal
    }

    return {
      answer: answer?.trim() || NO_SOURCE_MESSAGE,
      verses,
      tafsir,
      hadith: hadithList,
      confidence,
      language: data.language,
    };
  });
