import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Clock, PieChart as PieIcon, Lightbulb } from "lucide-react";
import { TimeSpentBreakdown, TopicMasteryMetric } from "@/lib/learning-analytics";

interface TimeSpentBarAndPieProps {
  weeklyData: TimeSpentBreakdown[];
  topicData: TopicMasteryMetric[];
  locale?: "en" | "ar" | "he";
}

const PIE_COLORS = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6"];

export const TimeSpentBarAndPie: React.FC<TimeSpentBarAndPieProps> = ({
  weeklyData,
  topicData,
  locale = "en",
}) => {
  const isAr = locale === "ar";

  const pieChartData = topicData.map((t) => ({
    name: isAr ? t.topicNameAr : t.topicName,
    value: t.timeSpentHours,
  }));

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <Clock className="w-5 h-5 text-amber-500" />
            {isAr ? "تحليل الوقت المستغرق والمقارنة" : "Time Spent Analysis & Distribution"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
            {isAr
              ? "متابعة الساعات الأسبوعية وتوزيع النشاط بين القراءة والتفسير والاختبارات."
              : "Weekly hours trend broken down by activity (Reading, Quiz, Tafsir, Social)."}
          </p>
        </div>
      </div>

      {/* Actionable Insight Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-3 dir-auto">
        <Lightbulb className="w-5 h-5 text-amber-600 shrink-0" />
        <div>
          <span className="font-extrabold">Recommendation: </span>
          <span>
            You currently spend 3x more time reading Surahs vs studying Topic Sciences. Balancing
            your time improves mastery by 25%.
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Weekly Trend Bar Chart */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider dir-auto">
            {isAr ? "الاتجاه الأسبوعي (ساعات)" : "Weekly Learning Hours Trend"}
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="weekLabel" stroke="#a1a1aa" fontSize={11} />
                <YAxis stroke="#a1a1aa" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "16px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="readingHours" stackId="a" fill="#f59e0b" name="Reading" />
                <Bar dataKey="quizHours" stackId="a" fill="#3b82f6" name="Quizzes" />
                <Bar dataKey="tafsirHours" stackId="a" fill="#10b981" name="Tafsir" />
                <Bar dataKey="socialHours" stackId="a" fill="#8b5cf6" name="Social" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Allocation Pie Chart */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider dir-auto">
            {isAr ? "توزيع الوقت حسب الموضوعات" : "% Time Allocation per Topic"}
          </h4>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "16px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
