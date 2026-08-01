import { describe, it, expect } from "vitest";
import { getTafsirFallbackOrder } from "./tafsir-fallback";

describe("tafsir fallback order", () => {
  it("keeps Hebrew tafsir with Arabic and English fallback", () => {
    expect(getTafsirFallbackOrder("he")).toEqual(["he", "ar", "en"]);
  });

  it("prefers English then Arabic then Hebrew", () => {
    expect(getTafsirFallbackOrder("en")).toEqual(["en", "ar", "he"]);
  });

  it("returns Arabic then English then Hebrew for Arabic locale", () => {
    expect(getTafsirFallbackOrder("ar")).toEqual(["ar", "en", "he"]);
  });
});
