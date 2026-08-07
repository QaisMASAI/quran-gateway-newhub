import React, { useState } from "react";
import {
  Users,
  Plus,
  BookOpen,
  FileCheck,
  Megaphone,
  MessageSquare,
  BarChart3,
  Trophy,
  Copy,
  Check,
  Settings,
  AlertTriangle,
  Send,
  Download,
  Search,
  Sparkles,
  ChevronRight,
  UserPlus,
  Lock,
  Layers,
  Trash2,
  Bookmark,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";
import {
  ClassroomEngine,
  Classroom,
  Assignment,
  StudentSubmission,
  ClassAnnouncement,
  DiscussionThread,
  StudentAnalyticsProfile,
  DEFAULT_ASSIGNMENT_TEMPLATES,
  AssignmentType,
} from "@/lib/classroom-engine";

interface TeacherPortalProps {
  locale?: "en" | "ar" | "he";
}

export const TeacherPortal: React.FC<TeacherPortalProps> = ({ locale = "en" }) => {
  const isAr = locale === "ar";

  // State Management
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => ClassroomEngine.getClassrooms());
  const [selectedClassId, setSelectedClassId] = useState<string>(classrooms[0]?.id || "cls_101");
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    ClassroomEngine.getAssignments(),
  );
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() =>
    ClassroomEngine.getSubmissions(),
  );
  const [announcements, setAnnouncements] = useState<ClassAnnouncement[]>(() =>
    ClassroomEngine.getAnnouncements(),
  );
  const [discussions, setDiscussions] = useState<DiscussionThread[]>(() =>
    ClassroomEngine.getDiscussions(),
  );

  const [activeTab, setActiveTab] = useState<
    | "roster"
    | "assignments"
    | "curation"
    | "gradebook"
    | "communication"
    | "analytics"
    | "leaderboard"
  >("roster");

  // Modals & Forms
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newClassSubject, setNewClassSubject] = useState("");
  const [newClassDesc, setNewClassDesc] = useState("");

  const [showCreateAssignmentModal, setShowCreateAssignmentModal] = useState(false);
  const [asgTitle, setAsgTitle] = useState("");
  const [asgDesc, setAsgDesc] = useState("");
  const [asgType, setAsgType] = useState<AssignmentType>("reading");
  const [asgPoints, setAsgPoints] = useState(100);
  const [asgDueDate, setAsgDueDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  );
  const [asgSurahId, setAsgSurahId] = useState(18);
  const [asgStartAyah, setAsgStartAyah] = useState(1);
  const [asgEndAyah, setAsgEndAyah] = useState(20);

  // Announcement Form
  const [ancTitle, setAncTitle] = useState("");
  const [ancBody, setAncBody] = useState("");

  // Copy Feedback
  const [copiedCode, setCopiedCode] = useState(false);

  // Selected Class
  const currentClass = classrooms.find((c) => c.id === selectedClassId) || classrooms[0];

  // Refresh helper
  const saveAndRefresh = () => {
    ClassroomEngine.saveClassrooms(classrooms);
    ClassroomEngine.saveAssignments(assignments);
    ClassroomEngine.saveSubmissions(submissions);
    ClassroomEngine.saveAnnouncements(announcements);
    ClassroomEngine.saveDiscussions(discussions);
  };

  // Handlers
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;

    const newCls: Classroom = {
      id: `cls_${Date.now()}`,
      teacherId: "tch_master_ahmed",
      teacherName: "Ustadh Ahmed Al-Mansoor",
      name: newClassName,
      subject: newClassSubject || "Quranic Studies",
      code: ClassroomEngine.generateJoinCode(),
      description: newClassDesc || "Interactive group learning environment.",
      students: ["std_1", "std_2", "std_3"],
      settings: {
        isPublic: true,
        allowPeerComparison: true,
        leaderboardEnabled: true,
        contentFilterLevel: "standard",
        allowRetries: true,
        lateSubmissionPenaltyPct: 10,
      },
      createdAt: new Date().toISOString(),
    };

    const updated = [newCls, ...classrooms];
    setClassrooms(updated);
    setSelectedClassId(newCls.id);
    setShowCreateClassModal(false);
    setNewClassName("");
    setNewClassSubject("");
    setNewClassDesc("");
    ClassroomEngine.saveClassrooms(updated);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim() || !selectedClassId) return;

    const newAsg: Assignment = {
      id: `asg_${Date.now()}`,
      classroomId: selectedClassId,
      title: asgTitle,
      description: asgDesc,
      contentType: asgType,
      content: {
        surahId: asgSurahId,
        startAyah: asgStartAyah,
        endAyah: asgEndAyah,
        targetVersesCount: asgEndAyah - asgStartAyah + 1,
      },
      dueDate: new Date(asgDueDate).toISOString(),
      pointsValue: Number(asgPoints),
      difficulty: "intermediate",
      createdAt: new Date().toISOString(),
    };

    const updated = [newAsg, ...assignments];
    setAssignments(updated);
    setShowCreateAssignmentModal(false);
    setAsgTitle("");
    setAsgDesc("");
    ClassroomEngine.saveAssignments(updated);
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancTitle.trim() || !ancBody.trim() || !selectedClassId) return;

    const newAnc: ClassAnnouncement = {
      id: `anc_${Date.now()}`,
      classroomId: selectedClassId,
      teacherId: "tch_master_ahmed",
      teacherName: "Ustadh Ahmed Al-Mansoor",
      title: ancTitle,
      body: ancBody,
      isPinned: false,
      postedAt: new Date().toISOString(),
    };

    const updated = [newAnc, ...announcements];
    setAnnouncements(updated);
    setAncTitle("");
    setAncBody("");
    ClassroomEngine.saveAnnouncements(updated);
  };

  const handleGradeEssay = (submissionId: string, gradeValue: number, feedbackText: string) => {
    const updated = submissions.map((s) => {
      if (s.id === submissionId) {
        return {
          ...s,
          grade: gradeValue,
          feedback: feedbackText,
          status: "graded" as const,
          reviewedAt: new Date().toISOString(),
          reviewedBy: "Ustadh Ahmed Al-Mansoor",
        };
      }
      return s;
    });
    setSubmissions(updated);
    ClassroomEngine.saveSubmissions(updated);
  };

  const handleCopyCode = (code: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const currentClassAssignments = assignments.filter((a) => a.classroomId === selectedClassId);

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4 px-2 sm:px-4">
      {/* HEADER: Teacher Class Selector & Quick Info */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-zinc-900 via-amber-950 to-zinc-900 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider dir-auto">
                {isAr
                  ? "بوابة المعلمين والتعليم الجماعي"
                  : "Teacher Portal • Group Learning Management"}
              </div>
              <h1 className="text-xl font-black tracking-tight dir-auto">{currentClass?.name}</h1>
            </div>
          </div>

          {/* Class Code Badge & Invite Button */}
          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-white/10 border border-white/20 flex items-center gap-2">
              <span className="text-xs text-zinc-300">Join Code:</span>
              <span className="font-mono font-black text-amber-400 text-base tracking-widest">
                {currentClass?.code}
              </span>
              <button
                onClick={() => handleCopyCode(currentClass?.code || "")}
                className="p-1 rounded-lg hover:bg-white/20 text-zinc-300 transition-colors"
                title="Copy Join Code"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <button
              onClick={() => setShowCreateClassModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500 text-zinc-950 font-black text-xs hover:bg-amber-400 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إنشاء فصل جديد" : "Create New Class"}</span>
            </button>
          </div>
        </div>

        {/* Class Selection Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {classrooms.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                selectedClassId === cls.id
                  ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-md"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10 border-white/10"
              }`}
            >
              {cls.name} ({cls.students.length} students)
            </button>
          ))}
        </div>
      </div>

      {/* PORTAL MAIN NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-200 dark:border-zinc-800">
        {[
          {
            id: "roster",
            label: isAr ? "قائمة الطلاب والإعدادات" : "Class Roster & Settings",
            icon: Users,
          },
          {
            id: "assignments",
            label: isAr ? "إدارة الواجبات والاختبارات" : "Assignments Manager",
            icon: FileCheck,
          },
          {
            id: "curation",
            label: isAr ? "المجموعات والملاحظات" : "Curated Content",
            icon: Bookmark,
          },
          {
            id: "gradebook",
            label: isAr ? "دفتر الدرجات والتصحيح" : "Gradebook & Grading",
            icon: BarChart3,
          },
          {
            id: "communication",
            label: isAr ? "الإعلانات والمناقشات" : "Communication Hub",
            icon: Megaphone,
          },
          {
            id: "analytics",
            label: isAr ? "تحليلات الأداء والإنذار المبكر" : "Student At-Risk Analytics",
            icon: AlertTriangle,
          },
          {
            id: "leaderboard",
            label: isAr ? "لوحة الصدارة والخصوصية" : "Leaderboard Settings",
            icon: Trophy,
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-amber-600 text-white border-amber-500 shadow-md"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CLASS ROSTER & SETTINGS */}
      {activeTab === "roster" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
                <Users className="w-5 h-5 text-amber-500" />
                {isAr ? "الطلاب المسجلون في الفصل" : "Enrolled Student Roster"} (
                {currentClass?.students.length})
              </h3>
              <button
                onClick={() => handleCopyCode(currentClass?.code || "")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 text-xs font-bold"
              >
                <UserPlus className="w-4 h-4" />
                <span>Invite Students via Code</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-400 font-mono uppercase">
                    <th className="py-3 px-2">Student Name</th>
                    <th className="py-3 px-2">ID</th>
                    <th className="py-3 px-2">Completed Asgs</th>
                    <th className="py-3 px-2">Avg Accuracy</th>
                    <th className="py-3 px-2">Engagement</th>
                    <th className="py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                  {currentClass?.students.map((stdId, idx) => {
                    const names = [
                      "Zaid Ibn Thabit",
                      "Aisha Al-Siddiqah",
                      "Omar Ibn Al-Khattab",
                      "Fatima Al-Zahra",
                      "Ali Ibn Abi Talib",
                      "Usama Ibn Zayd",
                    ];
                    const name = names[idx % names.length];
                    const analytics = ClassroomEngine.computeStudentAnalytics(
                      currentClass.id,
                      stdId,
                      name,
                    );

                    return (
                      <tr key={stdId} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                        <td className="py-3 px-2 font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                          <img
                            src={analytics.avatarUrl}
                            alt={name}
                            className="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 border border-amber-500/30"
                          />
                          <span>{name}</span>
                        </td>
                        <td className="py-3 px-2 font-mono text-zinc-400">{stdId}</td>
                        <td className="py-3 px-2 font-mono">
                          {analytics.assignmentsCompletedCount} / {analytics.totalAssignmentsCount}
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {analytics.avgQuizScorePct}%
                        </td>
                        <td className="py-3 px-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {analytics.engagementScore} / 100
                        </td>
                        <td className="py-3 px-2">
                          {analytics.isAtRisk ? (
                            <span className="px-2 py-1 rounded-lg bg-rose-500/10 text-rose-600 text-[10px] font-bold border border-rose-500/20">
                              At-Risk
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-bold border border-emerald-500/20">
                              Active
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNMENTS MANAGER */}
      {activeTab === "assignments" && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
            <div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
                <FileCheck className="w-5 h-5 text-amber-500" />
                {isAr ? "قائمة الواجبات والأنشطة" : "Class Assignments & Quizzes"}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
                {isAr
                  ? "إنشاء ومتابعة القراءة، الاختبارات التلقائية، والمقالات."
                  : "Manage active assignments, due dates, points, and template library."}
              </p>
            </div>

            <button
              onClick={() => setShowCreateAssignmentModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Assignment</span>
            </button>
          </div>

          {/* Template Reuse Cards */}
          <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 space-y-3">
            <h4 className="text-xs font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider flex items-center gap-2 dir-auto">
              <Sparkles className="w-4 h-4" />
              <span>
                {isAr ? "قوالب الواجبات الجاهزة للاستخدام" : "Reuse from Template Library"}
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DEFAULT_ASSIGNMENT_TEMPLATES.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-[10px] font-mono text-amber-600 font-bold uppercase">
                      {tpl.category}
                    </div>
                    <div className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 mt-1">
                      {tpl.title}
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setAsgTitle(tpl.title);
                      setAsgDesc(tpl.description);
                      setAsgType(tpl.contentType);
                      setAsgPoints(tpl.defaultPoints);
                      setShowCreateAssignmentModal(true);
                    }}
                    className="w-full py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold text-[11px] transition-colors"
                  >
                    Use This Template
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Assignments List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentClassAssignments.map((asg) => (
              <div
                key={asg.id}
                className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 text-[10px] font-mono font-bold uppercase">
                      {asg.contentType}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-400">
                      {asg.pointsValue} Points
                    </span>
                  </div>

                  <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 dir-auto">
                    {asg.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 dir-auto">
                    {asg.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-mono">
                  <span>Due: {new Date(asg.dueDate).toLocaleDateString()}</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">Active</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GRADEBOOK & GRADING */}
      {activeTab === "gradebook" && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                  {isAr ? "دفتر الدرجات التفاعلي" : "Interactive Gradebook Spreadsheet View"}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
                  {isAr
                    ? "تتبع الدرجات والمراجعة اليدوية والدرجات التلقائية."
                    : "Real-time auto-graded quizzes and manual essay review queue."}
                </p>
              </div>

              <button
                onClick={() => {
                  const csvData = ClassroomEngine.exportGradebookCsv(selectedClassId);
                  const blob = new Blob([csvData], { type: "text/csv" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `gradebook_${selectedClassId}.csv`;
                  a.click();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export CSV Gradebook</span>
              </button>
            </div>

            {/* Pending Submissions Grading Queue */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider dir-auto">
                {isAr ? "قائمة المقالات بانتظار التصحيح اليدوي" : "Pending Manual Grading Queue"}
              </h4>

              {submissions
                .filter((s) => s.status === "pending")
                .map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-amber-800 dark:text-amber-200">
                        Submitted by: {sub.studentName}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 italic p-3 rounded-xl bg-white/60 dark:bg-zinc-900/60 border border-zinc-200/50 dark:border-zinc-800/50">
                      "{sub.submission.essayText}"
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="number"
                        placeholder="Grade (0-100)"
                        id={`grade_${sub.id}`}
                        className="w-32 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs font-mono"
                      />
                      <input
                        type="text"
                        placeholder="Teacher Feedback..."
                        id={`feedback_${sub.id}`}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs"
                      />
                      <button
                        onClick={() => {
                          const gradeEl = document.getElementById(
                            `grade_${sub.id}`,
                          ) as HTMLInputElement;
                          const feedbackEl = document.getElementById(
                            `feedback_${sub.id}`,
                          ) as HTMLInputElement;
                          handleGradeEssay(
                            sub.id,
                            Number(gradeEl?.value || 85),
                            feedbackEl?.value || "Good effort!",
                          );
                        }}
                        className="px-4 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
                      >
                        Submit Grade & Feedback
                      </button>
                    </div>
                  </div>
                ))}

              {submissions.filter((s) => s.status === "pending").length === 0 && (
                <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 text-center text-xs text-zinc-400">
                  All submissions graded! No pending items in queue.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COMMUNICATION HUB */}
      {activeTab === "communication" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Post Class Announcement */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
              <Megaphone className="w-5 h-5 text-amber-500" />
              {isAr ? "إطلاق إعلان للفصل" : "Post Class Announcement"}
            </h3>

            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <input
                type="text"
                placeholder="Announcement Title..."
                value={ancTitle}
                onChange={(e) => setAncTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
              />
              <textarea
                placeholder="Write message to students..."
                rows={3}
                value={ancBody}
                onChange={(e) => setAncBody(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-900 dark:text-zinc-100"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
              >
                Broadcast Announcement
              </button>
            </form>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider dir-auto">
                Active Announcements
              </h4>
              {announcements.map((anc) => (
                <div
                  key={anc.id}
                  className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 space-y-1"
                >
                  <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                    {anc.title}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{anc.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Discussion Threads */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
            <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              {isAr ? "منتدى المناقشات والإجابات" : "Classroom Discussion Forum"}
            </h3>

            <div className="space-y-3">
              {discussions.map((disc) => (
                <div
                  key={disc.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100">
                      {disc.title}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">{disc.authorName}</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{disc.content}</p>

                  <div className="pt-2 space-y-1">
                    {disc.replies.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs"
                      >
                        <span className="font-bold text-amber-700 dark:text-amber-300">
                          {rep.authorName}:{" "}
                        </span>
                        <span>{rep.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: AT-RISK ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
          <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            {isAr
              ? "نظام التنبؤ بالطلاب الأكثر عرضة للتراجع"
              : "Automated At-Risk Student Diagnostic System"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentClass?.students.map((stdId, idx) => {
              const names = [
                "Zaid Ibn Thabit",
                "Aisha Al-Siddiqah",
                "Omar Ibn Al-Khattab",
                "Fatima Al-Zahra",
                "Ali Ibn Abi Talib",
              ];
              const name = names[idx % names.length];
              const analytics = ClassroomEngine.computeStudentAnalytics(
                currentClass.id,
                stdId,
                name,
              );

              return (
                <div
                  key={stdId}
                  className={`p-4 rounded-2xl border space-y-2 ${
                    analytics.isAtRisk
                      ? "bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-200"
                      : "bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-200"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span>{name}</span>
                    <span>Engagement: {analytics.engagementScore}/100</span>
                  </div>

                  {analytics.isAtRisk ? (
                    <div className="text-[11px] font-medium text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>{analytics.atRiskReason}</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-600 dark:text-emerald-400">
                      Performing on track. Completion rate: {analytics.completionRatePct}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE CLASS MODAL */}
      {showCreateClassModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100">
              Create New Classroom
            </h3>

            <form onSubmit={handleCreateClass} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-500 block mb-1">Class Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Advanced Tafsir 202"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-500 block mb-1">Subject</label>
                <input
                  type="text"
                  placeholder="e.g., Quranic Studies & Tajweed"
                  value={newClassSubject}
                  onChange={(e) => setNewClassSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-500 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Course objectives and expectations..."
                  value={newClassDesc}
                  onChange={(e) => setNewClassDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateClassModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700"
                >
                  Create Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE ASSIGNMENT MODAL */}
      {showCreateAssignmentModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <h3 className="font-black text-base text-zinc-900 dark:text-zinc-100">
              Create Class Assignment
            </h3>

            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-zinc-500 block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Assignment Title..."
                  value={asgTitle}
                  onChange={(e) => setAsgTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="font-bold text-zinc-500 block mb-1">Type</label>
                <select
                  value={asgType}
                  onChange={(e) => setAsgType(e.target.value as AssignmentType)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono"
                >
                  <option value="reading">Reading Assignment (Surah & Verses)</option>
                  <option value="quiz">Auto-Graded Quiz</option>
                  <option value="essay">Reflection Essay</option>
                  <option value="discussion">Discussion Thread</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-zinc-500 block mb-1">
                  Description / Instructions
                </label>
                <textarea
                  rows={2}
                  placeholder="Instructions for students..."
                  value={asgDesc}
                  onChange={(e) => setAsgDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-zinc-500 block mb-1">Points Value</label>
                  <input
                    type="number"
                    value={asgPoints}
                    onChange={(e) => setAsgPoints(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-zinc-500 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={asgDueDate}
                    onChange={(e) => setAsgDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateAssignmentModal(false)}
                  className="flex-1 py-2 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
