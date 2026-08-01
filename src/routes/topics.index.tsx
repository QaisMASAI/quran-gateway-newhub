import { useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import i18n, { normalizeLocale, type Locale } from "@/lib/i18n";
import { Header } from "@/components/Header";
import {
  Search,
  BookOpen,
  ChevronLeft,
  Sparkles,
  Heart,
  Scale,
  Sun,
  Moon,
  Shield,
  Users,
  HandHelping,
  Star,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { listEntitiesByKind, pickLocale, type KnowledgeEntity } from "@/lib/knowledge";
import { ALL_TOPICS } from "@/lib/topics";
import { useTopicT } from "@/lib/content-i18n";

export const Route = createFileRoute("/topics/")({
  head: () => {
    const locale = normalizeLocale(i18n.resolvedLanguage) ?? "he";
    const title =
      locale === "ar"
        ? "مواضيع القرآن الكريم - الفهرس الموضوعي | نور"
        : locale === "en"
          ? "Quranic Topics - Thematic Index | Noor"
          : "נושאי הקוראן - אינדקס נושאי | נור";
    const description =
      locale === "ar"
        ? "استكشف الفهرس الموضوعي الشامل لآيات القرآن الكريم: التوحيد، الصلاة، الصبر، الرحمة والأخلاق."
        : locale === "en"
          ? "Explore the comprehensive thematic index of the Holy Quran: Monotheism, Prayer, Patience, Mercy, and Ethics."
          : "חקור את אינדקס הנושאים המקיף של הקוראן: ייחוד האל, תפילה, סבלנות, רחמים ומוסר.";

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: "/topics" },
      ],
      links: [{ rel: "canonical", href: "/topics" }],
    };
  },
  component: TopicsIndexPage,
});

const TOPIC_ICONS = {
  heart: Heart,
  scale: Scale,
  book: BookOpen,
  sun: Sun,
  moon: Moon,
  shield: Shield,
  users: Users,
  sparkles: Sparkles,
  hand: HandHelping,
  star: Star,
} as const;

