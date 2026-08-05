import React, { useState } from "react";
import { Bell, Clock, Calendar, Check, Volume2, Sparkles } from "lucide-react";
import {
  getHabitData,
  toggleReminder,
  type ReadingReminder,
  type HabitUserData,
} from "@/lib/habit-engine";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface ReadingRemindersCardProps {
  locale: string;
}

export const ReadingRemindersCard: React.FC<ReadingRemindersCardProps> = ({ locale }) => {
  const isAr = locale === "ar";
  const isHe = locale === "he";

  const [habitData, setHabitData] = useState<HabitUserData>(getHabitData());
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    const updated = toggleReminder(id);
    setHabitData(updated);
  };

  const handleTestNotification = () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("Noor Al Quran | 📖 Reading Reminder", {
          body: "It's time for your daily Quranic reflection and study session.",
          icon: "/favicon.ico",
        });
        setNotificationStatus(
          isAr
            ? "تم إرسال تذكير تجريبي 🎉"
            : isHe
              ? "נשלחה תזכורת בדיקה 🎉"
              : "Test reminder sent! 🎉",
        );
      } else {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            setNotificationStatus(
              isAr
                ? "تم تفعيل الإشعارات بنجاح"
                : isHe
                  ? "התראות הופעלו בהצלחה"
                  : "Notifications enabled!",
            );
          } else {
            setNotificationStatus(
              isAr
                ? "تذكير: الإشعارات محظورة في متصفحك"
                : isHe
                  ? "התראות חסומות בדפדפן"
                  : "Notifications blocked in browser settings.",
            );
          }
        });
      }
    } else {
      setNotificationStatus(
        isAr
          ? "التذكيرات النشطة تعمل داخل المنصة"
          : isHe
            ? "תזכורות פועלות בתוך הפלטפורמה"
            : "In-app reminders active",
      );
    }
  };

  return (
    <div className="rounded-3xl border border-cyan-500/30 bg-zinc-900 p-6 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white">
              {isAr
                ? "منبه المدارسة والتلاوة"
                : isHe
                  ? "תזכורות קריאה ולימוד"
                  : "Study & Reading Reminders"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isAr
                ? "تذكيرات منتظمة لمحافظتك على الأوراد اليومية"
                : isHe
                  ? "תזכורות קבועות לשמירה על סדר הלימוד היומי"
                  : "Scheduled reminders to maintain daily reading habits"}
            </p>
          </div>
        </div>

        <button
          onClick={handleTestNotification}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 text-xs font-bold transition-all"
        >
          {isAr ? "تجربة التذكير" : isHe ? "בדוק תזכורת" : "Test Reminder"}
        </button>
      </div>

      {notificationStatus && (
        <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs text-center font-medium">
          {notificationStatus}
        </div>
      )}

      <div className="space-y-3">
        {habitData.reminders.map((r) => {
          const title = isAr ? r.titleAr : isHe ? r.titleHe : r.titleEn;

          return (
            <div
              key={r.id}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                r.enabled
                  ? "bg-zinc-950 border-cyan-500/40 shadow-sm"
                  : "bg-zinc-950/40 border-zinc-800/80 opacity-60"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white">{title}</span>
                  <Badge className="bg-zinc-800 text-cyan-300 border-zinc-700 text-[10px] px-2 py-0.5 font-mono">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {r.time}
                  </Badge>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{r.days.join(", ")}</span>
                </div>
              </div>

              <Switch
                checked={r.enabled}
                onCheckedChange={() => handleToggle(r.id)}
                className="data-[state=checked]:bg-cyan-500"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
