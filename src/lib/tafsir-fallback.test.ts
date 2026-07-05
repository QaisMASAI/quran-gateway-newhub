import { describe, it, expect } from "vitest";
import { getTafsirFallbackOrder } from "./tafsir-fallback";

describe("tafsir fallback order", () => {
  it("keeps Hebrew tafsir DB-only with Arabic fallback", () => {
    expect(getTafsirFallbackOrder("he")).toEqual(["he", "ar"]);
  });

  it("prefers English then Arabic then Hebrew", () => {
    expect(getTafsirFallbackOrder("en")).toEqual(["en", "ar", "he"]);
  });

  it("keeps Arabic locale Arabic-only", () => {
    expect(getTafsirFallbackOrder("ar")).toEqual(["ar"]);
  });
});
