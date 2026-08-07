import { describe, expect, it } from "vitest";
import {
  calculateAdaptiveDifficulty,
  calculateLevelFromXp,
  executePrestigeReset,
  INITIAL_USER_GAMEIFICATION,
  restoreStreak,
  type UserGameification,
} from "./gamification-engine-v2";

describe("Gamification Engine 2.0 Tests", () => {
  it("calculates level accurately based on 1,000 XP per level", () => {
    const level1 = calculateLevelFromXp(500);
    expect(level1.level).toBe(1);
    expect(level1.xpInLevel).toBe(500);
    expect(level1.xpNeededForNext).toBe(500);
    expect(level1.progressPercent).toBe(50);
    expect(level1.canPrestige).toBe(false);

    const level2 = calculateLevelFromXp(1250);
    expect(level2.level).toBe(2);
    expect(level2.xpInLevel).toBe(250);
    expect(level2.progressPercent).toBe(25);

    const level100 = calculateLevelFromXp(99500);
    expect(level100.level).toBe(100);
    expect(level100.canPrestige).toBe(true);
  });

  it("calculates adaptive difficulty formula Min(10, 1 + performance_factor * 8)", () => {
    // 0% accuracy -> 1 + 0*8 = 1
    const resLow = calculateAdaptiveDifficulty(0, 10);
    expect(resLow.performanceFactor).toBe(0);
    expect(resLow.difficultyScale).toBe(1);
    expect(resLow.tier).toBe("easy");

    // 50% accuracy -> 1 + 0.5*8 = 5
    const resMid = calculateAdaptiveDifficulty(5, 10);
    expect(resMid.performanceFactor).toBe(0.5);
    expect(resMid.difficultyScale).toBe(5);

    // 100% accuracy -> 1 + 1.0*8 = 9 (max 10)
    const resHigh = calculateAdaptiveDifficulty(10, 10);
    expect(resHigh.performanceFactor).toBe(1.0);
    expect(resHigh.difficultyScale).toBe(9);
    expect(resHigh.tier).toBe("hard");
  });

  it("handles streak restoration with gem cost (100 gems)", () => {
    const userState: UserGameification = JSON.parse(JSON.stringify(INITIAL_USER_GAMEIFICATION));
    userState.gems = 150;
    userState.streaks.current = 0;
    userState.streaks.longest = 10;

    const result = restoreStreak(userState);
    expect(result.success).toBe(true);
    expect(userState.gems).toBe(50);
    expect(userState.streaks.current).toBe(10);
  });

  it("rejects streak restoration if user has insufficient gems (< 100)", () => {
    const userState: UserGameification = JSON.parse(JSON.stringify(INITIAL_USER_GAMEIFICATION));
    userState.gems = 40;

    const result = restoreStreak(userState);
    expect(result.success).toBe(false);
    expect(userState.gems).toBe(40);
  });

  it("triggers prestige reset when level reaches 100", () => {
    const userState: UserGameification = JSON.parse(JSON.stringify(INITIAL_USER_GAMEIFICATION));
    userState.level = 100;
    userState.prestige = 0;

    const prestigeRes = executePrestigeReset(userState);
    expect(prestigeRes.success).toBe(true);
    expect(userState.prestige).toBe(1);
    expect(userState.level).toBe(1);
    expect(userState.totalXp).toBe(0);
  });

  it("prevents prestige reset if level is under 100", () => {
    const userState: UserGameification = JSON.parse(JSON.stringify(INITIAL_USER_GAMEIFICATION));
    userState.level = 45;

    const prestigeRes = executePrestigeReset(userState);
    expect(prestigeRes.success).toBe(false);
    expect(userState.prestige).toBe(0);
  });
});
