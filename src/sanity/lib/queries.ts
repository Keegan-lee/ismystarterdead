import { groq } from 'next-sanity';

import { sanityClient } from './client';
import type { IAffiliateOffer, IProduct, IProductForCheckout } from './types';

const productProjection = groq`{
  _id,
  title,
  description,
  stripePriceId,
  displayPrice,
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
      displayPrice,
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

