import React, { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Sparkles,
  BookOpen,
  History,
  BookCheck,
  Quote,
  GraduationCap,
  Layers,
  Lightbulb,
  Book,
  MapPin,
  Calendar,
  CheckCircle2,
  HelpCircle,
  Compass,
  Copy,
  Check,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  FileText,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import type { SearchResearchBrief } from "@/lib/search-brief.functions";

interface AiResearchBriefCardProps {
  brief: SearchResearchBrief;
  onSelectNextTopic?: (topic: string) => void;
}

export const AiResearchBriefCard: React.FC<AiResearchBriefCardProps> = ({
  brief,
  onSelectNextTopic,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("all");

  const isAr = brief.locale === "ar";
  const isHe = brief.locale === "he";

  const handleCopyReport = () => {
    const reportText = `
Bayan AI Executive Research Brief: ${brief.query}
Language: ${brief.locale.toUpperCase()}
Generated: ${new Date(brief.generatedAt).toLocaleDateString()}

• Overview:
${brief.overview}

• Historical Context:
${brief.historicalContext}

• Quranic Perspective:
${brief.quranicPerspective}

• Hadith Perspective:
${brief.hadithPerspective}

• Classical Tafsir Insights:
${brief.tafsirInsights}

• Scholarly Observations:
${brief.scholarlyObservations}

• Main Themes:
${brief.mainThemes.join(", ")}

• Related Concepts:
${brief.relatedConcepts.join(", ")}

• Practical Lessons:
${brief.practicalLessons.map((l, i) => `${i + 1}. ${l}`).join("\n")}

• Frequently Asked Questions:
${brief.faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n")}

Source: Bayan AI Islamic Research Platform
    `.trim();

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    toast.success(
      isAr
        ? "تم نسخ التقرير البحثي"
        : isHe
          ? "דוח המחקר הועתק ללוח"
          : "Executive Brief copied to clipboard",
    );
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Executive AI Research Brief: ${brief.query}`,
          text: brief.overview,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopyReport();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div id="ai-research-brief-report" className="space-y-8 animate-in fade-in duration-300">
      {/* EXECUTIVE HEADER BANNER */}
      <Card className="border-emerald-800/30 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-slate-100 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <CardHeader className="pb-4 relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 px-3 py-1 font-semibold flex items-center gap-1.5 text-xs">
                <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                {isAr
                  ? "تقرير بحثي تنفيذي بالذكاء الاصطناعي"
                  : isHe
                    ? "דוח מחקר מנהלי ב-AI"
                    : "Executive AI Research Brief"}
              </Badge>
              <Badge
                variant="outline"
                className="text-emerald-300 border-emerald-500/30 text-xs flex items-center gap-1"
              >
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                {isAr
                  ? "موثق من القاعدة الداخلية"
                  : isHe
                    ? "מאומת ממאגר פנימי"
                    : "Grounded Internal Database"}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 print:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyReport}
                className="h-8 text-slate-300 hover:text-white hover:bg-emerald-800/50 text-xs"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400 mr-1" />
                ) : (
                  <Copy className="h-3.5 w-3.5 mr-1" />
                )}
                {copied
                  ? isAr
                    ? "تم النسخ"
                    : isHe
                      ? "הועתק"
                      : "Copied"
                  : isAr
                    ? "نسخ التقرير"
                    : isHe
                      ? "העתק דוח"
                      : "Copy Brief"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="h-8 text-slate-300 hover:text-white hover:bg-emerald-800/50 text-xs"
              >
                <Share2 className="h-3.5 w-3.5 mr-1" />
                {isAr ? "مشاركة" : isHe ? "שתף" : "Share"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrint}
                className="h-8 text-slate-300 hover:text-white hover:bg-emerald-800/50 text-xs"
              >
                <Printer className="h-3.5 w-3.5 mr-1" />
                {isAr ? "طباعة" : isHe ? "הדפס" : "Print"}
              </Button>
            </div>
          </div>

          <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="h-7 w-7 text-amber-400 shrink-0" />
            <span>
              {isAr ? "دراسة تحليليّة شاطرة: " : isHe ? "מחקר מנהלי מקיף: " : "Executive Brief: "}
              <span className="text-amber-300 font-serif font-medium">"{brief.query}"</span>
            </span>
          </CardTitle>

          <p className="text-slate-300 text-sm mt-2 max-w-4xl leading-relaxed">
            {isAr
              ? "تحليل بحثي شامل تم توليده استناداً إلى النصوص القرآنية المحكمة والأحاديث النبوية الصحيحة والتفاسير المعتبيرة المسجلة في القاعدة."
              : isHe
                ? "ניתוח מחקרי מקיף ומבוסס המשלב פסוקי קוראן, חדית'ים מוסמכים ותפסירים קלאסיים מתוך המאגר הפנימי בלבד."
                : "A comprehensive executive intelligence report synthesized exclusively from authenticated Quranic verses, Sahih Hadiths, classical Tafsirs, and Knowledge Hub collections in our internal database."}
          </p>

          {/* CITATIONS & STATS BAR */}
          <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-emerald-800/40 text-xs text-slate-300">
            <span className="text-slate-400 font-medium">
              {isAr ? "المراجع المستند إليها:" : isHe ? "סימוכין שנשלפו:" : "Grounded Sources:"}
            </span>
            <span className="flex items-center gap-1 bg-emerald-900/60 px-2.5 py-1 rounded border border-emerald-700/50 text-emerald-200">
              <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
              {brief.groundingStats.versesCount}{" "}
              {isAr ? "آيات قرآنية" : isHe ? "פסוקי קוראן" : "Verses"}
            </span>
            <span className="flex items-center gap-1 bg-emerald-900/60 px-2.5 py-1 rounded border border-emerald-700/50 text-amber-200">
              <BookCheck className="h-3.5 w-3.5 text-amber-400" />
              {brief.groundingStats.hadithsCount}{" "}
              {isAr ? "أحاديث صحيحة" : isHe ? "חדית'ים מוסמכים" : "Hadiths"}
            </span>
            <span className="flex items-center gap-1 bg-emerald-900/60 px-2.5 py-1 rounded border border-emerald-700/50 text-blue-200">
              <Quote className="h-3.5 w-3.5 text-blue-400" />
              {brief.groundingStats.tafsirCount}{" "}
              {isAr ? "تفاسير كبرى" : isHe ? "קבוצות תפסיר" : "Tafsirs"}
            </span>
            <span className="flex items-center gap-1 bg-emerald-900/60 px-2.5 py-1 rounded border border-emerald-700/50 text-purple-200">
              <Layers className="h-3.5 w-3.5 text-purple-400" />
              {brief.groundingStats.entitiesCount}{" "}
              {isAr ? "كيانات معرفية" : isHe ? "ישויות ידע" : "Knowledge Entities"}
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* STICKY QUICK-JUMP SECTION NAVIGATION BAR */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border py-2 px-1 overflow-x-auto print:hidden shadow-sm">
        <div className="flex items-center gap-1.5 min-w-max text-xs">
          <span className="font-semibold text-muted-foreground mr-1 flex items-center gap-1">
            <Compass className="h-3.5 w-3.5 text-primary" />
            {isAr ? "أقسام التقرير:" : isHe ? "סעיפי הדוח:" : "Report Sections:"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection("sec-overview")}
            className="h-7 px-2.5 text-xs"
          >
            {isAr ? "نظرة عامة" : isHe ? "סקירה" : "Overview"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection("sec-history")}
            className="h-7 px-2.5 text-xs"
          >
            {isAr ? "السياق التاريخي" : isHe ? "הקשר היסטורי" : "History"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection("sec-quran")}
            className="h-7 px-2.5 text-xs"
          >
            {isAr ? "الرؤية القرآنية" : isHe ? "זווית קוראנית" : "Quran"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection("sec-hadith")}
            className="h-7 px-2.5 text-xs"
          >
            {isAr ? "السنة النبوية" : isHe ? "זווית חדית'" : "Hadith"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection("sec-tafsir")}
            className="h-7 px-2.5 text-xs"
          >
            {isAr ? "التفسير" : isHe ? "תפסיר" : "Tafsir"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection("sec-scholarly")}
            className="h-7 px-2.5 text-xs"
          >
            {isAr ? "آراء العلماء" : isHe ? "מבט תורני" : "Scholarly"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection("sec-themes")}
            className="h-7 px-2.5 text-xs"
          >
            {isAr ? "المحاور والمفاهيم" : isHe ? "נושאים ומושגים" : "Themes"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection("sec-terms")}
            className="h-7 px-2.5 text-xs"
          >
            {isAr ? "المصطلحات" : isHe ? "מונחים" : "Terms"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection("sec-entities")}
            className="h-7 px-2.5 text-xs"
          >
            {isAr ? "الأنبياء والأماكن" : isHe ? "נביאים ומקומות" : "Entities"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection("sec-lessons")}
            className="h-7 px-2.5 text-xs"
          >
            {isAr ? "الدروس العملية" : isHe ? "לקחים מעשיים" : "Lessons"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection("sec-faqs")}
            className="h-7 px-2.5 text-xs"
          >
            {isAr ? "أسئلة شائعة" : isHe ? "שאלות נפוצות" : "FAQs"}
          </Button>
        </div>
      </div>

      {/* 15 EXECUTIVE REPORT SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* MAIN REPORT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          {/* SECTION 1: OVERVIEW */}
          <section id="sec-overview" className="scroll-mt-28">
            <Card className="border-border shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                  <FileText className="h-5 w-5 text-amber-600" />
                  <span>
                    1.{" "}
                    {isAr
                      ? "نظرة عامة وتنفيذية (Overview)"
                      : isHe
                        ? "1. סקירה מנהלית כללית (Overview)"
                        : "1. Executive Overview"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-foreground/90 leading-relaxed text-base space-y-3">
                <p className="whitespace-pre-line">{brief.overview}</p>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 2: HISTORICAL CONTEXT */}
          <section id="sec-history" className="scroll-mt-28">
            <Card className="border-border shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                  <History className="h-5 w-5 text-emerald-600" />
                  <span>
                    2.{" "}
                    {isAr
                      ? "السياق التاريخي ودواعي النزول (Historical Context)"
                      : isHe
                        ? "2. ההקשר ההיסטורי ונסיבות ההתגלות (Historical Context)"
                        : "2. Historical Context & Revelation Background"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-foreground/90 leading-relaxed text-base space-y-3">
                <p className="whitespace-pre-line">{brief.historicalContext}</p>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 3: QURANIC PERSPECTIVE */}
          <section id="sec-quran" className="scroll-mt-28">
            <Card className="border-border shadow-sm hover:shadow transition-shadow border-l-4 border-l-emerald-600">
              <CardHeader className="pb-3 border-b border-border/50 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <BookOpen className="h-5 w-5 text-emerald-600" />
                  <span>
                    3.{" "}
                    {isAr
                      ? "الرؤية والمنظور القرآني (Quranic Perspective)"
                      : isHe
                        ? "3. הזווית והתפיסה הקוראנית (Quranic Perspective)"
                        : "3. Quranic Perspective & Passages"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-foreground/90 leading-relaxed text-base space-y-4">
                <p className="whitespace-pre-line">{brief.quranicPerspective}</p>

                {/* Grounded Quran Verses Citations Cards */}
                {brief.references.filter((r) => r.type === "quran").length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/60 space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      {isAr
                        ? "آيات قرآنية مستشهد بها:"
                        : isHe
                          ? "פסוקי קוראן מצוטטים:"
                          : "Cited Quranic Verses:"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {brief.references
                        .filter((r) => r.type === "quran")
                        .slice(0, 4)
                        .map((ref, idx) => (
                          <a
                            key={idx}
                            href={ref.url}
                            className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/30 dark:bg-emerald-900/10 hover:border-emerald-400 transition-colors block group"
                          >
                            <div className="flex items-center justify-between font-semibold text-sm text-emerald-800 dark:text-emerald-300">
                              <span>{ref.label}</span>
                              <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                            </div>
                            {ref.snippet && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1 font-serif">
                                "{ref.snippet}"
                              </p>
                            )}
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* SECTION 4: HADITH PERSPECTIVE */}
          <section id="sec-hadith" className="scroll-mt-28">
            <Card className="border-border shadow-sm hover:shadow transition-shadow border-l-4 border-l-amber-600">
              <CardHeader className="pb-3 border-b border-border/50 bg-amber-50/50 dark:bg-amber-950/20">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-amber-800 dark:text-amber-300">
                  <BookCheck className="h-5 w-5 text-amber-600" />
                  <span>
                    4.{" "}
                    {isAr
                      ? "السنة النبوية والأحاديث الصحيحة (Hadith Perspective)"
                      : isHe
                        ? "4. מסורת החדית' והסונה (Hadith Perspective)"
                        : "4. Hadith Perspective & Sunnah Traditions"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-foreground/90 leading-relaxed text-base space-y-4">
                <p className="whitespace-pre-line">{brief.hadithPerspective}</p>

                {/* Grounded Hadith Citations Cards */}
                {brief.references.filter((r) => r.type === "hadith").length > 0 && (
                  <div className="mt-4 pt-4 border-t border-border/60 space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                      {isAr
                        ? "أحاديث صحيحة مستشهد بها:"
                        : isHe
                          ? "חדית'ים מוסמכים מצוטטים:"
                          : "Cited Sahih Hadiths:"}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {brief.references
                        .filter((r) => r.type === "hadith")
                        .slice(0, 4)
                        .map((ref, idx) => (
                          <a
                            key={idx}
                            href={ref.url}
                            className="p-3 rounded-lg border border-amber-200 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-900/10 hover:border-amber-400 transition-colors block group"
                          >
                            <div className="flex items-center justify-between font-semibold text-sm text-amber-800 dark:text-amber-300">
                              <span>{ref.label}</span>
                              <ExternalLink className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" />
                            </div>
                            {ref.snippet && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                "{ref.snippet}"
                              </p>
                            )}
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* SECTION 5: CLASSICAL TAFSIR INSIGHTS */}
          <section id="sec-tafsir" className="scroll-mt-28">
            <Card className="border-border shadow-sm hover:shadow transition-shadow border-l-4 border-l-blue-600">
              <CardHeader className="pb-3 border-b border-border/50 bg-blue-50/50 dark:bg-blue-950/20">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-blue-800 dark:text-blue-300">
                  <Quote className="h-5 w-5 text-blue-600" />
                  <span>
                    5.{" "}
                    {isAr
                      ? "رؤى وأبعاد التفسير الكلاسيكي (Classical Tafsir Insights)"
                      : isHe
                        ? "5. פרשנות התפסיר הקלאסית (Classical Tafsir Insights)"
                        : "5. Classical Tafsir Exegesis & Commentary"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-foreground/90 leading-relaxed text-base space-y-3">
                <p className="whitespace-pre-line">{brief.tafsirInsights}</p>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 6: SCHOLARLY OBSERVATIONS */}
          <section id="sec-scholarly" className="scroll-mt-28">
            <Card className="border-border shadow-sm hover:shadow transition-shadow border-l-4 border-l-purple-600">
              <CardHeader className="pb-3 border-b border-border/50 bg-purple-50/50 dark:bg-purple-950/20">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-purple-800 dark:text-purple-300">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  <span>
                    6.{" "}
                    {isAr
                      ? "ملاحظات واستنتاجات العلماء (Scholarly Observations)"
                      : isHe
                        ? "6. תובנות ומסקנות תורניות (Scholarly Observations)"
                        : "6. Scholarly Consensus & Analytical Observations"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-foreground/90 leading-relaxed text-base space-y-3">
                <p className="whitespace-pre-line">{brief.scholarlyObservations}</p>
              </CardContent>
            </Card>
          </section>

          {/* SECTION 9: IMPORTANT TERMINOLOGY */}
          <section id="sec-terms" className="scroll-mt-28">
            <Card className="border-border shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                  <Book className="h-5 w-5 text-emerald-600" />
                  <span>
                    9.{" "}
                    {isAr
                      ? "المصطلحات والمفاهيم اللغوية (Important Terminology)"
                      : isHe
                        ? "9. מונחים קוראניים ולשוניים מרכזיים (Important Terminology)"
                        : "9. Important Terminology & Lexicon"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {brief.importantTerminology.map((term, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg border border-border/80 bg-card hover:bg-accent/40 transition-colors"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-bold text-base text-primary font-serif">
                        {term.term}
                      </span>
                      {term.transliteration && (
                        <Badge variant="secondary" className="text-xs">
                          {term.transliteration}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium mt-1 text-foreground/90">{term.meaning}</p>
                    {term.context && (
                      <p className="text-xs text-muted-foreground mt-1">{term.context}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* SECTION 13: PRACTICAL LESSONS */}
          <section id="sec-lessons" className="scroll-mt-28">
            <Card className="border-border shadow-sm hover:shadow transition-shadow bg-emerald-50/20 dark:bg-emerald-950/10">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <span>
                    13.{" "}
                    {isAr
                      ? "الدروس والتطبيقات العملية (Practical Lessons)"
                      : isHe
                        ? "13. לקחים ויישומים מעשיים (Practical Lessons)"
                        : "13. Practical Actionable Lessons"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {brief.practicalLessons.map((lesson, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                      {lesson}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* SECTION 14: FREQUENTLY ASKED QUESTIONS */}
          <section id="sec-faqs" className="scroll-mt-28">
            <Card className="border-border shadow-sm hover:shadow transition-shadow">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-lg font-bold flex items-center gap-2 text-primary">
                  <HelpCircle className="h-5 w-5 text-amber-600" />
                  <span>
                    14.{" "}
                    {isAr
                      ? "أسئلة شائعة حول الموضوع (Frequently Asked Questions)"
                      : isHe
                        ? "14. שאלות ותשובות מורחבות (Frequently Asked Questions)"
                        : "14. Frequently Asked Questions & Answers"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <Accordion type="single" collapsible defaultValue="faq-0" className="w-full">
                  {brief.faqs.map((faq, idx) => (
                    <AccordionItem key={idx} value={`faq-${idx}`}>
                      <AccordionTrigger className="text-base font-semibold text-left hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-foreground/80 space-y-2 leading-relaxed">
                        <p>{faq.answer}</p>
                        {faq.citations && faq.citations.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {faq.citations.map((c, i) => (
                              <Badge key={i} variant="outline" className="text-xs bg-muted/50">
                                {c}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* SIDEBAR COLUMN: THEMES, CONCEPTS, ENTITIES & NEXT TOPICS */}
        <div className="lg:col-span-4 space-y-6">
          {/* SECTION 7 & 8: MAIN THEMES & RELATED CONCEPTS */}
          <Card id="sec-themes" className="border-border shadow-sm scroll-mt-28">
            <CardHeader className="pb-2 border-b border-border/50 bg-muted/30">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-primary">
                <Layers className="h-4 w-4 text-emerald-600" />
                <span>
                  7 & 8.{" "}
                  {isAr
                    ? "المحاور والمفاهيم"
                    : isHe
                      ? "7-8. נושאים ומושגים"
                      : "7 & 8. Main Themes & Concepts"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-4">
              <div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  {isAr ? "المحاور الرئيسية:" : isHe ? "נושאי ליבה:" : "Main Themes:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {brief.mainThemes.map((theme, idx) => (
                    <Badge
                      key={idx}
                      className="bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200 text-xs py-1 px-2.5"
                    >
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-border/50">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                  {isAr ? "مفاهيم مرتبطة:" : isHe ? "מושגים קשורים:" : "Related Concepts:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {brief.relatedConcepts.map((concept, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onSelectNextTopic
                          ? onSelectNextTopic(concept)
                          : navigate({
                              to: "/search",
                              search: { q: concept, qState: "ok", src: "unknown" },
                            })
                      }
                      className="h-7 text-xs bg-card hover:bg-accent hover:text-accent-foreground"
                    >
                      {concept}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SECTION 10, 11, 12: RELATED PROPHETS, PLACES & EVENTS */}
          <Card id="sec-entities" className="border-border shadow-sm scroll-mt-28">
            <CardHeader className="pb-2 border-b border-border/50 bg-muted/30">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-primary">
                <Compass className="h-4 w-4 text-amber-600" />
                <span>
                  10-12.{" "}
                  {isAr
                    ? "الأنبياء والأماكن والأحداث"
                    : isHe
                      ? "10-12. נביאים, מקומות ואירועים"
                      : "10-12. Prophets, Places & Events"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-4">
              {/* PROPHETS */}
              {brief.relatedProphets.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-1">
                    <User className="h-3 w-3 text-amber-600" />
                    10. {isAr ? "الأنبياء والرسل:" : isHe ? "נביאים קשורים:" : "Related Prophets:"}
                  </span>
                  <div className="space-y-1.5">
                    {brief.relatedProphets.map((p, idx) => (
                      <a
                        key={idx}
                        href={
                          p.slug ? `/prophets/${p.slug}` : `/search?q=${encodeURIComponent(p.name)}`
                        }
                        className="p-2 rounded border border-border/60 bg-card hover:border-amber-400/60 block transition-colors group"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-foreground group-hover:text-amber-700 dark:group-hover:text-amber-300">
                          <span>{p.name}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {p.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {p.description}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* PLACES */}
              {brief.relatedPlaces.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-emerald-600" />
                    11.{" "}
                    {isAr
                      ? "الأماكن المقدسة والمعالم:"
                      : isHe
                        ? "מקומות קדושים:"
                        : "Related Places:"}
                  </span>
                  <div className="space-y-1.5">
                    {brief.relatedPlaces.map((pl, idx) => (
                      <a
                        key={idx}
                        href={
                          pl.slug
                            ? `/places/${pl.slug}`
                            : `/search?q=${encodeURIComponent(pl.name)}`
                        }
                        className="p-2 rounded border border-border/60 bg-card hover:border-emerald-400/60 block transition-colors group"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-300">
                          <span>{pl.name}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {pl.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {pl.description}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* EVENTS */}
              {brief.relatedEvents.length > 0 && (
                <div className="pt-2 border-t border-border/50">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-blue-600" />
                    12.{" "}
                    {isAr
                      ? "الأحداث الغزوات التاريخية:"
                      : isHe
                        ? "אירועים היסטוריים:"
                        : "Related Historical Events:"}
                  </span>
                  <div className="space-y-1.5">
                    {brief.relatedEvents.map((ev, idx) => (
                      <a
                        key={idx}
                        href={
                          ev.slug
                            ? `/events/${ev.slug}`
                            : `/search?q=${encodeURIComponent(ev.name)}`
                        }
                        className="p-2 rounded border border-border/60 bg-card hover:border-blue-400/60 block transition-colors group"
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-foreground group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          <span>{ev.name}</span>
                          <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {ev.description && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {ev.description}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* SECTION 15: SUGGESTED NEXT RESEARCH TOPICS */}
          <Card
            id="sec-next"
            className="border-emerald-800/20 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm scroll-mt-28"
          >
            <CardHeader className="pb-2 border-b border-border/40">
              <CardTitle className="text-base font-bold flex items-center gap-2 text-emerald-900 dark:text-emerald-200">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                <span>
                  15.{" "}
                  {isAr
                    ? "مواضيع بحثية مقترحة للتوسع"
                    : isHe
                      ? "15. נושאי מחקר מוצעים להעמקה"
                      : "15. Suggested Next Research Topics"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 space-y-2">
              <p className="text-xs text-muted-foreground mb-2">
                {isAr
                  ? "انقر على أي موضوع لمتابعة البحث والتحليل:"
                  : isHe
                    ? "לחץ על נושא להמשך מחקר:"
                    : "Click any topic to trigger a new executive search:"}
              </p>
              <div className="flex flex-col gap-1.5">
                {brief.nextTopics.map((topic, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      onSelectNextTopic
                        ? onSelectNextTopic(topic)
                        : navigate({
                            to: "/search",
                            search: { q: topic, qState: "ok", src: "unknown" },
                          })
                    }
                    className="justify-between h-auto py-2 px-3 text-xs font-semibold bg-card hover:bg-emerald-600 hover:text-white border-emerald-300 dark:border-emerald-800/60 transition-all text-left"
                  >
                    <span>{topic}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 ml-1" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
