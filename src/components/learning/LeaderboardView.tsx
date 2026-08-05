import React, { useState } from "react";
import {
  Users,
  Heart,
  Sparkles,
  Shield,
  Award,
  Send,
  CheckCircle2,
  Flame,
  BookOpen,
} from "lucide-react";
import type { UserStats } from "@/lib/gamification";

interface LeaderboardViewProps {
  userStats: UserStats;
  locale: "en" | "ar" | "he";
}

interface CircleMember {
  id: string;
  name: string;
  title: string;
  streak: number;
  contributionXP: number;
  lastActive: string;
}

const MOCK_CIRCLE_MEMBERS: CircleMember[] = [
  {
    id: "1",
    name: "طارق بن زياد",
    title: "صاحب القرآن",
    streak: 28,
    contributionXP: 850,
    lastActive: "منذ ساعة",
  },
  {
    id: "2",
    name: "فاطمة الفهرية",
    title: "طالبة العلم",
    streak: 21,
    contributionXP: 720,
    lastActive: "منذ ساعتين",
  },
  {
    id: "3",
    name: "ابن سينا الباحث",
    title: "متقن التفسير",
    streak: 14,
    contributionXP: 690,
    lastActive: "منذ 4 ساعات",
  },
  {
    id: "4",
    name: "عائشة بنت أحمد",
    title: "حافظة السنة",
    streak: 19,
    contributionXP: 540,
    lastActive: "أمس",
  },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ userStats, locale }) => {
  const [blessingsSent, setBlessingsSent] = useState<Record<string, boolean>>({});

  const handleSendBarakah = (memberId: string) => {
    setBlessingsSent((prev) => ({ ...prev, [memberId]: true }));
  };

  const isAr = locale === "ar";
  const isHe = locale === "he";

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 py-4">
      {/* Circle Banner - Islamic Sincerity & Collaboration */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-white/5 skew-x-12" />
        <div className="space-y-2 relative z-10 text-center sm:text-start">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider backdrop-blur-md inline-block">
            {isAr
              ? "حلقة التعلم الجماعي والتعاون على البر"
              : isHe
                ? "מעגל למידה שיתופי"
                : "Collaborative Study Circle"}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black dir-auto">
            {isAr
              ? "حلقة النور والذكر الحكيم"
              : isHe
                ? "מעגל האור והחכמה"
                : "Circle of Light & Wisdom"}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 dir-auto max-w-xl">
            {isAr
              ? "﴿وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَىٰ﴾ - حلقة خالية من التفاخر والمباهاة، تهدف للتعاون والتواصي بالحق واستدامة التعلم."
              : isHe
                ? "מעגל המבוסס על ערכי עזרה הדדית, למידה משותפת ותמיכה רוחנית."
                : "Collaborative learning circle focused on mutual encouragement, reflection, and shared knowledge goals."}
          </p>
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 min-w-[130px]">
          <Users className="w-10 h-10 text-emerald-300 mb-1" />
          <span className="text-xs font-bold text-emerald-200">
            {isAr ? "هدف الحلقة: 5,000 آية" : isHe ? "יעד: 5,000 פסוקים" : "Goal: 5,000 Verses"}
          </span>
        </div>
      </div>

      {/* Circle Collaborative Goal Progress */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
          <span className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-emerald-600" />
            {isAr
              ? "إجمالي الآيات المتدبرة جماعياً هذا الأسبوع"
              : isHe
                ? "פסוקים שנלמדו השבוע"
                : "Total Verses Studied Together"}
          </span>
          <span className="text-emerald-600 font-mono">3,480 / 5,000 XP</span>
        </div>
        <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-[70%]" />
        </div>
      </div>

      {/* Member Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          {isAr ? "أعضاء الحلقة والرفاق" : isHe ? "חברי מעגל הלימוד" : "Study Circle Companions"}
        </h3>

        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
          {MOCK_CIRCLE_MEMBERS.map((member) => (
            <div
              key={member.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-sm border border-emerald-500/20">
                  {member.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 dir-auto">
                    {member.name}
                  </h4>
                  <span className="text-[10px] text-zinc-400 dir-auto flex items-center gap-2 mt-0.5">
                    <span>{member.title}</span> •
                    <span className="text-amber-600 flex items-center gap-0.5">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" /> {member.streak}{" "}
                      {isAr ? "يوم ثبات" : "day streak"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleSendBarakah(member.id)}
                  disabled={blessingsSent[member.id]}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    blessingsSent[member.id]
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                  }`}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${blessingsSent[member.id] ? "fill-emerald-600" : ""}`}
                  />
                  <span>
                    {blessingsSent[member.id]
                      ? isAr
                        ? "أُرسلت الدعوات"
                        : "Du'a Sent"
                      : isAr
                        ? "أرسل دعوة بركة"
                        : "Send Barakah"}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
