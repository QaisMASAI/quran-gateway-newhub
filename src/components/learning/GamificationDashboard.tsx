import React, { useState } from "react";
import {
  Trophy,
  Flame,
  Heart,
  Sparkles,
  BookOpen,
  RotateCcw,
  Compass,
  Award,
  Users,
  PenTool,
  Shield,
  Sun,
  Layers,
  Zap,
  CheckCircle2,
} from "lucide-react";
import {
  loadUserGamification,
  saveUserGamification,
  type UserGameification,
} from "@/lib/gamification-engine-v2";
import { XpTracker } from "@/components/gamification/XpTracker";
import { StreakWidget } from "@/components/gamification/StreakWidget";
import { AchievementDisplay } from "@/components/gamification/AchievementDisplay";
import { LearningWorldsExplorer } from "@/components/gamification/LearningWorldsExplorer";
import { DailyChallengesWidget } from "@/components/gamification/DailyChallengesWidget";
import { AdaptiveQuizCard } from "@/components/gamification/AdaptiveQuizCard";
import { SocialLeaderboardView } from "@/components/gamification/SocialLeaderboardView";
import { PersonalizationWidget } from "@/components/gamification/PersonalizationWidget";
import { GamificationAdminDashboard } from "@/components/admin/GamificationAdminDashboard";
import { LearningAnalyticsDashboard } from "@/components/analytics/LearningAnalyticsDashboard";
import { ClassroomHub } from "@/components/classroom/ClassroomHub";
import { GraduationCap } from "lucide-react";

interface GamificationDashboardProps {
  locale?: "en" | "ar" | "he";
}

export const GamificationDashboard: React.FC<GamificationDashboardProps> = ({ locale = "en" }) => {
  const [data, setData] = useState<UserGameification>(loadUserGamification);
  const [activeTab, setActiveTab] = useState<
    | "classroom"
    | "analytics"
    | "xp_summary"
    | "streak"
    | "worlds"
    | "challenges"
    | "quiz"
    | "achievements"
    | "leaderboard"
    | "personalization"
    | "admin"
  >("analytics");

  const isAr = locale === "ar";
  const isHe = locale === "he";

  const handleUpdateData = (updated: UserGameification) => {
    setData(updated);
    saveUserGamification(updated);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-6 px-4">
      {/* Engine 2.0 Top Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-200 dark:border-zinc-800">
        {[
          {
            id: "classroom",
            labelAr: "الفصول و المعلمين",
            labelEn: "Classroom & Teacher Portal",
            icon: GraduationCap,
          },
          {
            id: "analytics",
            labelAr: "التحليلات المتقدمة",
            labelEn: "Analytics Dashboard",
            icon: Layers,
          },
          {
            id: "xp_summary",
            labelAr: "المستوى ونقاط XP",
            labelEn: "XP & Level 1-100",
            icon: Trophy,
          },
          { id: "streak", labelAr: "سلسلة الثبات", labelEn: "Daily Streak & Gems", icon: Flame },
          { id: "worlds", labelAr: "عوالم التعلم 6", labelEn: "6 Learning Worlds", icon: Compass },
          {
            id: "challenges",
            labelAr: "التحديات اليومية",
            labelEn: "Daily Challenges",
            icon: Sparkles,
          },
          { id: "quiz", labelAr: "الاختبار التكيفي", labelEn: "Adaptive Quiz", icon: Zap },
          { id: "achievements", labelAr: "300+ أوسمة", labelEn: "300+ Achievements", icon: Award },
          {
            id: "leaderboard",
            labelAr: "لوحة الشرف",
            labelEn: "Leaderboard & Circles",
            icon: Users,
          },
          { id: "personalization", labelAr: "التخصيص", labelEn: "Personalized Path", icon: Layers },
          { id: "admin", labelAr: "لوحة الإدارة", labelEn: "Admin Control", icon: Shield },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{isAr ? tab.labelAr : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}
      {activeTab === "classroom" && <ClassroomHub locale={locale} />}

      {activeTab === "analytics" && <LearningAnalyticsDashboard locale={locale} />}

      {activeTab === "xp_summary" && (
        <XpTracker data={data} onUpdate={handleUpdateData} locale={locale} />
      )}

      {activeTab === "streak" && (
        <StreakWidget data={data} onUpdate={handleUpdateData} locale={locale} />
      )}

      {activeTab === "worlds" && (
        <LearningWorldsExplorer data={data} onUpdate={handleUpdateData} locale={locale} />
      )}

      {activeTab === "challenges" && (
        <DailyChallengesWidget data={data} onUpdate={handleUpdateData} locale={locale} />
      )}

      {activeTab === "quiz" && (
        <AdaptiveQuizCard data={data} onUpdate={handleUpdateData} locale={locale} />
      )}

      {activeTab === "achievements" && <AchievementDisplay data={data} locale={locale} />}

      {activeTab === "leaderboard" && (
        <SocialLeaderboardView data={data} onUpdate={handleUpdateData} locale={locale} />
      )}

      {activeTab === "personalization" && <PersonalizationWidget data={data} locale={locale} />}

      {activeTab === "admin" && <GamificationAdminDashboard />}
    </div>
  );
};
