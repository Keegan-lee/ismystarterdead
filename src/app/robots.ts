import type { MetadataRoute } from 'next';

import { CANONICAL_ORIGIN } from '@/lib/seo/canonical';

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV === 'production';

  if (!isProd) {
    return {
      rules: [
        {
          userAgent: '*',
          disallow: '/',
        },
      ],
      sitemap: `${CANONICAL_ORIGIN}/sitemap.xml`,
      host: CANONICAL_ORIGIN,
    };
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api', '/studio', '/receipt'],
      },
    ],
    sitemap: `${CANONICAL_ORIGIN}/sitemap.xml`,
    host: CANONICAL_ORIGIN,
  };
}

