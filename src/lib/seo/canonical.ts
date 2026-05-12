export const CANONICAL_ORIGIN = 'https://ismystarterdead.com';

function stripTrailingSlash(pathname: string): string {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

/**
 * Convert an internal pathname into a canonical absolute URL.
 *
 * - Removes query/hash (if present)
 * - Ensures a leading slash
 * - Enforces no-trailing-slash policy (except for `/`)
 */
export function toCanonicalUrl(inputPathname: string): string {
  const withoutQuery = inputPathname.split('?')[0]?.split('#')[0] ?? '';
  const withLeadingSlash = withoutQuery.startsWith('/') ? withoutQuery : `/${withoutQuery}`;
  const canonicalPath = stripTrailingSlash(withLeadingSlash);
  return `${CANONICAL_ORIGIN}${canonicalPath}`;
}

