import React, { useState } from "react";
import {
  Compass,
  Sparkles,
  BookOpen,
  Quote,
  Lightbulb,
  GraduationCap,
  ScrollText,
  History,
  MapPin,
  Flame,
  Shuffle,
  Award,
  Layers,
  Heart,
  Scale,
  Clock,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DailySpotlight } from "./DailySpotlight";
import { InteractiveDiscoveryTimeline } from "./InteractiveDiscoveryTimeline";
import { InteractiveDiscoveryMap } from "./InteractiveDiscoveryMap";
import { ExploreMatrix } from "./ExploreMatrix";
import { CuratedCollectionsAndJourneys } from "./CuratedCollectionsAndJourneys";
import {
  getTodayVerse,
  getTodayHadith,
  getTodayReflection,
  getScholarOfTheWeek,
  getFeaturedStory,
} from "@/lib/discovery-engine";
import type { LocaleCode } from "@/lib/knowledge";

interface PremiumDiscoveryHubProps {
  locale: LocaleCode;
}

export const PremiumDiscoveryHub: React.FC<PremiumDiscoveryHubProps> = ({ locale }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const todayVerse = getTodayVerse(locale);
  const todayHadith = getTodayHadith(locale);
  const todayReflection = getTodayReflection(locale);
  const scholar = getScholarOfTheWeek(locale);
  const featuredStory = getFeaturedStory(locale);

  const [activeNavSection, setActiveNavSection] = useState<string>("daily-spotlight");

  const navItems = [
    { id: "daily-spotlight", labelAr: "إشراقة اليوم", labelHe: "היום", labelEn: "Daily Spotlight", icon: Sparkles },
    { id: "interactive-timeline", labelAr: "التسلسل الزمني", labelHe: "ציר זמן", labelEn: "Timeline", icon: History },
    { id: "interactive-map", labelAr: "الخرائط الأثرية", labelHe: "מפות", labelEn: "Interactive Maps", icon: MapPin },
    { id: "explore-matrix", labelAr: "مصفوفة الاستكشاف", labelHe: "מטריצה", labelEn: "Explore Matrix", icon: Compass },
    { id: "curated-collections", labelAr: "المجموعات والمسارات", labelHe: "אוספים ומסלולים", labelEn: "Collections & Journeys", icon: Award },
  ];

  const scrollTo = (id: string) => {
    setActiveNavSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="space-y-10 py-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* HEADER HERO BANNER */}
      <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-emerald-950 via-zinc-900 to-teal-950 border border-emerald-500/30 overflow-hidden shadow-2xl space-y-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs font-black uppercase tracking-wider px-3 py-1">
            {isAr ? "منصة الاستكشاف والمعرفة الشاملة" : isHe ? "מרכז הגילוי והידע המקיף" : "Premium Discovery & Knowledge Hub"}
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight dir-auto">
            {isAr ? "بوابة الاستكشاف والتعمق الإسلامي" : isHe ? "שער הפירוש והגילוי האסלאמי" : "Islamic Knowledge & Quranic Discovery Portal"}
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed dir-auto">
            {isAr
              ? "استكشف آيات اليوم، الأحاديث، التأملات، علماء الأمة، الخرائط التاريخية، مصفوفة المشاعر والمسارات التعليمية التفاعلية."
              : isHe
                ? "חקור את פסוקי היום, חדית'ים, הרהורים, חוקרי האסלאם, מפות היסטוריות, מטריצת הרגשות ומסלולי הלמידה."
                : "Explore daily Quranic verses, Sahih Hadiths, reflections, scholars of the week, historical timelines, interactive maps, emotions matrix & guided journeys."}
          </p>
        </div>
      </div>

      {/* STICKY DISCOVERY SUB-NAVIGATION BAR */}
      <div className="sticky top-16 z-30 bg-zinc-950/90 backdrop-blur-md p-2 rounded-2xl border border-zinc-800 shadow-xl overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-emerald-500 text-zinc-950 shadow-md shadow-emerald-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{isAr ? item.labelAr : isHe ? item.labelHe : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SECTION 1: DAILY SPOTLIGHT (Verse, Hadith, Reflection, Scholar, Story) */}
      <div id="daily-spotlight">
        <DailySpotlight
          locale={locale}
          todayVerse={todayVerse}
          todayHadith={todayHadith}
          todayReflection={todayReflection}
          scholar={scholar}
          featuredStory={featuredStory}
        />
      </div>

      {/* SECTION 2: INTERACTIVE HISTORICAL TIMELINE */}
      <div id="interactive-timeline">
        <InteractiveDiscoveryTimeline locale={locale} />
      </div>

      {/* SECTION 3: INTERACTIVE SACRED MAPS */}
      <div id="interactive-map">
        <InteractiveDiscoveryMap locale={locale} />
      </div>

      {/* SECTION 4: MULTIDIMENSIONAL EXPLORE MATRIX (Emotions, Virtues, Themes, Prophets, Places, Periods, Tafsir) */}
      <div id="explore-matrix">
        <ExploreMatrix locale={locale} />
      </div>

      {/* SECTION 5: CURATED COLLECTIONS, JOURNEYS, TRENDING & RANDOM */}
      <div id="curated-collections">
        <CuratedCollectionsAndJourneys locale={locale} />
      </div>
    </div>
  );
};
