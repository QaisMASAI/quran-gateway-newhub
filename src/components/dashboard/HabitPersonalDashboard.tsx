import React, { useState } from "react";
import {
  Flame,
  Award,
  Trophy,
  Sparkles,
  BookOpen,
  NotebookPen,
  BookMarked,
  Bell,
  BarChart3,
  Compass,
  GraduationCap,
  Target,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { DailyStreakTracker } from "@/components/habits/DailyStreakTracker";
import { ReadingGoalsCard } from "@/components/habits/ReadingGoalsCard";
import { ResearchGoalsCard } from "@/components/habits/ResearchGoalsCard";
import { LearningStatsOverview } from "@/components/habits/LearningStatsOverview";
import { ReadingRemindersCard } from "@/components/habits/ReadingRemindersCard";
import { KnowledgeMilestones } from "@/components/habits/KnowledgeMilestones";
import { RecommendedNextLessons } from "@/components/habits/RecommendedNextLessons";
import { ProgressTrackerCard } from "@/components/habits/ProgressTrackerCard";
import { AchievementSystemView } from "@/components/habits/AchievementSystemView";
import { SavedCollectionsManager } from "@/components/collections/SavedCollectionsManager";
import { PersonalNotesHub } from "@/components/notes/PersonalNotesHub";
import { AIStudyAssistantModal } from "@/components/ai/AIStudyAssistantModal";
import { CertificateViewerModal } from "@/components/certificates/CertificateViewerModal";

import { getGamificationStats, calculateLevel } from "@/lib/gamification";
import { getHabitData, generateCertificate, type CompletionCertificate } from "@/lib/habit-engine";

interface HabitPersonalDashboardProps {
  locale: string;
}

export const HabitPersonalDashboard: React.FC<HabitPersonalDashboardProps> = ({ locale }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showAiModal, setShowAiModal] = useState(false);
  const [activeCertificate, setActiveCertificate] = useState<CompletionCertificate | null>(null);

  const gameStats = getGamificationStats();
  const habitData = getHabitData();
  const levelInfo = calculateLevel(gameStats.xp);

  const handleOpenSampleCertificate = () => {
    const cert = generateCertificate(
      "quran_sciences_foundations",
      "Quranic Sciences & Tafsir Foundations",
      "أسس علوم القرآن والتفسير المعتمد",
      "יסודות מדעי הקוראן והתפסיר",
      "Learner of Knowledge",
    );
    setActiveCertificate(cert);
  };

  const tabs = [
    { id: "overview", labelEn: "Overview & Goals", labelAr: "نظرة عامة والأهداف", labelHe: "סקירה ויעדים", icon: Target },
    { id: "stats", labelEn: "Learning Stats", labelAr: "إحصائيات التعلم", labelHe: "סטטיסטיקת למידה", icon: BarChart3 },
    { id: "collections", labelEn: "Saved Collections", labelAr: "المجموعات المحفوظة", labelHe: "אוספים שמורים", icon: BookMarked },
    { id: "notes", labelEn: "Personal Notes", labelAr: "ملاحظاتي الشخصية", labelHe: "הערות אישיות", icon: NotebookPen },
    { id: "milestones", labelEn: "Milestones & Certificates", labelAr: "المحطات والشهادات", labelHe: "אבני דרך ותעודות", icon: GraduationCap },
    { id: "achievements", labelEn: "Badges & Achievements", labelAr: "الأوسمة والإنجازات", labelHe: "תגים והישגים", icon: Trophy },
    { id: "reminders", labelEn: "Reading Reminders", labelAr: "منبه القراءة", labelHe: "תזכורות קריאה", icon: Bell },
  ];

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto px-4 sm:px-6">
      {/* HABIT HERO DASHBOARD HEADER */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-950 via-zinc-900 to-amber-950/60 border border-gold/40 shadow-2xl overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-wrap items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <Badge className="bg-gold/20 text-amber-300 border-gold/40 text-xs font-black uppercase tracking-wider px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 inline mr-1" />
              {isAr ? "لوحة التعلم التراكمي المستمر" : isHe ? "לוח למידה מותאם אישית" : "Habit-Forming Personal Dashboard"}
            </Badge>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              {isAr ? "مسارك اليومي في طلب العلم والتدبر" : isHe ? "המסלול היומי שלך בלמידה והרהור" : "Your Daily Knowledge & Reflection Habit"}
            </h1>

            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              {isAr
                ? "حافظ على تتابعك اليومي، أتم أهداف القراءة والبحث، واستكشف محطتك القادمة مع نور AI."
                : isHe
                  ? "שמור על הרצף היומי, השלם יעדי קריאה ומחקר והמשך ללמוד עם נור AI."
                  : "Maintain your active streak, hit daily reading targets, organize notes & generate certificates of completion."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setShowAiModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-2xl px-4 py-3 text-xs gap-2 shadow-lg shadow-purple-600/20"
            >
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>{isAr ? "مساعد المدارسة نور AI" : isHe ? "עוזר הלימוד נור AI" : "Noor AI Study Assistant"}</span>
            </Button>

            <Button
              onClick={handleOpenSampleCertificate}
              variant="outline"
              className="border-gold/50 text-amber-300 hover:bg-gold/10 font-bold rounded-2xl px-4 py-3 text-xs gap-2"
            >
              <GraduationCap className="w-4 h-4 text-gold" />
              <span>{isAr ? "عرض شهادة الإتمام" : isHe ? "הצג תעודת סיום" : "View Certificate"}</span>
            </Button>
          </div>
        </div>

        {/* GAMIFICATION MINI BAR */}
        <div className="relative z-10 pt-4 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-zinc-950/80 border border-amber-500/30 flex items-center gap-3">
            <Flame className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
            <div>
              <span className="block text-[10px] text-zinc-400 font-medium">{isAr ? "التتابع الحالي" : isHe ? "רצף נוכחי" : "Active Streak"}</span>
              <strong className="text-sm font-black text-amber-400">{habitData.streak} {isAr ? "أيام" : isHe ? "ימים" : "Days"}</strong>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/80 border border-gold/30 flex items-center gap-3">
            <Trophy className="w-6 h-6 text-gold" />
            <div>
              <span className="block text-[10px] text-zinc-400 font-medium">{isAr ? "المستوى الحالي" : isHe ? "רמה" : "Level & Rank"}</span>
              <strong className="text-sm font-black text-amber-300">Lvl {levelInfo.level} • {gameStats.xp} XP</strong>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/80 border border-emerald-500/30 flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-emerald-400" />
            <div>
              <span className="block text-[10px] text-zinc-400 font-medium">{isAr ? "هدف القراءة اليوم" : isHe ? "יעד קריאה" : "Reading Goal"}</span>
              <strong className="text-sm font-black text-emerald-400">
                {habitData.goals.dailyAyahsRead} / {habitData.goals.dailyAyahTarget} Ayahs
              </strong>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-zinc-950/80 border border-purple-500/30 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-purple-400" />
            <div>
              <span className="block text-[10px] text-zinc-400 font-medium">{isAr ? "أبحاث اليوم" : isHe ? "מחקר יומי" : "Research Goal"}</span>
              <strong className="text-sm font-black text-purple-400">
                {habitData.goals.dailyResearchDone} / {habitData.goals.dailyResearchTarget} Queries
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* DASHBOARD TABS NAVIGATION */}
      <div className="sticky top-16 z-30 bg-zinc-950/90 backdrop-blur-md p-2 rounded-2xl border border-zinc-800 shadow-xl overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const label = isAr ? tab.labelAr : isHe ? tab.labelHe : tab.labelEn;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  isActive
                    ? "bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB CONTENT PANELS */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-fadeIn">
          {/* DAILY STREAK TRACKER */}
          <DailyStreakTracker locale={locale} />

          {/* GOALS DUAL GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ReadingGoalsCard locale={locale} />
            <ResearchGoalsCard locale={locale} />
          </div>

          {/* RECOMMENDED NEXT LESSONS */}
          <RecommendedNextLessons locale={locale} />

          {/* PROGRESS TRACKER */}
          <ProgressTrackerCard locale={locale} />
        </div>
      )}

      {activeTab === "stats" && (
        <div className="animate-fadeIn">
          <LearningStatsOverview locale={locale} />
        </div>
      )}

      {activeTab === "collections" && (
        <div className="animate-fadeIn">
          <SavedCollectionsManager locale={locale} />
        </div>
      )}

      {activeTab === "notes" && (
        <div className="animate-fadeIn">
          <PersonalNotesHub locale={locale} />
        </div>
      )}

      {activeTab === "milestones" && (
        <div className="space-y-8 animate-fadeIn">
          <KnowledgeMilestones locale={locale} />

          {/* CERTIFICATE BANNER */}
          <div className="p-6 rounded-3xl bg-zinc-900 border border-gold/40 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-gold" />
                <span>{isAr ? "شهادات الإتمام الأكاديمية" : isHe ? "תעודות סיום אקדמיות" : "Official Certificates of Completion"}</span>
              </h3>
              <p className="text-xs text-zinc-400">
                {isAr
                  ? "إصدار وتوثيق شهادات إتمام المسارات المعرفية مع ختم الاعتماد"
                  : isHe
                    ? "הנפקת תעודות סיום רשמיות עבור מסלולי הלימוד"
                    : "Generate official verified certificates of completion for finished study journeys"}
              </p>
            </div>

            <Button
              onClick={handleOpenSampleCertificate}
              className="bg-gold hover:bg-gold/90 text-zinc-950 font-black rounded-xl text-xs gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              <span>{isAr ? "عرض شهادتك الحالية" : isHe ? "הצג תעודה" : "View Certificate"}</span>
            </Button>
          </div>
        </div>
      )}

      {activeTab === "achievements" && (
        <div className="animate-fadeIn">
          <AchievementSystemView locale={locale} />
        </div>
      )}

      {activeTab === "reminders" && (
        <div className="animate-fadeIn">
          <ReadingRemindersCard locale={locale} />
        </div>
      )}

      {/* MODALS */}
      {showAiModal && (
        <AIStudyAssistantModal locale={locale} onClose={() => setShowAiModal(false)} />
      )}

      {activeCertificate && (
        <CertificateViewerModal
          certificate={activeCertificate}
          locale={locale}
          onClose={() => setActiveCertificate(null)}
        />
      )}
    </div>
  );
};
