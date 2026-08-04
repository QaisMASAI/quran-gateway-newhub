import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import {
  performUnifiedSearch,
  type UnifiedSearchResultItem,
  type UnifiedSearchResponse,
} from "./search-unified";
import { listEntitiesByKind, type KnowledgeEntity } from "./knowledge";
import { ALL_PROPHETS } from "./prophets";

export interface BriefTerm {
  term: string;
  transliteration?: string;
  meaning: string;
  context?: string;
}

export interface BriefFAQ {
  question: string;
  answer: string;
  citations: string[];
}

export interface BriefEntityRef {
  name: string;
  kind: "prophet" | "place" | "event" | "scholar" | "companion" | "topic" | "story" | "concept";
  slug?: string;
  description?: string;
}

export interface BriefReference {
  type: "quran" | "hadith" | "tafsir" | "entity";
  label: string;
  url: string;
  snippet?: string;
}

export interface SearchResearchBrief {
  query: string;
  locale: "ar" | "en" | "he";
  overview: string;
  historicalContext: string;
  quranicPerspective: string;
  hadithPerspective: string;
  tafsirInsights: string;
  scholarlyObservations: string;
  mainThemes: string[];
  relatedConcepts: string[];
  importantTerminology: BriefTerm[];
  relatedProphets: BriefEntityRef[];
  relatedPlaces: BriefEntityRef[];
  relatedEvents: BriefEntityRef[];
  practicalLessons: string[];
  faqs: BriefFAQ[];
  nextTopics: string[];
  groundingStats: {
    versesCount: number;
    hadithsCount: number;
    tafsirCount: number;
    entitiesCount: number;
  };
  references: BriefReference[];
  isAiGenerated: boolean;
  generatedAt: string;
}

const RequestSchema = z.object({
  query: z.string().min(1).max(300),
  locale: z.enum(["ar", "en", "he"]).optional().default("he"),
});

function sanitize(text: string, maxLen = 500): string {
  if (!text) return "";
  return text
    .replace(/[\r\n]+/g, " ")
    .slice(0, maxLen)
    .trim();
}

/**
 * Deterministic fallback generator that constructs an executive research brief
 * directly from internal database items when Gemini key is absent or unreachable.
 */
