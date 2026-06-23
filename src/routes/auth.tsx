import { z } from "zod";
import { createFileRoute } from "@tanstack/react-router";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Noor Al Quran| Sign in" },
      {
        name: "description",
        content: "Sign in or create an account to save verses, personal notes, and track your reading progress.",
      },
      { property: "og:title", content: "Noor Al Quran| Sign in" },
      {
        property: "og:description",
        content: "Sign in or create an account to save verses, notes, and reading progress.",
      },
      { property: "og:url", content: "/auth" },
      { name: "twitter:title", content: "Noor Al Quran| Sign in" },
      {
        name: "twitter:description",
        content: "Sign in or create an account to save verses, notes, and reading progress.",
      },
    ],
    links: [{ rel: "canonical", href: "/auth" }],
  }),
  pendingComponent: () => <div className="mx-auto max-w-md px-4 py-10 text-sm text-muted-foreground">Loading…</div>,
});
