import React, { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Target, AlertCircle, ChevronRight, CheckCircle2 } from "lucide-react";
import { TopicMasteryMetric } from "@/lib/learning-analytics";

interface TopicMasteryRadarProps {
  data: TopicMasteryMetric[];
  locale?: "en" | "ar" | "he";
}

export const TopicMasteryRadar: React.FC<TopicMasteryRadarProps> = ({ data, locale = "en" }) => {
  const isAr = locale === "ar";
  const [selectedTopic, setSelectedTopic] = useState<TopicMasteryMetric | null>(null);

  const radarChartData = data.map((t) => ({
    subject: isAr ? t.topicNameAr : t.topicName,
    user: t.userMasteryPct,
    global: t.globalAvgPct,
    raw: t,
  }));

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <Target className="w-5 h-5 text-indigo-500" />
            {isAr ? "مخطط إتقان الموضوعات (Radar)" : "Topic Mastery Radar Chart"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
            {isAr
              ? "مقارنة مستوى إتقانك بالمعدل العالمي (المناطق الحمراء تشير إلى نقاط الضغط)."
              : "Comparing your mastery % vs global learners average (Red zones indicate weak areas)."}
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span>You</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <div className="w-3 h-3 rounded-full bg-zinc-400" />
            <span>Global Avg</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Radar Chart */}
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData}>
              <PolarGrid stroke="#3f3f46" strokeDasharray="3 3" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#a1a1aa", fontSize: 11, fontWeight: "bold" }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name="You" dataKey="user" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
              <Radar
                name="Global Avg"
                dataKey="global"
                stroke="#71717a"
                fill="#71717a"
                fillOpacity={0.2}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  borderColor: "#27272a",
                  borderRadius: "16px",
                  color: "#fff",
                  fontSize: "12px",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Topic Cards Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider dir-auto">
            {isAr ? "تحليل الموضوعات والتصنيف" : "Drill-down Topic Analysis"}
          </h4>

          <div className="space-y-2">
            {data.map((t) => {
              const isWeak = t.userMasteryPct < 60;
              return (
                <div
                  key={t.topicId}
                  onClick={() => setSelectedTopic(t)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                    isWeak
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300"
                      : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {isWeak ? (
                      <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    )}
                    <div>
                      <div className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 dir-auto">
                        {isAr ? t.topicNameAr : t.topicName}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono">
                        {t.quizzesTaken} Quizzes • {t.timeSpentHours} hrs
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono">
                    <span
                      className={`text-xs font-black ${
                        isWeak ? "text-rose-600" : "text-emerald-600 dark:text-emerald-400"
                      }`}
                    >
                      {t.userMasteryPct}%
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Drill-Down Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 dir-auto">
              {isAr ? selectedTopic.topicNameAr : selectedTopic.topicName} Analysis
            </h3>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex justify-between">
                <span>User Mastery:</span>
                <span className="font-bold">{selectedTopic.userMasteryPct}%</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex justify-between">
                <span>Global Learners Avg:</span>
                <span className="font-bold">{selectedTopic.globalAvgPct}%</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex justify-between">
                <span>Total Time Spent:</span>
                <span className="font-bold">{selectedTopic.timeSpentHours} hrs</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTopic(null)}
              className="w-full py-2.5 rounded-2xl bg-amber-600 text-white font-bold text-xs"
            >
              Close Detailed View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
