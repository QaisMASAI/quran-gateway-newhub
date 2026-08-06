import React, { useState, useEffect } from "react";
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useTranslation } from "react-i18next";
import {
  Search,
  Sparkles,
  Loader2,
  BookOpen,
  History,
  Layers,
  Compass,
  FileText,
  X,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { normalizeLocale, type Locale } from "@/lib/i18n";
import { localeTextDir, uiFontClass } from "@/lib/locale-ui";
import { useQueryPrefillInput } from "@/hooks/useQueryPrefillInput";
import { getSearchResearchBrief } from "@/lib/search-brief.functions";
import { PerplexityResearchHub } from "@/components/search/PerplexityResearchHub";

export const Route = createLazyFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const { q, qState, src } = Route.useSearch();
  const navigate = useNavigate({ from: "/search" });
  const { i18n } = useTranslation();
  const locale = (normalizeLocale(i18n.language) ?? "he") as Locale;
  const uiClass = uiFontClass(locale);
  const textDir = localeTextDir(locale);

  const fetchBriefAndResults = useServerFn(getSearchResearchBrief);
  const {
    input: searchQuery,
    setInput: setSearchQuery,
    trimmed,
  } = useQueryPrefillInput({ initialQ: q });

  const activeQuery = q?.trim() || "";

  // Query to fetch the Executive AI Research Brief and Categorized Results
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["searchResearchBrief", activeQuery, locale],
    queryFn: () => fetchBriefAndResults({ data: { query: activeQuery, locale } }),
    enabled: activeQuery.length > 0,
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trimmed) return;
    navigate({
      search: { q: trimmed, qState: "ok", src: "search_input" },
    });
  };

  const handleSelectTopic = (topic: string) => {
    setSearchQuery(topic);
    navigate({
      search: { q: topic, qState: "ok", src: "unknown" },
    });
  };

  const handleClear = () => {
    setSearchQuery("");
    navigate({
      search: { q: "", qState: "missing", src: "unknown" },
    });
  };

  const popularPrompts = [
    {
      labelAr: "الصبر والثبات في القرآن",
      labelHe: "סבלנות ועמידות בקוראן",
      labelEn: "Patience and Perseverance (Sabr)",
      q: "Patience and Perseverance in Islam",
    },
    {
      labelAr: "التوحيد وإفراد الله بالعبادة",
      labelHe: "ייחוד האל (תווחיד)",
      labelEn: "Divine Unity (Tawheed)",
      q: "Tawheed Divine Unity",
    },
    {
      labelAr: "الزكاة والصدقة وطهارة المال",
      labelHe: "צדקה וזכאת",
      labelEn: "Charity & Purification (Zakat)",
      q: "Zakat and Charity in Quran",
    },
    {
      labelAr: "قصة النبي موسى عليه السلام",
      labelHe: "סיפור משה רבינו",
      labelEn: "Prophet Moses (Musa)",
      q: "Prophet Moses in Quran",
    },
    {
      labelAr: "الإسراء والمعراج والمعجزات",
      labelHe: "מסע הלילה (איסרא ומעראג')",
      labelEn: "Night Journey (Isra and Miraj)",
      q: "Isra and Miraj Night Journey",
    },
    {
      labelAr: "شهر رمضان ونزول القرآن",
      labelHe: "חודש רמדאן והקוראן",
      labelEn: "Ramadan & Quran Revelation",
      q: "Ramadan Quran Revelation",
    },
    {
      labelAr: "أحوال يوم القيامة والبعث",
      labelHe: "יום הדין ותחיית המתים",
      labelEn: "Day of Judgment (Yawm al-Qiyamah)",
      q: "Day of Judgment Yawm al Qiyamah",
    },
    {
      labelAr: "صلح الحديبية والسيرة النبوية",
      labelHe: "הסכם חודייביה בסירה",
      labelEn: "Treaty of Hudaybiyyah",
      q: "Treaty of Hudaybiyyah",
    },
  ];

  return (
    <div className={`min-h-screen bg-background text-foreground ${uiClass}`} dir={textDir}>
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TOP SEARCH BAR HEADER */}
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="text-center space-y-2">
            <Badge className="bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800 px-3 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-amber-500 inline-block" />
              {locale === "ar"
                ? "محرك البحث والتحليل التنفيذي الموحد"
                : locale === "he"
                  ? "מנוע מחקר מנהלי וחיפוש מאוחד ב-AI"
                  : "Executive AI Knowledge Research Engine"}
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif text-foreground">
              {locale === "ar"
                ? "البحث المعرفي والتقرير التنفيذي"
                : locale === "he"
                  ? "מחקר תורני ודוח מנהלי מאוחד"
                  : "Islamic Knowledge & Executive AI Research"}
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              {locale === "ar"
                ? "يبدأ كل بحث بتقرير تنفيذي محدد مستخرج حصراً من قاعدة البيانات الداخلية (القرآن، الحديث، التفسير، السيرة)، يليه نتائج البحث المصنفة."
                : locale === "he"
                  ? "כל חיפוש מתחיל בדוח מחקר מנהלי מקיף המבוסס על המאגר הפנימי (קוראן, חדית', תפסיר, היסטוריה), ולאחריו תוצאות חיפוש ממוינות."
                  : "Every search initiates with a grounded Executive AI Research Brief synthesized from internal databases (Quran, Hadith, Tafsir, History), followed by categorized search records."}
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative mt-4">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  locale === "ar"
                    ? "ابحث عن موضوع، آية، حديث، نبي، أو مفهوم إسلامي..."
                    : locale === "he"
                      ? "חפש נושא, פסוק, חדית', נביא או מושג באסלאם..."
                      : "Search any topic, verse, hadith, prophet, or concept..."
                }
                className="pl-12 pr-28 py-6 text-base rounded-full border-2 border-emerald-800/30 focus-visible:border-emerald-600 shadow-lg bg-card text-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-24 text-muted-foreground hover:text-foreground p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <Button
                type="submit"
                disabled={!trimmed}
                className="absolute right-2 rounded-full px-5 py-5 bg-primary text-primary-foreground font-semibold shadow hover:bg-primary/90 text-sm"
              >
                <span>{locale === "ar" ? "بحث" : locale === "he" ? "חפש" : "Research"}</span>
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </form>
        </div>

        {/* ACTIVE SEARCH RESULT AREA */}
        {activeQuery ? (
          <div className="space-y-8">
            {/* LOADING STATE FOR EXECUTIVE AI BRIEF */}
            {isLoading && (
              <Card className="border-emerald-800/30 bg-card shadow-lg p-6 sm:p-8 space-y-6 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 rounded-full">
                    <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">
                      {locale === "ar"
                        ? `جاري صياغة التقرير التنفيذي لموضوع "${activeQuery}"...`
                        : locale === "he"
                          ? `מכין דוח מחקר מנהלי עבור "${activeQuery}"...`
                          : `Generating Executive AI Research Brief for "${activeQuery}"...`}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {locale === "ar"
                        ? "يتم تجميع وتوثيق البيانات حصراً من الآيات والأحاديث والتفاسير في القاعدة الداخلية."
                        : locale === "he"
                          ? "מקבץ ומאמת נתונים מתוך פסוקים, חדית'ים ותפסירים מהמאגר הפנימי בלבד."
                          : "Synthesizing evidence exclusively from authenticated Quran verses, Sahih Hadiths, and classical Tafsirs."}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                  <Skeleton className="h-6 w-3/4 bg-muted" />
                  <Skeleton className="h-20 w-full bg-muted" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-32 w-full bg-muted" />
                    <Skeleton className="h-32 w-full bg-muted" />
                  </div>
                  <Skeleton className="h-24 w-full bg-muted" />
                </div>
              </Card>
            )}

            {/* ERROR STATE */}
            {isError && (
              <Card className="border-destructive/50 bg-destructive/5 p-6 text-center space-y-3">
                <p className="text-sm font-semibold text-destructive">
                  {locale === "ar"
                    ? "حدث خطأ أثناء تحميل التقرير البحثي. يرجى المحاولة مرة أخرى."
                    : locale === "he"
                      ? "אירעה שגיאה בטעינת דוח המחקר. אנא נסה שוב."
                      : "Failed to generate AI Research Brief. Please try again."}
                </p>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  {locale === "ar"
                    ? "إعادة المحاولة"
                    : locale === "he"
                      ? "נסה שוב"
                      : "Retry Research"}
                </Button>
              </Card>
            )}

            {/* LOADED DATA AREA - 10-SECTION PERPLEXITY RESEARCH HUB */}
            {data && (
              <PerplexityResearchHub
                brief={data.brief}
                searchResults={data.searchResults}
                onSelectTopic={handleSelectTopic}
              />
            )}
          </div>
        ) : (
          /* EMPTY SEARCH LANDING STATE WITH POPULAR RESEARCH PROMPTS */
          <div className="space-y-8 pt-4">
            <Card className="border-border bg-gradient-to-br from-card to-muted/30 shadow-md">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-foreground">
                    {locale === "ar"
                      ? "مواضيع بحثية تنفيذيّة مقترحة للبدء:"
                      : locale === "he"
                        ? "נושאי מחקר מנהליים מוצעים להתחלה:"
                        : "Featured Executive Research Prompts:"}
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {popularPrompts.map((prompt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      onClick={() => handleSelectTopic(prompt.q)}
                      className="h-auto p-4 flex flex-col items-start text-left justify-between bg-card hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-400 border-border transition-all rounded-xl shadow-sm group"
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <Badge variant="secondary" className="text-[10px]">
                          Topic #{idx + 1}
                        </Badge>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
                      </div>
                      <span className="font-bold text-sm text-foreground group-hover:text-emerald-800 dark:group-hover:text-emerald-300">
                        {locale === "ar"
                          ? prompt.labelAr
                          : locale === "he"
                            ? prompt.labelHe
                            : prompt.labelEn}
                      </span>
                      <span className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        "{prompt.q}"
                      </span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
