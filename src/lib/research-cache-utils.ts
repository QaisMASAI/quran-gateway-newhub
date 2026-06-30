export function normalizeCacheQuestion(question: string): string {
  return question.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isRecentByTtl(iso: string | null | undefined, ttlMs: number): boolean {
  if (!iso) return false;
  const parsed = Date.parse(iso);
  if (Number.isNaN(parsed)) return false;
  return Date.now() - parsed <= ttlMs;
}

export function shouldServeCachedResult(options: {
  cacheVersion?: number | null;
  currentVersion: number;
  createdAt?: string | null;
  ttlMs: number;
}): boolean {
  return (
    Number(options.cacheVersion ?? 1) === options.currentVersion &&
    isRecentByTtl(options.createdAt, options.ttlMs)
  );
}