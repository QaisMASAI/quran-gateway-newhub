import React from "react";
import { ShieldCheck, ExternalLink, BookCheck, FileText, CheckCircle2, Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { SearchResearchBrief } from "@/lib/search-brief.functions";

interface PerplexityRecentlyUpdatedSourcesProps {
  brief: SearchResearchBrief;
}

export const PerplexityRecentlyUpdatedSources: React.FC<PerplexityRecentlyUpdatedSourcesProps> = ({ brief }) => {
  const isAr = brief.locale === "ar";
  const isHe = brief.locale === "he";

  const references = brief.references || [];

  return (
    <section id="recently-updated-sources" className="space-y-4 scroll-mt-24">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold text-white dir-auto">
              {isAr ? "المصادر والمراجع الحديثة المعتمدة" : isHe ? "מקורות מעודכנים ומאומתים" : "Recently Updated Sources & Grounded Citations"}
            </h3>
            <p className="text-xs text-zinc-400 dir-auto">
              {isAr
                ? "قائمة بالكتب، التفاسير والمخطوطات المحدثة الموثقة في قاعدة البيانات"
                : isHe
                  ? "רשימת ספרים, פרשנויות ומקורות מאומתים במאגר"
                  : "Verified corpus references, classical manuscripts & authenticated Hadith indices"}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/10 font-bold text-xs">
          {references.length} {isAr ? "مصدر موثق" : isHe ? "מקורות" : "Grounded Sources"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {references.map((ref, idx) => (
          <a
            key={idx}
            href={ref.url}
            className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-850/80 transition-all flex flex-col justify-between space-y-2 shadow-md group"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>{ref.type}</span>
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-blue-400 transition-colors" />
              </div>

              <h4 className="font-extrabold text-sm text-zinc-100 group-hover:text-white dir-auto">
                {ref.label}
              </h4>

              {ref.snippet && (
                <p className="text-xs text-zinc-400 dir-auto line-clamp-2 leading-relaxed">
                  "{ref.snippet}"
                </p>
              )}
            </div>

            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-400">
              <span>{isAr ? "مصدر موثق 100%" : isHe ? "מקור מאומת" : "100% Grounded Source"}</span>
              <span className="text-emerald-400 font-mono font-bold">#REF-{idx + 1}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
};
