'use client';

import Image from 'next/image';
import Link from 'next/link';

import {
  GALLERY_STATUS_COLORS,
  formatGalleryDate,
} from '@/lib/gallery/constants';
import { urlForImage } from '@/sanity/lib/image';
import type { IGalleryItem } from '@/sanity/lib/types';

export interface IGalleryCardProps {
  item: IGalleryItem;
}

export function GalleryCard({ item }: IGalleryCardProps) {
  const imageUrl = item.image?.asset?._ref
    ? urlForImage(item.image).width(640).height(480).fit('crop').auto('format').url()
    : null;

  const scoreLabel = item.score >= 0 ? `+${item.score}` : String(item.score);

  return (
    <Link
      href={`/gallery/${item.slug}`}
      className="group block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-crust"
      aria-label={`View starter photo from ${formatGalleryDate(item.submittedAt)} — ${item.status}`}
    >
      <article className="card overflow-hidden p-0 transition-shadow group-hover:shadow-md">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-crumb">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={item.userLabel ? `Starter photo: ${item.userLabel}` : 'Analyzed sourdough starter photo'}
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 45vw, 90vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl" aria-hidden="true">
              🫙
            </div>
          )}

          <span className="absolute left-2 top-2 rounded-full bg-flour/95 px-2 py-0.5 text-[10px] font-bold text-umber shadow-sm">
            {scoreLabel}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${GALLERY_STATUS_COLORS[item.status]}`}
          >
            {item.status}
          </span>
          <time dateTime={item.submittedAt} className="text-[11px] text-beaver">
            {formatGalleryDate(item.submittedAt)}
          </time>
        </div>
      </article>
    </Link>
  );
}
