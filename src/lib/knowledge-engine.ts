import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ALL_PROPHETS } from "@/lib/prophets";
import { ALL_TOPICS } from "@/lib/topics";
import seed from "@/lib/seeds/knowledge-seed.json";

export type KnowledgeKind =
  | "verse"
  | "hadith"
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
  hadiths: ConnectedHadith[];
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
    "hadith",
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

    const bundle: InterconnectedKnowledgeBundle = {
      entityType: kind,
      entityId: id,
      title: "",
      verses: [],
      hadiths: [],
      tafsirPassages: [],
      prophets: [],
      topics: [],
      stories: [],
      placesEvents: [],
    };

    // Helper to pick localized string
    const pickText = (obj: { he?: string; ar?: string; en?: string } | null | undefined) => {
      if (!obj) return "";
      return obj[locale] || obj.he || obj.ar || obj.en || "";
    };

    if (kind === "verse") {
      // id format: "surah:ayah" e.g. "2:255" or "1:1"
      const [surahStr, ayahStr] = id.split(":");
      const surah = Number(surahStr) || 1;
      const ayah = Number(ayahStr) || 1;

      bundle.title = `Verse ${surah}:${ayah}`;

      // Fetch Hadiths linked to this verse
      const { data: hadithLinks } = await supabaseAdmin
        .from("hadith_verse_links")
        .select("hadith_entry_id, weight")
        .eq("surah", surah)
        .eq("ayah", ayah)
        .order("weight", { ascending: false })
        .limit(6);

      const hadithIds = (hadithLinks ?? []).map((l) => l.hadith_entry_id);
      if (hadithIds.length > 0) {
        const { data: hadiths } = await supabaseAdmin
          .from("hadith_entries")
          .select("id, collection_slug, book_id, id_in_book, narrator, arabic_text, english_text, hebrew_text")
          .in("id", hadithIds);

        bundle.hadiths = (hadiths ?? []).map((h) => ({
          id: h.id,
          collectionSlug: h.collection_slug,
          collectionTitle: h.collection_slug === "bukhari" ? "Sahih al-Bukhari" : h.collection_slug === "muslim" ? "Sahih Muslim" : h.collection_slug,
          bookId: h.book_id,
          idInBook: h.id_in_book,
          narrator: h.narrator,
          arabicText: h.arabic_text,
          translationText: (locale === "he" ? h.hebrew_text : locale === "en" ? h.english_text : h.arabic_text) || h.arabic_text,
          grade: "Sahih",
        }));
      }

      // Fetch Tafsirs linked to this verse
      const { data: tafsirs } = await supabaseAdmin
        .from("tafsir_passages")
        .select("body, source:tafsir_sources(name_he, name_ar, name_en)")
        .eq("surah", surah)
        .gte("ayah_start", ayah)
        .lte("ayah_end", ayah)
        .limit(3);

      bundle.tafsirPassages = (tafsirs ?? []).map((t) => {
        const src = t.source as unknown as { name_he?: string; name_ar?: string; name_en?: string } | null;
        return {
          source: pickText(src) || "Tafsir",
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
        title: p.name[locale] || p.name.he || p.name.ar || p.name.en,
        summary: p.title[locale] || p.title.he || "",
      }));

      const topicMatches = ALL_TOPICS.filter((t) =>
        t.refs.some((r) => r.surah === surah && r.ayah <= ayah && (r.to ?? r.ayah) >= ayah)
      );
      bundle.topics = topicMatches.map((t) => ({
        id: t.slug,
        slug: t.slug,
        kind: "topic",
        title: t.title[locale] || t.title.he || t.title.ar || t.title.en,
        summary: t.summary?.[locale] || t.summary?.he || "",
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
            .from("hadith_verse_links")
            .select("surah, ayah, weight")
            .eq("hadith_entry_id", entry.id)
            .limit(5);

          if (vLinks && vLinks.length > 0) {
            for (const vl of vLinks) {
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
        bundle.title = prophet.name[locale] || prophet.name.ar;
        bundle.summary = prophet.title[locale] || prophet.title.he;

        for (const ref of prophet.refs.slice(0, 8)) {
          bundle.verses.push({
            surah: ref.surah,
            ayah: ref.ayah,
            reference: `${ref.surah}:${ref.ayah}${ref.to ? `-${ref.to}` : ""}`,
            arabic: "",
            translation: ref.note || "",
          });
        }
      } else if (topic) {
        bundle.title = topic.title[locale] || topic.title.ar;
        bundle.summary = topic.summary?.[locale] || topic.summary?.he;

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
