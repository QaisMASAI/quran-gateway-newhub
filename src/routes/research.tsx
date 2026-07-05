import { createFileRoute } from "@tanstack/react-router";
import i18n, { normalizeLocale } from "@/lib/i18n";

export const Route = createFileRoute("/research")({
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    return {
      meta: [
        { title: i18n.t("pages:research.title", { lng: locale }) },
        {
          name: "description",
          content: i18n.t("pages:research.subtitle", { lng: locale }),
        },
        { property: "og:title", content: i18n.t("pages:research.title", { lng: locale }) },
        {
          property: "og:description",
          content: i18n.t("pages:research.subtitle", { lng: locale }),
        },
        { property: "og:url", content: "/research" },
        { name: "twitter:title", content: i18n.t("pages:research.title", { lng: locale }) },
        {
          name: "twitter:description",
          content: i18n.t("pages:research.subtitle", { lng: locale }),
        },
      ],
      links: [{ rel: "canonical", href: "/research" }],
    };
  },
  pendingComponent: () => (
    <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">Loading…</div>
  ),
});
