import React, { useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  FileText,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Trophy,
  User,
  Send,
  AlertCircle,
  Calendar,
  Layers,
  ChevronRight,
  Check,
  Zap,
  Bookmark,
} from "lucide-react";
import {
  ClassroomEngine,
  Classroom,
  Assignment,
  StudentSubmission,
  ClassAnnouncement,
  DiscussionThread,
} from "@/lib/classroom-engine";

interface StudentClassroomModeProps {
  studentId?: string;
  studentName?: string;
  locale?: "en" | "ar" | "he";
}

export const StudentClassroomMode: React.FC<StudentClassroomModeProps> = ({
  studentId = "std_1",
  studentName = "Zaid Ibn Thabit",
  locale = "en",
}) => {
  const isAr = locale === "ar";

  // Data State
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => ClassroomEngine.getClassrooms());
  const [activeClassId, setActiveClassId] = useState<string>(classrooms[0]?.id || "cls_101");
  const [assignments, setAssignments] = useState<Assignment[]>(() =>
    ClassroomEngine.getAssignments(),
  );
  const [submissions, setSubmissions] = useState<StudentSubmission[]>(() =>
    ClassroomEngine.getSubmissions(),
  );
  const [announcements] = useState<ClassAnnouncement[]>(() => ClassroomEngine.getAnnouncements());
  const [discussions, setDiscussions] = useState<DiscussionThread[]>(() =>
    ClassroomEngine.getDiscussions(),
  );

  // Tabs
  const [activeTab, setActiveTab] = useState<
    "assignments" | "syllabus" | "discussions" | "grades" | "announcements"
  >("assignments");
  const [asgFilter, setAsgFilter] = useState<"all" | "pending" | "completed">("all");

  // Join Class Code State
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinSuccessMsg, setJoinSuccessMsg] = useState("");

  // Selected Working Assignment
  const [selectedAsg, setSelectedAsg] = useState<Assignment | null>(null);
  const [quizSelectedAnswers, setQuizSelectedAnswers] = useState<Record<string, number>>({});
  const [essayText, setEssayText] = useState("");
  const [discussionReply, setDiscussionReply] = useState("");

  const currentClass = classrooms.find((c) => c.id === activeClassId) || classrooms[0];
  const classAssignments = assignments.filter((a) => a.classroomId === activeClassId);

  // Handlers
  const handleJoinClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;

    const matched = classrooms.find(
      (c) => c.code.toUpperCase() === joinCodeInput.trim().toUpperCase(),
    );

    if (matched) {
      if (!matched.students.includes(studentId)) {
        matched.students.push(studentId);
        ClassroomEngine.saveClassrooms(classrooms);
      }
      setActiveClassId(matched.id);
      setJoinSuccessMsg(`Successfully joined ${matched.name}!`);
      setJoinCodeInput("");
      setTimeout(() => setJoinSuccessMsg(""), 3000);
    } else {
      alert("Invalid class code. Please verify with your teacher.");
    }
  };

  const handleSubmitAssignment = (asg: Assignment) => {
    let finalGrade: number | undefined = undefined;
    let quizScorePct: number | undefined = undefined;

    if (asg.contentType === "quiz") {
      const result = ClassroomEngine.autoGradeQuiz(asg, quizSelectedAnswers);
      quizScorePct = result.scorePct;
      finalGrade = result.pointsEarned;
    } else if (asg.contentType === "reading") {
      finalGrade = asg.pointsValue; // Full credit on reading completion
    }

    const newSub: StudentSubmission = {
      id: `sub_${Date.now()}`,
      assignmentId: asg.id,
      studentId,
      studentName,
      submission: {
        quizAnswers: quizSelectedAnswers,
        quizScorePct,
        essayText: asg.contentType === "essay" ? essayText : undefined,
        versesReadCount: asg.content.targetVersesCount || 20,
        timeSpentSeconds: 600,
        completedAt: new Date().toISOString(),
      },
      submittedAt: new Date().toISOString(),
      grade: finalGrade,
      status: asg.contentType === "essay" ? "pending" : "graded",
      reviewedBy: asg.contentType === "quiz" ? "System Auto-Grader" : "Teacher",
    };

    const updated = [newSub, ...submissions];
    setSubmissions(updated);
    ClassroomEngine.saveSubmissions(updated);
    setSelectedAsg(null);
    setQuizSelectedAnswers({});
    setEssayText("");
  };

  const handleAddDiscussionReply = (threadId: string) => {
    if (!discussionReply.trim()) return;

    const updated = discussions.map((d) => {
      if (d.id === threadId) {
        return {
          ...d,
          replies: [
            ...d.replies,
            {
              id: `rep_${Date.now()}`,
              authorId: studentId,
              authorName: studentName,
              authorRole: "student" as const,
              content: discussionReply,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      }
      return d;
    });

    setDiscussions(updated);
    ClassroomEngine.saveDiscussions(updated);
    setDiscussionReply("");
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 py-4 px-2 sm:px-4">
      {/* HEADER: Student Class Indicator & Join Class Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-zinc-900 to-emerald-900 text-white shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider dir-auto">
                {isAr ? "وضع الطالب والتعلم المباشر" : "Student Classroom Portal"}
              </div>
              <h1 className="text-xl font-black tracking-tight dir-auto">{currentClass?.name}</h1>
              <div className="text-xs text-zinc-300 dir-auto">
                Teacher:{" "}
                <span className="font-bold text-emerald-300">{currentClass?.teacherName}</span>
              </div>
            </div>
          </div>

          {/* Join Code Box */}
          <form onSubmit={handleJoinClass} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter Class Code (e.g. AZH101)"
              value={joinCodeInput}
              onChange={(e) => setJoinCodeInput(e.target.value)}
              className="px-3.5 py-2 rounded-2xl bg-white/10 border border-white/20 text-xs text-white placeholder-zinc-400 font-mono uppercase focus:outline-none focus:border-emerald-400"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-2xl bg-emerald-500 text-zinc-950 font-black text-xs hover:bg-emerald-400 transition-all shadow-md"
            >
              Join Class
            </button>
          </form>
        </div>

        {joinSuccessMsg && (
          <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-xs font-bold text-emerald-300">
            {joinSuccessMsg}
          </div>
        )}

        {/* My Enrolled Classes Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {classrooms.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setActiveClassId(cls.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all border ${
                activeClassId === cls.id
                  ? "bg-emerald-500 text-zinc-950 border-emerald-400 shadow-md"
                  : "bg-white/5 text-zinc-300 hover:bg-white/10 border-white/10"
              }`}
            >
              {cls.name}
            </button>
          ))}
        </div>
      </div>

      {/* STUDENT NAVIGATION TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-zinc-200 dark:border-zinc-800">
        {[
          {
            id: "assignments",
            label: isAr ? "الواجبات والأنشطة" : "My Assignments",
            icon: FileText,
          },
          { id: "syllabus", label: isAr ? "الخطة الدراسية" : "Class Syllabus", icon: Calendar },
          {
            id: "discussions",
            label: isAr ? "النقاشات الجماعية" : "Class Discussions",
            icon: MessageSquare,
          },
          {
            id: "grades",
            label: isAr ? "سجل درجاتي وملاحظات المعلم" : "My Grades & Feedback",
            icon: Trophy,
          },
          { id: "announcements", label: isAr ? "الإعلانات" : "Announcements", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? "bg-emerald-600 text-white border-emerald-500 shadow-md"
                  : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ASSIGNMENTS LIST */}
      {activeTab === "assignments" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {["all", "pending", "completed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setAsgFilter(f as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-extrabold capitalize transition-all ${
                    asgFilter === f
                      ? "bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30"
                      : "text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <span className="text-xs font-mono text-zinc-400">
              {classAssignments.length} Total Assignments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classAssignments.map((asg) => {
              const sub = submissions.find(
                (s) => s.assignmentId === asg.id && s.studentId === studentId,
              );

              return (
                <div
                  key={asg.id}
                  className="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[10px] font-mono font-bold uppercase">
                        {asg.contentType}
                      </span>
                      {sub ? (
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Submitted ({sub.grade || 0}/
                          {asg.pointsValue} pts)
                        </span>
                      ) : (
                        <span className="text-xs font-mono font-bold text-amber-600">
                          Due: {new Date(asg.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-zinc-900 dark:text-zinc-100 dir-auto">
                      {asg.title}
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 dir-auto">
                      {asg.description}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedAsg(asg)}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                  >
                    {sub ? "View Submission & Feedback" : "Start Assignment"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: MY GRADES */}
      {activeTab === "grades" && (
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg space-y-4">
          <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2 dir-auto">
            <Trophy className="w-5 h-5 text-amber-500" />
            {isAr ? "سجل الدرجات الشخصية" : "My Personal Gradebook"}
          </h3>

          <div className="space-y-3">
            {submissions.map((sub) => {
              const asg = assignments.find((a) => a.id === sub.assignmentId);
              return (
                <div
                  key={sub.id}
                  className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2"
                >
                  <div className="flex items-center justify-between font-bold text-xs">
                    <span className="text-zinc-900 dark:text-zinc-100">
                      {asg?.title || "Assignment"}
                    </span>
                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                      Score: {sub.grade !== undefined ? `${sub.grade} pts` : "Pending Grade"}
                    </span>
                  </div>

                  {sub.feedback && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200">
                      <span className="font-bold">Teacher Feedback: </span>
                      <span>"{sub.feedback}"</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ASSIGNMENT WORKSPACE DIALOG */}
      {selectedAsg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="font-extrabold text-base text-zinc-900 dark:text-zinc-100 dir-auto">
                {selectedAsg.title}
              </h3>
              <button
                onClick={() => setSelectedAsg(null)}
                className="text-xs font-bold text-zinc-400 hover:text-zinc-600"
              >
                Close
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 dir-auto">
              {selectedAsg.description}
            </p>

            {/* Quiz Workspace */}
            {selectedAsg.contentType === "quiz" && selectedAsg.content.questions && (
              <div className="space-y-4 text-xs">
                {selectedAsg.content.questions.map((q) => (
                  <div
                    key={q.id}
                    className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 space-y-2"
                  >
                    <div className="font-bold text-zinc-900 dark:text-zinc-100">
                      {q.questionText}
                    </div>
                    <div className="space-y-1">
                      {q.options.map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className="flex items-center gap-2 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name={`q_${q.id}`}
                            checked={quizSelectedAnswers[q.id] === oIdx}
                            onChange={() =>
                              setQuizSelectedAnswers({ ...quizSelectedAnswers, [q.id]: oIdx })
                            }
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Essay Workspace */}
            {selectedAsg.contentType === "essay" && (
              <div className="space-y-2 text-xs">
                <label className="font-bold text-zinc-500 block">Your Reflection Essay</label>
                <textarea
                  rows={6}
                  placeholder="Write your response here..."
                  value={essayText}
                  onChange={(e) => setEssayText(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-xs"
                />
              </div>
            )}

            {/* Reading Workspace */}
            {selectedAsg.contentType === "reading" && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2 text-center">
                <div className="font-bold text-amber-700 dark:text-amber-300">
                  Target Verses: Surah {selectedAsg.content.surahNameEn} (
                  {selectedAsg.content.startAyah} - {selectedAsg.content.endAyah})
                </div>
                <p className="text-zinc-500">
                  Read the assigned verses attentively in your Quran reader, then click submit to
                  log progress.
                </p>
              </div>
            )}

            <button
              onClick={() => handleSubmitAssignment(selectedAsg)}
              className="w-full py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
            >
              Submit Assignment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
