import 'server-only';

const TRUSTED_FORWARD_HEADERS = ['x-vercel-forwarded-for', 'x-real-ip'] as const;

/**
 * Best-effort client IP extraction for rate limiting.
 */
export function getClientIp(req: Request): string {
  for (const header of TRUSTED_FORWARD_HEADERS) {
    const value = req.headers.get(header);
    if (value) {
      return value.split(',')[0]?.trim() || 'unknown';
    }
  }

  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return 'unknown';
}
