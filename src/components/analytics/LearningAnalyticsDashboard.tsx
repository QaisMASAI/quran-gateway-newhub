import React, { useState } from "react";
import { Download, Sparkles, RefreshCw, Layers } from "lucide-react";
import { generateMockAnalyticsSummary, AnalyticsSummary } from "@/lib/learning-analytics";
import { ProgressOverviewCards } from "./ProgressOverviewCards";
import { LearningCalendarHeatmap } from "./LearningCalendarHeatmap";
import { TopicMasteryRadar } from "./TopicMasteryRadar";
import { TimeSpentBarAndPie } from "./TimeSpentBarAndPie";
import { QuizPerformanceCharts } from "./QuizPerformanceCharts";
import { AchievementRarityDistribution } from "./AchievementRarityDistribution";
import { PersonalizedInsightsAndRecommendations } from "./PersonalizedInsightsAndRecommendations";
import { ComparativeStatsCard } from "./ComparativeStatsCard";
import { AnalyticsExportModal } from "./AnalyticsExportModal";

interface LearningAnalyticsDashboardProps {
  userId?: string;
  locale?: "en" | "ar" | "he";
}

export const LearningAnalyticsDashboard: React.FC<LearningAnalyticsDashboardProps> = ({
  userId = "usr_guest",
  locale = "en",
}) => {
  const [summary, setSummary] = useState<AnalyticsSummary>(() =>
    generateMockAnalyticsSummary(userId),
  );
  const [showExportModal, setShowExportModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAr = locale === "ar";

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setSummary(generateMockAnalyticsSummary(userId));
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 py-6 px-4">
      {/* Dashboard Top Header & Export Controls */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <Layers className="w-6 h-6 text-amber-500" />
            {isAr ? "لوحة تحليلات التعلم المتقدمة" : "Learning Analytics & Insights Dashboard"}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
            {isAr
              ? "تحليل شامل وموجه للإتقان الأكاديمي، خريطة الحرارة، ومنحنيات الأداء."
              : "Comprehensive metrics, GitHub-style heatmaps, radar mastery, & personalized recommendations."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 transition-colors"
            title="Refresh Analytics Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 text-white font-black text-xs hover:bg-amber-700 transition-all shadow-md"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? "تصدير التقرير" : "Export Reports"}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Progress Overview Cards */}
      <ProgressOverviewCards summary={summary} locale={locale} />

      {/* SECTION 2: Calendar Activity Heatmap */}
      <LearningCalendarHeatmap data={summary.heatmapData} locale={locale} />

      {/* SECTION 3: Radar Topic Mastery & Drill-down */}
      <TopicMasteryRadar data={summary.topicMasteryData} locale={locale} />

      {/* SECTION 4: Time Spent Bar & Allocation Pie */}
      <TimeSpentBarAndPie
        weeklyData={summary.timeSpentWeeklyData}
        topicData={summary.topicMasteryData}
        locale={locale}
      />

      {/* SECTION 5: Quiz Performance Evolution & Weak Areas */}
      <QuizPerformanceCharts
        accuracyData={summary.quizAccuracyTrendData}
        weakAreas={summary.weakAreas}
        locale={locale}
      />

      {/* SECTION 6: Achievement Showcase & Rarity Distribution */}
      <AchievementRarityDistribution
        rarityData={summary.achievementRarityDistribution}
        locale={locale}
      />

      {/* SECTION 7: Personalized Recommendations & Next Steps */}
      <PersonalizedInsightsAndRecommendations summary={summary} locale={locale} />

      {/* SECTION 8: Comparative Benchmarks & Global Ranking */}
      <ComparativeStatsCard summary={summary} locale={locale} />

      {/* Export Modal */}
      {showExportModal && (
        <AnalyticsExportModal
          summary={summary}
          onClose={() => setShowExportModal(false)}
          locale={locale}
        />
      )}
    </div>
  );
};
