import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeCacheQuestion,
  isRecentByTtl,
  shouldServeCachedResult,
} from "./research-cache-utils";

describe("research cache utils", () => {
  it("normalizes cache questions", () => {
    assert.equal(normalizeCacheQuestion("  Patience   in Islam  "), "patience in islam");
  });

  it("respects TTL boundaries", () => {
    const now = Date.now();
    assert.equal(isRecentByTtl(new Date(now - 30_000).toISOString(), 60_000), true);
    assert.equal(isRecentByTtl(new Date(now - 120_000).toISOString(), 60_000), false);
  });

  it("requires matching cache version and TTL validity", () => {
    const createdAt = new Date(Date.now() - 10_000).toISOString();
    assert.equal(
      shouldServeCachedResult({ cacheVersion: 2, currentVersion: 2, createdAt, ttlMs: 60_000 }),
      true,
    );
    assert.equal(
      shouldServeCachedResult({ cacheVersion: 1, currentVersion: 2, createdAt, ttlMs: 60_000 }),
      false,
    );
  });
});