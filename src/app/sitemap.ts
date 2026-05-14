import type { MetadataRoute } from 'next';

import { toCanonicalUrl } from '@/lib/seo/canonical';
import { getIndexableSanitySitemapEntries } from '@/sanity/lib/sitemap';

/** Regenerate sitemap periodically; aligns with Sanity revalidate windows elsewhere. */
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: toCanonicalUrl('/'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: toCanonicalUrl('/books'),
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
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
    {
      url: toCanonicalUrl('/faq'),
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const dynamicEntries = await getIndexableSanitySitemapEntries();
  const dynamicSitemap: MetadataRoute.Sitemap = dynamicEntries.map((entry) => ({
    url: toCanonicalUrl(entry.pathname),
    lastModified: new Date(entry.updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...dynamicSitemap];
}
