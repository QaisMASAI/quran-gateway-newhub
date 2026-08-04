import React, { useState } from "react";
import { BookOpen, Target, Plus, CheckCircle2, Award, Edit2 } from "lucide-react";
import { getHabitData, updateGoals, logAyahReadProgress, type HabitUserData } from "@/lib/habit-engine";
import { Button } from "@/components/ui/button";

interface ReadingGoalsCardProps {
  locale: string;
  onUpdate?: () => void;
}

export const ReadingGoalsCard: React.FC<ReadingGoalsCardProps> = ({ locale, onUpdate }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const [habitData, setHabitData] = useState<HabitUserData>(getHabitData());
  const [isEditing, setIsEditing] = useState(false);
  const [newTarget, setNewTarget] = useState(habitData.goals.dailyAyahTarget);

  const { dailyAyahTarget, dailyAyahsRead } = habitData.goals;
  const progressPercent = Math.min(100, Math.round((dailyAyahsRead / Math.max(1, dailyAyahTarget)) * 100));
  const isCompleted = dailyAyahsRead >= dailyAyahTarget;

  const handleSimulateRead = () => {
    const updated = logAyahReadProgress(2); // Read 2 ayahs
    setHabitData(updated);
    if (onUpdate) onUpdate();
  };

  const handleSaveTarget = () => {
    const updated = updateGoals(newTarget, habitData.goals.dailyResearchTarget);
    setHabitData(updated);
    setIsEditing(false);
    if (onUpdate) onUpdate();
  };

  return (
    <div className="rounded-3xl border border-emerald-500/30 bg-zinc-900 p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {isAr ? "هدف القراءة اليومي" : isHe ? "יעד קריאה יומי" : "Daily Reading Goal"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAr
                ? "حدد عدد الآيات المستهدفة لقراءتها يومياً"
                : isHe
                  ? "הגדר מספר פסוקים לקריאה יומית"
                  : "Target number of Quranic verses to read each day"}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      {isEditing ? (
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3">
          <label className="block text-xs font-semibold text-zinc-300">
            {isAr ? "الهدف اليومي (عدد الآيات):" : isHe ? "יעד יומי (מספר פסוקים):" : "Daily Target (Ayahs):"}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="200"
              value={newTarget}
              onChange={(e) => setNewTarget(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold text-center focus:outline-none focus:border-emerald-500"
            />
            <Button
              onClick={handleSaveTarget}
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-xl text-xs"
            >
              {isAr ? "حفظ" : isHe ? "שמור" : "Save"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-zinc-200">
              <Target className="w-4 h-4 text-emerald-400" />
              <span>
                {dailyAyahsRead} / {dailyAyahTarget}{" "}
                {isAr ? "آية تم قراءتها" : isHe ? "פסוקים נקראו" : "Ayahs Read"}
              </span>
            </div>
            <span
              className={`font-black ${
                isCompleted ? "text-emerald-400" : "text-zinc-400"
              }`}
            >
              {progressPercent}%
            </span>
          </div>

          <div className="h-3 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-md shadow-emerald-500/30"
                  : "bg-emerald-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-400">
              {isCompleted
                ? isAr
                  ? "إنجاز رائع! حققت هدفك اليوم 🌟"
                  : isHe
                    ? "הישג מצוין! השלמת את היעד 🌟"
                    : "Goal Reached! Excellent dedication 🌟"
                : isAr
                  ? `باقي ${dailyAyahTarget - dailyAyahsRead} آية لتحقيق الهدف`
                  : isHe
                    ? `נותרו עוד ${dailyAyahTarget - dailyAyahsRead} פסוקים`
                    : `${dailyAyahTarget - dailyAyahsRead} ayahs remaining today`}
            </span>

            <Button
              onClick={handleSimulateRead}
              size="sm"
              variant="outline"
              className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 rounded-xl text-xs gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? "تسجيل تلاوة آيتين" : isHe ? "רשום 2 פסוקים" : "+ Log 2 Ayahs"}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
