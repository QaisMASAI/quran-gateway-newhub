import { describe, expect, it } from "vitest";
import { ClassroomEngine, Assignment } from "./classroom-engine";

describe("Classroom Engine Logic & Helper Tests", () => {
  it("generates 6-character uppercase join code", () => {
    const code = ClassroomEngine.generateJoinCode();
    expect(code).toHaveLength(6);
    expect(code).toBe(code.toUpperCase());
  });

  it("auto-grades quiz correctly", () => {
    const mockAssignment: Assignment = {
      id: "asg_test",
      classroomId: "cls_101",
      title: "Test Quiz",
      description: "Test Quiz",
      contentType: "quiz",
      content: {
        questions: [
          {
            id: "q1",
            questionText: "Question 1",
            options: ["A", "B", "C", "D"],
            correctOptionIndex: 1,
            explanation: "Explanation 1",
          },
          {
            id: "q2",
            questionText: "Question 2",
            options: ["A", "B", "C", "D"],
            correctOptionIndex: 3,
            explanation: "Explanation 2",
          },
        ],
      },
      dueDate: new Date().toISOString(),
      pointsValue: 100,
      difficulty: "beginner",
      createdAt: new Date().toISOString(),
    };

    // Both correct -> 100%
    const perfectGrade = ClassroomEngine.autoGradeQuiz(mockAssignment, { q1: 1, q2: 3 });
    expect(perfectGrade.scorePct).toBe(100);
    expect(perfectGrade.pointsEarned).toBe(100);

    // One correct -> 50%
    const halfGrade = ClassroomEngine.autoGradeQuiz(mockAssignment, { q1: 1, q2: 0 });
    expect(halfGrade.scorePct).toBe(50);
    expect(halfGrade.pointsEarned).toBe(50);
  });

  it("calculates student at-risk status correctly for low completion rate", () => {
    const profile = ClassroomEngine.computeStudentAnalytics("cls_101", "std_low", "Low Student");
    expect(profile.studentId).toBe("std_low");
    expect(profile.engagementScore).toBeGreaterThanOrEqual(0);
  });

  it("exports CSV gradebook string with header and rows", () => {
    const csv = ClassroomEngine.exportGradebookCsv("cls_101");
    expect(csv).toContain("Student ID,Student Name");
    expect(csv).toContain("Zaid Ibn Thabit");
  });
});
