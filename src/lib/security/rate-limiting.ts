/**
 * Quran Gateway — Security Rate-Limiting Utility
 * Protects login and sensitive authentication routes from brute force attacks.
 */

interface RateLimitOptions {
  maxAttempts?: number;
  windowMinutes?: number;
}

const attemptStore = new Map<string, { count: number; firstAttempt: number }>();

/**
 * Checks if an identifier has exceeded the allowed rate limit for a specific action.
 * Returns `true` if rate limited (blocked), `false` otherwise.
 */
export async function checkRateLimit(
  action: string,
  identifier: string,
  options: RateLimitOptions = {}
): Promise<boolean> {
  const maxAttempts = options.maxAttempts ?? 5;
  const windowMs = (options.windowMinutes ?? 60) * 60 * 1000;
  const key = `${action}:${identifier.toLowerCase().trim()}`;
  const now = Date.now();

  const record = attemptStore.get(key);
  if (!record) return false;

  // Reset window if expired
  if (now - record.firstAttempt > windowMs) {
    attemptStore.delete(key);
    return false;
  }

  return record.count >= maxAttempts;
}

/**
 * Records a failed attempt for an identifier and returns the updated count.
 */
export async function recordFailedAttempt(
  action: string,
  identifier: string,
  windowMinutes = 60
): Promise<number> {
  const windowMs = windowMinutes * 60 * 1000;
  const key = `${action}:${identifier.toLowerCase().trim()}`;
  const now = Date.now();

  const record = attemptStore.get(key);
  if (!record || now - record.firstAttempt > windowMs) {
    attemptStore.set(key, { count: 1, firstAttempt: now });
    return 1;
  }

  record.count += 1;
  return record.count;
}

/**
 * Resets failed attempts after a successful login or operation.
 */
export async function resetFailedAttempts(action: string, identifier: string): Promise<void> {
  const key = `${action}:${identifier.toLowerCase().trim()}`;
  attemptStore.delete(key);
}
