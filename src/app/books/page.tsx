import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

import { getBooks } from '@/sanity/lib/queries';
import { urlForImage } from '@/sanity/lib/image';
import { formatPriceInCents } from '@/lib/pricing/formatPrice';
import type { IProduct } from '@/sanity/lib/types';

export const metadata: Metadata = {
  title: 'Books',
  description:
    'Browse our sourdough discard cookbooks. Tested, beginner-friendly recipes delivered to your inbox—pay once or grab the free starter pack.',
  openGraph: {
    title: 'Books',
    description:
      'Sourdough discard cookbooks. Tested, beginner-friendly recipes delivered to your inbox—pay once or grab the free starter pack.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Books',
    description:
      'Sourdough discard cookbooks. Tested, beginner-friendly recipes delivered to your inbox—pay once or grab the free starter pack.',
  },
};

function BookCard({ book }: { book: IProduct }) {
  const slug = book.slug?.current;
  const imageUrl = book.image?.asset?._ref
    ? urlForImage(book.image).width(480).height(720).fit('max').auto('format').url()
    : null;
  const priceLabel = formatPriceInCents(book.priceInCents);
  const isFree = book.priceInCents <= 0;

  const Card = (
    <article className="card flex flex-col h-full transition-shadow hover:shadow-md">
      <div className="relative w-full aspect-[2/3] overflow-hidden rounded-xl border border-dough bg-crumb">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`${book.title} cover`}
            fill
            sizes="(min-width: 768px) 280px, (min-width: 640px) 45vw, 90vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl" aria-hidden="true">
            📖
          </div>
        )}

        <span
          className={`absolute top-2 left-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            isFree ? 'bg-green-100 text-green-800' : 'bg-dough text-umber'
          }`}
        >
          {isFree ? 'Free' : priceLabel}
        </span>
      </div>

      <div className="mt-4 flex flex-1 flex-col">
        <h2 className="font-serif font-bold text-blackish text-base leading-snug">{book.title}</h2>
        <p className="mt-1.5 text-xs text-beaver leading-relaxed line-clamp-3">{book.description}</p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-blackish">{priceLabel}</p>
          <span
            className="btn-primary text-xs inline-flex items-center gap-1 px-4 py-2"
            aria-hidden={slug ? 'false' : 'true'}
          >
            {isFree ? 'Get it free' : 'View book'} <span aria-hidden="true">→</span>
          </span>
        </div>
      </div>
    </article>
  );

  if (!slug) return Card;

  return (
    <Link
      href={`/books/${slug}`}
      className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-crust"
      aria-label={`Open ${book.title}`}
    >
      {Card}
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="card text-center border-2 border-dashed border-crust">
      <p className="text-3xl mb-2" aria-hidden="true">
        📚
      </p>
      <h2 className="font-serif font-bold text-blackish mb-1">No books yet</h2>
      <p className="text-xs text-beaver">
        We&apos;re kneading the next batch. Check back soon — or grab a free recipe in the meantime.
      </p>
      <div className="mt-4">
        <Link
          href="/discard-recipes"
          className="text-sm text-umber underline underline-offset-2 hover:text-beaver transition-colors"
        >
          Browse free recipes →
        </Link>
      </div>
    </div>
  );
}

export default async function BooksPage() {
  const books = await getBooks();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
        <header className="text-center mb-10">
          <p className="text-[11px] font-semibold text-beaver uppercase tracking-[0.2em] mb-2">Library</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-blackish mb-3">Sourdough Books</h1>
          <p className="text-beaver text-sm max-w-md mx-auto leading-relaxed">
            Tested cookbooks for using your discard, baking a perfect loaf, and keeping your starter alive.
            Delivered to your inbox after checkout.
          </p>
        </header>

        {books.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {books.map((book) => (
              <li key={book._id} className="flex">
                <BookCard book={book} />
              </li>
            ))}
          </ul>
        )}

        <div className="text-center mt-10">
          <Link href="/" className="text-sm text-beaver hover:text-umber transition-colors underline underline-offset-2">
            ← Check if your starter is alive
          </Link>
        </div>
    </main>
  );
}
