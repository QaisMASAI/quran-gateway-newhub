import React from "react";
import { Sparkles, Eye, BookOpen, Activity, Clock, Compass } from "lucide-react";
import { type UserGameification } from "@/lib/gamification-engine-v2";

interface PersonalizationWidgetProps {
  data: UserGameification;
  locale?: "en" | "ar" | "he";
}

export const PersonalizationWidget: React.FC<PersonalizationWidgetProps> = ({
  data,
  locale = "en",
}) => {
  const isAr = locale === "ar";
  const pers = data.personalization;

  const styleIcon = () => {
    switch (pers.detectedStyle) {
      case "visual":
        return <Eye className="w-5 h-5 text-indigo-500" />;
      case "kinesthetic":
        return <Activity className="w-5 h-5 text-emerald-500" />;
      default:
        return <BookOpen className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <Sparkles className="w-5 h-5 text-purple-500" />
            {isAr ? "التخصيص وملاءمة التعلم" : "Personalized Learning Profile"}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
            {isAr
              ? "تحليل نمط تعلمك وتفضيلات الوقت والصعوبة."
              : "Detecting your preferred learning style, time availability, and difficulty curve."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Detected Style */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center gap-2">
            {styleIcon()}
            <span className="text-xs font-bold text-zinc-500">Learning Style</span>
          </div>
          <div className="text-base font-black text-zinc-900 dark:text-zinc-100 capitalize">
            {pers.detectedStyle} Learner
          </div>
        </div>

        {/* Difficulty Preference */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold text-zinc-500">Difficulty Preference</span>
          </div>
          <div className="text-base font-black text-zinc-900 dark:text-zinc-100 font-mono">
            Level {pers.difficultyPreference} / 10
          </div>
        </div>

        {/* Time Availability */}
        <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="text-xs font-bold text-zinc-500">Time Awareness</span>
          </div>
          <div className="text-base font-black text-zinc-900 dark:text-zinc-100 font-mono">
            ~{pers.preferredTimeMinutes} Min / Day
          </div>
        </div>
      </div>

      {/* Recommended Next Lesson Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between gap-4 shadow-md">
        <div className="space-y-1">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
            Recommended Next Step
          </span>
          <h4 className="font-extrabold text-sm dir-auto">
            Quranic Mastery Path 1: Al-Fatihah & Short Surahs
          </h4>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-purple-900 font-black text-xs hover:bg-zinc-100 transition-colors shrink-0 shadow-sm">
          <Compass className="w-4 h-4" />
          <span>Start Lesson</span>
        </button>
      </div>
    </div>
  );
};
