import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Zap, AlertTriangle, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { QuizAccuracyTrend } from "@/lib/learning-analytics";

interface QuizPerformanceChartsProps {
  accuracyData: QuizAccuracyTrend[];
  weakAreas: {
    topicId: string;
    topicName: string;
    accuracyPct: number;
    recommendedAction: string;
  }[];
  locale?: "en" | "ar" | "he";
}

export const QuizPerformanceCharts: React.FC<QuizPerformanceChartsProps> = ({
  accuracyData,
  weakAreas,
  locale = "en",
}) => {
  const isAr = locale === "ar";

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            {isAr ? "تحليل أداء الاختبارات والدقة" : "Quiz Performance & Accuracy Evolution"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
            {isAr
              ? "تتبع ارتقاء نسبة الدقة وانخفاض زمن الإجابة مع زيادة مستوى الصعوبة."
              : "Tracking accuracy rise and reduced time-per-question alongside difficulty progression."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Line Chart: Accuracy % & Speed Evolution */}
        <div className="lg:col-span-2 space-y-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider dir-auto">
            {isAr ? "منحنى الدقة وزمن الإجابة" : "Accuracy % & Answer Speed Trend"}
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#a1a1aa" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#a1a1aa" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "16px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="accuracyPct"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Accuracy %"
                />
                <Line
                  type="monotone"
                  dataKey="avgTimePerQuestionSec"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Avg Sec / Question"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Weak Areas Card */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 dir-auto">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>{isAr ? "أبرز 3 مجالات تحتاج مراجعة" : "Top Weak Areas (< 60%)"}</span>
          </h4>

          <div className="space-y-3">
            {weakAreas.map((area) => (
              <div
                key={area.topicId}
                className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-rose-700 dark:text-rose-300">
                    {area.topicName}
                  </span>
                  <span className="font-mono font-black text-rose-600">{area.accuracyPct}%</span>
                </div>

                <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed dir-auto">
                  {area.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
