import { ALL_300_ACHIEVEMENTS } from "./gamification";

export interface AssessmentRubricCriteria {
  id: string;
  title: string;
  maxPoints: number;
  description: string;
}

export interface AssessmentRubric {
  id: string;
  title: string;
  criteria: AssessmentRubricCriteria[];
}

export interface ClassroomSettings {
  isPublic: boolean;
  allowPeerComparison: boolean;
  leaderboardEnabled: boolean;
  contentFilterLevel: "strict" | "standard" | "open";
  allowRetries: boolean;
  lateSubmissionPenaltyPct: number;
}

export interface Classroom {
  id: string;
  teacherId: string;
  teacherName: string;
  name: string;
  code: string; // 6-character unique join code
  subject: string;
  description: string;
  students: string[]; // Student user IDs
  settings: ClassroomSettings;
  createdAt: string;
}

export type AssignmentType = "reading" | "quiz" | "essay" | "discussion";

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface AssignmentContent {
  // Reading
  surahId?: number;
  surahNameEn?: string;
  surahNameAr?: string;
  startAyah?: number;
  endAyah?: number;
  targetVersesCount?: number;

  // Quiz
  quizTopics?: string[];
  questions?: QuizQuestion[];

  // Essay / Discussion
  promptText?: string;
  passageToAnnotate?: string;
  minWordCount?: number;

  // Templates
  templateId?: string;
}

export interface Assignment {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  contentType: AssignmentType;
  content: AssignmentContent;
  dueDate: string;
  pointsValue: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  rubric?: AssessmentRubric;
  createdAt: string;
}

export interface StudentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submission: {
    versesReadCount?: number;
    quizAnswers?: Record<string, number>; // questionId -> selectedIndex
    quizScorePct?: number;
    essayText?: string;
    timeSpentSeconds: number;
    completedAt?: string;
  };
  submittedAt: string;
  grade?: number; // Out of assignment.pointsValue
  feedback?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  status: "pending" | "graded" | "returned";
}

export interface ClassAnnouncement {
  id: string;
  classroomId: string;
  teacherId: string;
  teacherName: string;
  title: string;
  body: string;
  isPinned: boolean;
  postedAt: string;
  attachments?: { title: string; url: string }[];
}

export interface DiscussionThread {
  id: string;
  classroomId: string;
  authorId: string;
  authorName: string;
  authorRole: "teacher" | "student";
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: string;
  replies: {
    id: string;
    authorId: string;
    authorName: string;
    authorRole: "teacher" | "student";
    content: string;
    createdAt: string;
  }[];
}

export interface DirectMessage {
  id: string;
  classroomId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  message: string;
  sentAt: string;
}

export interface CuratedCollectionNote {
  id: string;
  classroomId: string;
  title: string;
  description: string;
  surahId: number;
  startAyah: number;
  endAyah: number;
  teacherAnnotations: string;
  supplementaryLinks: { label: string; url: string }[];
  createdAt: string;
}

export interface StudentAnalyticsProfile {
  studentId: string;
  studentName: string;
  avatarUrl: string;
  loginFrequencyDays: number;
  assignmentsCompletedCount: number;
  totalAssignmentsCount: number;
  completionRatePct: number;
  avgQuizScorePct: number;
  engagementScore: number; // 0-100
  isAtRisk: boolean;
  atRiskReason?: string;
  masteredTopics: string[];
  weakTopics: string[];
}

export interface AssignmentTemplate {
  id: string;
  title: string;
  category: string;
  contentType: AssignmentType;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  defaultPoints: number;
  content: AssignmentContent;
}

