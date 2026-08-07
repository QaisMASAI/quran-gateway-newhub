import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  getPendingScholarReviews,
  resolveScholarReview,
  queueAiResponseForScholarReview,
  type ScholarModerationQueueItem,
} from "./ai/ai-safety-rag";

export const getModerationQueueFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<ScholarModerationQueueItem[]> => {
    // If store is empty, seed a default low-confidence demo item for testing review workflow
    const pending = getPendingScholarReviews();
    if (pending.length === 0) {
      queueAiResponseForScholarReview(
        "tafsir_explanation",
        "1.4.2",
        "Explain Surah Al-Baqarah 2:255 Throne Verse esoteric dimensions",
        "The Throne Verse (Ayat al-Kursi) is the greatest verse in the Quran. It affirms divine oneness (Tawhid) and supreme sovereignty. Some non-authentic commentary mentions unverified claims regarding cosmic celestial spheres.",
        {
          isGrounded: false,
          verifiedVerseKeys: ["2:255"],
          invalidVerseKeys: [],
          verifiedHadithRefs: ["Sahih al-Bukhari #5010"],
          invalidHadithRefs: [],
          confidenceScore: 0.65,
          flags: ["unverified_esoteric_claims", "needs_scholar_verification"],
        }
      );
    }
    return getPendingScholarReviews();
  }
);

const ResolveSchema = z.object({
  itemId: z.string(),
  scholarId: z.string().default("scholar-admin-1"),
  action: z.enum(["approved", "rejected"]),
  scholarNotes: z.string().optional(),
});

export const resolveModerationItemFn = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ResolveSchema.parse(input))
  .handler(async ({ data }) => {
    const updated = resolveScholarReview(
      data.itemId,
      data.scholarId,
      data.action,
      data.scholarNotes
    );
    return { ok: true, item: updated };
  });
