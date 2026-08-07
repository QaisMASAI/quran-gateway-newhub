import React, { useState } from "react";
import { Calendar, Flame, Info } from "lucide-react";
import { DayHeatmapItem } from "@/lib/learning-analytics";

interface LearningCalendarHeatmapProps {
  data: DayHeatmapItem[];
  locale?: "en" | "ar" | "he";
}

export const LearningCalendarHeatmap: React.FC<LearningCalendarHeatmapProps> = ({
  data,
  locale = "en",
}) => {
  const isAr = locale === "ar";
  const [hoveredDay, setHoveredDay] = useState<DayHeatmapItem | null>(null);

  const getIntensityColor = (intensity: DayHeatmapItem["intensity"]) => {
    switch (intensity) {
      case 0:
        return "bg-zinc-100 dark:bg-zinc-800/80 border-zinc-200/50 dark:border-zinc-800";
      case 1:
        return "bg-amber-200 dark:bg-amber-950/80 border-amber-300 dark:border-amber-900";
      case 2:
        return "bg-amber-400 dark:bg-amber-700/90 border-amber-500 dark:border-amber-600";
      case 3:
        return "bg-amber-500 dark:bg-amber-600 border-amber-600 dark:border-amber-500";
      case 4:
        return "bg-amber-600 dark:bg-amber-500 border-amber-700 dark:border-amber-400 shadow-sm";
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <Calendar className="w-5 h-5 text-amber-500" />
            {isAr
              ? "خريطة الحرارة والنشاط اليومي (180 يوماً)"
              : "Learning Activity Heatmap (180 Days)"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
            {isAr
              ? "تعتمد كثافة اللون على عدد الدقائق والاختبارات المنجزة."
              : "Color intensity reflects active learning minutes and completed quizzes."}
          </p>
        </div>

        {/* Hovered Day Info Badge */}
        {hoveredDay ? (
          <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono font-bold text-amber-700 dark:text-amber-300">
            {hoveredDay.date}: {hoveredDay.minutes} min ({hoveredDay.quizzes} quizzes)
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
            <span>Less</span>
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-md border ${getIntensityColor(
                  i as DayHeatmapItem["intensity"],
                )}`}
              />
            ))}
            <span>More</span>
          </div>
        )}
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2 scrollbar-thin">
        <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[700px]">
          {data.map((day) => (
            <div
              key={day.date}
              onMouseEnter={() => setHoveredDay(day)}
              onMouseLeave={() => setHoveredDay(null)}
              className={`w-3.5 h-3.5 rounded-md border transition-all cursor-pointer hover:scale-125 ${getIntensityColor(
                day.intensity,
              )}`}
              title={`${day.date}: ${day.minutes} mins, ${day.quizzes} quizzes`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
