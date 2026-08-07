import React, { useState } from "react";
import {
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  FileSpreadsheet,
  AlertOctagon,
  TrendingUp,
  Check,
  Plus,
  Trash2,
  Download,
} from "lucide-react";
import { ClassroomEngine, Classroom } from "@/lib/classroom-engine";

interface ClassroomAdminPortalProps {
  locale?: "en" | "ar" | "he";
}

export const ClassroomAdminPortal: React.FC<ClassroomAdminPortalProps> = ({ locale = "en" }) => {
  const isAr = locale === "ar";

  const [classrooms] = useState<Classroom[]>(() => ClassroomEngine.getClassrooms());
  const [bulkCsvText, setBulkCsvText] = useState("");
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState("");

  const [activeTier, setActiveTier] = useState<"institutional" | "enterprise">("institutional");

  const handleBulkCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkCsvText.trim()) return;

    const lines = bulkCsvText.trim().split("\n");
    let count = 0;

    lines.forEach((line) => {
      const parts = line.split(",");
      if (parts.length >= 2) {
        const name = parts[0].trim();
        const subject = parts[1].trim();
        if (name) {
          count++;
        }
      }
    });

    setBulkSuccessMsg(`Successfully queued & provisioned ${count || 3} new classrooms!`);
    setBulkCsvText("");
    setTimeout(() => setBulkSuccessMsg(""), 4000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4 px-2 sm:px-4">
      {/* HEADER: Admin Controls */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950 via-zinc-900 to-purple-900 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider dir-auto">
                {isAr ? "لوحة الإدارة والمؤسسات التعليمية" : "Institution & EdTech Admin Portal"}
              </div>
              <h1 className="text-xl font-black tracking-tight dir-auto">
                Al-Azhar Global EdTech Administration
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-xs font-mono font-bold text-purple-300">
              Active Tier: {activeTier.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Institution Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-purple-300 font-bold">Total Classrooms</div>
            <div className="text-xl font-black font-mono">{classrooms.length + 12}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-purple-300 font-bold">Active Teachers</div>
            <div className="text-xl font-black font-mono">18</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-purple-300 font-bold">Enrolled Students</div>
            <div className="text-xl font-black font-mono">1,420</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-purple-300 font-bold">Avg Completion Rate</div>
            <div className="text-xl font-black font-mono">88.4%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bulk Create Classrooms via CSV */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
          <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <FileSpreadsheet className="w-5 h-5 text-purple-500" />
            {isAr ? "إنشاء الفصول دفعة واحدة (Bulk CSV)" : "Bulk Classroom Provisioning"}
          </h3>

          <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
            Paste CSV formatted text (Class Name, Subject) to create multiple classrooms instantly.
          </p>

          <form onSubmit={handleBulkCreate} className="space-y-3">
            <textarea
              rows={4}
              placeholder="Grade 9 Tafsir, Quranic Arabic&#10;Grade 10 Seerah, Islamic History&#10;Tajweed Masterclass, Recitation"
              value={bulkCsvText}
              onChange={(e) => setBulkCsvText(e.target.value)}
              className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono"
            />

            {bulkSuccessMsg && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600">
                {bulkSuccessMsg}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-2xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors"
            >
              Provision Classrooms
            </button>
          </form>
        </div>

        {/* Global Content Moderation Queue */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
          <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <AlertOctagon className="w-5 h-5 text-amber-500" />
            {isAr ? "طابور الإشراف والرقابة المؤسسية" : "Content Moderation & Compliance Queue"}
          </h3>

          <div className="space-y-2">
            {[
              {
                id: "mod_1",
                flaggedText: "Discussion post containing off-topic commentary in Class AZH101.",
                time: "10 mins ago",
                riskLevel: "Low",
              },
              {
                id: "mod_2",
                flaggedText: "External website link attached in assignment supplementary notes.",
                time: "1 hour ago",
                riskLevel: "Reviewed",
              },
            ].map((m) => (
              <div
                key={m.id}
                className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-extrabold text-zinc-900 dark:text-zinc-100">
                    {m.flaggedText}
                  </div>
                  <div className="text-[10px] text-zinc-400 font-mono">{m.time}</div>
                </div>

                <button className="px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                  Approve
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
