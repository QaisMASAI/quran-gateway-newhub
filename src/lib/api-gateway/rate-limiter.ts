/**
 * Quran Gateway — In-Memory & Redis-Ready Sliding Window Rate Limiter
 */

import type { RateLimitMeta } from "./types";
import { ApiError } from "./errors";

export interface RateLimitConfig {
  limit: number;
  windowSeconds: number;
}

export const TIER_LIMITS: Record<RateLimitMeta["tier"], RateLimitConfig> = {
  anonymous: { limit: 60, windowSeconds: 60 },
  authenticated: { limit: 300, windowSeconds: 60 },
  internal_admin: { limit: 1200, windowSeconds: 60 },
  search_heavy: { limit: 30, windowSeconds: 60 },
};

type WindowEntry = {
  timestamps: number[];
};

class SlidingWindowRateLimiter {
  private windows = new Map<string, WindowEntry>();

  constructor() {
    // Periodically clean up expired windows every 5 minutes
    if (typeof setInterval !== "undefined") {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  public checkAndConsume(
    clientId: string,
    tier: RateLimitMeta["tier"] = "anonymous",
    overrideConfig?: RateLimitConfig,
  ): {
    allowed: boolean;
    meta: RateLimitMeta;
    headers: Record<string, string>;
  } {
    const now = Date.now();
    const config = overrideConfig || TIER_LIMITS[tier] || TIER_LIMITS.anonymous;
    const windowMs = config.windowSeconds * 1000;
    const key = `${tier}:${clientId}`;

    let entry = this.windows.get(key);
    if (!entry) {
      entry = { timestamps: [] };
      this.windows.set(key, entry);
    }

    // Filter out timestamps older than current sliding window
    entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);

    const currentCount = entry.timestamps.length;
    const allowed = currentCount < config.limit;

    if (allowed) {
      entry.timestamps.push(now);
    }

    const remaining = Math.max(0, config.limit - entry.timestamps.length);
    const oldestTimestamp = entry.timestamps[0] || now;
    const resetMs = Math.max(0, windowMs - (now - oldestTimestamp));
    const resetSeconds = Math.ceil(resetMs / 1000);

    const meta: RateLimitMeta = {
      limit: config.limit,
      remaining,
      resetSeconds,
      tier,
    };

    const headers: Record<string, string> = {
      "X-RateLimit-Limit": String(config.limit),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(Math.floor((now + resetMs) / 1000)),
    };

    if (!allowed) {
      headers["Retry-After"] = String(Math.max(1, resetSeconds));
    }

    return { allowed, meta, headers };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.windows.entries()) {
      // Remove windows empty or older than 10 minutes
      if (
        entry.timestamps.length === 0 ||
        now - entry.timestamps[entry.timestamps.length - 1] > 10 * 60 * 1000
      ) {
        this.windows.delete(key);
      }
    }
  }
}

export const globalRateLimiter = new SlidingWindowRateLimiter();

export function enforceRateLimit(
  clientIp: string,
  userId?: string | null,
  tier: RateLimitMeta["tier"] = "anonymous",
  overrideConfig?: RateLimitConfig,
) {
  const clientId = userId ? `user:${userId}` : `ip:${clientIp || "127.0.0.1"}`;
  const result = globalRateLimiter.checkAndConsume(clientId, tier, overrideConfig);

  if (!result.allowed) {
    throw new ApiError(
      "RATE_LIMIT_EXCEEDED",
      `Rate limit exceeded for tier '${tier}'. Allowed: ${result.meta.limit} req / ${
        overrideConfig?.windowSeconds || TIER_LIMITS[tier]?.windowSeconds || 60
      }s.`,
      {
        retryAfterSeconds: result.meta.resetSeconds,
      },
    );
  }

  return result;
}
