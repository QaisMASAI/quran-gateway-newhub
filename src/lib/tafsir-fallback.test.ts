import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getTafsirFallbackOrder } from "./tafsir-fallback";

describe("tafsir fallback order", () => {
  it("keeps Hebrew tafsir DB-only with Arabic fallback", () => {
    assert.deepEqual(getTafsirFallbackOrder("he"), ["he", "ar"]);
  });

  it("prefers English then Arabic then Hebrew", () => {
    assert.deepEqual(getTafsirFallbackOrder("en"), ["en", "ar", "he"]);
  });

  it("keeps Arabic locale Arabic-only", () => {
    assert.deepEqual(getTafsirFallbackOrder("ar"), ["ar"]);
  });
});