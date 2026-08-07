import React, { useState } from "react";
import {
  Compass,
  BookOpen,
  Award,
  CheckCircle2,
  Lock,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import {
  LEARNING_WORLDS_CATALOG,
  type LearningWorld,
  type WorldId,
  awardXpEngine,
  type UserGameification,
} from "@/lib/gamification-engine-v2";

interface LearningWorldsExplorerProps {
  data: UserGameification;
  onUpdate: (updated: UserGameification) => void;
  locale?: "en" | "ar" | "he";
}

export const LearningWorldsExplorer: React.FC<LearningWorldsExplorerProps> = ({
  data,
  onUpdate,
  locale = "en",
}) => {
  const isAr = locale === "ar";
  const [activeWorldId, setActiveWorldId] = useState<WorldId>("quranic_mastery");
  const [activeBossModal, setActiveBossModal] = useState<LearningWorld["bossChallenge"] | null>(
    null,
  );

  const activeWorld =
    LEARNING_WORLDS_CATALOG.find((w) => w.id === activeWorldId) || LEARNING_WORLDS_CATALOG[0];

  const handleCompleteBoss = () => {
    if (!activeBossModal) return;
    const updated = awardXpEngine(data, activeBossModal.xpReward, "challenge", activeWorldId);
    updated.worldProgress[activeWorldId] = Math.min(
      100,
      (updated.worldProgress[activeWorldId] || 0) + 25,
    );
    onUpdate({ ...updated });
    setActiveBossModal(null);
    alert(`Boss Challenge Passed! Awarded +${activeBossModal.xpReward} Challenge XP!`);
  };

  return (
    <div className="space-y-6">
      {/* Worlds Selection Tabs */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
        <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
          <Compass className="w-5 h-5 text-indigo-500" />
          {isAr ? "عوالم التعلم الستة" : "6 Learning Worlds"}
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {LEARNING_WORLDS_CATALOG.map((world) => {
            const isActive = world.id === activeWorldId;
            const progress = data.worldProgress[world.id] || 0;
            return (
              <button
                key={world.id}
                onClick={() => setActiveWorldId(world.id)}
                className={`p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md ring-2 ring-indigo-500/30"
                    : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100"
                }`}
              >
                <div className="text-2xl">{world.icon}</div>
                <div>
                  <div className="font-extrabold text-xs line-clamp-1 dir-auto">
                    {isAr ? world.nameAr : world.name}
                  </div>
                  <div className="text-[10px] opacity-80 font-mono mt-0.5">
                    {progress}% Complete
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active World Details */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{activeWorld.icon}</span>
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 dir-auto">
                {isAr ? activeWorld.nameAr : activeWorld.name}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
                {activeWorld.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveBossModal(activeWorld.bossChallenge)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{isAr ? "اختبار القمة (Boss Challenge)" : "Boss Challenge Exam"}</span>
          </button>
        </div>

        {/* Learning Paths in World */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider dir-auto">
            {isAr ? "مسارات العالم (20-40 ساعة لكل مسار)" : "Learning Paths (20-40 Hours Each)"}
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeWorld.paths.map((path) => (
              <div
                key={path.id}
                className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h5 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 dir-auto">
                    {path.title}
                  </h5>
                  <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    ~{path.estimatedHours} hrs
                  </span>
                </div>

                <div className="space-y-2">
                  {path.nodes.map((node) => (
                    <div
                      key={node.id}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 dir-auto">
                        {node.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        ) : node.unlocked ? (
                          <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
                        ) : (
                          <Lock className="w-4 h-4 text-zinc-400 shrink-0" />
                        )}
                        <span
                          className={
                            node.completed
                              ? "line-through text-zinc-400"
                              : "font-bold text-zinc-800 dark:text-zinc-200"
                          }
                        >
                          {node.title}
                        </span>
                      </div>
                      {node.isBossChallenge && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 font-bold text-[10px]">
                          Boss
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Boss Challenge Modal */}
      {activeBossModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-indigo-600" />
              <div>
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 dir-auto">
                  {activeBossModal.title}
                </h3>
                <span className="text-xs font-bold text-indigo-600">
                  Reward: +{activeBossModal.xpReward} Challenge XP
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 dir-auto leading-relaxed">
              {activeBossModal.description}
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setActiveBossModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-100"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteBoss}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Start Final Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
