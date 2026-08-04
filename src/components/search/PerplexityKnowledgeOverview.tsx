import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Compass,
  BookMarked,
  Sparkles,
  MapPin,
  Calendar,
  GraduationCap,
  Lightbulb,
  ChevronRight,
  ArrowUpRight,
  Layers,
  BookOpen,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SearchResearchBrief } from "@/lib/search-brief.functions";

interface PerplexityKnowledgeOverviewProps {
  brief: SearchResearchBrief;
  onSelectTopic?: (topic: string) => void;
}

export const PerplexityKnowledgeOverview: React.FC<PerplexityKnowledgeOverviewProps> = ({
  brief,
  onSelectTopic,
}) => {
  const isAr = brief.locale === "ar";
  const isHe = brief.locale === "he";

  return (
    <section id="knowledge-overview" className="space-y-6 scroll-mt-24">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Compass className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold text-white dir-auto">
              {isAr ? "بطاقات الملخص المعرفي" : isHe ? "כרטיסי סקירת ידע" : "Knowledge Overview Cards"}
            </h3>
            <p className="text-xs text-zinc-400 dir-auto">
              {isAr
                ? "مفاهيم أساسية، شخصيات تاريخية، مفردات مركزية ودروس عملية مستفادة"
                : isHe
                  ? "מושגי יסוד, אישיויות היסטוריות, אוצר מילים ולקחים מעשיים"
                  : "Core concepts, historical figures, essential vocabulary & practical takeaways"}
            </p>
          </div>
        </div>

        <Badge variant="outline" className="border-amber-500/30 text-amber-400 bg-amber-500/10 font-bold text-xs">
          {brief.importantTerminology.length + brief.relatedProphets.length + brief.relatedEvents.length} {isAr ? "بطاقات معالجة" : isHe ? "כרטיסים" : "Cards"}
        </Badge>
      </div>

      {/* Grid of Knowledge Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Essential Terminology Card */}
        {brief.importantTerminology.map((term, idx) => (
          <div
            key={`term-${idx}`}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase">
                  {isAr ? "مصطلح محوري" : isHe ? "מונח מפתח" : "Essential Term"}
                </span>
                <BookMarked className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
              </div>
              <h4 className="text-lg font-extrabold text-white dir-auto">
                {term.term}
              </h4>
              {term.transliteration && (
                <p className="text-xs font-mono text-emerald-300 dir-auto">
                  {term.transliteration}
                </p>
              )}
              <p className="text-xs text-zinc-300 leading-relaxed dir-auto">
                {term.meaning}
              </p>
              {term.context && (
                <p className="text-[11px] text-zinc-400 italic dir-auto border-t border-zinc-800/80 pt-2 mt-2">
                  "{term.context}"
                </p>
              )}
            </div>
          </div>
        ))}

        {/* 2. Related Prophets & Figures Cards */}
        {brief.relatedProphets.map((prophet, idx) => (
          <div
            key={`prophet-${idx}`}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase flex items-center gap-1">
                  <span>🌱</span>
                  <span>{isAr ? "نبي / رسول" : isHe ? "נביא ושליח" : "Prophet & Messenger"}</span>
                </span>
                <GraduationCap className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
              </div>
              <h4 className="text-lg font-extrabold text-white dir-auto">
                {prophet.name}
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed dir-auto line-clamp-3">
                {prophet.description || (isAr ? "شخصية مباركة مذكورة في القرآن والسيرة" : "Blessed prophetic figure mentioned in Quran & Seerah")}
              </p>
            </div>

            {prophet.slug && (
              <Link
                to="/learn/$kind/$slug"
                params={{ kind: "prophet", slug: prophet.slug }}
                className="inline-flex items-center justify-between text-xs font-bold text-amber-400 hover:text-amber-300 pt-2 border-t border-zinc-800"
              >
                <span>{isAr ? "استكشف السيرة العطرة" : isHe ? "חקור את הסירה" : "Explore Seerah"}</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        ))}

        {/* 3. Sacred Places & Geography Cards */}
        {brief.relatedPlaces.map((place, idx) => (
          <div
            key={`place-${idx}`}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-rose-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg group"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{isAr ? "مكان مقدس" : isHe ? "מקום קדוש" : "Sacred Location"}</span>
                </span>
              </div>
              <h4 className="text-lg font-extrabold text-white dir-auto">
                {place.name}
              </h4>
              <p className="text-xs text-zinc-300 leading-relaxed dir-auto">
                {place.description || (isAr ? "موقع تاريخي وجغرافي مبارك" : "Blessed historical geography")}
              </p>
            </div>
          </div>
        ))}

        {/* 4. Practical Lessons & Wisdom Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-emerald-950/40 border border-zinc-800 hover:border-emerald-500/50 transition-all space-y-3 shadow-lg col-span-1 md:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Lightbulb className="w-5 h-5 text-amber-400 animate-pulse" />
            <h4 className="text-sm font-extrabold text-zinc-200 dir-auto">
              {isAr ? "الدروس والتطبيقات العملية المستفادة" : isHe ? "לקחים ותובנות מעשיות" : "Practical Lessons & Life Applications"}
            </h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {brief.practicalLessons.map((lesson, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{isAr ? "تطبيق عملي" : isHe ? "יישום מעשי" : "Application"}</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed dir-auto">
                  {lesson}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
