import { describe, it, expect } from "vitest";
import {
  normalizeCacheQuestion,
  isRecentByTtl,
  shouldServeCachedResult,
} from "./research-cache-utils";

describe("research cache utils", () => {
  it("normalizes cache questions", () => {
    expect(normalizeCacheQuestion("  Patience   in Islam  ")).toBe("patience in islam");
  });

  it("respects TTL boundaries", () => {
    const now = Date.now();
    expect(isRecentByTtl(new Date(now - 30_000).toISOString(), 60_000)).toBe(true);
    expect(isRecentByTtl(new Date(now - 120_000).toISOString(), 60_000)).toBe(false);
  });

  it("requires matching cache version and TTL validity", () => {
    const createdAt = new Date(Date.now() - 10_000).toISOString();
    expect(
      shouldServeCachedResult({ cacheVersion: 2, currentVersion: 2, createdAt, ttlMs: 60_000 }),
    ).toBe(true);
    expect(
      shouldServeCachedResult({ cacheVersion: 1, currentVersion: 2, createdAt, ttlMs: 60_000 }),
    ).toBe(false);
  });
});
