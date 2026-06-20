import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import StarterMeter from '@/components/StarterMeter';
import {
  GALLERY_STATUS_CARD_COLORS,
  GALLERY_STATUS_COLORS,
  formatGalleryDate,
} from '@/lib/gallery/constants';
import { evaluateStarterScore } from '@/lib/evaluateScore';
import { toCanonicalUrl } from '@/lib/seo/canonical';
import { urlForImage } from '@/sanity/lib/image';
import { getGalleryItemBySlug } from '@/sanity/lib/queries';

export const revalidate = 0;

interface IGalleryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: IGalleryDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getGalleryItemBySlug(slug);

  if (!item) {
    return {
      title: 'Photo not found',
      description: 'This gallery photo could not be found.',
    };
  }

  const title = `${item.status} starter`;
  const description = `Analyzed sourdough starter photo — ${item.status} (score ${item.score}). Submitted ${formatGalleryDate(item.submittedAt)}.`;
  const canonical = toCanonicalUrl(`/gallery/${slug}`);

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function GalleryDetailPage({ params }: IGalleryDetailPageProps) {
  const { slug } = await params;
  const item = await getGalleryItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const result = evaluateStarterScore(item.score);
  const imageUrl = item.image?.asset?._ref
    ? urlForImage(item.image).width(1200).height(900).fit('max').auto('format').url()
    : null;

  const scoreLabel = item.score >= 0 ? `+${item.score}` : String(item.score);

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/gallery"
          className="text-sm text-beaver hover:text-umber transition-colors underline"
        >
          ← Back to gallery
        </Link>
      </div>

      <article>
        <header className={`rounded-2xl border-2 ${GALLERY_STATUS_CARD_COLORS[item.status]} p-6 mb-6 text-center`}>
          <div className="flex justify-center mb-4">
            <StarterMeter score={item.score} compact />
          </div>
          <h1 className={`font-serif text-2xl font-bold mb-2 ${result.color}`}>{result.headline}</h1>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${GALLERY_STATUS_COLORS[item.status]}`}
            >
              {item.status}
            </span>
            <span className="rounded-full bg-flour px-2.5 py-0.5 text-xs font-bold text-umber">
              Score {scoreLabel}
            </span>
            <time dateTime={item.submittedAt} className="text-xs text-beaver">
              {formatGalleryDate(item.submittedAt)}
            </time>
          </div>
        </header>

        <div className="card overflow-hidden p-0 mb-6">
          <div className="relative aspect-[4/3] w-full bg-crumb">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={item.userLabel ? `Starter photo: ${item.userLabel}` : 'Analyzed sourdough starter photo'}
                fill
                sizes="(min-width: 768px) 768px, 90vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-5xl" aria-hidden="true">
                🫙
              </div>
            )}
          </div>
        </div>

        {item.userLabel && (
          <div className="card mb-6">
            <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-1">Note</p>
            <p className="text-sm text-blackish leading-relaxed">{item.userLabel}</p>
          </div>
        )}

        <div className="card">
          <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-3">What this means</p>
          <p className="text-sm text-beaver leading-relaxed mb-4">{result.message}</p>
          <ol className="space-y-2">
            {result.actions.slice(0, 3).map((action, index) => (
              <li key={action} className="flex items-start gap-2 text-sm text-blackish">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-dough text-[10px] font-bold text-umber">
                  {index + 1}
                </span>
                <span>{action}</span>
              </li>
            ))}
          </ol>
        </div>
      </article>

      <div className="mt-8 text-center">
        <Link href="/" className="btn-primary text-xs inline-block">
          Check your own starter →
        </Link>
      </div>
    </main>
  );
}
