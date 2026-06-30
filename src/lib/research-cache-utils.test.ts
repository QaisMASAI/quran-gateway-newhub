import { describe, expect, test } from "bun:test";
import {
  isRecentByTtl,
  normalizeCacheQuestion,
  shouldServeCachedResult,
} from "./research-cache-utils";

describe("research cache utils", () => {
  test("normalizes question strings for stable cache keys", () => {
    expect(normalizeCacheQuestion("  Patience   in   Islam  ")).toBe("patience in islam");
  });

  test("returns true only within TTL window", () => {
    const now = Date.now();
    expect(isRecentByTtl(new Date(now - 30_000).toISOString(), 60_000)).toBe(true);
    expect(isRecentByTtl(new Date(now - 120_000).toISOString(), 60_000)).toBe(false);
  });

  test("serves cache only when both version and TTL are valid", () => {
    const createdAt = new Date(Date.now() - 10_000).toISOString();
    expect(
      shouldServeCachedResult({
        cacheVersion: 3,
        currentVersion: 3,
        createdAt,
        ttlMs: 60_000,
      }),
    ).toBe(true);

    expect(
      shouldServeCachedResult({
        cacheVersion: 2,
        currentVersion: 3,
        createdAt,
        ttlMs: 60_000,
      }),
    ).toBe(false);
  });
});