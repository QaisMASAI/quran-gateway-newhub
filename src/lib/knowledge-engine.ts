import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { ALL_PROPHETS } from "@/lib/prophets";
import { ALL_TOPICS } from "@/lib/topics";

export type KnowledgeKind =
  | "verse"
  | "tafsir"
  | "prophet"
  | "topic"
  | "story"
  | "event"
  | "place"
  | "scholar"
  | "companion";

export interface ConnectedVerse {
  surah: number;
  ayah: number;
  reference: string;
  arabic: string;
  translation: string;
  tafsirPreview?: string;
  asbabPreview?: string;
}

export interface ConnectedHadith {
  id: number;
  collectionSlug: string;
  collectionTitle: string;
  bookId: number;
  idInBook: number;
  narrator: string | null;
  arabicText: string;
  translationText: string;
  grade?: string;
}

export interface ConnectedEntity {
  id: string;
  slug: string;
  kind: KnowledgeKind;
  title: string;
  summary: string;
  icon?: string | null;
}

export interface InterconnectedKnowledgeBundle {
  entityType: KnowledgeKind;
  entityId: string;
  title: string;
  subtitle?: string;
  summary?: string;
  verses: ConnectedVerse[];
  tafsirPassages: Array<{ source: string; body: string; surah: number; ayah: number }>;
  prophets: ConnectedEntity[];
  topics: ConnectedEntity[];
  stories: ConnectedEntity[];
  placesEvents: ConnectedEntity[];
  aiSummary?: string;
}

const QueryInputSchema = z.object({
  kind: z.enum([
    "verse",
    "tafsir",
    "prophet",
    "topic",
    "story",
    "event",
    "place",
    "scholar",
    "companion",
  ]),
  id: z.string().min(1),
  locale: z.enum(["he", "ar", "en"]).default("he"),
});

