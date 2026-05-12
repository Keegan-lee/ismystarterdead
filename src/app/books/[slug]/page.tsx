import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { ProductCheckoutCta } from '@/components/checkout/ProductCheckoutCta/ProductCheckoutCta';
import { getBookBySlug } from '@/sanity/lib/queries';
import { urlForImage } from '@/sanity/lib/image';
import { formatPriceInCents } from '@/lib/pricing/formatPrice';
import { toCanonicalUrl } from '@/lib/seo/canonical';

type TParams = { slug: string };

function truncateForDescription(input: string, max = 158): string {
  const flat = input.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max - 1).trimEnd()}…`;
}

export async function generateMetadata({ params }: { params: Promise<TParams> }): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    return {
      title: 'Book not found',
      description: 'This book is unavailable. Browse other sourdough cookbooks instead.',
      robots: { index: false, follow: false },
    };
  }

  const description = truncateForDescription(book.description);
  const canonical = toCanonicalUrl(`/books/${slug}`);

  return {
    title: book.title.length <= 20 ? book.title : `${book.title.slice(0, 19)}…`,
    description,
    alternates: { canonical },
    openGraph: {
      title: book.title,
      description,
      type: 'article',
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: book.title,
      description,
    },
  };
}

export default async function BookDetailPage({ params }: { params: Promise<TParams> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) notFound();

  const coverUrl = book.image?.asset?._ref
    ? urlForImage(book.image).width(720).height(1080).fit('max').auto('format').url()
    : null;
  const isFree = book.priceInCents <= 0;
  const priceLabel = formatPriceInCents(book.priceInCents);
  const ctaLabel = isFree ? `Get the book — Free →` : `Get the book — ${priceLabel} →`;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-beaver">
          <Link href="/books" className="hover:text-umber underline-offset-2 hover:underline">
            Books
          </Link>{' '}
          <span aria-hidden="true">/</span>{' '}
          <span className="text-blackish">{book.title}</span>
        </nav>

        <article className="grid grid-cols-1 md:grid-cols-[minmax(0,280px)_1fr] gap-8 items-start">
          <div className="card p-3">
            <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl">
              {coverUrl ? (
                <Image
                  src={coverUrl}
                  alt={`${book.title} cover`}
                  fill
                  sizes="(min-width: 768px) 280px, 80vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-5xl bg-crumb" aria-hidden="true">
                  📖
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-beaver uppercase tracking-[0.2em] mb-2">
              {isFree ? 'Free download' : 'Cookbook'}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-blackish leading-tight">
              {book.title}
            </h1>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-blackish">{priceLabel}</span>
              {isFree ? (
                <span className="text-xs text-beaver">No payment required</span>
              ) : (
                <span className="text-xs text-beaver">One-time purchase</span>
              )}
            </div>

            <p className="mt-5 text-sm text-blackish leading-relaxed whitespace-pre-line">
              {book.description}
            </p>

            <ul className="mt-6 space-y-2 text-xs text-beaver">
              <li className="flex items-start gap-2">
                <span className="text-crust mt-0.5">•</span>
                <span>Delivered by email after checkout</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-crust mt-0.5">•</span>
                <span>No account required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-crust mt-0.5">•</span>
                <span>{isFree ? 'Always free' : 'Secure checkout powered by Stripe'}</span>
              </li>
            </ul>

            <div className="mt-7">
              <ProductCheckoutCta product={book} ctaLabel={ctaLabel} />
            </div>
          </div>
        </article>

        <div className="text-center mt-12">
          <Link
            href="/books"
            className="text-sm text-beaver hover:text-umber transition-colors underline underline-offset-2"
          >
            ← Back to all books
          </Link>
        </div>
    </main>
  );
}
