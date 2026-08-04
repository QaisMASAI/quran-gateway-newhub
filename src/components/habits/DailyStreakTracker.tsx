import React, { useState } from "react";
import { Flame, Calendar, Shield, Award, Sparkles, CheckCircle2 } from "lucide-react";
import { getHabitData, saveHabitData, type HabitUserData } from "@/lib/habit-engine";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DailyStreakTrackerProps {
  locale: string;
  onUpdate?: () => void;
}

export const DailyStreakTracker: React.FC<DailyStreakTrackerProps> = ({ locale, onUpdate }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const [habitData, setHabitData] = useState<HabitUserData>(getHabitData());

  const todayStr = new Date().toISOString().split("T")[0];
  const isTodayActive = habitData.activeDates.includes(todayStr);

  const handleUseStreakFreeze = () => {
    if (habitData.streakFreezeCount <= 0) return;
    const updated = {
      ...habitData,
      streakFreezeCount: habitData.streakFreezeCount - 1,
    };
    saveHabitData(updated);
    setHabitData(updated);
    if (onUpdate) onUpdate();
  };

  // Generate last 14 days calendar
  const last14Days = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const iso = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString(locale === "ar" ? "ar-EG" : locale === "he" ? "he-IL" : "en-US", {
      weekday: "narrow",
    });
    return {
      date: iso,
      dayLabel,
      active: habitData.activeDates.includes(iso),
      isToday: iso === todayStr,
    };
  });

  return (
    <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 via-zinc-900 to-zinc-950 p-6 shadow-xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 text-zinc-950 font-black shadow-lg shadow-amber-500/20">
            <Flame className="w-8 h-8 fill-zinc-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-black text-white">{habitData.streak}</span>
              <span className="text-base font-bold text-amber-400">
                {isAr ? "يوم متواصل" : isHe ? "ימים ברצף" : "Day Streak"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isTodayActive
                ? isAr
                  ? "ممتاز! لقد حافظت على تتابعك اليوم 🎉"
                  : isHe
                    ? "מעולה! שמרת על הרצף היומי 🎉"
                    : "Great job! Your daily streak is active today 🎉"
                : isAr
                  ? "قم بقراءة آية أو إجراء بحث لتثبيت تتابع اليوم"
                  : isHe
                    ? "קרא פסוק או בצע מחקר כדי לשמור על הרצף"
                    : "Read a verse or do research to maintain today's streak"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-zinc-800/80 border border-zinc-700/60 rounded-2xl px-3.5 py-2 text-xs font-semibold text-zinc-200">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>
              {isAr ? "تجميد التتابع:" : isHe ? "הקפאת רצף:" : "Streak Freeze:"}{" "}
              <strong className="text-cyan-400">{habitData.streakFreezeCount}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* 14-DAY CALENDAR HEATMAP */}
      <div className="space-y-2 pt-2 border-t border-zinc-800/60">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 font-bold text-zinc-300">
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>{isAr ? "نشاطك في الـ 14 يوماً الماضية" : isHe ? "פעילות ב-14 הימים האחרונים" : "Last 14 Days Activity"}</span>
          </div>
          <span className="text-[11px] text-amber-400/80 font-medium">
            {habitData.activeDates.length} {isAr ? "أيام إجمالية" : isHe ? "ימים פעילים" : "total active days"}
          </span>
        </div>

        <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 pt-1">
          {last14Days.map((d) => (
            <div
              key={d.date}
              className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                d.active
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 font-extrabold shadow-sm shadow-amber-500/10"
                  : d.isToday
                    ? "bg-zinc-800 border-dashed border-amber-400/60 text-zinc-300"
                    : "bg-zinc-900/60 border-zinc-800/80 text-zinc-600"
              }`}
            >
              <span className="text-[10px] uppercase">{d.dayLabel}</span>
              <div className="mt-1">
                {d.active ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-zinc-700" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
