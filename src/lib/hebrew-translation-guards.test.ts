import { describe, expect, it } from "vitest";
import { validateHebrewTranslationTriplet } from "@/lib/hebrew-translation-guards";

describe("validateHebrewTranslationTriplet", () => {
  it("fails when Arabic source is missing", () => {
    const result = validateHebrewTranslationTriplet({
      arabic: "",
      english: "Meaning",
      hebrew: "פירוש",
    });
    expect(result).toEqual({ ok: false, reason: "missing_arabic" });
  });

  it("fails when English source is missing", () => {
    const result = validateHebrewTranslationTriplet({
      arabic: "نص",
      english: "   ",
      hebrew: "פירוש",
    });
    expect(result).toEqual({ ok: false, reason: "missing_english" });
  });

  it("fails when Hebrew output is empty", () => {
    const result = validateHebrewTranslationTriplet({
      arabic: "نص",
      english: "Meaning",
      hebrew: "",
    });
    expect(result).toEqual({ ok: false, reason: "empty_hebrew" });
  });

  it("passes only when AR + EN exist and Hebrew output is non-empty", () => {
    const result = validateHebrewTranslationTriplet({
      arabic: "قال الله",
      english: "Allah said",
      hebrew: "אללה אמר",
    });
    expect(result).toEqual({ ok: true });
  });
});
