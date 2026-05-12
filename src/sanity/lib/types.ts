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