function generateFallbackResearchBrief(
  query: string,
  locale: "ar" | "en" | "he",
  quranItems: UnifiedSearchResultItem[],
  hadithItems: UnifiedSearchResultItem[],
  tafsirItems: UnifiedSearchResultItem[],
  entityItems: KnowledgeEntity[],
): SearchResearchBrief {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const topVerse = quranItems[0];
  const topHadith = hadithItems[0];
  const topTafsir = tafsirItems[0];

  // Identify related entities
  const prophetsList = entityItems
    .filter((e) => e.kind === "prophet")
    .map((p) => ({
      name: (isAr ? p.title_i18n?.ar : isHe ? p.title_i18n?.he : p.title_i18n?.en) || p.slug,
      kind: "prophet" as const,
      slug: p.slug,
      description:
        (isAr ? p.summary_i18n?.ar : isHe ? p.summary_i18n?.he : p.summary_i18n?.en) || undefined,
    }));

  const placesList = entityItems
    .filter((e) => e.kind === "place")
    .map((p) => ({
      name: (isAr ? p.title_i18n?.ar : isHe ? p.title_i18n?.he : p.title_i18n?.en) || p.slug,
      kind: "place" as const,
      slug: p.slug,
      description:
        (isAr ? p.summary_i18n?.ar : isHe ? p.summary_i18n?.he : p.summary_i18n?.en) || undefined,
    }));

  const eventsList = entityItems
    .filter((e) => e.kind === "event")
    .map((p) => ({
      name: (isAr ? p.title_i18n?.ar : isHe ? p.title_i18n?.he : p.title_i18n?.en) || p.slug,
      kind: "event" as const,
      slug: p.slug,
      description:
        (isAr ? p.summary_i18n?.ar : isHe ? p.summary_i18n?.he : p.summary_i18n?.en) || undefined,
    }));

  const verseCitations = quranItems.map((q) => q.title).join(", ");
  const hadithCitations = hadithItems.map((h) => h.title).join(", ");

  const references: BriefReference[] = [
    ...quranItems.slice(0, 6).map((q) => ({
      type: "quran" as const,
      label: q.title,
      url: q.url,
      snippet: q.snippet,
    })),
    ...hadithItems.slice(0, 6).map((h) => ({
      type: "hadith" as const,
      label: h.title,
      url: h.url,
      snippet: h.snippet,
    })),
    ...tafsirItems.slice(0, 4).map((t) => ({
      type: "tafsir" as const,
      label: t.title,
      url: t.url,
      snippet: t.snippet,
    })),
  ];

  const overview = isAr
    ? `تقرير إداري تحليلي يستكشف موضوع "${query}" استناداً إلى المراجع المعتمدة في قاعدة البيانات الداخلية. يربط هذا التقرير بين آيات القرآن الكريم [${verseCitations || "القرآن الكربم"}]، والأحاديث النبوية الصحيحة [${hadithCitations || "السنّة النبوية"}] والتفاسير المعاصرة والتاريخية.`
    : isHe
      ? `דוח מחקר מנהלי מקיף המנתח את הנושא "${query}" על בסיס נתוני המאגר הפנימי. הדוח מחבר בין פסוקי הקוראן [${verseCitations || "קוראן"}] לחדית'ים המוסמכים [${hadithCitations || "חדית'"}] ולתפסירים הקלאסיים.`
      : `An executive research brief synthesizing internal knowledge database records for "${query}". This report synthesizes evidence across Quranic verses [${verseCitations || "Quran"}], authentic Sahih Hadith traditions [${hadithCitations || "Hadith"}], and classical Tafsir commentaries.`;

  const historicalContext = isAr
    ? `يتجلى السياق التاريخي لموضوع "${query}" في دواعي النزول ومراحل التشريع المكي والمدني. يظهر الحفظ النبوي والتطبيق العملي في السيرة العطرة وأحداث السيرة الكبرى.`
    : isHe
      ? `ההקשר ההיסטורי של "${query}" ניכר ברקע ההתגלות (אסבאב א-נזול) ובשלבי החקיקה במאכה ומדינה, בצד היישום המעשי בסירת הנביא.`
      : `The historical context surrounding "${query}" is evidenced in the circumstances of revelation (Asbab al-Nuzul) and stages of Quranic legislation across Makkan and Madinan eras, as documented in classical sources.`;

  const quranicPerspective = isAr
    ? `تناول القرآن الكريم موضوع "${query}" عبر عدة آيات محكمة. أشار الحق سبحانه إلى أبعاد هذا המושג في ${quranItems.length > 0 ? topVerse.snippet : "الآيات ذات الصلة"}. [${verseCitations}]`
    : isHe
      ? `הקוראן מציג את "${query}" במספר פסוקים מרכזיים. הפסוקים מדגישים את החשיבות הרוחנית והמוסרית [${verseCitations}]: ${topVerse ? `"${topVerse.snippet.slice(0, 180)}…"` : ""}`
      : `The Holy Quran addresses "${query}" across multiple foundational passages. Principal emphasis is placed on spiritual, moral, and social guidance [${verseCitations}]: ${topVerse ? `"${topVerse.snippet.slice(0, 180)}…"` : ""}`;

  const hadithPerspective = isAr
    ? `في السنة النبوية المطهرة، وردت أحاديث صحيحة توضح معالم "${query}". جاء في السنن والصحاح [${hadithCitations}]: ${topHadith ? `"${topHadith.snippet.slice(0, 180)}…"` : ""}`
    : isHe
      ? `במסורת החדית' המוחרת, חדית'ים מוסמכים מפרטים את הוראות "${query}". כפי שמופיע באוספים [${hadithCitations}]: ${topHadith ? `"${topHadith.snippet.slice(0, 180)}…"` : ""}`
      : `In Prophetic traditions (Sunnah), authentic narrations detail the practical application of "${query}" [${hadithCitations}]: ${topHadith ? `"${topHadith.snippet.slice(0, 180)}…"` : ""}`;

  const tafsirInsights = isAr
    ? `بين أئمة التفسير كابن كثير والجلالين المعاني الدقيقة واللغوية المرتبطة بـ "${query}". ورد في التفاسير المسجلة [${topTafsir ? topTafsir.title : "التفاسير المعتمدة"}]: ${topTafsir ? `"${topTafsir.snippet.slice(0, 200)}…"` : "تحليل التفسير القائم على الآيات."}`
    : isHe
      ? `מפרשי הקוראן הקלאסיים מציגים ניתוח פרשני ולשוני של "${query}". כפי שצוין בתפסיר [${topTafsir ? topTafsir.title : "תפסיר קלאסי"}]: ${topTafsir ? `"${topTafsir.snippet.slice(0, 200)}…"` : ""}`
      : `Classical exegesis offers nuanced textual and linguistic commentaries on "${query}" [${topTafsir ? topTafsir.title : "Classical Tafsir"}]: ${topTafsir ? `"${topTafsir.snippet.slice(0, 200)}…"` : "Exegetical analysis anchored in authentic tradition."}`;

  const scholarlyObservations = isAr
    ? `أجمع علماء الأمة ودراسوا العلوم الإسلامية على أهمية الفهم الشامل لـ "${query}" والتكامل بين النص والعمل.`
    : isHe
      ? `חכמי הקהילה והחוקרים הדגישו את ההכרח בהבנה כוללת של "${query}" תוך שילוב בין הכתוב ליישום המעשי.`
      : `Scholarly consensus emphasizes holistic comprehension of "${query}", bridging textual revelation with systematic ethical implementation.`;

  return {
    query,
    locale,
    overview,
    historicalContext,
    quranicPerspective,
    hadithPerspective,
    tafsirInsights,
    scholarlyObservations,
    mainThemes: [
      isAr ? "الإيمان والتقوى" : isHe ? "אמונה ויראת שמים" : "Faith and Piety",
      isAr ? "الالتزام الأخلاقي" : isHe ? "מחויבות מוסרית" : "Ethical Commitment",
      isAr ? "الهداية والتدبر" : isHe ? "הדרכה והתבוננות" : "Guidance and Reflection",
      isAr ? "التطبيق العملي" : isHe ? "יישום מעשי" : "Practical Application",
    ],
    relatedConcepts: [
      isAr ? "الصبر والثبات" : isHe ? "סבלנות ועמידות" : "Patience & Perseverance",
      isAr ? "التقوى والإחسان" : isHe ? "חסד ויראת אל" : "God-Consciousness & Excellence",
      isAr ? "التوكل والرضا" : isHe ? "ביטחון ואמונה" : "Reliance & Contentment",
    ],
    importantTerminology: [
      {
        term: query,
        transliteration: query,
        meaning: isAr
          ? "المفهوم الإيماني أو الفقهي الأصيل المذكور في المراجع"
          : isHe
            ? "מונח יסוד אמונתי או הלכתי מהמקורות"
            : "Core foundational concept referenced in primary Islamic sources",
        context: isAr
          ? "مذكور في القرآن الكريم والسنة النبوية الصحيحة"
          : isHe
            ? "מופיע בקוראן ובחדית' המוסמך"
            : "Anchored in Quranic verses and authenticated Hadith corpus",
      },
    ],
    relatedProphets:
      prophetsList.length > 0
        ? prophetsList
        : [
            {
              name: isAr ? "النبي محمد ﷺ" : isHe ? "הנביא מוחמד ﷺ" : "Prophet Muhammad ﷺ",
              kind: "prophet",
              slug: "muhammad",
              description: isAr
                ? "خاتم الأنبياء والمرسلين"
                : isHe
                  ? "חותם הנביאים"
                  : "The Seal of the Prophets",
            },
          ],
    relatedPlaces:
      placesList.length > 0
        ? placesList
        : [
            {
              name: isAr ? "مكة المكرمة" : isHe ? "מכה" : "Makkah al-Mukarramah",
              kind: "place",
              slug: "makkah",
              description: isAr
                ? "مهبط الوحي والقبلة"
                : isHe
                  ? "מקום ההתגלות והקִבְּלָה"
                  : "Cradle of revelation and Qiblah",
            },
            {
              name: isAr ? "المدينة المنورة" : isHe ? "אל-מדינה" : "Madinah al-Munawwarah",
              kind: "place",
              slug: "madinah",
              description: isAr
                ? "دار الهجرة والنصرة"
                : isHe
                  ? "עיר ההגירה"
                  : "City of Hijrah and support",
            },
          ],
    relatedEvents:
      eventsList.length > 0
        ? eventsList
        : [
            {
              name: isAr ? "الهجرة النبوية" : isHe ? "ההגירה (היג'רה)" : "The Prophetic Hijrah",
              kind: "event",
              slug: "hijrah",
              description: isAr
                ? "נקודת התפנית בהיסטוריה האסלאמית"
                : isHe
                  ? "נקודת מפנה בהיסטוריה"
                  : "Turning point in Islamic history",
            },
          ],
    practicalLessons: [
      isAr
        ? "تعزيز الصلة بالله والتدبر المستمر في الآيات."
        : isHe
          ? "חיזוק הקשר עם האל והתבוננות מתמדת בפסוקים."
          : "Strengthening devotion and continuous reflection upon divine revelation.",
      isAr
        ? "الاقتداء بالسنة النبوية والتخلق بالأخلاق الكريمة."
        : isHe
          ? "אימוץ אורחות חיים על פי החדית' והמוסר."
          : "Emulating the Sunnah through refined character and upright conduct.",
      isAr
        ? "ربط العلم بالعمل ونفع المجتمع."
        : isHe
          ? "חיבור בין לימוד ליישום מעשי ולתועלת הקהילה."
          : "Bridging knowledge with practical service to society.",
    ],
    faqs: [
      {
        question: isAr
          ? `ما هو المعنى المحوري لـ "${query}" في القرآن والسنة؟`
          : isHe
            ? `מהי המשמעות המרכזית של "${query}" בקוראן ובחדית'?`
            : `What is the core significance of "${query}" in the Quran and Sunnah?`,
        answer: isAr
          ? `يتجلى المعنى المحوري في الارتقاء الإيماني والأخلاقي وتطبيق التشريعات الربانية الموثقة في القاعدة.`
          : isHe
            ? `המשמעות המרכזית מתבטאת בהתעלות רוחנית ומוסרית וביישום ההנחיות מהמקורות.`
            : `The core significance centers on spiritual elevation, moral integrity, and adherence to authentic divine guidance.`,
        citations: verseCitations ? [verseCitations] : ["Surah Al-Baqarah"],
      },
      {
        question: isAr
          ? `كيف تطبق القواعد العملية لـ "${query}" في الحياة اليومية؟`
          : isHe
            ? `כיצד מיושמים העקרונות של "${query}" בחיי היומיום?`
            : `How are the principles of "${query}" applied in daily life?`,
        answer: isAr
          ? `من خلال الاستقامة والمواظبة على العبادات والأخلاق الفاضلة المسجلة في السيرة.`
          : isHe
            ? `באמצעות יושרה, התמדה במעשים טובים ואימוץ מידות טובות.`
            : `Through upright character, consistency in worship, and adherence to righteous deeds.`,
        citations: hadithCitations ? [hadithCitations] : ["Sahih al-Bukhari"],
      },
    ],
    nextTopics: [
      `${query} in Quran`,
      `Sabr and Tawakkul`,
      `Prophet Muhammad Sunnah`,
      `Tafsir Ibn Kathir`,
    ],
    groundingStats: {
      versesCount: quranItems.length,
      hadithsCount: hadithItems.length,
      tafsirCount: tafsirItems.length,
      entitiesCount: entityItems.length,
    },
    references,
    isAiGenerated: false,
    generatedAt: new Date().toISOString(),
  };
}

