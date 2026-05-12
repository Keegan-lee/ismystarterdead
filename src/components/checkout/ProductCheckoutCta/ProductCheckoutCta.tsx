'use client';

import { useMemo, useState } from 'react';

import type { IProduct } from '@/sanity/lib/types';

import { CheckoutModal } from '../CheckoutModal/CheckoutModal';
import { urlForImage } from '@/sanity/lib/image';

export interface IProductCheckoutCtaProps {
  product: Pick<IProduct, '_id' | 'title' | 'description' | 'priceInCents' | 'image'>;
  ctaLabel: string;
}

export function ProductCheckoutCta({ product, ctaLabel }: IProductCheckoutCtaProps) {
  const [isOpen, setIsOpen] = useState(false);

  const checkoutProduct = useMemo(
    () => ({
      productId: product._id,
      title: product.title,
      description: product.description,
      priceInCents: product.priceInCents,
      imageUrl: product?.image?.asset?._ref
        ? urlForImage(product.image)
            // This image is used as a "book cover" in the checkout modal.
            // Avoid square thumbnails/cropping and request sufficient resolution.
            .width(600)
            .height(900)
            .fit('max')
            .auto('format')
            .url()
        : undefined,
    }),
    [product._id, product.description, product.priceInCents, product.title, product.image],
  );

  return (
    <>
      <button
        type="button"
        className="btn-primary text-xs inline-flex items-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        <span>{ctaLabel}</span>
      </button>

      <CheckoutModal isOpen={isOpen} onClose={() => setIsOpen(false)} product={checkoutProduct} />
    </>
  );
}
