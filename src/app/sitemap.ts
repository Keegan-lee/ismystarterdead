import type { MetadataRoute } from 'next';

import { toCanonicalUrl } from '@/lib/seo/canonical';

/** Regenerate sitemap periodically; aligns with Sanity revalidate windows elsewhere. */
export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: toCanonicalUrl('/'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: toCanonicalUrl('/gallery'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: toCanonicalUrl('/discard-recipes'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
}

