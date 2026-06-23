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
});

export interface VerseCitation {
  surah: number;
  ayah: number;
  arabic: string;
  hebrew: string;
  similarity: number;
}

export interface TafsirCitation {
  source: string;
  translator?: string | null;
  surah: number;
  ayah: number;
  text: string;
}

export interface ResearchResult {
  answer: string;
  verses: VerseCitation[];
  tafsir: TafsirCitation[];
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
    const { data: chunkRows } = await supabaseAdmin.rpc("match_grounded_chunks", {
      query_embedding: embedding as unknown as string,
      match_count: Math.max(8, data.k * 2),
      min_similarity: 0.12,
      language_filter: data.language,
      surah_filter: undefined,
    });

    const chunkVerses = (chunkRows ?? []).filter((r) => r.content_type === "quran_ayah");
    const chunkTafsir = (chunkRows ?? []).filter((r) => r.content_type !== "quran_ayah");

    const verses: VerseCitation[] = [];
    if (chunkVerses.length > 0) {
      for (const row of chunkVerses.slice(0, data.k)) {
        verses.push({
          surah: Number(row.surah ?? 0),
          ayah: Number(row.ayah_start ?? 0),
          arabic: "",
          hebrew: (row.chunk_text ?? "").slice(0, 800),
          similarity: row.similarity ?? 0,
        });
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
        .select("surah,ayah_start,ayah_end,lang,body,source_id,tafsir_sources(name_en,author)")
        .in("surah", surahs)
        .eq("lang", data.language)
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

    // 4) Build grounded prompt
    const versesBlock = verses
      .map(
        (v, i) =>
          `[${i + 1}] (${v.surah}:${v.ayah}) AR: ${sanitize(v.arabic, 400)}\nHE: ${sanitize(v.hebrew, 400)}`,
      )
      .join("\n\n");
    const tafsirBlock = tafsir
      .map((t) => `(${t.source} on ${t.surah}:${t.ayah}) ${sanitize(t.text, 400)}`)
      .join("\n\n");

    const userMsg = `${SYSTEM_BY_LANG[data.language]}\n\n=== Question ===\n${sanitize(data.question)}\n\n=== Retrieved Evidence (LOCAL DATABASE ONLY) ===\nVerses:\n${versesBlock || "(none)"}\n\nTafsir:\n${tafsirBlock || "(none)"}\n\nRules:\n- Use only the evidence above.\n- If evidence is insufficient, output exactly: No authenticated Islamic source was found in the database for this question.\n- Cite verses as [surah:ayah].\n\nProduce a concise, well-cited answer.`;

    const gateway = createLovableAiGatewayProvider(apiKey);
    let answer = "";
    try {
      const { text } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        prompt: userMsg,
      });
      answer = text;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("429")) return { ...base, verses, tafsir, error: "rate_limit" };
      if (msg.includes("402")) return { ...base, verses, tafsir, error: "credits_exhausted" };
      return { ...base, verses, tafsir, error: "generation_failed" };
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
        citations: { verses, tafsir } as never,
        confidence,
        language: data.language,
      });
    } catch {
      // non-fatal
    }

    return { answer, verses, tafsir, confidence, language: data.language };
  });
