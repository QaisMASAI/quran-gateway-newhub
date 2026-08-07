import { describe, expect, it } from "vitest";
import { generateMockAnalyticsSummary } from "./learning-analytics";

describe("Learning Analytics Engine Tests", () => {
  it("generates comprehensive analytics summary with all sections populated", () => {
    const summary = generateMockAnalyticsSummary("test_usr_123");

    expect(summary.userId).toBe("test_usr_123");
    expect(summary.totalLearningHours).toBeGreaterThan(0);
    expect(summary.totalVersesRead).toBeGreaterThan(0);
    expect(summary.totalQuizzesCompleted).toBeGreaterThan(0);
    expect(summary.heatmapData.length).toBeGreaterThan(100);
    expect(summary.topicMasteryData.length).toBe(6);
    expect(summary.weakAreas.length).toBeGreaterThan(0);
    expect(summary.percentileRank).toBe(95);
  });

  it("heatmap data includes intensity scale 0-4", () => {
    const summary = generateMockAnalyticsSummary("test_usr_123");
    const intensities = summary.heatmapData.map((d) => d.intensity);
    const validIntensities = intensities.every((i) => i >= 0 && i <= 4);
    expect(validIntensities).toBe(true);
  });

  it("correctly flags weak areas with accuracy below 60%", () => {
    const summary = generateMockAnalyticsSummary("test_usr_123");
    const weakTopics = summary.topicMasteryData.filter((t) => t.userMasteryPct < 60);
    expect(summary.weakAreas.length).toBe(weakTopics.length);
  });
});