// Default pre-loaded Template Library
export const DEFAULT_ASSIGNMENT_TEMPLATES: AssignmentTemplate[] = [
  {
    id: "tpl_surah_mulk",
    title: "Weekly Surah Al-Mulk Memorization & Reflection",
    category: "Quranic Reading",
    contentType: "reading",
    description:
      "Read and reflect on Surah Al-Mulk (verses 1-30). Focus on divine creation and sovereignty.",
    difficulty: "intermediate",
    defaultPoints: 50,
    content: {
      surahId: 67,
      surahNameEn: "Al-Mulk",
      surahNameAr: "الملك",
      startAyah: 1,
      endAyah: 30,
      targetVersesCount: 30,
    },
  },
  {
    id: "tpl_tajweed_quiz",
    title: "Fundamentals of Tajweed Rules Quiz",
    category: "Tajweed & Recitation",
    contentType: "quiz",
    description: "Assess understanding of Noon Sakinah, Tanween, and Ghunnah rules.",
    difficulty: "beginner",
    defaultPoints: 100,
    content: {
      quizTopics: ["Tajweed", "Recitation Rules"],
      questions: [
        {
          id: "q1",
          questionText: "What is Izhar in Noon Sakinah rules?",
          options: [
            "Clear pronunciation without Ghunnah",
            "Merging two letters with Ghunnah",
            "Changing Noon to Meem",
            "Hiding the sound",
          ],
          correctOptionIndex: 0,
          explanation:
            "Izhar means pronouncing the Noon Sakinah or Tanween clearly when followed by throat letters.",
        },
        {
          id: "q2",
          questionText: "How many letters are associated with Iqlab?",
          options: ["6 letters", "1 letter (Ba)", "15 letters", "4 letters"],
          correctOptionIndex: 1,
          explanation: "Iqlab applies exclusively to the letter Ba (ب).",
        },
      ],
    },
  },
  {
    id: "tpl_sira_essay",
    title: "The Patience of Prophet Muhammad (ﷺ) at Ta'if",
    category: "Seerah & History",
    contentType: "essay",
    description:
      "Write a 250-word reflective essay examining lessons of perseverance from the event of Ta'if.",
    difficulty: "intermediate",
    defaultPoints: 100,
    content: {
      promptText:
        "Analyze the Dua made by the Prophet (ﷺ) after Ta'if and discuss its spiritual resilience.",
      minWordCount: 200,
    },
  },
];

