import React, { useState } from "react";
import {
  Sparkles,
  BookOpen,
  Quote,
  ShieldCheck,
  Copy,
  Check,
  Share2,
  Printer,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Layers,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SearchResearchBrief } from "@/lib/search-brief.functions";

interface PerplexityAiResearchBriefProps {
  brief: SearchResearchBrief;
  onSelectTopic?: (topic: string) => void;
}

export const PerplexityAiResearchBrief: React.FC<PerplexityAiResearchBriefProps> = ({
  brief,
  onSelectTopic,
}) => {
  const [copied, setCopied] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>("overview");

  const isAr = brief.locale === "ar";
  const isHe = brief.locale === "he";

  const handleCopyReport = () => {
    const reportText = `
Executive AI Research Brief: ${brief.query}
Language: ${brief.locale.toUpperCase()}
Generated: ${new Date(brief.generatedAt).toLocaleDateString()}

• Executive Summary:
${brief.overview}

• Quranic Perspective:
${brief.quranicPerspective}

• Hadith Tradition:
${brief.hadithPerspective}

• Classical Tafsir:
${brief.tafsirInsights}

• Historical Context:
${brief.historicalContext}

Source: Bayan AI Islamic Knowledge Engine
    `.trim();

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    toast.success(
      isAr
        ? "تم نسخ التقرير البحثي"
        : isHe
          ? "דוח המחקר הועתק ללוח"
          : "Research brief copied to clipboard",
    );
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `Research Brief: ${brief.query}`,
          text: brief.overview,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopyReport();
    }
  };

  return (
    <section id="ai-research-brief" className="space-y-6 scroll-mt-24">
      {/* Perplexity Style Top Card */}
      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-6 sm:p-8 text-zinc-100 shadow-2xl relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-lg">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[11px] font-black uppercase tracking-wider">
                    {isAr
                      ? "ملخص البحث التنفيذي بالذكاء الاصطناعي"
                      : isHe
                        ? "תקציר מחקר מנהלי ב-AI"
                        : "AI Executive Research Brief"}
                  </Badge>
                  {brief.isAiGenerated && (
                    <span className="text-[10px] text-zinc-400 font-medium">
                      • {new Date(brief.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 dir-auto">
                  {brief.query}
                </h2>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyReport}
                className="bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-200 text-xs font-bold rounded-xl gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isAr ? "تم النسخ" : isHe ? "הועתק" : "Copied") : (isAr ? "نسخ" : isHe ? "העתק" : "Copy")}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-200 text-xs font-bold rounded-xl gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isAr ? "مشاركة" : isHe ? "שתף" : "Share"}</span>
              </Button>
            </div>
          </div>

          {/* Sources / References Chips Bar */}
          <div className="space-y-2">
            <span className="text-[11px] font-extrabold text-zinc-400 uppercase tracking-wider block dir-auto">
              {isAr ? "المصادر والمحطات المعتمدة:" : isHe ? "מקורות מאומתים:" : "Grounded Sources & Evidence:"}
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{brief.groundingStats.versesCount} {isAr ? "آية قرأنية" : isHe ? "פסוקים" : "Verses"}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-bold shrink-0">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{brief.groundingStats.hadithsCount} {isAr ? "أحاديث نبوية" : isHe ? "חדית'ים" : "Hadiths"}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold shrink-0">
                <Quote className="w-3.5 h-3.5" />
                <span>{brief.groundingStats.tafsirCount} {isAr ? "تفاسير معتمدة" : isHe ? "תפסירים" : "Tafsirs"}</span>
              </div>
              {brief.references.slice(0, 4).map((ref, idx) => (
                <a
                  key={idx}
                  href={ref.url}
                  className="px-3 py-1.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700/80 text-zinc-300 hover:text-white text-xs font-medium shrink-0 flex items-center gap-1 transition-colors"
                >
                  <span>[{idx + 1}] {ref.label}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-500" />
                </a>
              ))}
            </div>
          </div>

          {/* Main Executive Answer / Overview */}
          <div className="p-5 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-3">
            <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2 dir-auto">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>{isAr ? "التقرير التنفيذي المستخلص" : isHe ? "דוח מחקר מקיף" : "Synthesized Research Summary"}</span>
            </h3>
            <p className="text-sm sm:text-base text-zinc-200 leading-relaxed dir-auto">
              {brief.overview}
            </p>
          </div>

          {/* Key Perspectives Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quranic Perspective */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
              <h4 className="text-xs font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5 dir-auto">
                <span>📖</span>
                <span>{isAr ? "المنظور القرآني" : isHe ? "הזווית הקוראנית" : "Quranic Perspective"}</span>
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed dir-auto">
                {brief.quranicPerspective}
              </p>
            </div>

            {/* Hadith Perspective */}
            <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-800/40 space-y-2">
              <h4 className="text-xs font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 dir-auto">
                <span>📜</span>
                <span>{isAr ? "السنة والنبوءات" : isHe ? "מסורת החדית'" : "Prophetic Sunnah & Hadith"}</span>
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed dir-auto">
                {brief.hadithPerspective}
              </p>
            </div>

            {/* Tafsir Insights */}
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40 space-y-2">
              <h4 className="text-xs font-extrabold text-purple-400 uppercase tracking-wider flex items-center gap-1.5 dir-auto">
                <span>🔍</span>
                <span>{isAr ? "رؤى التفاسير المعتمدة" : isHe ? "תובנות התפסיר" : "Exegetical Tafsir Insights"}</span>
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed dir-auto">
                {brief.tafsirInsights}
              </p>
            </div>

            {/* Scholarly & Historical Observations */}
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-2">
              <h4 className="text-xs font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 dir-auto">
                <span>🎓</span>
                <span>{isAr ? "السياق التاريخي والملاحظات" : isHe ? "הקשר היסטורי ומחקר" : "Historical & Scholarly Context"}</span>
              </h4>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed dir-auto">
                {brief.historicalContext}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
