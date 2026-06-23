import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Noor Al Quran | Search the Quran" },
      {
        name: "description",
        content: "Search the Holy Quran across translations, surah names and Arabic text — with highlighted matches.",
      },
      { property: "og:title", content: "Noor Al Quran | Search the Quran" },
      {
        property: "og:description",
        content: "Search the Holy Quran across translations, surah names and Arabic text — with highlighted matches.",
      },
      { property: "og:url", content: "/search" },
      { name: "twitter:title", content: "Noor Al Quran | Search the Quran" },
      {
        name: "twitter:description",
        content: "Search the Holy Quran across translations, surah names and Arabic text — with highlighted matches.",
      },
    ],
    links: [{ rel: "canonical", href: "/search" }],
  }),
  pendingComponent: () => <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Loading…</div>,
});
