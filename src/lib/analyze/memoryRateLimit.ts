import { ANALYZE_RATE_LIMIT_MAX } from '@/lib/analyze/constants';

interface IRateLimitState {
  count: number;
  resetAt: number;
}

const memoryBuckets = new Map<string, IRateLimitState>();

export interface IMemoryRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkMemoryRateLimit(
  key: string,
  now = Date.now(),
  windowMs = 60 * 60 * 1000,
): IMemoryRateLimitResult {
  const existing = memoryBuckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    memoryBuckets.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: ANALYZE_RATE_LIMIT_MAX - 1,
      resetAt,
    };
  }

  if (existing.count >= ANALYZE_RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  memoryBuckets.set(key, existing);

  return {
    allowed: true,
    remaining: ANALYZE_RATE_LIMIT_MAX - existing.count,
    resetAt: existing.resetAt,
  };
}

export function resetMemoryRateLimitForTests(): void {
  memoryBuckets.clear();
}
