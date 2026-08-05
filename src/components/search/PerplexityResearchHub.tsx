import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Compass,
  History,
  Network,
  Layers,
  GraduationCap,
  HelpCircle,
  Brain,
  ShieldCheck,
  Search,
  ArrowUp,
} from "lucide-react";
import type { SearchResearchBrief } from "@/lib/search-brief.functions";
import type { UnifiedSearchResponse } from "@/lib/search-unified";
import { PerplexityAiResearchBrief } from "./PerplexityAiResearchBrief";
import { PerplexityKnowledgeOverview } from "./PerplexityKnowledgeOverview";
import { PerplexityTimeline } from "./PerplexityTimeline";
import { PerplexityKnowledgeGraph } from "./PerplexityKnowledgeGraph";
import { CategorizedSearchResults } from "./CategorizedSearchResults";
import { PerplexityRelatedTopics } from "./PerplexityRelatedTopics";
import { PerplexitySuggestedResearch } from "./PerplexitySuggestedResearch";
import { PerplexityRelatedQuestions } from "./PerplexityRelatedQuestions";
import { PerplexityLearningRecommendations } from "./PerplexityLearningRecommendations";
import { PerplexityRecentlyUpdatedSources } from "./PerplexityRecentlyUpdatedSources";

interface PerplexityResearchHubProps {
  brief: SearchResearchBrief;
  searchResults: UnifiedSearchResponse;
  onSelectTopic?: (topic: string) => void;
}

export const PerplexityResearchHub: React.FC<PerplexityResearchHubProps> = ({
  brief,
  searchResults,
  onSelectTopic,
}) => {
  const [activeSection, setActiveSection] = useState<string>("ai-research-brief");
  const [showScrollTop, setShowScrollTop] = useState(false);

  const isAr = brief.locale === "ar";
  const isHe = brief.locale === "he";

  const sectionNavItems = [
    {
      id: "ai-research-brief",
      labelEn: "1. AI Brief",
      labelAr: "1. الملخص",
      labelHe: "1. תקציר AI",
      icon: <Sparkles className="w-3.5 h-3.5" />,
    },
    {
      id: "knowledge-overview",
      labelEn: "2. Overview",
      labelAr: "2. البطاقات",
      labelHe: "2. כרטיסים",
      icon: <Compass className="w-3.5 h-3.5" />,
    },
    {
      id: "timeline",
      labelEn: "3. Timeline",
      labelAr: "3. التسلسل",
      labelHe: "3. ציר זמן",
      icon: <History className="w-3.5 h-3.5" />,
    },
    {
      id: "knowledge-graph",
      labelEn: "4. Knowledge Graph",
      labelAr: "4. الرسم البياني",
      labelHe: "4. תרשים",
      icon: <Network className="w-3.5 h-3.5" />,
    },
    {
      id: "categorized-results",
      labelEn: "5. Results",
      labelAr: "5. النتائج",
      labelHe: "5. תוצאות",
      icon: <Search className="w-3.5 h-3.5" />,
    },
    {
      id: "related-topics",
      labelEn: "6. Topics",
      labelAr: "6. الموضوعات",
      labelHe: "6. נושאים",
      icon: <Layers className="w-3.5 h-3.5" />,
    },
    {
      id: "suggested-research",
      labelEn: "7. Research",
      labelAr: "7. المسارات",
      labelHe: "7. מחקר",
      icon: <GraduationCap className="w-3.5 h-3.5" />,
    },
    {
      id: "related-questions",
      labelEn: "8. Questions",
      labelAr: "8. الأسئلة",
      labelHe: "8. שאלות",
      icon: <HelpCircle className="w-3.5 h-3.5" />,
    },
    {
      id: "learning-recommendations",
      labelEn: "9. Learning",
      labelAr: "9. التوصيات",
      labelHe: "9. למידה",
      icon: <Brain className="w-3.5 h-3.5" />,
    },
    {
      id: "recently-updated-sources",
      labelEn: "10. Sources",
      labelAr: "10. المصادر",
      labelHe: "10. מקורות",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-10 relative">
      {/* Sticky Table of Contents Jump Bar */}
      <div className="sticky top-16 z-30 bg-zinc-950/90 backdrop-blur-xl border border-zinc-800/80 p-2 rounded-2xl shadow-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none my-4">
        {sectionNavItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                isActive
                  ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-black shadow-md shadow-emerald-500/20 scale-105"
                  : "bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              <span>{item.icon}</span>
              <span>{isAr ? item.labelAr : isHe ? item.labelHe : item.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* 1. AI RESEARCH BRIEF */}
      <PerplexityAiResearchBrief brief={brief} onSelectTopic={onSelectTopic} />

      {/* 2. KNOWLEDGE OVERVIEW CARDS */}
      <PerplexityKnowledgeOverview brief={brief} onSelectTopic={onSelectTopic} />

      {/* 3. TIMELINE */}
      <PerplexityTimeline brief={brief} />

      {/* 4. KNOWLEDGE GRAPH */}
      <PerplexityKnowledgeGraph brief={brief} />

      {/* 5. CATEGORIZED RESULTS */}
      <div id="categorized-results" className="scroll-mt-24 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Search className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold text-white dir-auto">
              {isAr
                ? "نتائج البحث المصنفة والمؤكدة"
                : isHe
                  ? "תוצאות חיפוש ממוינות ומאומתות"
                  : "Categorized & Verified Database Records"}
            </h3>
            <p className="text-xs text-zinc-400 dir-auto">
              {isAr
                ? "سجلات معتمدة مقسمة حسب القرآن، التفسير، الأنبياء والموضوعات"
                : isHe
                  ? "תוצאות מאומתות לפי קוראן, תפסיר ונביאים"
                  : "Ranked evidence items across Quranic Verses, Sahih Traditions, Classical Exegesis & Topics"}
            </p>
          </div>
        </div>
        <CategorizedSearchResults searchResults={searchResults} locale={brief.locale} />
      </div>

      {/* 6. RELATED TOPICS */}
      <PerplexityRelatedTopics brief={brief} onSelectTopic={onSelectTopic} />

      {/* 7. SUGGESTED RESEARCH */}
      <PerplexitySuggestedResearch brief={brief} onSelectTopic={onSelectTopic} />

      {/* 8. RELATED QUESTIONS */}
      <PerplexityRelatedQuestions brief={brief} onSelectTopic={onSelectTopic} />

      {/* 9. LEARNING RECOMMENDATIONS */}
      <PerplexityLearningRecommendations brief={brief} />

      {/* 10. RECENTLY UPDATED SOURCES */}
      <PerplexityRecentlyUpdatedSources brief={brief} />

      {/* Scroll To Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl z-40 transition-all hover:scale-110"
          title="Scroll to Top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
