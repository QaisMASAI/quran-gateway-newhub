import React from "react";
import { Link } from "@tanstack/react-router";
import { BookOpen, Trophy, Sparkles, Brain, CheckCircle2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SearchResearchBrief } from "@/lib/search-brief.functions";

interface PerplexityLearningRecommendationsProps {
  brief: SearchResearchBrief;
}

export const PerplexityLearningRecommendations: React.FC<PerplexityLearningRecommendationsProps> = ({ brief }) => {
  const isAr = brief.locale === "ar";
  const isHe = brief.locale === "he";

  const recommendations = [
    {
      id: "rec-quiz",
      icon: <Trophy className="w-5 h-5 text-amber-400" />,
      titleEn: `Test Your Knowledge: ${brief.query}`,
      titleAr: `اختبار واستذكار: ${brief.query}`,
      titleHe: `בחן את הידע שלך: ${brief.query}`,
      descEn: "Take an interactive 5-question comprehension quiz on verses, Hadiths, and historical context.",
      descAr: "خض اختباراً تفاعلياً قصيراً من 5 أسئلة لقياس استيعابك للنصوص والأحكام.",
      descHe: "בחן את הבנתך באמצעות חידון אינטראקטיבי קצר.",
      xp: "+150 XP",
      actionTextEn: "Start Knowledge Quiz",
      actionTextAr: "ابدأ الاختبار المعرفي",
      actionTextHe: "התחל חידון",
      link: "/gamification",
    },
    {
      id: "rec-reading",
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
      titleEn: "Sequential Reading Plan",
      titleAr: "خطة القراءة المتسلسلة والمتابعة",
      titleHe: "תכנית קריאה מדורגת",
      descEn: "Follow a structured reading sequence covering Quran verses, Sahih Hadiths, and Ibn Kathir exegesis.",
      descAr: "اتبع تسلسلاً متكاملاً يبدأ بآيات الكتاب، يليه الفهم النبوي ثم التفسير المعتمد.",
      descHe: "תכנית לימוד מומלצת מהקוראן ועד לתפסיר.",
      xp: "Guided Plan",
      actionTextEn: "Explore Reading Plan",
      actionTextAr: "استعرض خطة القراءة",
      actionTextHe: "צפה בתכנית הלימוד",
      link: "/learn",
    },
  ];

  return (
    <section id="learning-recommendations" className="space-y-4 scroll-mt-24">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Brain className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold text-white dir-auto">
              {isAr ? "التوصيات التعلمية والمسارات التفاعلية" : isHe ? "המלצות למידה ומסלולים" : "Personalized Learning & Study Pathways"}
            </h3>
            <p className="text-xs text-zinc-400 dir-auto">
              {isAr
                ? "اخبر معرفتك واستكمل خطة القراءة التفاعلية لترسيخ الفهم"
                : isHe
                  ? "בחן את הידע שלך והמשך בתכנית הלימוד האישית"
                  : "Interactive quizzes, structured reading plans & gamified progress tracking"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all space-y-3 flex flex-col justify-between shadow-lg"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-zinc-800 border border-zinc-700">
                  {item.icon}
                </div>
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 font-bold text-xs">
                  {item.xp}
                </Badge>
              </div>

              <h4 className="text-base font-extrabold text-white dir-auto">
                {isAr ? item.titleAr : isHe ? item.titleHe : item.titleEn}
              </h4>

              <p className="text-xs text-zinc-300 leading-relaxed dir-auto">
                {isAr ? item.descAr : isHe ? item.descHe : item.descEn}
              </p>
            </div>

            <Link to={item.link}>
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md">
                <span>{isAr ? item.actionTextAr : isHe ? item.actionTextHe : item.actionTextEn}</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
};
