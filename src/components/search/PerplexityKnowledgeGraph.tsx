import React from "react";
import { Network, Sparkles, Layers } from "lucide-react";
import { PageKnowledgeHub } from "@/components/knowledge/PageKnowledgeHub";
import type { SearchResearchBrief } from "@/lib/search-brief.functions";

interface PerplexityKnowledgeGraphProps {
  brief: SearchResearchBrief;
}

export const PerplexityKnowledgeGraph: React.FC<PerplexityKnowledgeGraphProps> = ({ brief }) => {
  const isAr = brief.locale === "ar";
  const isHe = brief.locale === "he";

  return (
    <section id="knowledge-graph" className="space-y-4 scroll-mt-24">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Network className="w-5 h-5 animate-pulse" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold text-white dir-auto">
              {isAr ? "الرسم البياني وشبكة المعرفة الـ 10 أبعاد" : isHe ? "תרשים הידע ה-10 ממדי" : "10-Dimensional Knowledge Network Graph"}
            </h3>
            <p className="text-xs text-zinc-400 dir-auto">
              {isAr
                ? "خريطة تفاعلية ديناميكية تربط موضوع البحث بجميع العلوم الإسلامية والأبعاد العشرة"
                : isHe
                  ? "מפה אינטראקטיבית המקשרת את נושא המחקר לכל 10 הממדים בתורת האסלאם"
                  : "Interactive visual orbit linking your query across Quran, Hadith, Tafsir, Prophets, Scholars & Topics"}
            </p>
          </div>
        </div>
      </div>

      <PageKnowledgeHub
        slug={brief.query}
        locale={brief.locale}
        title={
          isAr
            ? `شبكة الترابط المعرفي لموضوع: ${brief.query}`
            : isHe
              ? `רשת קשרים תורנית עבור: ${brief.query}`
              : `Knowledge Interconnection Matrix for: ${brief.query}`
        }
      />
    </section>
  );
};
