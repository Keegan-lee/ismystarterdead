import 'server-only';

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

import {
  ANALYZE_RATE_LIMIT_MAX,
  ANALYZE_RATE_LIMIT_WINDOW,
} from '@/lib/analyze/constants';
import { checkMemoryRateLimit, resetMemoryRateLimitForTests } from '@/lib/analyze/memoryRateLimit';

let upstashLimiter: Ratelimit | null | undefined;

function getUpstashLimiter(): Ratelimit | null {
  if (upstashLimiter !== undefined) {
    return upstashLimiter;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    upstashLimiter = null;
    return null;
  }

  upstashLimiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(ANALYZE_RATE_LIMIT_MAX, ANALYZE_RATE_LIMIT_WINDOW),
    prefix: 'ismystarterdead:analyze',
    analytics: false,
  });

  return upstashLimiter;
}

export interface IAnalyzeRateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Enforces max 5 analyze requests per IP per hour.
 * Uses Upstash Redis when configured, otherwise an in-memory fallback for local dev.
 */
export async function checkAnalyzeRateLimit(ip: string): Promise<IAnalyzeRateLimitResult> {
  const key = ip || 'unknown';

  const upstash = getUpstashLimiter();
  if (upstash) {
    const result = await upstash.limit(key);
    return {
      allowed: result.success,
      remaining: result.remaining,
      resetAt: result.reset,
    };
  }

  return checkMemoryRateLimit(key);
}

/** Test helper to reset in-memory buckets. */
export function resetAnalyzeRateLimitForTests(): void {
  resetMemoryRateLimitForTests();
  upstashLimiter = undefined;
}
