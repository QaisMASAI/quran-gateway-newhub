import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Sparkles,
  BookOpen,
  Quote,
  GraduationCap,
  ScrollText,
  Copy,
  Check,
  Share2,
  ChevronRight,
  ArrowUpRight,
  Play,
  Volume2,
  Heart,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type {
  TodayVerse,
  TodayHadith,
  TodayReflection,
  ScholarOfTheWeek,
  FeaturedStory,
} from "@/lib/discovery-engine";
import type { LocaleCode } from "@/lib/knowledge";

interface DailySpotlightProps {
  locale: LocaleCode;
  todayVerse: TodayVerse;
  todayHadith: TodayHadith;
  todayReflection: TodayReflection;
  scholar: ScholarOfTheWeek;
  featuredStory: FeaturedStory;
}

export const DailySpotlight: React.FC<DailySpotlightProps> = ({
  locale,
  todayVerse,
  todayHadith,
  todayReflection,
  scholar,
  featuredStory,
}) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const [copiedVerse, setCopiedVerse] = useState(false);
  const [copiedHadith, setCopiedHadith] = useState(false);

  const handleCopy = (text: string, type: "verse" | "hadith") => {
    navigator.clipboard.writeText(text);
    if (type === "verse") {
      setCopiedVerse(true);
      setTimeout(() => setCopiedVerse(false), 2000);
    } else {
      setCopiedHadith(true);
      setTimeout(() => setCopiedHadith(false), 2000);
    }
    toast.success(
      isAr ? "تم النسخ إلى الحافظة" : isHe ? "הועתק ללוח" : "Copied to clipboard",
    );
  };

  return (
    <div className="space-y-8">
      {/* 1. TODAY'S VERSE CARD */}
      <section id="todays-verse" className="scroll-mt-24">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/80 via-zinc-900 to-zinc-950 border border-emerald-500/30 shadow-2xl relative overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <BookOpen className="w-5 h-5 animate-pulse" />
              </span>
              <div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                  {isAr ? "آية اليوم المباركة" : isHe ? "פסוק היום" : "Today's Verse"}
                </Badge>
                <h3 className="text-lg font-extrabold text-white mt-0.5 dir-auto">
                  {isAr
                    ? `سورة ${todayVerse.surahNameAr} (آية ${todayVerse.ayah})`
                    : isHe
                      ? `סורת ${todayVerse.surahNameHe} (פסוק ${todayVerse.ayah})`
                      : `Surah ${todayVerse.surahNameEn} (${todayVerse.surah}:${todayVerse.ayah})`}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  handleCopy(
                    `${todayVerse.arabic}\n\n${
                      isAr
                        ? todayVerse.translationAr
                        : isHe
                          ? todayVerse.translationHe
                          : todayVerse.translationEn
                    }`,
                    "verse",
                  )
                }
                className="bg-zinc-800/80 border-zinc-700 text-zinc-200 hover:bg-zinc-700 text-xs font-bold rounded-xl gap-1.5"
              >
                {copiedVerse ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedVerse ? (isAr ? "تم النسخ" : isHe ? "הועתק" : "Copied") : (isAr ? "نسخ" : isHe ? "העתק" : "Copy")}</span>
              </Button>
              <Link
                to="/surah/$id"
                params={{ id: String(todayVerse.surah) }}
                hash={`v-${todayVerse.ayah}`}
                search={{ q: undefined }}
              >
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl gap-1 shadow-lg">
                  <span>{isAr ? "اقرأ السورة والتفسير" : isHe ? "קרא את הסורה" : "Read Surah & Tafsir"}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Arabic Verse Display */}
          <div className="p-6 rounded-2xl bg-zinc-950/80 border border-zinc-800 text-center space-y-3">
            <p className="font-serif text-2xl sm:text-3xl leading-loose text-emerald-200 dir-rtl tracking-wide font-arabic">
              " {todayVerse.arabic} "
            </p>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-sans italic dir-auto max-w-3xl mx-auto pt-2 border-t border-zinc-800/60">
              {isAr ? todayVerse.translationAr : isHe ? todayVerse.translationHe : todayVerse.translationEn}
            </p>
          </div>

          {/* Tafsir Reflection Note */}
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed dir-auto">
              <strong className="text-emerald-400 block mb-0.5">
                {isAr ? "لفتة قرآنية وتأملية:" : isHe ? "תובנת התפסיר:" : "Exegesis Insight:"}
              </strong>
              {isAr ? todayVerse.tafsirSummaryAr : isHe ? todayVerse.tafsirSummaryHe : todayVerse.tafsirSummaryEn}
            </p>
          </div>
        </div>
      </section>

      {/* GRID: TODAY'S HADITH & TODAY'S REFLECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. TODAY'S HADITH */}
        <section id="todays-hadith" className="scroll-mt-24">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-sky-500/40 transition-all shadow-xl space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Quote className="w-4 h-4" />
                  </span>
                  <div>
                    <Badge className="bg-sky-500/10 text-sky-400 border-sky-500/30 text-[10px] font-black uppercase">
                      {isAr ? "حديث اليوم النبوي" : isHe ? "חדית' היום" : "Today's Hadith"}
                    </Badge>
                    <h4 className="text-sm font-extrabold text-white mt-0.5 dir-auto">
                      {isAr ? todayHadith.bookAr : isHe ? todayHadith.bookHe : todayHadith.bookEn} #{todayHadith.hadithNum}
                    </h4>
                  </div>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
                  {isAr ? todayHadith.gradeAr : isHe ? todayHadith.gradeHe : todayHadith.gradeEn}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800 space-y-2">
                <p className="font-serif text-lg text-sky-200 dir-rtl leading-relaxed font-arabic">
                  "{todayHadith.arabic}"
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed dir-auto pt-2 border-t border-zinc-800">
                  {isAr ? todayHadith.translationAr : isHe ? todayHadith.translationHe : todayHadith.translationEn}
                </p>
                <p className="text-[11px] text-zinc-400 font-mono dir-auto">
                  — {isAr ? todayHadith.narratorAr : isHe ? todayHadith.narratorHe : todayHadith.narratorEn}
                </p>
              </div>
            </div>

            <Link
              to="/hadith/$collection/entry/$num"
              params={{ collection: todayHadith.collection, num: String(todayHadith.hadithNum) }}
              className="w-full"
            >
              <Button variant="outline" className="w-full bg-zinc-800 hover:bg-sky-600 text-zinc-200 hover:text-white border-zinc-700 text-xs font-bold py-2 rounded-xl flex items-center justify-between">
                <span>{isAr ? "استعرض الشرح والتخريج" : isHe ? "צפה בפרשנות החדית'" : "View Full Hadith Commentary"}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* 3. TODAY'S REFLECTION */}
        <section id="todays-reflection" className="scroll-mt-24">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-amber-500/40 transition-all shadow-xl space-y-4 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Lightbulb className="w-4 h-4 animate-pulse" />
                  </span>
                  <div>
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30 text-[10px] font-black uppercase">
                      {isAr ? "إشراقة وتأمل اليوم" : isHe ? "הרהור ותובנה יומית" : "Today's Reflection"}
                    </Badge>
                    <h4 className="text-sm font-extrabold text-white mt-0.5 dir-auto">
                      {isAr ? todayReflection.titleAr : isHe ? todayReflection.titleHe : todayReflection.titleEn}
                    </h4>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed dir-auto p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
                {isAr ? todayReflection.summaryAr : isHe ? todayReflection.summaryHe : todayReflection.summaryEn}
              </p>

              <div className="space-y-2">
                <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider block dir-auto">
                  {isAr ? "خطوات تطبيقية عملية:" : isHe ? "צעדים יישומיים:" : "Practical Action Items:"}
                </span>
                <ul className="space-y-1.5 text-xs text-zinc-300 dir-auto">
                  {(isAr
                    ? todayReflection.actionItemsAr
                    : isHe
                      ? todayReflection.actionItemsHe
                      : todayReflection.actionItemsEn
                  ).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 bg-zinc-950/50 p-2 rounded-xl border border-zinc-800/60">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* GRID: SCHOLAR OF THE WEEK & FEATURED STORY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4. SCHOLAR OF THE WEEK */}
        <section id="scholar-of-the-week" className="scroll-mt-24">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-purple-500/40 transition-all shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <GraduationCap className="w-4 h-4" />
                </span>
                <div>
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-[10px] font-black uppercase">
                    {isAr ? "عالم الأسبوع" : isHe ? "חוקר השבוע" : "Scholar of the Week"}
                  </Badge>
                  <h4 className="text-base font-extrabold text-white mt-0.5 dir-auto">
                    {isAr ? scholar.nameAr : isHe ? scholar.nameHe : scholar.nameEn}
                  </h4>
                </div>
              </div>

              <span className="text-[10px] font-mono text-zinc-400 bg-zinc-800 px-2 py-1 rounded-lg">
                {scholar.era}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed dir-auto">
              {isAr ? scholar.bioAr : isHe ? scholar.bioHe : scholar.bioEn}
            </p>

            {/* Quote */}
            <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-800/40 text-xs italic text-purple-200 dir-auto">
              "{isAr ? scholar.keyQuoteAr : isHe ? scholar.keyQuoteHe : scholar.keyQuoteEn}"
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-bold text-zinc-400 block dir-auto">
                {isAr ? "أشهر المؤثرات والمصنفات:" : isHe ? "חיבורים בולטים:" : "Notable Masterworks:"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(isAr ? scholar.famousWorksAr : isHe ? scholar.famousWorksHe : scholar.famousWorksEn).map((work, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-medium">
                    {work}
                  </span>
                ))}
              </div>
            </div>

            <Link
              to="/scholars/$slug"
              params={{ slug: scholar.slug }}
              className="inline-block w-full pt-2"
            >
              <Button className="w-full bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-between shadow-md">
                <span>{isAr ? "تصفح ترجمة ورسائل العالم" : isHe ? "חקור את תולדות החוקר" : "Explore Scholar's Works"}</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>

        {/* 5. FEATURED STORY */}
        <section id="featured-story" className="scroll-mt-24">
          <div className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 hover:border-teal-500/40 transition-all shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <ScrollText className="w-4 h-4" />
                </span>
                <div>
                  <Badge className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-[10px] font-black uppercase">
                    {isAr ? "قصة الأسبوع القرآنية" : isHe ? "סיפור השבוע" : "Featured Quranic Story"}
                  </Badge>
                  <h4 className="text-base font-extrabold text-white mt-0.5 dir-auto">
                    {isAr ? featuredStory.titleAr : isHe ? featuredStory.titleHe : featuredStory.titleEn}
                  </h4>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                {featuredStory.surahRef}
              </span>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed dir-auto p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800">
              {isAr ? featuredStory.summaryAr : isHe ? featuredStory.summaryHe : featuredStory.summaryEn}
            </p>

            <div className="p-3.5 rounded-2xl bg-teal-950/30 border border-teal-800/40 text-xs text-teal-200 space-y-1 dir-auto">
              <span className="font-extrabold text-teal-400 block uppercase text-[10px]">
                {isAr ? "العبرة والدرس المستفاد:" : isHe ? "לקח מוסרי:" : "Moral & Ethical Takeaway:"}
              </span>
              <p>{isAr ? featuredStory.moralTakeawayAr : isHe ? featuredStory.moralTakeawayHe : featuredStory.moralTakeawayEn}</p>
            </div>

            <Link
              to="/stories/$slug"
              params={{ slug: featuredStory.slug }}
              className="inline-block w-full pt-2"
            >
              <Button className="w-full bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-between shadow-md">
                <span>{isAr ? "اقرأ القصة الكاملة والعبر" : isHe ? "קרא את הסיפור המלא" : "Read Full Quranic Narrative"}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};