// Mock Pre-populated Classrooms
export const INITIAL_MOCK_CLASSROOMS: Classroom[] = [
  {
    id: "cls_101",
    teacherId: "tch_master_ahmed",
    teacherName: "Ustadh Ahmed Al-Mansoor",
    name: "Al-Azhar Quranic Studies 101",
    code: "AZH101",
    subject: "Quranic Recitation & Tafsir",
    description:
      "Foundational class covering Surah Al-Kahf, Tajweed rules, and weekly reflective journals.",
    students: ["std_1", "std_2", "std_3", "std_4", "std_5"],
    settings: {
      isPublic: true,
      allowPeerComparison: true,
      leaderboardEnabled: true,
      contentFilterLevel: "standard",
      allowRetries: true,
      lateSubmissionPenaltyPct: 10,
    },
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: "cls_102",
    teacherId: "tch_master_ahmed",
    teacherName: "Dr. Fatima Al-Zahra",
    name: "High School Islamic History & Seerah",
    code: "SEER22",
    subject: "Islamic Civilizations",
    description:
      "Interactive timeline analysis of Prophetic history, companions, and golden era contributions.",
    students: ["std_1", "std_2", "std_6"],
    settings: {
      isPublic: false,
      allowPeerComparison: false,
      leaderboardEnabled: false,
      contentFilterLevel: "strict",
      allowRetries: false,
      lateSubmissionPenaltyPct: 20,
    },
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
];

export const INITIAL_MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg_001",
    classroomId: "cls_101",
    title: "Surah Al-Kahf Verses 1-20 Reading & Recitation",
    description:
      "Read Surah Al-Kahf verses 1-20 attentively, noting themes of protection and faith.",
    contentType: "reading",
    content: {
      surahId: 18,
      surahNameEn: "Al-Kahf",
      surahNameAr: "الكهف",
      startAyah: 1,
      endAyah: 20,
      targetVersesCount: 20,
    },
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    pointsValue: 50,
    difficulty: "beginner",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: "asg_002",
    classroomId: "cls_101",
    title: "Tajweed & Noon Sakinah Mastery Quiz",
    description: "5-question auto-graded test checking accuracy on Izhar, Igham, Iqlab, and Ikhfa.",
    contentType: "quiz",
    content: {
      quizTopics: ["Tajweed", "Recitation"],
      questions: [
        {
          id: "q1",
          questionText: "Which of the following letters causes Izhar Halqi?",
          options: [
            "Hamza, Ha, 'Ain, Ha, Ghain, Kha",
            "Yaa, Ra, Meem, Laam, Waw, Noon",
            "Ba only",
            "Ta, Tha, Jeem, Dal",
          ],
          correctOptionIndex: 0,
          explanation: "Throat letters (الحروف الحلقية) cause clear pronunciation without Ghunnah.",
        },
        {
          id: "q2",
          questionText: "What is Idgham without Ghunnah letters?",
          options: [
            "Laam and Ra (ل ، ر)",
            "Yaa and Waw (ي ، و)",
            "Meem and Noon (م ، ن)",
            "Ba and Ta (ب ، ت)",
          ],
          correctOptionIndex: 0,
          explanation: "Laam and Ra result in complete merging without nasal resonance.",
        },
      ],
    },
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    pointsValue: 100,
    difficulty: "intermediate",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: "asg_003",
    classroomId: "cls_101",
    title: "Essay: Lessons from the Companions of the Cave",
    description: "Write a 300-word reflection essay on youth standing firm in truth.",
    contentType: "essay",
    content: {
      promptText:
        "Explain how the story of Ashab al-Kahf applies to modern youth navigating digital challenges.",
      minWordCount: 200,
    },
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    pointsValue: 100,
    difficulty: "advanced",
    rubric: {
      id: "rub_01",
      title: "Reflection Rubric",
      criteria: [
        {
          id: "c1",
          title: "Textual Relevance",
          maxPoints: 40,
          description: "References Quranic verses accurately.",
        },
        {
          id: "c2",
          title: "Modern Application",
          maxPoints: 40,
          description: "Connects ancient story to modern life.",
        },
        {
          id: "c3",
          title: "Grammar & Clarity",
          maxPoints: 20,
          description: "Clear expression and structure.",
        },
      ],
    },
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
];

