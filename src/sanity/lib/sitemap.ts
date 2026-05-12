import 'server-only';

import { groq } from 'next-sanity';

import { sanityClient } from './client';

export type TSanitySitemapEntry = {
  pathname: string;
  updatedAt: string;
};

/**
 * Aggregates indexable sitemap entries sourced from Sanity content.
 *
 * Currently surfaces `/books/{slug}` for active books with a published slug.
 */
export async function getIndexableSanitySitemapEntries(): Promise<TSanitySitemapEntry[]> {
  return getIndexableBookEntries();
}

/** Active books surfaced at `/books/{slug}`. Excludes drafts and inactive entries. */
export async function getIndexableBookEntries(): Promise<TSanitySitemapEntry[]> {
  const rows = await sanityClient.fetch(
    groq`*[
      _type == "product" &&
      type == "book" &&
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
    return [{ pathname: `/books/${row.slug}`, updatedAt: row.updatedAt }];
  });
}

/**
 * Legacy seam: `/products/{slug}` is not currently a routed page. Kept for callers
 * that may still expect this signature; prefer `getIndexableBookEntries`.
 */
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
