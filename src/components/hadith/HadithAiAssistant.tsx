import { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Scale,
  GitCompare,
  FileSearch,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
  Share2,
  Copy,
  Layers,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { generateHadithStudySummary } from "@/lib/hadith.functions";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type HadithAiMode = "summary" | "lessons" | "isnad" | "cross_ref" | "difficult_arabic";

interface HadithAiAssistantProps {
  collectionLabel: string;
  hadithNumber: number;
  narrator?: string | null;
  arabicText: string;
  englishText?: string | null;
  hebrewText?: string | null;
  verseRefs?: string[];
  tafsirSnippets?: string[];
  citations?: string[];
  locale: "he" | "ar" | "en";
}

export function HadithAiAssistant({
  collectionLabel,
  hadithNumber,
  narrator,
  arabicText,
  englishText,
  hebrewText,
  verseRefs = [],
  tafsirSnippets = [],
  citations = [],
  locale,
}: HadithAiAssistantProps) {
  const [activeMode, setActiveMode] = useState<HadithAiMode>("summary");
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<{
    explanation?: string;
    historical_context?: string;
    why_narrated?: string;
    main_lessons?: string;
    citations?: string[];
  } | null>(null);

  const generateFn = useServerFn(generateHadithStudySummary);
  const isRtl = locale !== "en";

  const handleRunAi = async (mode: HadithAiMode) => {
    setActiveMode(mode);
    setLoading(true);
    try {
      const res = await generateFn({
        data: {
          collectionLabel,
          hadithNumber,
          narrator,
          arabicText,
          translationText: locale === "he" ? hebrewText || englishText : englishText,
          verseRefs,
          tafsirSnippets,
          citations,
          lang: locale,
        },
      });
      if (res) {
        setSummaryData(res);
      } else {
        toast.error(
          locale === "ar"
            ? "تعذر تحميل التحليل الذكي للحديث"
            : locale === "he"
              ? "לא ניתן לטעון ניתוח חכם לחדית'"
              : "Could not load AI scholarly analysis for this Hadith"
        );
      }
    } catch {
      toast.error(
        locale === "ar"
          ? "حدث خطأ أثناء إجراء التحليل الفقهي المعتمد"
          : locale === "he"
            ? "אירעה שגיאה בעיבוד הניתוח המוסמך"
            : "Failed to generate AI scholarly Hadith analysis"
      );
    } finally {
      setLoading(false);
    }
  };

  const currentDisplayContent = () => {
    if (!summaryData) return null;
    switch (activeMode) {
      case "summary":
        return summaryData.explanation || summaryData.historical_context;
      case "lessons":
        return summaryData.main_lessons;
      case "isnad":
        return summaryData.why_narrated || summaryData.historical_context;
      case "cross_ref":
        return (
          summaryData.explanation +
          "\n\n**Cited Quranic Evidence:**\n" +
          (summaryData.citations?.join("\n- ") || "Authentic Canonical Text")
        );
      case "difficult_arabic":
        return summaryData.explanation;
      default:
        return summaryData.explanation;
    }
  };

  const handleCopy = () => {
    const text = currentDisplayContent();
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success(locale === "ar" ? "تم نسخ التحليل" : "Analysis copied to clipboard");
  };

  return (
    <div
      className="rounded-3xl border border-primary/20 bg-gradient-to-b from-card to-secondary/30 p-5 md:p-6 shadow-xl space-y-5"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground flex items-center gap-2">
              <span>
                {locale === "ar"
                  ? "المساعد العلمي الذكي للحديث"
                  : locale === "he"
                    ? "עוזר החדית' החכם והמואמת"
                    : "AI Scholarly Hadith Engine"}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30">
                Canonical Evidence Only
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {locale === "ar"
                ? "شرح وتحليل فقهي مستند حصراً لكتب الحديث المعتمدة"
                : locale === "he"
                  ? "ניתוח הלכתי מבוסס מקורות חדית' מוסמכים בלבד"
                  : "Strict grounded analysis with zero invented interpretations and verified isnad citations."}
            </p>
          </div>
        </div>

        {summaryData && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="rounded-xl gap-1.5 text-xs"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>{locale === "ar" ? "نسخ" : "Copy"}</span>
          </Button>
        )}
      </div>

      {/* Mode Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        <button
          type="button"
          onClick={() => handleRunAi("summary")}
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
            activeMode === "summary"
              ? "border-primary bg-primary text-primary-foreground shadow-md"
              : "border-border/80 bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>{locale === "ar" ? "الشرح المعنائي" : locale === "he" ? "הסבר מילולי" : "Textual Analysis"}</span>
        </button>

        <button
          type="button"
          onClick={() => handleRunAi("lessons")}
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
            activeMode === "lessons"
              ? "border-primary bg-primary text-primary-foreground shadow-md"
              : "border-border/80 bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>{locale === "ar" ? "الفوائد الفقهية" : locale === "he" ? "לקחים הלכתיים" : "Juristic Rulings"}</span>
        </button>

        <button
          type="button"
          onClick={() => handleRunAi("isnad")}
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
            activeMode === "isnad"
              ? "border-primary bg-primary text-primary-foreground shadow-md"
              : "border-border/80 bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>{locale === "ar" ? "سياق الرواية" : locale === "he" ? "הקשר המסורת" : "Isnad Context"}</span>
        </button>

        <button
          type="button"
          onClick={() => handleRunAi("cross_ref")}
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
            activeMode === "cross_ref"
              ? "border-primary bg-primary text-primary-foreground shadow-md"
              : "border-border/80 bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <GitCompare className="h-4 w-4" />
          <span>{locale === "ar" ? "الربط بالقرآن" : locale === "he" ? "הצלבה עם הקוראן" : "Quran Cross-Ref"}</span>
        </button>

        <button
          type="button"
          onClick={() => handleRunAi("difficult_arabic")}
          className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl border text-xs font-semibold transition-all ${
            activeMode === "difficult_arabic"
              ? "border-primary bg-primary text-primary-foreground shadow-md"
              : "border-border/80 bg-card hover:border-primary/40 text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileSearch className="h-4 w-4" />
          <span>{locale === "ar" ? "غريب الحديث" : locale === "he" ? "מילים קשות" : "Vocabulary"}</span>
        </button>
      </div>

      {/* Main Output Box */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-inner min-h-[160px] flex flex-col justify-between space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3 text-muted-foreground">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="text-xs font-medium">
              {locale === "ar"
                ? "جاري إعداد واستخلاص التحليل الفقهي المعتمد…"
                : locale === "he"
                  ? "מעבד ניתוח מוסמך מכתבי החדית'…"
                  : "Synthesizing authentic juristic commentary…"}
            </span>
          </div>
        ) : summaryData ? (
          <div className="space-y-4">
            <div className="prose dark:prose-invert max-w-none text-sm text-foreground/90 leading-relaxed font-reading-ar">
              <ReactMarkdown>{currentDisplayContent() || "No detailed commentary available for this view."}</ReactMarkdown>
            </div>

            {/* Citations Footer */}
            {summaryData.citations && summaryData.citations.length > 0 && (
              <div className="border-t border-border/60 pt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="font-semibold text-foreground">
                  {locale === "ar" ? "المصادر المعتمدة:" : locale === "he" ? "מקורות מוסמכים:" : "Grounded Sources:"}
                </span>
                {summaryData.citations.map((c, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-mono text-muted-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground space-y-3">
            <Layers className="h-8 w-8 text-primary/40" />
            <p className="text-xs max-w-md">
              {locale === "ar"
                ? "اختر نوع التحليل المطلوب أعلاه لتشغيل المحرك العلمي للحديث"
                : locale === "he"
                  ? "בחר את סוג הניתוח המבוקש למעלה להפעלת מנוע החדית' החכם"
                  : "Select an analytical mode above to trigger the AI Scholarly Hadith Engine."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleRunAi("summary")}
              className="rounded-xl gap-2 text-xs font-bold"
            >
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>{locale === "ar" ? "تشغيل الشرح الفقهي" : locale === "he" ? "הפעל ניתוח לימודי" : "Generate Explanation"}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
