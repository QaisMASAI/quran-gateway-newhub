const BASE_DELAY_MS = 1000;
const MAX_DELAY_MS = 30000;

export function getNextMcpRetryDelay(attempt: number): number {
  const exponent = Math.max(0, attempt - 1);
  const backoff = BASE_DELAY_MS * Math.pow(2, exponent);
  return Math.min(MAX_DELAY_MS, backoff);
}
