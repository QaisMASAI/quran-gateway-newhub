import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { TOPICS } from "@/lib/topics";
import { EMOTIONS } from "@/lib/emotions";
import { PROPHETS } from "@/lib/prophets";
import { READING_PLANS } from "@/lib/reading-plans";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths: string[] = [
          "/",
          "/search",
          "/ask",
          "/favorites",
          "/topics",
          "/emotions",
          "/prophets",
          "/plans",
          ...TOPICS.map((t) => `/topics/${t.slug}`),
          ...EMOTIONS.map((e) => `/emotions/${e.slug}`),
          ...PROPHETS.map((p) => `/prophets/${p.slug}`),
          ...READING_PLANS.map((p) => `/plans/${p.slug}`),
          ...Array.from({ length: 114 }, (_, i) => `/surah/${i + 1}`),
        ];
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...paths.map((p) => `  <url><loc>${p}</loc></url>`),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
