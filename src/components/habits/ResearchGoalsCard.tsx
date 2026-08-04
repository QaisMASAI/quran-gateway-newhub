import React, { useState } from "react";
import { Sparkles, Compass, Plus, Edit2, Target } from "lucide-react";
import { getHabitData, updateGoals, logResearchQuery, type HabitUserData } from "@/lib/habit-engine";
import { Button } from "@/components/ui/button";

interface ResearchGoalsCardProps {
  locale: string;
  onUpdate?: () => void;
}

export const ResearchGoalsCard: React.FC<ResearchGoalsCardProps> = ({ locale, onUpdate }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const [habitData, setHabitData] = useState<HabitUserData>(getHabitData());
  const [isEditing, setIsEditing] = useState(false);
  const [newTarget, setNewTarget] = useState(habitData.goals.dailyResearchTarget);

  const { dailyResearchTarget, dailyResearchDone } = habitData.goals;
  const progressPercent = Math.min(
    100,
    Math.round((dailyResearchDone / Math.max(1, dailyResearchTarget)) * 100),
  );
  const isCompleted = dailyResearchDone >= dailyResearchTarget;

  const handleSimulateResearch = () => {
    const updated = logResearchQuery();
    setHabitData(updated);
    if (onUpdate) onUpdate();
  };

  const handleSaveTarget = () => {
    const updated = updateGoals(habitData.goals.dailyAyahTarget, newTarget);
    setHabitData(updated);
    setIsEditing(false);
    if (onUpdate) onUpdate();
  };

  return (
    <div className="rounded-3xl border border-purple-500/30 bg-zinc-900 p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {isAr ? "هدف البحث والتأمل اليومي" : isHe ? "יעד מחקר והרהור יומי" : "Research & Study Goal"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAr
                ? "طرح أسئلة، مقارنة التفاسير، واستكشاف علوم الأثر"
                : isHe
                  ? "שאילת שאלות, השוואת תפסירים וחקר חדית'"
                  : "Target AI queries, Tafsir comparisons & Hadith studies"}
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
            {isAr
              ? "الهدف البحثي اليومي (عدد الاستعلامات):"
              : isHe
                ? "יעד מחקר יומי (מספר שאילתות):"
                : "Daily Research Target (Queries):"}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max="50"
              value={newTarget}
              onChange={(e) => setNewTarget(Number(e.target.value))}
              className="w-24 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-bold text-center focus:outline-none focus:border-purple-500"
            />
            <Button
              onClick={handleSaveTarget}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-xl text-xs"
            >
              {isAr ? "حفظ" : isHe ? "שמור" : "Save"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-zinc-200">
              <Compass className="w-4 h-4 text-purple-400" />
              <span>
                {dailyResearchDone} / {dailyResearchTarget}{" "}
                {isAr ? "أبحاث مكتملة" : isHe ? "שאילתות הושלמו" : "Queries Completed"}
              </span>
            </div>
            <span
              className={`font-black ${
                isCompleted ? "text-purple-400" : "text-zinc-400"
              }`}
            >
              {progressPercent}%
            </span>
          </div>

          <div className="h-3 rounded-full bg-zinc-950 overflow-hidden border border-zinc-800">
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted
                  ? "bg-gradient-to-r from-purple-500 to-indigo-400 shadow-md shadow-purple-500/30"
                  : "bg-purple-500"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-zinc-400">
              {isCompleted
                ? isAr
                  ? "ممتاز! أتممت هدف البحث اليوم 🧠"
                  : isHe
                    ? "מעולה! השלמת את יעד המחקר היומי 🧠"
                    : "Research Goal Met! Excellent inquiry 🧠"
                : isAr
                  ? `باقي ${dailyResearchTarget - dailyResearchDone} استعلامات بحثية`
                  : isHe
                    ? `נותרו עוד ${dailyResearchTarget - dailyResearchDone} שאילתות`
                    : `${dailyResearchTarget - dailyResearchDone} research queries remaining`}
            </span>

            <Button
              onClick={handleSimulateResearch}
              size="sm"
              variant="outline"
              className="border-purple-500/40 text-purple-300 hover:bg-purple-500/10 rounded-xl text-xs gap-1.5 h-8"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? "تسجيل بحث ذكي" : isHe ? "רשום שאילתת מחקר" : "+ Log Research"}</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
