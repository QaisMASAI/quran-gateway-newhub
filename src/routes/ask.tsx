import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/ask")({
  head: () => ({
    meta: [
      { title: "Noor Al Quran| Ask Noor Al QuranAI" },
      {
        name: "description",
        content:
          "Ask questions in Hebrew, Arabic or English and get answers built only on verses from the Holy Quran, with precise references.",
      },
      { property: "og:title", content: "Noor Al Quran| Ask Noor Al QuranAI" },
      { property: "og:description", content: "Verse-grounded answers — no fabrications." },
      { property: "og:url", content: "/ask" },
      { name: "twitter:title", content: "Noor Al Quran| Ask Noor Al QuranAI" },
      { name: "twitter:description", content: "Verse-grounded answers — no fabrications." },
    ],
    links: [{ rel: "canonical", href: "/ask" }],
  }),
  pendingComponent: () => <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Loading…</div>,
});
