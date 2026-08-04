import React from "react";
import { Layers, Sparkles, ArrowRight, Tag, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SearchResearchBrief } from "@/lib/search-brief.functions";

interface PerplexityRelatedTopicsProps {
  brief: SearchResearchBrief;
  onSelectTopic?: (topic: string) => void;
}

export const PerplexityRelatedTopics: React.FC<PerplexityRelatedTopicsProps> = ({
  brief,
  onSelectTopic,
}) => {
  const isAr = brief.locale === "ar";
  const isHe = brief.locale === "he";

  const mainThemes = brief.mainThemes || [];
  const relatedConcepts = brief.relatedConcepts || [];
  const allTopics = Array.from(new Set([...mainThemes, ...relatedConcepts]));

  return (
    <section id="related-topics" className="space-y-4 scroll-mt-24">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Layers className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold text-white dir-auto">
              {isAr ? "الموضوعات والمفاهيم ذات الصلة" : isHe ? "נושאים ומושגים קשורים" : "Related Topics & Conceptual Branches"}
            </h3>
            <p className="text-xs text-zinc-400 dir-auto">
              {isAr
                ? "انقر على أي موضوع لاستكشاف تقريره البحثي المباشر ورسمه المعرفي"
                : isHe
                  ? "לחץ על כל נושא כדי להפיל מחקר מנהלי נוסף"
                  : "Explore tangential themes, theological branches, and ethical foundations"}
            </p>
          </div>
        </div>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {allTopics.map((topic, idx) => (
          <button
            key={idx}
            onClick={() => onSelectTopic?.(topic)}
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-cyan-500/60 hover:bg-zinc-850/90 transition-all text-left flex items-center justify-between group shadow-md"
          >
            <div className="flex items-center gap-3">
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 font-bold text-xs">
                #{idx + 1}
              </span>
              <div>
                <span className="font-extrabold text-sm text-zinc-100 group-hover:text-cyan-300 transition-colors block dir-auto">
                  {topic}
                </span>
                <span className="text-[10px] text-zinc-400 block dir-auto">
                  {isAr ? "انقر لبدء البحث الفوري" : isHe ? "לחץ למחקר מיידי" : "Click to launch research"}
                </span>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
          </button>
        ))}
      </div>
    </section>
  );
};
