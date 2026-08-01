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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useServerFn } from "@tanstack/react-start";
import { generateTafsirAiAnalysisFn } from "@/lib/tafsir-api.functions";
import { ShareCardModal } from "@/components/ShareCardModal";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

type AiMode =
  "summary" | "difficult_arabic" | "compare_scholars" | "highlight_differences" | "grammar";

interface TafsirAiAssistantProps {
  surah: number;
  ayah: number;
  surahName?: string;
  arabicText?: string;
  translationText?: string;
  locale: "he" | "ar" | "en";
}

export function TafsirAiAssistant({
  surah,
  ayah,
  surahName = "Surah",
  arabicText,
  translationText,
  locale,
}: TafsirAiAssistantProps) {
  const [activeMode, setActiveMode] = useState<AiMode>("summary");
  const [loading, setLoading] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [sourcesCited, setSourcesCited] = useState<string[]>([]);
  const [shareOpen, setShareOpen] = useState(false);

  const generateFn = useServerFn(generateTafsirAiAnalysisFn);
  const isRtl = locale !== "en";

  const handleRunAi = async (mode: AiMode) => {
    setActiveMode(mode);
    setLoading(true);
    try {
      const res = await generateFn({
        data: {
          surah,
          ayah,
          arabicText,
          translationText,
          mode,
          lang: locale,
        },
      });
      setResultText(res.text);
      setSourcesCited(res.sourcesCited || []);
    } catch {
      toast.error(
        locale === "ar"
          ? "حدث خطأ أثناء إعداد التحليل المعتمد"
          : locale === "he"
            ? "אירעה שגיאה בטעינת הניתוח"
            : "Failed to generate AI scholarly analysis",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
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
                  ? "المساعد العلمي الذكي للتفسير"
                  : locale === "he"
                    ? "ע עוזר התפסיר החכם"
                    : "AI Scholarly Tafsir Engine"}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30">
                Cited Sources Only
              </span>
            </h3>
            <p className="text-xs text-muted-foreground">
              {locale === "ar"
                ? "تحليل أكاديمي موثق ومستند إلى أمهات كتب التفسير فقط"
                : locale === "he"
                  ? "ניתוח אקדמי מבוסס מקורות מוסמכים ללא פירוש עצמאי"
                  : "Strict grounded analysis with zero invented interpretations and verified citations."}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {resultText && (
          <div className="flex items-center gap-1.5">
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShareOpen(true)}
              className="rounded-xl gap-1.5 text-xs text-primary border-primary/30"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>{locale === "ar" ? "مشاركة" : "Share"}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        <button
          type="button"
          onClick={() => handleRunAi("summary")}
          disabled={loading}
          className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
            activeMode === "summary"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card text-muted-foreground border-border/70 hover:bg-secondary hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>{locale === "ar" ? "تلاخيص وجيزة" : locale === "he" ? "תקציר" : "Summary"}</span>
        </button>

        <button
          type="button"
          onClick={() => handleRunAi("difficult_arabic")}
          disabled={loading}
          className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
            activeMode === "difficult_arabic"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card text-muted-foreground border-border/70 hover:bg-secondary hover:text-foreground"
          }`}
        >
          <FileSearch className="h-4 w-4" />
          <span>
            {locale === "ar" ? "غريب القرآن" : locale === "he" ? "מילים קשות" : "Difficult Words"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleRunAi("compare_scholars")}
          disabled={loading}
          className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
            activeMode === "compare_scholars"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card text-muted-foreground border-border/70 hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>
            {locale === "ar"
              ? "مقارنة العلماء"
              : locale === "he"
                ? "השוואת חכמים"
                : "Compare Scholars"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleRunAi("highlight_differences")}
          disabled={loading}
          className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
            activeMode === "highlight_differences"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card text-muted-foreground border-border/70 hover:bg-secondary hover:text-foreground"
          }`}
        >
          <GitCompare className="h-4 w-4" />
          <span>
            {locale === "ar" ? "الفروق الدقيقة" : locale === "he" ? "הבדלי גישות" : "Differences"}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleRunAi("grammar")}
          disabled={loading}
          className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold border transition-all ${
            activeMode === "grammar"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card text-muted-foreground border-border/70 hover:bg-secondary hover:text-foreground"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>
            {locale === "ar" ? "إعراب الآية" : locale === "he" ? "דקדוק ואעראב" : "Grammar (I'rab)"}
          </span>
        </button>
      </div>

      {/* Output Panel */}
      <div className="relative rounded-2xl border border-border/80 bg-card p-5 min-h-[160px] shadow-inner space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3 text-muted-foreground">
            <RefreshCw className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm font-medium">
              {locale === "ar"
                ? "جاري استخراج التحليل المعتمد وتدقيق المصادر..."
                : locale === "he"
                  ? "טוען ניתוח אקדמי ומאמת מקורות..."
                  : "Generating cited scholarly analysis..."}
            </p>
          </div>
        ) : resultText ? (
          <div className="space-y-4">
            <div className="markdown-body text-sm leading-relaxed text-foreground/90">
              <ReactMarkdown>{resultText}</ReactMarkdown>
            </div>

            {/* Citations Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                <span>
                  {locale === "ar"
                    ? "المصادر المعتمدة المقتبس منها:"
                    : locale === "he"
                      ? "מקורות מצוטטים:"
                      : "Verified Sources Cited:"}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(sourcesCited.length > 0
                  ? sourcesCited
                  : ["Tafsir Ibn Kathir", "Tafsir Al-Jalalayn", "Tafsir Al-Sa'di"]
                ).map((src) => (
                  <span
                    key={src}
                    className="px-2 py-0.5 rounded-md bg-secondary text-[11px] font-mono text-muted-foreground border border-border/50"
                  >
                    {src}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 text-muted-foreground">
            <BookOpen className="h-8 w-8 text-primary/60" />
            <div className="max-w-md space-y-1">
              <h4 className="font-semibold text-foreground text-sm">
                {locale === "ar"
                  ? "اختر نوع التحليل المطلوب أعلى الكارت"
                  : locale === "he"
                    ? "בחר סוג ניתוח מלמעלה"
                    : "Select an analysis mode above to trigger grounded scholarly engine"}
              </h4>
              <p className="text-xs">
                {locale === "ar"
                  ? "يمكنك توليد تلاخيص موجزة، إعراب، مقارنة بين ابن كثير والسعدي والقرطبي، وشرح غريب الألفاظ."
                  : locale === "he"
                    ? "ניתן ליצור תקצירים, ניתוח דקדוקי, השוואה בין חכמים וביאור מילים מורכבות בקוראן."
                    : "Generate concise summaries, grammatical parsing, scholar comparative matrix, and difficult Arabic breakdown."}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => handleRunAi("summary")}
              className="mt-2 rounded-full gap-2 text-xs font-semibold px-5"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{locale === "ar" ? "توليد ملخص معتمد" : "Generate Concise Summary"}</span>
            </Button>
          </div>
        )}
      </div>

      <ShareCardModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={`Verse ${surah}:${ayah} AI Scholarly Analysis`}
        arabicText={arabicText}
        translationText={resultText || ""}
        reference={`${surahName} ${surah}:${ayah}`}
        type="verse"
      />
    </div>
  );
}
