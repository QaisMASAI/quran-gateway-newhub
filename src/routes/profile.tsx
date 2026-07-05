import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Noor Al Quran | My Profile" },
      {
        name: "description",
        content: "Your learning journey, bookmarks, notes and recommended topics.",
      },
      { property: "og:title", content: "Noor Al Quran | My Profile" },
      {
        property: "og:description",
        content: "Your learning journey, bookmarks, notes and recommended topics.",
      },
      { property: "og:url", content: "/profile" },
      { name: "twitter:title", content: "Noor Al Quran | My Profile" },
      {
        name: "twitter:description",
        content: "Your learning journey, bookmarks, notes and recommended topics.",
      },
    ],
    links: [{ rel: "canonical", href: "/profile" }],
  }),
  pendingComponent: () => (
    <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-muted-foreground">Loading…</div>
  ),
});
