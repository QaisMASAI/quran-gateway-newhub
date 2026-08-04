import React from "react";
import { Sparkles, ArrowUpRight, Compass, GraduationCap, BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SearchResearchBrief } from "@/lib/search-brief.functions";

interface PerplexitySuggestedResearchProps {
  brief: SearchResearchBrief;
  onSelectTopic?: (topic: string) => void;
}

export const PerplexitySuggestedResearch: React.FC<PerplexitySuggestedResearchProps> = ({
  brief,
  onSelectTopic,
}) => {
  const isAr = brief.locale === "ar";
  const isHe = brief.locale === "he";

  const nextTopics = brief.nextTopics || [];

  const researchPrompts = nextTopics.map((topic, idx) => ({
    query: topic,
    titleEn: `Deep-Dive Analysis: ${topic}`,
    titleAr: `تحقيق عميق: ${topic}`,
    titleHe: `מחקר מעמיק: ${topic}`,
    levelEn: idx % 2 === 0 ? "Scholarly Inquiry" : "Foundational Overview",
    levelAr: idx % 2 === 0 ? "بحث تحليلي موسع" : "مدخل معرفي شامل",
    levelHe: idx % 2 === 0 ? "מחקר אקדמי" : "מבוא מקיף",
    estTime: `${3 + idx * 2} min read`,
  }));

  return (
    <section id="suggested-research" className="space-y-4 scroll-mt-24">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <GraduationCap className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold text-white dir-auto">
              {isAr ? "مسارات البحث العلمي المقترحة" : isHe ? "כיווני מחקר מוצעים" : "Suggested Research & Deep-Dive Pathways"}
            </h3>
            <p className="text-xs text-zinc-400 dir-auto">
              {isAr
                ? "توصيات منهجية للتعمق في الأبعاد الفقهية، التاريخية، والتفسيرية"
                : isHe
                  ? "המלצות מתודולוגיות להעמקה בתחומי הפרשנות, ההלכה וההיסטוריה"
                  : "Curated research directions to deepen comprehension across specialized domains"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {researchPrompts.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 text-[10px] font-bold">
                  {isAr ? item.levelAr : isHe ? item.levelHe : item.levelEn}
                </Badge>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-zinc-500" />
                  <span>{item.estTime}</span>
                </span>
              </div>

              <h4 className="text-base font-extrabold text-white group-hover:text-amber-300 transition-colors dir-auto">
                {isAr ? item.titleAr : isHe ? item.titleHe : item.titleEn}
              </h4>
            </div>

            <Button
              onClick={() => onSelectTopic?.(item.query)}
              className="w-full bg-zinc-800 hover:bg-amber-600 text-zinc-200 hover:text-white text-xs font-bold py-2 rounded-xl flex items-center justify-between gap-2 transition-all"
            >
              <span>{isAr ? "ابدأ هذا البحث الآن" : isHe ? "התחל מחקר זה" : "Launch Research Path"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
};
