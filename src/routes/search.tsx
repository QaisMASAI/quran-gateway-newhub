import { createFileRoute } from "@tanstack/react-router";
import i18n, { normalizeLocale } from "@/lib/i18n";
import { buildQueryPrefillSearch } from "@/lib/query-prefill";
import {
  generateGroundedAnswer,
  groundAndFactCheck,
  confidenceScore,
} from "@/lib/ai/ai-safety-rag";
import { performUnifiedSearch } from "@/lib/search-unified";

export async function searchVerifiedSources(query: string) {
  const results = await performUnifiedSearch(query, "en", "all");
  const quran = results.categoryResults.quran || [];
  const tafsir = results.categoryResults.tafsir || [];
  return [...quran, ...tafsir];
}

export const handleSearch = async (query: string) => {
  // Step 1: Get relevant verses & tafsirs from database
  const sources = await searchVerifiedSources(query);

  // Step 2: Generate answer grounded in sources only
  const groundedAnswer = await generateGroundedAnswer(
    query,
    sources, // CRITICAL: Only use these sources
  );

  // Step 3: Fact-check response against sources
  const factChecked = await groundAndFactCheck(groundedAnswer.content, sources);

  // Step 4: Add confidence score
  const confidence = confidenceScore(factChecked);

  return {
    content: factChecked.content,
    sources: factChecked.citedSources, // Show all sources used
    confidence, // 'high', 'medium', 'low'
    reviewStatus: factChecked.needsReview ? "pending" : "approved",
  };
};

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => buildQueryPrefillSearch(search),
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    return {
      meta: [
        { title: i18n.t("pages:search.metaTitle", { lng: locale }) },
        {
          name: "description",
          content: i18n.t("pages:search.metaDescription", { lng: locale }),
        },
        { property: "og:title", content: i18n.t("pages:search.metaTitle", { lng: locale }) },
        {
          property: "og:description",
          content: i18n.t("pages:search.metaDescription", { lng: locale }),
        },
        { property: "og:url", content: "/search" },
        { name: "twitter:title", content: i18n.t("pages:search.metaTitle", { lng: locale }) },
        {
          name: "twitter:description",
          content: i18n.t("pages:search.metaDescription", { lng: locale }),
        },
      ],
      links: [{ rel: "canonical", href: "/search" }],
    };
  },
  pendingComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Loading…</div>
  ),
});
