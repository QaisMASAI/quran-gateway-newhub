import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "AI Research Assistant — Discover Quran" },
      {
        name: "description",
        content:
          "Ask deep questions about the Quran. Every answer is grounded in verses and authenticated Tafsir, with citations and a confidence score.",
      },
      { property: "og:title", content: "Quran AI Research Assistant" },
      {
        property: "og:description",
        content: "Source-grounded answers with verse + Tafsir citations.",
      },
      { property: "og:url", content: "/research" },
      { name: "twitter:title", content: "Quran AI Research Assistant" },
      { name: "twitter:description", content: "Source-grounded answers with verse + Tafsir citations." },
    ],
    links: [{ rel: "canonical", href: "/research" }],
  }),
  pendingComponent: () => <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">Loading…</div>,
});
