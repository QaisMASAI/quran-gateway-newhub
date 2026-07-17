import { createFileRoute } from "@tanstack/react-router";
import i18n, { normalizeLocale } from "@/lib/i18n";
import { buildQueryPrefillSearch } from "@/lib/query-prefill";

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
