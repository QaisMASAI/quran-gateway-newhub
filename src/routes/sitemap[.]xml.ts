import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { TOPICS } from "@/lib/topics";
import { EMOTIONS } from "@/lib/emotions";
import { PROPHETS } from "@/lib/prophets";
import { READING_PLANS } from "@/lib/reading-plans";
import knowledgeSeed from "@/lib/seeds/knowledge-seed.json";

const BASE_URL = "https://quran-gateway-newhub.lovable.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entityByKind = new Map<string, Array<{ slug: string }>>();
        for (const entity of knowledgeSeed.entities as Array<{ kind: string; slug: string }>) {
          const list = entityByKind.get(entity.kind) ?? [];
          list.push({ slug: entity.slug });
          entityByKind.set(entity.kind, list);
        }

        const routeEntriesFromSeed = [
          ...(entityByKind.get("topic") ?? []).map((item) => `/topics/${item.slug}`),
          ...(entityByKind.get("prophet") ?? []).map((item) => `/prophets/${item.slug}`),
          ...(entityByKind.get("story") ?? []).map((item) => `/stories/${item.slug}`),
          ...(entityByKind.get("concept") ?? []).map((item) => `/concepts/${item.slug}`),
          ...(entityByKind.get("event") ?? []).map((item) => `/events/${item.slug}`),
          ...(entityByKind.get("place") ?? []).map((item) => `/places/${item.slug}`),
          ...(entityByKind.get("book") ?? []).map((item) => `/books/${item.slug}`),
          ...(entityByKind.get("companion") ?? []).map((item) => `/companions/${item.slug}`),
          ...(entityByKind.get("scholar") ?? []).map((item) => `/scholars/${item.slug}`),
          ...(entityByKind.get("dua") ?? []).map((item) => `/duas/${item.slug}`),
          ...(entityByKind.get("mosque") ?? []).map((item) => `/mosques/${item.slug}`),
          ...(entityByKind.get("topic") ?? []).map((item) => `/learn/topic/${item.slug}`),
          ...(entityByKind.get("prophet") ?? []).map((item) => `/learn/prophet/${item.slug}`),
          ...(entityByKind.get("story") ?? []).map((item) => `/learn/story/${item.slug}`),
          ...(entityByKind.get("concept") ?? []).map((item) => `/learn/concept/${item.slug}`),
          ...(entityByKind.get("event") ?? []).map((item) => `/learn/event/${item.slug}`),
          ...(entityByKind.get("place") ?? []).map((item) => `/learn/place/${item.slug}`),
          ...(entityByKind.get("theme") ?? []).map((item) => `/learn/theme/${item.slug}`),
          ...(entityByKind.get("nation") ?? []).map((item) => `/learn/nation/${item.slug}`),
        ];

        const paths: string[] = [
          "/",
          "/search",
          "/ask",
          "/auth",
          "/favorites",
          "/kids",
          "/onboarding",
          "/profile",
          "/topics",
          "/emotions",
          "/prophets",
          "/plans",
          "/learn",
          "/learn/tafsir-ibn-kathir",
          "/learn/graph",
          "/learn/journeys",
          "/explore/timeline",
          "/explore/map",
          "/surahs",
          "/tafsir",
          "/tafsir/compare",
          "/recent-ai",
          "/topics",
          "/stories",
          "/concepts",
          "/events",
          "/places",
          "/books",
          "/companions",
          "/scholars",
          "/duas",
          "/mosques",
          ...routeEntriesFromSeed,
          ...TOPICS.map((t) => `/topics/${t.slug}`),
          ...EMOTIONS.map((e) => `/emotions/${e.slug}`),
          ...PROPHETS.map((p) => `/prophets/${p.slug}`),
          ...READING_PLANS.map((p) => `/plans/${p.slug}`),
          ...Array.from({ length: 114 }, (_, i) => `/surah/${i + 1}`),
        ];

        const dedupedPaths = Array.from(new Set(paths));
        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...dedupedPaths.map((p) => `  <url><loc>${BASE_URL}${p}</loc></url>`),
          `</urlset>`,
        ].join("\n");
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
