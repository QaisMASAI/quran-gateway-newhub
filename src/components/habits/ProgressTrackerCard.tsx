import React from "react";
import { Link } from "@tanstack/react-router";
import { Compass, BookOpen, ScrollText, PlayCircle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProgressTrackerCardProps {
  locale: string;
}

export const ProgressTrackerCard: React.FC<ProgressTrackerCardProps> = ({ locale }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const items = [
    {
      id: "prog_quran",
      titleEn: "Quranic Recitation Progress",
      titleAr: "تقدم تلاوة القرآن الكريم",
      titleHe: "התקדמות קריאת הקוראן",
      completed: 180,
      total: 6236,
      unitEn: "Ayahs",
      unitAr: "آية",
      unitHe: "פסוקים",
      link: "/surahs",
      color: "from-emerald-500 to-teal-400",
    },
    {
      id: "prog_hadith",
      titleEn: "Prophetic Traditions Explored",
      titleAr: "جوامع الحديث النبوي المكتشفة",
      titleHe: "חדית'ים שנחקרו",
      completed: 25,
      total: 100,
      unitEn: "Hadiths",
      unitAr: "حديثاً",
      unitHe: "חדית'ים",
      link: "/hadith",
      color: "from-amber-500 to-gold",
    },
    {
      id: "prog_journeys",
      titleEn: "Islamic Knowledge Journeys",
      titleAr: "المسارات المعرفية المكتملة",
      titleHe: "מסלולי למידה הושלמו",
      completed: 2,
      total: 5,
      unitEn: "Journeys",
      unitAr: "مسارات",
      unitHe: "מסלולים",
      link: "/learn/journeys",
      color: "from-purple-500 to-indigo-400",
    },
  ];

  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {isAr ? "مؤشرات التقدم والتحصيل" : isHe ? "מדדי התקדמות והישגים" : "Overall Educational Progress Tracking"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAr
                ? "متابعة المكتمل والمتبقي في السور، الأحاديث، والمسارات التعليمية"
                : isHe
                  ? "מעקב אחר התקדמות בסורות, חדית'ים ומסלולים"
                  : "Track completed vs remaining items across Quran, Hadith & Journeys"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const percent = Math.min(100, Math.round((item.completed / item.total) * 100));
          const title = isAr ? item.titleAr : isHe ? item.titleHe : item.titleEn;
          const unit = isAr ? item.unitAr : isHe ? item.unitHe : item.unitEn;

          return (
            <div key={item.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-white">
                <span>{title}</span>
                <span className="text-zinc-400 font-mono">
                  {item.completed} / {item.total} {unit} ({percent}%)
                </span>
              </div>

              <div className="h-2.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${item.color} transition-all duration-500`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-400">
                <span>
                  {isAr ? "معدل الإنجاز مستمر" : isHe ? "קצב הלמידה רציף" : "Consistent progress speed"}
                </span>

                <Link
                  to={item.link}
                  className="font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>{isAr ? "متابعة التعلم" : isHe ? "המשך בלמידה" : "Continue"}</span>
                  <PlayCircle className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
