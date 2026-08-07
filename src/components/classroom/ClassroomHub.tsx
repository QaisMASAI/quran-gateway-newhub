import React, { useState } from "react";
import { GraduationCap, UserCheck, ShieldCheck, Sparkles, Layers } from "lucide-react";
import { TeacherPortal } from "./TeacherPortal";
import { StudentClassroomMode } from "./StudentClassroomMode";
import { ClassroomAdminPortal } from "./ClassroomAdminPortal";

interface ClassroomHubProps {
  locale?: "en" | "ar" | "he";
}

export const ClassroomHub: React.FC<ClassroomHubProps> = ({ locale = "en" }) => {
  const isAr = locale === "ar";
  const [portalRole, setPortalRole] = useState<"teacher" | "student" | "admin">("teacher");

  return (
    <div className="w-full space-y-6">
      {/* MODE SWITCHER BANNER */}
      <div className="w-full max-w-6xl mx-auto p-4 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-2xl bg-amber-500/10 text-amber-600">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-black text-sm text-zinc-900 dark:text-zinc-100 dir-auto">
              {isAr ? "منصة الفصول الدراسية والتعليم الجماعي" : "Classroom Mode & Teacher Portal"}
            </h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 dir-auto">
              {isAr
                ? "تبديل الدور للاختبار بين المعلم، الطالب، وإدارة المؤسسة."
                : "Switch active role below to explore Teacher tools, Student assignment mode, or Admin controls."}
            </p>
          </div>
        </div>

        {/* Role Toggle Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
          <button
            onClick={() => setPortalRole("teacher")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              portalRole === "teacher"
                ? "bg-amber-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Teacher Portal</span>
          </button>

          <button
            onClick={() => setPortalRole("student")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              portalRole === "student"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Student Mode</span>
          </button>

          <button
            onClick={() => setPortalRole("admin")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
              portalRole === "admin"
                ? "bg-purple-600 text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Portal</span>
          </button>
        </div>
      </div>

      {/* RENDER ACTIVE ROLE PORTAL */}
      {portalRole === "teacher" && <TeacherPortal locale={locale} />}
      {portalRole === "student" && <StudentClassroomMode locale={locale} />}
      {portalRole === "admin" && <ClassroomAdminPortal locale={locale} />}
    </div>
  );
};
