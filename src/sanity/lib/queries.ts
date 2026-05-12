import { groq } from 'next-sanity';

import { sanityClient } from './client';
import type { IAffiliateOffer, IProduct, IProductForCheckout } from './types';

const productProjection = groq`{
  _id,
  title,
  description,
  type,
  priceInCents,
  stripePriceId,
  image,
  slug,
  active,
}`;

export async function getActiveProducts(): Promise<IProduct[]> {
  return sanityClient.fetch(
    groq`*[_type == "product" && (active == true || !defined(active))] | order(_createdAt desc) ${productProjection}`,
    {},
    { next: { revalidate: 60 } },
  );
}

export async function getProductBySlug(slug: string): Promise<IProduct | null> {
  return sanityClient.fetch(
    groq`*[_type == "product" && slug.current == $slug][0] ${productProjection}`,
    { slug },
    { next: { revalidate: 60 } },
  );
}

/** Active products typed as books, ordered by newest first. */
export async function getBooks(): Promise<IProduct[]> {
  return sanityClient.fetch(
    groq`*[
      _type == "product" &&
      type == "book" &&
      (active == true || !defined(active))
    ] | order(_createdAt desc) ${productProjection}`,
    {},
    { next: { revalidate: 60 } },
  );
}

/** Active book by slug. Returns null if the slug resolves to a non-book or inactive product. */
export async function getBookBySlug(slug: string): Promise<IProduct | null> {
  return sanityClient.fetch(
    groq`*[
      _type == "product" &&
      type == "book" &&
      (active == true || !defined(active)) &&
      slug.current == $slug
    ][0] ${productProjection}`,
    { slug },
    { next: { revalidate: 60 } },
  );
}

export async function getAffiliateOffers(): Promise<IAffiliateOffer[]> {
  return sanityClient.fetch(
    groq`*[_type == "affiliateOffer"] | order(_createdAt desc) {
      _id,
      title,
      description,
      image,
      url
    }`,
    {},
    { next: { revalidate: 300 } },
  );
}

export async function getProductForCheckoutById(productId: string): Promise<IProductForCheckout | null> {
  return sanityClient.fetch(
    groq`*[_type == "product" && _id == $productId][0]{
      _id,
      title,
      description,
      type,
      priceInCents,
      stripePriceId,
      "imageUrl": image.asset->url,
      "asset": asset.asset->{
        url,
        originalFilename,
        mimeType,
        size
      }
    }`,
    { productId },
    { cache: 'no-store' },
  );
}
