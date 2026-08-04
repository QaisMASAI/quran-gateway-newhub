import React from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, ArrowRight, BookOpen, Compass, ScrollText, PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecommendedNextLessonsProps {
  locale: string;
}

export const RecommendedNextLessons: React.FC<RecommendedNextLessonsProps> = ({ locale }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const recommendations = [
    {
      id: "rec_yasin",
      type: "quran",
      titleEn: "Surah Yasin (36:1-83)",
      titleAr: "سورة يس - قلب القرآن",
      titleHe: "סורת יאסין - לב הקוראן",
      descEn: "Explore the core arguments for Resurrection and Divine Oneness.",
      descAr: "دراسة وتأمل الآيات المباركة في إثبات البعث والربوبية.",
      descHe: "חקור את הטיעונים המרכזיים לתחיית המתים וייחוד השם.",
      link: "/surah/36",
      badgeEn: "Recommended Next",
      badgeAr: "الدرس القادم",
      badgeHe: "מומלץ כעת",
      icon: BookOpen,
      duration: "15 min",
    },
    {
      id: "rec_nawawi",
      type: "hadith",
      titleEn: "An-Nawawi's 40 Hadiths (Hadith 1-5)",
      titleAr: "الأربعين النووية - الأحاديث 1 إلى 5",
      titleHe: "40 החדית'ים של א-נוואווי (חדית' 1-5)",
      descEn: "Foundational traditions on intention, Islam, Iman and Ihsan.",
      descAr: "الأصول الكبرى للنية وأركان الإسلام والإيمان والإحسان.",
      descHe: "יסודות הכוונה, האסלאם, האימאן והאיחסאן.",
      link: "/hadith/nawawi",
      badgeEn: "Core Heritage",
      badgeAr: "الأصول المعتمدة",
      badgeHe: "יסודות",
      icon: ScrollText,
      duration: "20 min",
    },
    {
      id: "rec_seerah",
      type: "journey",
      titleEn: "Prophetic Seerah: The Madinan Era",
      titleAr: "السيرة النبوية: العهد المدني والمؤاخاة",
      titleHe: "הסירה הנבאווית: התקופה המדינית",
      descEn: "Guided chronological journey through community building & statecraft.",
      descAr: "مسار تفاعلي لمراحل بناء المجتمع والدولة النبوية.",
      descHe: "מסלול כרונולוגי של בניית הקהילה במדינה.",
      link: "/learn/journeys/seerah-madinah",
      badgeEn: "Guided Journey",
      badgeAr: "مسار موجه",
      badgeHe: "מסלול מודרך",
      icon: Compass,
      duration: "30 min",
    },
  ];

  return (
    <div className="rounded-3xl border border-indigo-500/30 bg-zinc-900 p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {isAr ? "الدروس والمحطات الموصى بها تالياً" : isHe ? "שיעורים מומלצים להמשך" : "Recommended Next Lessons"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAr
                ? "ترشيحات ذكية مصممة خصيصاً لمتابعة التعلم المستمر"
                : isHe
                  ? "המלצות חכמות להמשך רציף של הלמידה"
                  : "Personalized lesson recommendations to foster continuous habit-building"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const Icon = rec.icon;
          const title = isAr ? rec.titleAr : isHe ? rec.titleHe : rec.titleEn;
          const desc = isAr ? rec.descAr : isHe ? rec.descHe : rec.descEn;
          const badge = isAr ? rec.badgeAr : isHe ? rec.badgeHe : rec.badgeEn;

          return (
            <div
              key={rec.id}
              className="group p-5 rounded-2xl bg-zinc-950 border border-zinc-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge className="bg-indigo-500/10 text-indigo-300 border-indigo-500/30 text-[10px] font-bold px-2.5 py-0.5">
                    {badge}
                  </Badge>
                  <span className="text-[10px] font-mono text-zinc-400">{rec.duration}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                  <h4 className="text-sm font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                    {title}
                  </h4>
                </div>

                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{desc}</p>
              </div>

              <Link
                to={rec.link}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 text-xs font-bold text-zinc-200 transition-all shadow-sm"
              >
                <PlayCircle className="w-4 h-4" />
                <span>{isAr ? "بدء الدرس الآن" : isHe ? "התחל שיעור" : "Start Lesson"}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
