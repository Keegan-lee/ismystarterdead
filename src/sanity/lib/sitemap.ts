import 'server-only';

import { groq } from 'next-sanity';

import { sanityClient } from './client';

export type TSanitySitemapEntry = {
  pathname: string;
  updatedAt: string;
};

/**
 * Seam for future sitemap expansion.
 *
 * This repo currently has no indexable dynamic routes (e.g. `/products/[slug]`),
 * so this function intentionally returns an empty list until such routes exist.
 */
export async function getIndexableSanitySitemapEntries(): Promise<TSanitySitemapEntry[]> {
  // NOTE: Enable once an indexable dynamic route exists (e.g. /products/[slug]).
  return [];
}

export async function getIndexableProductEntries(): Promise<TSanitySitemapEntry[]> {
  const rows = await sanityClient.fetch(
    groq`*[
      _type == "product" &&
      defined(slug.current) &&
      (active == true || !defined(active)) &&
      !(_id in path("drafts.**"))
    ]{
      "slug": slug.current,
      "updatedAt": _updatedAt
    }`,
    {},
    { next: { revalidate: 300 } },
  );

  return (rows as Array<{ slug?: string; updatedAt?: string }>).flatMap((row) => {
    if (!row.slug || !row.updatedAt) return [];
    return [{ pathname: `/products/${row.slug}`, updatedAt: row.updatedAt }];
  });
}

