import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BookOpen,
  Quote,
  Layers,
  User,
  MapPin,
  Compass,
  FileText,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  Sparkles,
  Brain,
  Network,
  History,
  Star,
  BookCopy,
  Link as LinkIcon,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import type { UnifiedSearchResponse, KnowledgeCategory } from "@/lib/search-unified";
import { EntityMetadataBadges } from "./EntityMetadataBadges";
import { SearchResultRankingDetails } from "./SearchResultRankingDetails";

interface CategorizedSearchResultsProps {
  searchResults: UnifiedSearchResponse;
  locale: "ar" | "en" | "he";
}

export const CategorizedSearchResults: React.FC<CategorizedSearchResultsProps> = ({ searchResults, locale }) => {
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const isAr = locale === "ar";
  const isHe = locale === "he";

  const { categoryResults, categoryCounts, totalResults, query, overallRankingRationale } = searchResults;

  const categories: Array<{
    id: KnowledgeCategory;
    label: string;
    icon: React.ReactNode;
    count: number;
    color: string;
  }> = [
    {
      id: "quran",
      label: isAr ? "القرآن الكريم" : isHe ? "קוראן קודש" : "Holy Quran",
      icon: <BookOpen className="h-4 w-4 text-emerald-600" />,
      count: categoryCounts.quran || 0,
      color: "border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
    },
    {
      id: "tafsir",
      label: isAr ? "التفسير الكلاسيكي" : isHe ? "תפסיר קלאסי" : "Classical Tafsir",
      icon: <Quote className="h-4 w-4 text-blue-600" />,
      count: categoryCounts.tafsir || 0,
      color: "border-blue-500/30 text-blue-700 dark:text-blue-300",
    },
    {
      id: "topics",
      label: isAr ? "المواضيع والمفاهيم" : isHe ? "נושאים ומושגים" : "Topics & Concepts",
      icon: <Layers className="h-4 w-4 text-purple-600" />,
      count: categoryCounts.topics || 0,
      color: "border-purple-500/30 text-purple-700 dark:text-purple-300",
    },
    {
      id: "prophets",
      label: isAr ? "الأنبياء والرسل" : isHe ? "נביאים" : "Prophets",
      icon: <User className="h-4 w-4 text-indigo-600" />,
      count: categoryCounts.prophets || 0,
      color: "border-indigo-500/30 text-indigo-700 dark:text-indigo-300",
    },
    {
      id: "places",
      label: isAr ? "الأماكن والمعالم" : isHe ? "מקומות" : "Places & Landmarks",
      icon: <MapPin className="h-4 w-4 text-rose-600" />,
      count: categoryCounts.places || 0,
      color: "border-rose-500/30 text-rose-700 dark:text-rose-300",
    },
  ];

  return (
    <div className="space-y-6 pt-8 border-t border-border mt-12">
      {/* MULTI-FACTOR AI RANKING SUMMARY BANNER */}
      <Card className="border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-700 text-white dark:bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {isAr
                  ? "محرك الترتيب بالذكاء الاصطناعي (7 عوامل)"
                  : isHe
                    ? "אלגוריתם דירוג מרובה-ממדים ב-AI"
                    : "7-Factor AI Search Ranking Engine"}
              </Badge>
              <span className="text-xs text-muted-foreground font-medium">
                {isAr
                  ? "ترتيب غير مقتصر على الكلمات المفتاحية"
                  : isHe
                    ? "דירוג תוצאות מבוסס משמעות והקשר"
                    : "Not ranked by keywords alone"}
              </span>
            </div>
          </div>

          <p className="text-xs text-emerald-950 dark:text-emerald-200 leading-relaxed font-medium">
            {overallRankingRationale ||
              (isAr
                ? `تم تصنيف النتائج بناءً على التطابق الدلالي، العلاقات في رسم البياني المعرفي، الأهمية التاريخية، أهمية الموضوع، التكرار في المصادر، الإحالات المتقاطعة، وتطابق هدف البحث.`
                : isHe
                  ? `התוצאות דורגו בעזרת מודל רב-ממדי המשקלל דמיון סמנטי, קשרי גרף ידע, זיקה היסטורית, חשיבות נושאית, תדירות במקורות, הפניות צולבות וכוונת החיפוש.`
                  : `Results are ranked using a multi-factor engine incorporating semantic similarity, knowledge graph relationships, historical context, topic importance, source frequency, cross references, and search intent.`)}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background/80 border text-purple-700 dark:text-purple-300 font-medium">
              <Brain className="w-3 h-3 text-purple-500" /> {isAr ? "دلالي" : isHe ? "סמנטי" : "Semantic"}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background/80 border text-blue-700 dark:text-blue-300 font-medium">
              <Network className="w-3 h-3 text-blue-500" /> {isAr ? "بياني" : isHe ? "גרף ידע" : "Knowledge Graph"}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background/80 border text-amber-700 dark:text-amber-300 font-medium">
              <History className="w-3 h-3 text-amber-500" /> {isAr ? "تاريخي" : isHe ? "היסטורי" : "History"}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background/80 border text-yellow-700 dark:text-yellow-300 font-medium">
              <Star className="w-3 h-3 text-yellow-500" /> {isAr ? "أهمية" : isHe ? "חשיבות" : "Topic Importance"}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background/80 border text-emerald-700 dark:text-emerald-300 font-medium">
              <BookCopy className="w-3 h-3 text-emerald-500" /> {isAr ? "تكرار" : isHe ? "תדירות" : "Source Frequency"}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background/80 border text-indigo-700 dark:text-indigo-300 font-medium">
              <LinkIcon className="w-3 h-3 text-indigo-500" /> {isAr ? "إحالات" : isHe ? "הפניות" : "Cross Refs"}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background/80 border text-rose-700 dark:text-rose-300 font-medium">
              <Target className="w-3 h-3 text-rose-500" /> {isAr ? "الهدف" : isHe ? "כוונת המשתמש" : "User Intent"}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Search className="h-6 w-6 text-primary" />
            <span>
              {isAr
                ? "نتائج البحث الـمُصنّفة بالمصادر"
                : isHe
                  ? "תוצאות חיפוש ממוינות לפי מקורות"
                  : "Categorized Search Database Results"}
            </span>
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isAr
              ? `تم العثور على ${totalResults} نتيجة مرتبطة بـ "${query}" عبر المجموعات والمراجع.`
              : isHe
                ? `נמצאו ${totalResults} תוצאות עבור "${query}" ברחבי המאגר הפנימי.`
                : `Found ${totalResults} categorized database records matching "${query}".`}
          </p>
        </div>
      </div>

      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <div className="overflow-x-auto pb-2">
          <TabsList className="bg-muted/60 p-1 min-w-max">
            <TabsTrigger value="all" className="text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5">
              <Filter className="h-3.5 w-3.5" />
              <span>{isAr ? "جميع المصادر" : isHe ? "כל המקורות" : "All Categories"}</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                {totalResults}
              </Badge>
            </TabsTrigger>

            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5"
              >
                {cat.icon}
                <span>{cat.label}</span>
                <Badge variant="outline" className={`ml-1 text-[10px] px-1.5 py-0 ${cat.color}`}>
                  {cat.count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ALL CATEGORIES TAB CONTENT */}
        <TabsContent value="all" className="mt-6 space-y-8">
          {categories.map((cat) => {
            const items = categoryResults[cat.id] || [];
            if (items.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    {cat.icon}
                    <span>{cat.label}</span>
                    <Badge variant="outline" className="text-xs">
                      {items.length}
                    </Badge>
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveCategory(cat.id)}
                    className="text-xs text-primary hover:underline h-7"
                  >
                    {isAr ? "عرض الكل ←" : isHe ? "הצג הכל ←" : "View All →"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.slice(0, 4).map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-border/80 bg-card hover:bg-accent/30 hover:border-primary/40 transition-all block group shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <a
                            href={item.url}
                            className="font-bold text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {item.title}
                            <ChevronRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </a>
                          <Badge variant="secondary" className="text-[10px] uppercase">
                            {item.badge || cat.id}
                          </Badge>
                        </div>

                        {item.subtitle && (
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                            {item.subtitle}
                          </p>
                        )}

                        <p className="text-xs text-foreground/80 line-clamp-3 leading-relaxed font-serif">
                          {item.snippet}
                        </p>
                        {item.metadata && <EntityMetadataBadges metadata={item.metadata} compact={true} />}
                      </div>

                      {/* 7-FACTOR RANKING SCORE & RATIONALE */}
                      <SearchResultRankingDetails
                        relevanceScore={item.relevanceScore}
                        rankingExplanation={item.rankingExplanation}
                        rankingFactors={item.rankingFactors}
                        locale={locale}
                      />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </TabsContent>

        {/* INDIVIDUAL CATEGORY TABS CONTENT */}
        {categories.map((cat) => {
          const items = categoryResults[cat.id] || [];
          return (
            <TabsContent key={cat.id} value={cat.id} className="mt-6 space-y-3">
              {items.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                  {isAr
                    ? `لم يتم العثور على نتائج في قسم ${cat.label}.`
                    : isHe
                      ? `לא נמצאו תוצאות בקטגוריה ${cat.label}.`
                      : `No records found under ${cat.label}.`}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-border/80 bg-card hover:bg-accent/40 hover:border-primary/40 transition-all block group shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <a
                            href={item.url}
                            className="font-bold text-base text-primary hover:underline flex items-center gap-1"
                          >
                            {item.title}
                            <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                          </a>
                          <Badge variant="outline" className={`text-xs ${cat.color}`}>
                            {item.badge || cat.id}
                          </Badge>
                        </div>

                        {item.subtitle && (
                          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5">
                            {item.subtitle}
                          </p>
                        )}

                        <p className="text-xs text-foreground/80 leading-relaxed font-serif">{item.snippet}</p>
                        {item.metadata && <EntityMetadataBadges metadata={item.metadata} />}
                      </div>

                      {/* 7-FACTOR RANKING SCORE & RATIONALE */}
                      <SearchResultRankingDetails
                        relevanceScore={item.relevanceScore}
                        rankingExplanation={item.rankingExplanation}
                        rankingFactors={item.rankingFactors}
                        locale={locale}
                      />
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
