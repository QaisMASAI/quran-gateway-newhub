import React, { useState } from "react";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Brain,
  Network,
  History,
  Star,
  BookCopy,
  Link as LinkIcon,
  Target,
  Info,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RankingFactors } from "@/lib/search-unified";

interface SearchResultRankingDetailsProps {
  relevanceScore: number;
  rankingExplanation?: string;
  rankingFactors?: RankingFactors;
  locale: "ar" | "en" | "he";
  compact?: boolean;
}

export const SearchResultRankingDetails: React.FC<SearchResultRankingDetailsProps> = ({
  relevanceScore,
  rankingExplanation,
  rankingFactors,
  locale,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isAr = locale === "ar";
  const isHe = locale === "he";

  const getScoreColor = (score: number) => {
    if (score >= 88)
      return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/70 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800";
    if (score >= 75)
      return "bg-amber-100 text-amber-900 dark:bg-amber-950/70 dark:text-amber-200 border-amber-300 dark:border-amber-800";
    return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700";
  };

  const factorIcons: Array<{
    key: keyof RankingFactors;
    labelAr: string;
    labelHe: string;
    labelEn: string;
    icon: React.ReactNode;
  }> = [
    {
      key: "semanticSimilarity",
      labelAr: "التطابق الدلالي",
      labelHe: "דמיון סמנטי",
      labelEn: "Semantic Similarity",
      icon: <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />,
    },
    {
      key: "knowledgeGraph",
      labelAr: "رسم البياني المعرفي",
      labelHe: "גרף ידע",
      labelEn: "Knowledge Graph",
      icon: <Network className="w-3 h-3 text-blue-600 dark:text-blue-400" />,
    },
    {
      key: "historicalRelevance",
      labelAr: "الأهمية التاريخية",
      labelHe: "זיקה היסטורית",
      labelEn: "Historical Context",
      icon: <History className="w-3 h-3 text-amber-600 dark:text-amber-400" />,
    },
    {
      key: "topicImportance",
      labelAr: "أهمية الموضوع",
      labelHe: "חשיבות נושאית",
      labelEn: "Topic Importance",
      icon: <Star className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />,
    },
    {
      key: "sourceFrequency",
      labelAr: "التكرار بالمصادر",
      labelHe: "תדירות במקורות",
      labelEn: "Source Frequency",
      icon: <BookCopy className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      key: "crossReferences",
      labelAr: "الإحالات المتقاطعة",
      labelHe: "הפניות צולבות",
      labelEn: "Cross-References",
      icon: <LinkIcon className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />,
    },
    {
      key: "userIntent",
      labelAr: "تطابق هدف المستخدم",
      labelHe: "כוונת המשתמש",
      labelEn: "User Intent Match",
      icon: <Target className="w-3 h-3 text-rose-600 dark:text-rose-400" />,
    },
  ];

  return (
    <div className="mt-2.5 pt-2 border-t border-border/40 text-xs space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={`font-semibold px-2 py-0.5 text-[11px] flex items-center gap-1 border ${getScoreColor(
              relevanceScore,
            )}`}
          >
            <Sparkles className="w-3 h-3 text-amber-500 inline-block" />
            <span>
              {relevanceScore}% {isAr ? "ملاءمة" : isHe ? "ציון רלוונטיות" : "Relevance Score"}
            </span>
          </Badge>

          {rankingExplanation && !compact && (
            <span className="text-[11px] text-muted-foreground line-clamp-1 italic">{rankingExplanation}</span>
          )}
        </div>

        {rankingFactors && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="h-6 px-1.5 text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Info className="w-3 h-3 text-primary" />
            <span>
              {isAr ? "سبب الترتيب (7 عوامل)" : isHe ? "סיבת הדירוג (7 מדדים)" : "Ranking Rationale (7 Factors)"}
            </span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        )}
      </div>

      {/* EXPANDABLE 7-FACTOR BREAKDOWN */}
      {expanded && rankingFactors && (
        <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2 text-xs animate-in fade-in-50 duration-150">
          {rankingExplanation && (
            <p className="text-xs font-medium text-foreground/90 bg-background/80 p-2 rounded border border-border/40 leading-relaxed">
              💡 <strong>{isAr ? "سبب التصنيف:" : isHe ? "סיבת הדירוג:" : "Ranking Rationale:"}</strong>{" "}
              {rankingExplanation}
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            {factorIcons.map((factor) => {
              const scoreVal = rankingFactors[factor.key] ?? 70;
              const label = isAr ? factor.labelAr : isHe ? factor.labelHe : factor.labelEn;

              return (
                <div key={factor.key} className="p-1.5 rounded bg-card border border-border/40 flex flex-col gap-1">
                  <div className="flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                    <span className="flex items-center gap-1 truncate">
                      {factor.icon}
                      <span className="truncate">{label}</span>
                    </span>
                    <span className="font-bold text-foreground">{scoreVal}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                    <div
                      className="bg-primary h-1 rounded-full transition-all duration-300"
                      style={{ width: `${scoreVal}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
