import { describe, expect, test } from "bun:test";
import { getTafsirFallbackOrder } from "./tafsir-fallback";

describe("tafsir fallback order", () => {
  test("keeps Hebrew tafsir DB-only with Arabic fallback", () => {
    expect(getTafsirFallbackOrder("he")).toEqual(["he", "ar"]);
  });

  test("prefers English tafsir and falls back safely", () => {
    expect(getTafsirFallbackOrder("en")).toEqual(["en", "ar", "he"]);
  });

  test("Arabic locale stays Arabic-only", () => {
    expect(getTafsirFallbackOrder("ar")).toEqual(["ar"]);
  });
});