function TopicsIndexPage() {
  const { t, i18n } = useTranslation("pages");
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const q = useQuery({
    queryKey: ["entities-by-kind", "topic"],
    queryFn: () => listEntitiesByKind("topic"),
    staleTime: 5 * 60_000,
  });

  // Combine static ALL_TOPICS and db topics without duplicates
  const allTopicCards = useMemo(() => {
    const seenSlugs = new Set<string>();
    const list: Array<{
      slug: string;
      title: string;
      subtitle?: string;
      description: string;
      icon: keyof typeof TOPIC_ICONS;
      refsCount: number;
    }> = [];

    // First add curated TOPICS from lib/topics.ts
    for (const top of ALL_TOPICS) {
      seenSlugs.add(top.slug);
      list.push({
        slug: top.slug,
        title: top.title,
        subtitle: top.subtitle,
        description: top.description,
        icon: top.icon,
        refsCount: top.refs.length,
      });
    }

    // Next add database entities of kind 'topic' if not already present
    if (q.data) {
      for (const ent of q.data) {
        if (!seenSlugs.has(ent.slug)) {
          seenSlugs.add(ent.slug);
          const title = pickLocale(ent.title_i18n, locale);
          const summary = pickLocale(ent.summary_i18n, locale);
          list.push({
            slug: ent.slug,
            title,
            subtitle: undefined,
            description: summary,
            icon: "sparkles",
            refsCount: 3,
          });
        }
      }
    }

    return list;
  }, [q.data, locale]);

  const filteredTopics = useMemo(() => {
    let result = allTopicCards;
    if (searchQuery.trim()) {
      const sq = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(sq) ||
          (t.subtitle && t.subtitle.toLowerCase().includes(sq)) ||
          t.description.toLowerCase().includes(sq) ||
          t.slug.toLowerCase().includes(sq),
      );
    }
    return result;
  }, [allTopicCards, searchQuery]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Header */}
      <div className="border-b border-border bg-gradient-to-b from-primary-soft/40 via-background to-background">
        <div className="mx-auto max-w-5xl px-4 pt-8 pb-6 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-2">
            <Sparkles className="h-4 w-4 text-gold" />
            <span>{locale === "ar" ? "الفهرس الموضوعي" : locale === "he" ? "אינדקס הנושאים" : "Thematic Index"}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("topics.title", "Quranic Topics")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-2xl">
            {t(
              "topics.intro",
              "Explore authentic Quranic guidance categorized by spiritual themes, ethics, worship, and social values.",
            )}
          </p>

          {/* Search Box */}
          <div className="mt-6 relative max-w-xl">
            <Search className="absolute inset-y-0 start-3 my-auto h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                locale === "ar"
                  ? "ابحث في مواضيع القرآن (التوحيد، الصبر، الصلاة...)"
                  : locale === "he"
                    ? "חפש בנושאי הקוראן (ייחוד האל, סבלנות, תפילה...)"
                    : "Search Quran topics (Tawhid, Patience, Prayer...)"
              }
              className="w-full rounded-2xl border border-border bg-card/80 py-3 start-10 pe-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 end-3 my-auto text-xs text-muted-foreground hover:text-foreground"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">
            {locale === "ar"
              ? `عرض ${filteredTopics.length} موضوعاً`
              : locale === "he"
                ? `מציג ${filteredTopics.length} נושאים`
                : `Showing ${filteredTopics.length} topics`}
          </div>
        </div>

        {q.isLoading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span>Loading topics…</span>
          </div>
        )}

        {filteredTopics.length === 0 && !q.isLoading ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {locale === "ar"
                ? "لم يتم العثور على مواضيع تطابق بحثك."
                : locale === "he"
                  ? "לא נמצאו נושאים התואמים את החיפוש שלך."
                  : "No topics found matching your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTopics.map((item) => (
              <TopicCardItem
                key={item.slug}
                slug={item.slug}
                icon={item.icon}
                defaultTitle={item.title}
                defaultSubtitle={item.subtitle}
                defaultDescription={item.description}
                refsCount={item.refsCount}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function TopicCardItem({
  slug,
  icon,
  defaultTitle,
  defaultSubtitle,
  defaultDescription,
  refsCount,
}: {
  slug: string;
  icon: keyof typeof TOPIC_ICONS;
  defaultTitle: string;
  defaultSubtitle?: string;
  defaultDescription: string;
  refsCount: number;
}) {
  const Icon = TOPIC_ICONS[icon] ?? BookOpen;
  const { t, i18n } = useTranslation("pages");
  const topicT = useTopicT(slug);
  const locale = i18n.language || "en";

  const title = topicT.title || defaultTitle;
  const subtitle = topicT.subtitle || defaultSubtitle;
  const description = topicT.description || defaultDescription;

  return (
    <Link
      to="/learn/$kind/$slug"
      params={{ kind: "topic", slug }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card/90 via-card to-secondary/30 p-5 shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-gold/15 group-hover:text-gold shadow-2xs">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="rounded-full border border-primary/20 bg-primary-soft/50 px-2.5 py-0.5 text-[10.5px] font-semibold text-primary">
            {t("search.kindTopic", "Topic")}
          </span>
        </div>
        <ChevronLeft
          className="h-4 w-4 shrink-0 text-muted-foreground transition-all group-hover:-translate-x-0.5 group-hover:text-gold ltr:rotate-180"
          aria-hidden="true"
        />
      </div>

      <div className="mt-4 min-w-0">
        <h3
          className="line-clamp-1 font-display text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors"
          dir="auto"
        >
          {title}
        </h3>
        {subtitle && (
          <p className="mt-0.5 text-xs font-arabic font-medium text-gold truncate" dir="auto">
            {subtitle}
          </p>
        )}
        <p className="mt-2 line-clamp-2 text-xs sm:text-sm text-muted-foreground leading-relaxed" dir="auto">
          {description}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border/60 pt-3 text-[11px] font-medium text-muted-foreground">
        <span className="text-gold font-semibold">
          {refsCount} {t("topics.refsLabel", "Verses")}
        </span>
        <span className="text-primary group-hover:underline font-semibold">
          {locale === "ar" ? "عرض الموضوع ←" : locale === "he" ? "הצג נושא ←" : "Explore →"}
        </span>
      </div>
    </Link>
  );
}