export const INITIAL_MOCK_SUBMISSIONS: StudentSubmission[] = [
  {
    id: "sub_001",
    assignmentId: "asg_001",
    studentId: "std_1",
    studentName: "Zaid Ibn Thabit",
    submission: {
      versesReadCount: 20,
      timeSpentSeconds: 1200,
      completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    grade: 50,
    feedback: "MashaAllah excellent reading speed and consistency!",
    reviewedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    reviewedBy: "tch_master_ahmed",
    status: "graded",
  },
  {
    id: "sub_002",
    assignmentId: "asg_002",
    studentId: "std_1",
    studentName: "Zaid Ibn Thabit",
    submission: {
      quizAnswers: { q1: 0, q2: 0 },
      quizScorePct: 100,
      timeSpentSeconds: 240,
    },
    submittedAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    grade: 100,
    feedback: "Perfect score on Tajweed rules!",
    reviewedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    reviewedBy: "System Auto-Grader",
    status: "graded",
  },
  {
    id: "sub_003",
    assignmentId: "asg_003",
    studentId: "std_2",
    studentName: "Aisha Al-Siddiqah",
    submission: {
      essayText:
        "The story of Ashab al-Kahf teaches us that true faith requires moral courage regardless of external societal pressures...",
      timeSpentSeconds: 1800,
    },
    submittedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    status: "pending",
  },
];

export const INITIAL_MOCK_ANNOUNCEMENTS: ClassAnnouncement[] = [
  {
    id: "anc_001",
    classroomId: "cls_101",
    teacherId: "tch_master_ahmed",
    teacherName: "Ustadh Ahmed Al-Mansoor",
    title: "Welcome to Quranic Studies 101!",
    body: "Assalamu Alaikum students! Please review the syllabus and complete your first reading assignment on Surah Al-Kahf by Friday.",
    isPinned: true,
    postedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const INITIAL_MOCK_DISCUSSIONS: DiscussionThread[] = [
  {
    id: "disc_001",
    classroomId: "cls_101",
    authorId: "std_1",
    authorName: "Zaid Ibn Thabit",
    authorRole: "student",
    title: "Question regarding Ayah 9 in Surah Al-Kahf",
    content:
      "Why are the people of the cave referred to as 'Ar-Raqim' in the verse? What is the linguistic meaning?",
    isPinned: false,
    isLocked: false,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    replies: [
      {
        id: "rep_001",
        authorId: "tch_master_ahmed",
        authorName: "Ustadh Ahmed Al-Mansoor",
        authorRole: "teacher",
        content:
          "Great observation! Scholars of Tafsir explain that 'Ar-Raqim' refers to the inscribed tablet containing their names.",
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
    ],
  },
];

// Helper Storage Manager with LocalStorage Persistence
const STORAGE_KEY_CLASSES = "bayan_classroom_classes_v1";
const STORAGE_KEY_ASSIGNMENTS = "bayan_classroom_assignments_v1";
const STORAGE_KEY_SUBMISSIONS = "bayan_classroom_submissions_v1";
const STORAGE_KEY_ANNOUNCEMENTS = "bayan_classroom_announcements_v1";
const STORAGE_KEY_DISCUSSIONS = "bayan_classroom_discussions_v1";

export class ClassroomEngine {
  public static getClassrooms(): Classroom[] {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_CLASSES);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Error reading classrooms from storage", e);
    }
    return INITIAL_MOCK_CLASSROOMS;
  }

  public static saveClassrooms(items: Classroom[]): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(items));
      }
    } catch (e) {
      console.warn("Error saving classrooms", e);
    }
  }

  public static getAssignments(): Assignment[] {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Error reading assignments", e);
    }
    return INITIAL_MOCK_ASSIGNMENTS;
  }

  public static saveAssignments(items: Assignment[]): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(items));
      }
    } catch (e) {
      console.warn("Error saving assignments", e);
    }
  }

  public static getSubmissions(): StudentSubmission[] {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Error reading submissions", e);
    }
    return INITIAL_MOCK_SUBMISSIONS;
  }

  public static saveSubmissions(items: StudentSubmission[]): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(items));
      }
    } catch (e) {
      console.warn("Error saving submissions", e);
    }
  }

  public static getAnnouncements(): ClassAnnouncement[] {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_ANNOUNCEMENTS);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Error reading announcements", e);
    }
    return INITIAL_MOCK_ANNOUNCEMENTS;
  }

  public static saveAnnouncements(items: ClassAnnouncement[]): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_ANNOUNCEMENTS, JSON.stringify(items));
      }
    } catch (e) {
      console.warn("Error saving announcements", e);
    }
  }

  public static getDiscussions(): DiscussionThread[] {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(STORAGE_KEY_DISCUSSIONS);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Error reading discussions", e);
    }
    return INITIAL_MOCK_DISCUSSIONS;
  }

  public static saveDiscussions(items: DiscussionThread[]): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(STORAGE_KEY_DISCUSSIONS, JSON.stringify(items));
      }
    } catch (e) {
      console.warn("Error saving discussions", e);
    }
  }

  // Generate unique Join Code
  public static generateJoinCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Auto-grade Quiz Submission
  public static autoGradeQuiz(
    assignment: Assignment,
    quizAnswers: Record<string, number>,
  ): { scorePct: number; pointsEarned: number } {
    if (!assignment.content.questions || assignment.content.questions.length === 0) {
      return { scorePct: 100, pointsEarned: assignment.pointsValue };
    }

    let correctCount = 0;
    const totalQuestions = assignment.content.questions.length;

    assignment.content.questions.forEach((q) => {
      const selected = quizAnswers[q.id];
      if (selected !== undefined && selected === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / totalQuestions) * 100);
    const pointsEarned = Math.round((scorePct / 100) * assignment.pointsValue);

    return { scorePct, pointsEarned };
  }

  // Calculate At-Risk Predictive Analytics
  public static computeStudentAnalytics(
    classroomId: string,
    studentId: string,
    studentName: string,
  ): StudentAnalyticsProfile {
    const allAssignments = this.getAssignments().filter((a) => a.classroomId === classroomId);
    const allSubmissions = this.getSubmissions().filter((s) => s.studentId === studentId);

    const totalAssignmentsCount = allAssignments.length;
    const completedCount = allSubmissions.length;
    const completionRatePct =
      totalAssignmentsCount > 0 ? Math.round((completedCount / totalAssignmentsCount) * 100) : 100;

    const quizSubmissions = allSubmissions.filter((s) => s.submission.quizScorePct !== undefined);
    const avgQuizScorePct =
      quizSubmissions.length > 0
        ? Math.round(
            quizSubmissions.reduce((acc, curr) => acc + (curr.submission.quizScorePct || 0), 0) /
              quizSubmissions.length,
          )
        : 85;

    // Engagement score (0-100) based on completion rate and average quiz score
    const engagementScore = Math.min(
      100,
      Math.round(completionRatePct * 0.6 + avgQuizScorePct * 0.4),
    );

    let isAtRisk = false;
    let atRiskReason = undefined;

    if (completionRatePct < 50) {
      isAtRisk = true;
      atRiskReason = "Low assignment completion rate (< 50%)";
    } else if (avgQuizScorePct < 60) {
      isAtRisk = true;
      atRiskReason = "Quiz accuracy below passing threshold (< 60%)";
    } else if (engagementScore < 55) {
      isAtRisk = true;
      atRiskReason = "Declining engagement & login activity";
    }

    return {
      studentId,
      studentName,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${studentName}`,
      loginFrequencyDays: Math.floor(Math.random() * 5) + 3,
      assignmentsCompletedCount: completedCount,
      totalAssignmentsCount,
      completionRatePct,
      avgQuizScorePct,
      engagementScore,
      isAtRisk,
      atRiskReason,
      masteredTopics: ["Tajweed Rules", "Surah Reading"],
      weakTopics: avgQuizScorePct < 70 ? ["Advanced Grammatical Parsing"] : [],
    };
  }

  // Export Gradebook to CSV String
  public static exportGradebookCsv(classroomId: string): string {
    const cls = this.getClassrooms().find((c) => c.id === classroomId);
    const assignments = this.getAssignments().filter((a) => a.classroomId === classroomId);
    const submissions = this.getSubmissions();

    const headers = [
      "Student ID",
      "Student Name",
      ...assignments.map((a) => `"${a.title}"`),
      "Total Grade %",
    ];

    const mockStudents = [
      { id: "std_1", name: "Zaid Ibn Thabit" },
      { id: "std_2", name: "Aisha Al-Siddiqah" },
      { id: "std_3", name: "Omar Ibn Al-Khattab" },
      { id: "std_4", name: "Fatima Al-Zahra" },
      { id: "std_5", name: "Ali Ibn Abi Talib" },
    ];

    const rows = mockStudents.map((std) => {
      let totalEarned = 0;
      let totalPossible = 0;

      const scores = assignments.map((asg) => {
        const sub = submissions.find((s) => s.assignmentId === asg.id && s.studentId === std.id);
        totalPossible += asg.pointsValue;
        if (sub && sub.grade !== undefined) {
          totalEarned += sub.grade;
          return sub.grade.toString();
        }
        return "N/A";
      });

      const overallPct = totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
      return [std.id, `"${std.name}"`, ...scores, `${overallPct}%`].join(",");
    });

    return [headers.join(","), ...rows].join("\n");
  }
}
