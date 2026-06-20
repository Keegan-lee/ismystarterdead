import Link from 'next/link';
import type { Metadata } from 'next';

import { GalleryView } from '@/components/gallery/GalleryView/GalleryView';
import { toCanonicalUrl } from '@/lib/seo/canonical';
import { getGalleryItems } from '@/sanity/lib/queries';

const GALLERY_DESCRIPTION =
  'Browse real sourdough starter photos from the community — healthy, struggling, and dead. Compare yours and learn what each stage looks like.';

const GALLERY_CANONICAL = toCanonicalUrl('/gallery');

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Starter Gallery',
  description: GALLERY_DESCRIPTION,
  alternates: { canonical: GALLERY_CANONICAL },
  openGraph: {
    title: 'Starter Gallery',
    description: GALLERY_DESCRIPTION,
    url: GALLERY_CANONICAL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Starter Gallery',
    description: GALLERY_DESCRIPTION,
  },
};

export default async function GalleryPage() {
  const items = await getGalleryItems();

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="mb-2 font-serif text-3xl font-bold text-blackish">Starter Gallery</h1>
        <p className="mx-auto max-w-md text-sm text-beaver">
          Real photos from analyzed starters — healthy, struggling, and dead. Filter and compare with
          your own.
        </p>
      </header>

      <GalleryView items={items} />

      <div className="card mt-10 border-2 border-dashed border-crust text-center">
        <p className="text-2xl mb-2" aria-hidden="true">
          📸
        </p>
        <h2 className="font-serif font-bold text-blackish mb-1">Add your starter</h2>
        <p className="text-xs text-beaver mb-4">
          Upload a photo on the diagnostic page — successful analyses are added to the gallery
          automatically.
        </p>
        <Link href="/" className="btn-primary text-xs inline-block">
          Check your starter →
        </Link>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-beaver hover:text-umber transition-colors underline">
          ← Check your own starter
        </Link>
      </div>
    </main>
  );
}
