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

export interface IProduct {
  _id: string;
  title: string;
  description: string;
  stripePriceId: string;
  displayPrice: string;
  image: ISanityImageAssetRef;
  asset: ISanityFileAssetRef;
  slug?: { current?: string };
  active?: boolean;
}

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
  displayPrice: string;
  stripePriceId: string;
  imageUrl?: string;
  asset: {
    url: string;
    originalFilename: string;
    mimeType: string;
    size: number;
  };
}

