import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import type { Locale } from "@/lib/i18n";

type ApiTafsirResponse = {
  text?: string;
  surah?: number;
  ayah?: number;
  ayahs?: Array<{ surah?: number; ayah?: number; text?: string }>;
};

type SourceMeta = {
  id: string;
  slug: string;
  name_he: string;
  name_ar: string;
  name_en: string;
  author: string | null;
};

const JALALAYN_SOURCE: SourceMeta = {
  id: "api-jalalayn",
  slug: "al_jalalayn",
  name_he: "תפסיר אל-ג׳לאלין",
  name_ar: "تفسير الجلالين",
  name_en: "Tafsir Al-Jalalayn",
  author: "Jalal al-Din al-Mahalli, Jalal al-Din al-Suyuti",
};

const WAHIDI_SOURCE: SourceMeta = {
  id: "api-wahidi-asbab",
  slug: "asbab_al_nuzul_wahidi",
  name_he: "אסבאב אל-נוזול (אל-וואחידי)",
  name_ar: "أسباب النزول للواحدي",
  name_en: "Asbab al-Nuzul by Al-Wahidi",
  author: "Al-Wahidi",
};

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function stripHtml(value: string): string {
  return value
    .replace(/<sup[^>]*>.*?<\/sup>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTafsirText(payload: unknown, surah: number, ayah: number): string | null {
  if (!payload || typeof payload !== "object") return null;

  const obj = payload as ApiTafsirResponse;
  if (typeof obj.text === "string" && obj.text.trim().length > 0) {
    return stripHtml(obj.text);
  }

  if (Array.isArray(obj.ayahs)) {
    const hit = obj.ayahs.find((row) => row.surah === surah && row.ayah === ayah);
    if (hit?.text) return stripHtml(hit.text);
  }

  if (Array.isArray(payload)) {
    const arr = payload as Array<{ text?: string; surah?: number; ayah?: number }>;
    const hit = arr.find((row) => row.surah === surah && row.ayah === ayah);
    if (hit?.text) return stripHtml(hit.text);
  }

  return null;
}

async function fetchJson(url: string): Promise<unknown | null> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function translateAcademic(
  text: string,
  targetLang: Locale,
  sourceName: string,
): Promise<string | null> {
  if (!text.trim()) return null;
  const key = process.env.LOVABLE_API_KEY;
  if (!key) return null;

  const gateway = createLovableAiGatewayProvider(key);
  const langLabel = targetLang === "he" ? "Hebrew" : targetLang === "ar" ? "Arabic" : "English";
  const prompt = [
    `Translate the authenticated Islamic source excerpt into academic ${langLabel}.`,
    "Rules:",
    "- Faithful translation only, no additions or omissions.",
    "- Preserve names, Quran references, and isnad-related wording.",
    "- Keep tone formal and scholarly.",
    "- Return plain text only.",
    `Source: ${sourceName}`,
    `Text:\n${text}`,
  ].join("\n");

  try {
    const { text: translated } = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      prompt,
      temperature: 0,
      maxOutputTokens: 1200,
    });
    const cleaned = normalizeText(stripHtml(translated));
    return cleaned.length > 0 ? cleaned : null;
  } catch {
    return null;
  }
}

async function fetchJalalaynRaw(surah: number, ayah: number, slug: string): Promise<string | null> {
  const url = `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${slug}/${surah}/${ayah}.json`;
  const payload = await fetchJson(url);
  return payload ? extractTafsirText(payload, surah, ayah) : null;
}

async function fetchAsbabRaw(surah: number, ayah: number): Promise<string | null> {
  const url = `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-asbab-al-nuzul-by-al-wahidi/${surah}/${ayah}.json`;
  const payload = await fetchJson(url);
  return payload ? extractTafsirText(payload, surah, ayah) : null;
}

export async function fetchJalalaynForVerse(args: {
  surah: number;
  ayah: number;
  lang: Locale;
}): Promise<{ body: string; lang: Locale; source: SourceMeta } | null> {
  const { surah, ayah, lang } = args;
  const arabic = await fetchJalalaynRaw(surah, ayah, "ar-tafsir-al-jalalayn");
  const english = await fetchJalalaynRaw(surah, ayah, "en-al-jalalayn");

  const direct = lang === "ar" ? arabic : lang === "en" ? english : null;

  if (direct) {
    return {
      body: normalizeText(direct),
      lang,
      source: JALALAYN_SOURCE,
    };
  }

  const fallbackText = arabic ?? english;
  if (!fallbackText) return null;

  const translated = await translateAcademic(fallbackText, lang, JALALAYN_SOURCE.name_en);
  return {
    body: normalizeText(translated ?? fallbackText),
    lang,
    source: JALALAYN_SOURCE,
  };
}

export async function fetchAsbabForVerseFromApi(args: {
  surah: number;
  ayah: number;
  lang: Locale;
}): Promise<{ body: string; lang: Locale; source: SourceMeta } | null> {
  const raw = await fetchAsbabRaw(args.surah, args.ayah);
  if (!raw) return null;

  if (args.lang === "en") {
    return {
      body: normalizeText(raw),
      lang: "en",
      source: WAHIDI_SOURCE,
    };
  }

  const translated = await translateAcademic(raw, args.lang, WAHIDI_SOURCE.name_en);
  return {
    body: normalizeText(translated ?? raw),
    lang: args.lang,
    source: WAHIDI_SOURCE,
  };
}
