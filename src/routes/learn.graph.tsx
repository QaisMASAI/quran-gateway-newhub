import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/learn/graph")({
  head: () => ({
    meta: [
      { title: "Noor Al Quran| Knowledge Graph" },
      {
        name: "description",
        content:
          "Visual map of the Quran's interconnected topics, prophets and stories — explore how knowledge connects.",
      },
      { property: "og:title", content: "Noor Al Quran| Knowledge Graph" },
      {
        property: "og:description",
        content:
          "Visual map of the Quran's interconnected topics, prophets and stories — explore how knowledge connects.",
      },
      { property: "og:url", content: "/learn/graph" },
      { name: "twitter:title", content: "Noor Al Quran| Knowledge Graph" },
      {
        name: "twitter:description",
        content:
          "Visual map of the Quran's interconnected topics, prophets and stories — explore how knowledge connects.",
      },
    ],
    links: [{ rel: "canonical", href: "/learn/graph" }],
  }),
  pendingComponent: () => <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-muted-foreground">Loading…</div>,
});
