import type { PortableTextBlock } from '@portabletext/types';

export interface ISanityImageAssetRef {
  asset?: {
    _ref: string;
    _type: 'reference';
  };
}

export interface ISanityFileAssetRef {
  asset?: {
    _ref: string;
    _type: 'reference';
  };
}

export type TProductType = 'book';

export interface IProduct {
  _id: string;
  title: string;
  description: string;
  type: TProductType;
  priceInCents: number;
  stripePriceId?: string;
  image: ISanityImageAssetRef;
  asset: ISanityFileAssetRef;
  slug?: { current?: string };
  active?: boolean;
}

/** Serializable product fields passed from RSC into checkout CTAs. */
export type TProductCheckoutSummary = Pick<IProduct, '_id' | 'title' | 'description' | 'priceInCents' | 'image'>;

export interface IAffiliateOffer {
  _id: string;
  title: string;
  description: string;
  image: ISanityImageAssetRef;
  url: string;
}

export interface IProductForCheckout {
  _id: string;
  title: string;
  description: string;
  type: TProductType;
  priceInCents: number;
  stripePriceId?: string;
  imageUrl?: string;
  asset: {
    url: string;
    originalFilename: string;
    mimeType: string;
    size: number;
  };
}

/**
 * A single Portable Text block as returned by Sanity. Re-exported here so app
 * code can stay on `@/sanity/lib/types` without importing `@portabletext/types`
 * directly.
 */
export type TPortableTextBlock = PortableTextBlock;

/**
 * Constrained brand-token name used to tint FAQ category filter pills.
 * Mirrors the `colorAccent` list in `src/sanity/schemas/faqCategory.ts`.
 */
export type TFaqColorAccent = 'crust' | 'umber' | 'alive' | 'warn' | 'dough';

/**
 * A taxonomy entry that groups one or more {@link IFaqItem} documents.
 * Used to build the filter pills on `/faq`.
 */
export interface IFaqCategory {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  order?: number;
  colorAccent?: TFaqColorAccent;
  active?: boolean;
}

/**
 * Compact, denormalised category shape embedded in {@link IFaqItem} via GROQ
 * dereferencing. Avoids shipping the full category document with each item.
 */
export type TFaqItemCategoryRef = Pick<IFaqCategory, '_id' | 'title' | 'colorAccent'> & {
  slug: string;
};

/**
 * A single question/answer document, resolved with its category dereferenced
 * into a compact {@link TFaqItemCategoryRef}. This is the shape consumed by
 * `FAQList`, `FAQItem`, and `FAQJsonLd`.
 */
export interface IFaqItem {
  _id: string;
  question: string;
  slug: string;
  answer: TPortableTextBlock[];
  answerPlain?: string;
  order?: number;
  seoKeywords?: string[];
  active?: boolean;
  category: TFaqItemCategoryRef;
}
