import React from "react";
import {
  Bookmark,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import type { UserStats } from "@/lib/gamification";
import { getLearningRecommendations } from "@/lib/gamification";

interface BookmarksHistoryViewProps {
  stats: UserStats;
  locale: "en" | "ar" | "he";
}

export const BookmarksHistoryView: React.FC<BookmarksHistoryViewProps> = ({ stats, locale }) => {
  const rec = getLearningRecommendations(stats);
  const recText = locale === "ar" ? rec.reasonAr : locale === "he" ? rec.reasonHe : rec.reasonEn;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 py-4">
      {/* AI Recommendation Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-xl flex items-start gap-4">
        <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md shrink-0">
          <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-base uppercase tracking-wider text-emerald-100 dir-auto">
            {locale === "ar"
              ? "توصيات المحرك الذكي للتفوق"
              : locale === "he"
                ? "המלצת AI מותאמת אישית"
                : "AI Personalized Learning Insight"}
          </h3>
          <p className="text-sm font-medium leading-relaxed dir-auto">{recText}</p>
        </div>
      </div>

      {/* Bookmarks Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
          <Bookmark className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span>
            {locale === "ar"
              ? "المحفوظات والمرجعيات الخاصة"
              : locale === "he"
                ? "סימניות שמורות"
                : "Saved Bookmarks & Citations"}
          </span>
        </h3>

        {stats.bookmarks.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-sm text-zinc-500 dir-auto">
            {locale === "ar"
              ? "لم تقم بحفظ أي أسئلة أو آيات بعد. انقر على أيقونة الإشارة المرجعية أثناء اللعب للحفظ."
              : locale === "he"
                ? "לא שמרת סימניות עדיין."
                : "No bookmarks saved yet. Click the bookmark icon during gameplay to save questions."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2"
              >
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 dir-auto">
                  {bm.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold dir-auto">
                  <span>{bm.citation}</span>
                  <span className="text-zinc-400 font-normal">
                    {new Date(bm.savedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Study History Log */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
          <Clock className="w-5 h-5 text-emerald-500" />
          <span>
            {locale === "ar"
              ? "سجل محاولات التعلم والأداء"
              : locale === "he"
                ? "היסטוריית לימוד"
                : "Recent Study History"}
          </span>
        </h3>

        {stats.studyHistory.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 text-center text-sm text-zinc-500 dir-auto">
            {locale === "ar"
              ? "سيظهر سجل إجاباتك هنا فور بدء الألعاب والتحديات."
              : locale === "he"
                ? "ההיסטוריה תופיע כאן לאחר שתתחיל."
                : "Your answer history log will appear here after taking quizzes."}
          </div>
        ) : (
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800">
            {stats.studyHistory.slice(0, 15).map((entry) => (
              <div key={entry.id} className="p-3.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  {entry.correct ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-500 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200 dir-auto block">
                      {entry.questionTitle}
                    </span>
                    <span className="text-xs text-zinc-400 uppercase dir-auto">
                      {entry.mode.replace("_", " ")} •{" "}
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="text-right font-bold text-xs">
                  {entry.correct ? (
                    <span className="text-emerald-600 dark:text-emerald-400">
                      +{entry.xpEarned} XP
                    </span>
                  ) : (
                    <span className="text-rose-500">0 XP</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
