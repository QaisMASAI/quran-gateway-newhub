import { describe, expect, it } from "vitest";
import {
  GlobalExpansionEngine,
  REGIONAL_MARKET_ANALYSIS,
  LANGUAGE_LOCALIZATION_PRIORITIES,
  REGIONAL_PRICING_TIERS,
  GTM_PHASE_MILESTONES,
} from "./global-expansion-engine";

describe("Global Expansion Strategy Engine Tests", () => {
  it("calculates PPP discounts accurately", () => {
    // Base USD price = 4.99, India PPP discount = 60%
    const pppPriceIn = GlobalExpansionEngine.calculatePPPPrice(4.99, 60);
    expect(pppPriceIn).toBe(2.0); // 4.99 * 0.4 = 1.996 -> rounded to 2.00

    // Base USD price = 4.99, MENA PPP discount = 30%
    const pppPriceMena = GlobalExpansionEngine.calculatePPPPrice(4.99, 30);
    expect(pppPriceMena).toBe(3.49);
  });

  it("contains regional market analysis for all 5 core global regions", () => {
    expect(REGIONAL_MARKET_ANALYSIS).toHaveLength(5);
    const regionIds = REGIONAL_MARKET_ANALYSIS.map((r) => r.regionId);
    expect(regionIds).toContain("mena");
    expect(regionIds).toContain("south_asia");
    expect(regionIds).toContain("sea");
    expect(regionIds).toContain("europe");
    expect(regionIds).toContain("north_america");
  });

  it("has priority localization languages configured for Phase 1", () => {
    const phase1Langs = LANGUAGE_LOCALIZATION_PRIORITIES.filter(
      (l) => l.priorityPhase === "Phase 1 (W1-12)",
    );
    expect(phase1Langs.map((l) => l.code)).toContain("ur");
    expect(phase1Langs.map((l) => l.code)).toContain("id");
  });

  it("exports valid strategy summary report JSON", () => {
    const summaryStr = GlobalExpansionEngine.exportExpansionStrategySummary();
    const parsed = JSON.parse(summaryStr);
    expect(parsed.title).toContain("Global Expansion");
    expect(parsed.totalBudgetUsd).toBe(550000); // 120k + 180k + 250k
  });
});