export const getSearchResearchBrief = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RequestSchema.parse(input))
  .handler(
    async ({
      data,
    }): Promise<{ brief: SearchResearchBrief; searchResults: UnifiedSearchResponse }> => {
      const locale = data.locale;
      const query = data.query.trim();

      // 1. Retrieve unified search results across all collections
      const searchResults = await performUnifiedSearch(query, locale, "all");

      const quranItems = searchResults.categoryResults.quran || [];
      const hadithItems = searchResults.categoryResults.hadith || [];
      const tafsirItems = searchResults.categoryResults.tafsir || [];

      // Also gather entity hits
      const allEntities = await listEntitiesByKind("topic");
      const matchedProphets = await listEntitiesByKind("prophet");
      const matchedPlaces = await listEntitiesByKind("place");
      const matchedEvents = await listEntitiesByKind("event");

      const matchedEntities = [
        ...matchedProphets,
        ...matchedPlaces,
        ...matchedEvents,
        ...allEntities,
      ].filter((e) => {
        const qLower = query.toLowerCase();
        return (
          e.slug.includes(qLower) ||
          (e.title_i18n?.ar && e.title_i18n.ar.includes(query)) ||
          (e.title_i18n?.en && e.title_i18n.en.toLowerCase().includes(qLower)) ||
          (e.title_i18n?.he && e.title_i18n.he.includes(query))
        );
      });

      const apiKey = process.env.LOVABLE_API_KEY;

      // Fallback brief if no AI key or AI generation fails
      const fallbackBrief = generateFallbackResearchBrief(
        query,
        locale,
        quranItems,
        hadithItems,
        tafsirItems,
        matchedEntities,
      );

      if (!apiKey) {
        return { brief: fallbackBrief, searchResults };
      }

      try {
        // 2. AI Synthesis via Gemini
        const provider = createLovableAiGatewayProvider(apiKey);

        const groundingPrompt = `
=== RETRIEVED QURAN VERSES (${quranItems.length}) ===
${quranItems
  .slice(0, 8)
  .map((q) => `• [${q.title}] ${sanitize(q.snippet, 300)}`)
  .join("\n")}

=== RETRIEVED HADITHS (${hadithItems.length}) ===
${hadithItems
  .slice(0, 6)
  .map((h) => `• [${h.title}] Narrator: ${h.subtitle || "N/A"} - ${sanitize(h.snippet, 300)}`)
  .join("\n")}

=== RETRIEVED TAFSIR PASSAGES (${tafsirItems.length}) ===
${tafsirItems
  .slice(0, 4)
  .map((t) => `• [${t.title}] ${sanitize(t.snippet, 300)}`)
  .join("\n")}

=== RETRIEVED ENTITIES (${matchedEntities.length}) ===
${matchedEntities
  .slice(0, 8)
  .map(
    (e) =>
      `• [${e.kind.toUpperCase()}: ${e.slug}] Title: ${e.title_i18n?.en || e.slug} - Summary: ${sanitize(e.summary_i18n?.en || "", 200)}`,
  )
  .join("\n")}
`;

        const systemPrompt = `You are the chief academic research AI for Bayan AI, the world's most advanced Islamic Research Platform.
Your task is to generate an Executive AI Research Brief on the topic: "${query}".
Language requested: "${locale}" (All content MUST be strictly written in ${locale === "ar" ? "Arabic" : locale === "he" ? "Hebrew" : "English"}).

CRITICAL REQUIREMENTS:
1. Grounding: You MUST ONLY synthesize facts present in or strictly supported by the retrieved internal database records above. Never invent facts, commentary, or unsupported generalizations.
2. Structure: Return ONLY a valid JSON object matching this EXACT schema:
{
  "overview": "Rich executive summary paragraph grounded in retrieved sources...",
  "historicalContext": "Paragraph analyzing historical background, revelation context (Asbab al-Nuzul), and Makkan/Madinan era significance...",
  "quranicPerspective": "Paragraph detailing Quranic verses [citing Surah X:Y]...",
  "hadithPerspective": "Paragraph detailing Sahih Hadith traditions [citing collection & number]...",
  "tafsirInsights": "Paragraph synthesizing classical Tafsir commentaries (Ibn Kathir, Al-Jalalayn, etc.)...",
  "scholarlyObservations": "Paragraph summarizing scholarly consensus, linguistic observations, and jurisprudential analysis...",
  "mainThemes": ["Theme 1", "Theme 2", "Theme 3", "Theme 4"],
  "relatedConcepts": ["Concept 1", "Concept 2", "Concept 3"],
  "importantTerminology": [
    { "term": "Term in Arabic / Transliteration", "transliteration": "Transliteration", "meaning": "Core meaning", "context": "Linguistic & Quranic usage" }
  ],
  "relatedProphets": [
    { "name": "Prophet Name", "kind": "prophet", "slug": "slug", "description": "Role and connection to topic" }
  ],
  "relatedPlaces": [
    { "name": "Place Name", "kind": "place", "slug": "slug", "description": "Historical or sacred significance" }
  ],
  "relatedEvents": [
    { "name": "Event Name", "kind": "event", "slug": "slug", "description": "Historical context and significance" }
  ],
  "practicalLessons": ["Actionable lesson 1", "Actionable lesson 2", "Actionable lesson 3"],
  "faqs": [
    { "question": "Relevant question?", "answer": "Clear, grounded answer...", "citations": ["Surah 2:153", "Sahih al-Bukhari #123"] }
  ],
  "nextTopics": ["Suggested Next Research Query 1", "Suggested Query 2", "Suggested Query 3"]
}
`;

        const aiResponse = await generateText({
          model: provider("gemini-3.6-flash"),
          system: systemPrompt,
          prompt: `Generate the Executive AI Research Brief for "${query}" based on the following database records:\n${groundingPrompt}`,
        });

        const text = aiResponse.text.trim();
        // Extract JSON if wrapped in markdown block
        const jsonString = text
          .replace(/^```json\s*/i, "")
          .replace(/```\s*$/i, "")
          .trim();
        const parsed = JSON.parse(jsonString);

        const aiBrief: SearchResearchBrief = {
          query,
          locale,
          overview: parsed.overview || fallbackBrief.overview,
          historicalContext: parsed.historicalContext || fallbackBrief.historicalContext,
          quranicPerspective: parsed.quranicPerspective || fallbackBrief.quranicPerspective,
          hadithPerspective: parsed.hadithPerspective || fallbackBrief.hadithPerspective,
          tafsirInsights: parsed.tafsirInsights || fallbackBrief.tafsirInsights,
          scholarlyObservations:
            parsed.scholarlyObservations || fallbackBrief.scholarlyObservations,
          mainThemes:
            Array.isArray(parsed.mainThemes) && parsed.mainThemes.length > 0
              ? parsed.mainThemes
              : fallbackBrief.mainThemes,
          relatedConcepts:
            Array.isArray(parsed.relatedConcepts) && parsed.relatedConcepts.length > 0
              ? parsed.relatedConcepts
              : fallbackBrief.relatedConcepts,
          importantTerminology:
            Array.isArray(parsed.importantTerminology) && parsed.importantTerminology.length > 0
              ? parsed.importantTerminology
              : fallbackBrief.importantTerminology,
          relatedProphets:
            Array.isArray(parsed.relatedProphets) && parsed.relatedProphets.length > 0
              ? parsed.relatedProphets
              : fallbackBrief.relatedProphets,
          relatedPlaces:
            Array.isArray(parsed.relatedPlaces) && parsed.relatedPlaces.length > 0
              ? parsed.relatedPlaces
              : fallbackBrief.relatedPlaces,
          relatedEvents:
            Array.isArray(parsed.relatedEvents) && parsed.relatedEvents.length > 0
              ? parsed.relatedEvents
              : fallbackBrief.relatedEvents,
          practicalLessons:
            Array.isArray(parsed.practicalLessons) && parsed.practicalLessons.length > 0
              ? parsed.practicalLessons
              : fallbackBrief.practicalLessons,
          faqs:
            Array.isArray(parsed.faqs) && parsed.faqs.length > 0 ? parsed.faqs : fallbackBrief.faqs,
          nextTopics:
            Array.isArray(parsed.nextTopics) && parsed.nextTopics.length > 0
              ? parsed.nextTopics
              : fallbackBrief.nextTopics,
          groundingStats: fallbackBrief.groundingStats,
          references: fallbackBrief.references,
          isAiGenerated: true,
          generatedAt: new Date().toISOString(),
        };

        return { brief: aiBrief, searchResults };
      } catch (err) {
        console.error("Error generating AI research brief with Gemini:", err);
        return { brief: fallbackBrief, searchResults };
      }
    },
  );
