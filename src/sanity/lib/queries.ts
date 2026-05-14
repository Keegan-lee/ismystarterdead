import { groq } from 'next-sanity';

import { sanityClient } from './client';
import type {
  IAffiliateOffer,
  IFaqCategory,
  IFaqItem,
  IProduct,
  IProductForCheckout,
} from './types';

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

/**
 * Shared GROQ projection for `faqItem` documents. Dereferences the category
 * into a compact ref shape so the frontend can render filter pills and group
 * labels without a second round-trip.
 */
const faqItemProjection = groq`{
  _id,
  question,
  "slug": slug.current,
  answer,
  answerPlain,
  order,
  seoKeywords,
  active,
  "category": category->{
    _id,
    title,
    "slug": slug.current,
    colorAccent
  }
}`;

/** Active FAQ categories ordered for the `/faq` filter pills. Excludes drafts and inactive entries. */
export async function getFaqCategories(): Promise<IFaqCategory[]> {
  return sanityClient.fetch(
    groq`*[
      _type == "faqCategory" &&
      (active == true || !defined(active)) &&
      !(_id in path("drafts.**"))
    ] | order(coalesce(order, 100) asc, title asc) {
      _id,
      title,
      slug,
      description,
      order,
      colorAccent,
      active
    }`,
    {},
    /** Editorial content: avoid caching empty/stale responses after imports (see `getAllFaqs`). */
    { next: { revalidate: 0 } },
  );
}

/**
 * All active FAQ items, ordered by category then within-category order. Items
 * whose `category` reference does not resolve to a published document are omitted
 * (`defined(category->)`).
 */
export async function getAllFaqs(): Promise<IFaqItem[]> {
  return sanityClient.fetch(
    groq`*[
      _type == "faqItem" &&
      (active == true || !defined(active)) &&
      !(_id in path("drafts.**")) &&
      defined(category->)
    ] | order(coalesce(category->order, 100) asc, coalesce(order, 100) asc, question asc) ${faqItemProjection}`,
    {},
    /**
     * Always revalidate: FAQs change rarely but must appear immediately after Studio
     * edits or `faqs:import`; a long `revalidate` window made it easy to assume the
     * page was "broken" while the Data Cache still held an older empty response.
     */
    { next: { revalidate: 0 } },
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
