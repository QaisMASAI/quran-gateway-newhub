import React, { useState } from "react";
import { Award, CheckCircle2, Gift, Sparkles, Trophy, Lock } from "lucide-react";
import { getHabitData, claimMilestoneReward, type KnowledgeMilestone, type HabitUserData } from "@/lib/habit-engine";
import { awardXP } from "@/lib/gamification";
import { Button } from "@/components/ui/button";

interface KnowledgeMilestonesProps {
  locale: string;
  onUpdate?: () => void;
}

export const KnowledgeMilestones: React.FC<KnowledgeMilestonesProps> = ({ locale, onUpdate }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const [habitData, setHabitData] = useState<HabitUserData>(getHabitData());
  const [claimedNotice, setClaimedNotice] = useState<string | null>(null);

  const handleClaim = (milestone: KnowledgeMilestone) => {
    const { data: updated, xpAwarded } = claimMilestoneReward(milestone.id);
    if (xpAwarded > 0) {
      awardXP(xpAwarded);
      setHabitData(updated);
      const title = isAr ? milestone.titleAr : isHe ? milestone.titleHe : milestone.titleEn;
      setClaimedNotice(
        isAr
          ? `تهانينا! حصلت على +${xpAwarded} XP لإنجاز "${title}" 🎉`
          : isHe
            ? `מזל טוב! קיבלת +${xpAwarded} XP עבור "${title}" 🎉`
            : `Congratulations! Claimed +${xpAwarded} XP for "${title}" 🎉`,
      );
      if (onUpdate) onUpdate();
    }
  };

  return (
    <div className="rounded-3xl border border-gold/30 bg-zinc-900 p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gold/10 text-gold border border-gold/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {isAr ? "محطات وإنجازات المعرفة" : isHe ? "אבני דרך והישגי ידע" : "Knowledge Milestones"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAr
                ? "محطات فارقة في رحلتك مع القرآن والسنة وعلوم الإسلام"
                : isHe
                  ? "ציוני דרך במסע הלימוד בקוראן ובסונה"
                  : "Key milestones achieved along your Quranic & Islamic study path"}
            </p>
          </div>
        </div>
      </div>

      {claimedNotice && (
        <div className="p-3 rounded-2xl bg-gold/10 border border-gold/30 text-gold text-xs text-center font-bold animate-fadeIn">
          {claimedNotice}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {habitData.milestones.map((m) => {
          const title = isAr ? m.titleAr : isHe ? m.titleHe : m.titleEn;
          const desc = isAr ? m.descAr : isHe ? m.descHe : m.descEn;
          const percent = Math.min(100, Math.round((m.currentCount / m.targetCount) * 100));

          return (
            <div
              key={m.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 ${
                m.claimed
                  ? "bg-zinc-950 border-gold/30 opacity-80"
                  : m.completed
                    ? "bg-gradient-to-br from-gold/10 to-zinc-950 border-gold shadow-md shadow-gold/10"
                    : "bg-zinc-950 border-zinc-800"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">{title}</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{desc}</p>
                </div>

                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-full bg-gold/20 text-gold font-black text-xs border border-gold/30">
                    +{m.xpReward} XP
                  </span>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-medium text-zinc-400">
                  <span>
                    {m.currentCount} / {m.targetCount}
                  </span>
                  <span>{percent}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-gold transition-all duration-500"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="pt-1 flex items-center justify-end">
                {m.claimed ? (
                  <span className="text-xs font-bold text-gold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {isAr ? "تم استلام المكافأة" : isHe ? "נאסף" : "Reward Claimed"}
                  </span>
                ) : m.completed ? (
                  <Button
                    onClick={() => handleClaim(m)}
                    size="sm"
                    className="bg-gold hover:bg-gold/90 text-zinc-950 font-black rounded-xl text-xs gap-1.5"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>{isAr ? "استلام المكافأة" : isHe ? "אסוף פרס" : "Claim Reward"}</span>
                  </Button>
                ) : (
                  <span className="text-xs text-zinc-500 flex items-center gap-1 font-medium">
                    <Lock className="w-3.5 h-3.5" />
                    {isAr ? "قيد التقدم" : isHe ? "בתהליך" : "In Progress"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