export const getInterconnectedKnowledge = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => QueryInputSchema.parse(input))
  .handler(async ({ data }): Promise<InterconnectedKnowledgeBundle> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { kind, id, locale } = data;

    const fallbackLocale = locale === "ar" ? "ar" : locale === "en" ? "en" : "he";

    const prophetDisplayName = (prophet: (typeof ALL_PROPHETS)[number]) => {
      if (fallbackLocale === "ar") return prophet.nameAr;
      if (fallbackLocale === "he") return prophet.nameHe;
      return prophet.nameHeAlt ?? prophet.nameAr;
    };

    const topicDisplayTitle = (topic: (typeof ALL_TOPICS)[number]) => {
      if (fallbackLocale === "ar") return topic.subtitle ?? topic.title;
      if (fallbackLocale === "en") return topic.subtitle ?? topic.title;
      return topic.title;
    };

    const pickSourceName = (source: { name_he?: string; name_ar?: string; name_en?: string } | null | undefined) => {
      if (!source) return "Tafsir";
      if (fallbackLocale === "ar") return source.name_ar ?? source.name_en ?? source.name_he ?? "Tafsir";
      if (fallbackLocale === "en") return source.name_en ?? source.name_ar ?? source.name_he ?? "Tafsir";
      return source.name_he ?? source.name_ar ?? source.name_en ?? "Tafsir";
    };

    type TafsirPassageRow = Database["public"]["Tables"]["tafsir_passages"]["Row"];

    const bundle: InterconnectedKnowledgeBundle = {
      entityType: kind,
      entityId: id,
      title: "",
      verses: [],
      tafsirPassages: [],
      prophets: [],
      topics: [],
      stories: [],
      placesEvents: [],
    };

    if (kind === "verse") {
      // id format: "surah:ayah" e.g. "2:255" or "1:1"
      const [surahStr, ayahStr] = id.split(":");
      const surah = Number(surahStr) || 1;
      const ayah = Number(ayahStr) || 1;

      bundle.title = `Verse ${surah}:${ayah}`;


      }

      // Fetch Tafsirs linked to this verse
      const { data: tafsirs } = await supabaseAdmin
        .from("tafsir_passages")
        .select("body, source:tafsir_sources(name_he, name_ar, name_en)")
        .eq("surah", surah)
        .gte("ayah_start", ayah)
        .lte("ayah_end", ayah)
        .limit(3);

      bundle.tafsirPassages = ((tafsirs ?? []) as Array<TafsirPassageRow & { source?: unknown }>).map((t) => {
        const sourceRow = Array.isArray(t.source)
          ? (t.source[0] as { name_he?: string; name_ar?: string; name_en?: string } | undefined)
          : (t.source as { name_he?: string; name_ar?: string; name_en?: string } | null | undefined);
        return {
          source: pickSourceName(sourceRow),
          body: t.body,
          surah,
          ayah,
        };
      });

      // Find prophets and topics referencing this verse
      const prophetMatches = ALL_PROPHETS.filter((p) =>
        p.refs.some((r) => r.surah === surah && r.ayah <= ayah && (r.to ?? r.ayah) >= ayah)
      );
      bundle.prophets = prophetMatches.map((p) => ({
        id: p.slug,
        slug: p.slug,
        kind: "prophet",
        title: prophetDisplayName(p),
        summary: fallbackLocale === "ar" ? "نبي مذكور في القرآن" : fallbackLocale === "en" ? "Prophet mentioned in the Quran" : "נביא מוזכר בקוראן",
      }));

      const topicMatches = ALL_TOPICS.filter((t) =>
        t.refs.some((r) => r.surah === surah && r.ayah <= ayah && (r.to ?? r.ayah) >= ayah)
      );
      bundle.topics = topicMatches.map((t) => ({
        id: t.slug,
        slug: t.slug,
        kind: "topic",
        title: topicDisplayTitle(t),
        summary: t.description,
      }));

    } else if (kind === "hadith") {
      // id format: hadith entry ID or global ID
      const hadithId = Number(id);
      if (!isNaN(hadithId)) {
        const { data: entry } = await supabaseAdmin
          .from("hadith_entries")
          .select("id, collection_slug, book_id, id_in_book, narrator, arabic_text, english_text, hebrew_text")
          .eq("id", hadithId)
          .maybeSingle();

        if (entry) {
          bundle.title = `${entry.collection_slug.toUpperCase()} Hadith #${entry.id_in_book}`;
          bundle.summary = entry.narrator ? `Narrated by ${entry.narrator}` : undefined;

          // Fetch related verses
          const { data: vLinks } = await supabaseAdmin
            .from("hadith_entity_links")
            .select("surah, ayah, weight")
            .eq("hadith_id", entry.id)
            .not("surah", "is", null)
            .not("ayah", "is", null)
            .limit(5);

          const verseLinks = ((vLinks ?? []) as HadithEntityLinkRow[]).filter(
            (vl): vl is HadithEntityLinkRow & { surah: number; ayah: number } =>
              typeof vl.surah === "number" && typeof vl.ayah === "number",
          );

          if (verseLinks.length > 0) {
            for (const vl of verseLinks) {
              const { data: verseTrans } = await supabaseAdmin
                .from("ayah_translations")
                .select("text, source_id")
                .eq("surah", vl.surah)
                .eq("ayah", vl.ayah)
                .limit(2);

              bundle.verses.push({
                surah: vl.surah,
                ayah: vl.ayah,
                reference: `${vl.surah}:${vl.ayah}`,
                arabic: verseTrans?.find((t) => t.source_id.includes("arabic"))?.text || "",
                translation: verseTrans?.[0]?.text || "",
              });
            }
          }
        }
      }

    } else if (kind === "prophet" || kind === "topic" || kind === "story") {
      const prophet = ALL_PROPHETS.find((p) => p.slug === id);
      const topic = ALL_TOPICS.find((t) => t.slug === id);

      if (prophet) {
        bundle.title = prophetDisplayName(prophet);
        bundle.summary = fallbackLocale === "ar" ? "رحلة نبي في القرآن" : fallbackLocale === "en" ? "A prophet's journey in the Quran" : "מסע נביא בקוראן";

        for (const ref of prophet.refs.slice(0, 8)) {
          bundle.verses.push({
            surah: ref.surah,
            ayah: ref.ayah,
            reference: `${ref.surah}:${ref.ayah}${ref.to ? `-${ref.to}` : ""}`,
            arabic: "",
            translation: "",
          });
        }
      } else if (topic) {
        bundle.title = topicDisplayTitle(topic);
        bundle.summary = topic.description;

        for (const ref of topic.refs.slice(0, 8)) {
          bundle.verses.push({
            surah: ref.surah,
            ayah: ref.ayah,
            reference: `${ref.surah}:${ref.ayah}${ref.to ? `-${ref.to}` : ""}`,
            arabic: "",
            translation: "",
          });
        }
      }
    }

    return bundle;
  });
