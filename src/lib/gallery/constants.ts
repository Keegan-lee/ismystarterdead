import type { StarterResult } from '@/lib/evaluateScore';
import type { TGalleryFilterGroup } from '@/sanity/lib/types';

/** Tailwind classes for each diagnostic status badge. */
export const GALLERY_STATUS_COLORS: Record<StarterResult['status'], string> = {
  Alive: 'bg-green-100 text-green-800',
  'Needs Love': 'bg-amber-100 text-amber-800',
  'At Risk': 'bg-yellow-100 text-yellow-800',
  'Likely Dead': 'bg-orange-100 text-orange-800',
  Contaminated: 'bg-red-100 text-red-800',
};

/** Card border/background tints keyed by diagnostic status. */
export const GALLERY_STATUS_CARD_COLORS: Record<StarterResult['status'], string> = {
  Alive: 'bg-green-50 border-green-200',
  'Needs Love': 'bg-amber-50 border-amber-200',
  'At Risk': 'bg-yellow-50 border-yellow-200',
  'Likely Dead': 'bg-orange-50 border-orange-200',
  Contaminated: 'bg-red-50 border-red-200',
};

export const GALLERY_FILTER_OPTIONS: ReadonlyArray<{ id: TGalleryFilterGroup; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'healthy', label: 'Healthy' },
  { id: 'struggling', label: 'Struggling' },
  { id: 'dead', label: 'Dead' },
];

export const GALLERY_SORT_OPTIONS: ReadonlyArray<{ id: 'date' | 'score'; label: string }> = [
  { id: 'date', label: 'Newest first' },
  { id: 'score', label: 'Highest score' },
];

/** Number of gallery cards shown per "load more" page. */
export const GALLERY_PAGE_SIZE = 12;

/**
 * Maps a fine-grained diagnostic status into the coarse filter groups used
 * on the gallery page (Healthy / Struggling / Dead).
 */
export function statusToFilterGroup(
  status: StarterResult['status'],
): Exclude<TGalleryFilterGroup, 'all'> {
  switch (status) {
    case 'Alive':
      return 'healthy';
    case 'Needs Love':
    case 'At Risk':
      return 'struggling';
    case 'Likely Dead':
    case 'Contaminated':
      return 'dead';
  }
}

/** Formats an ISO datetime for compact gallery card display. */
export function formatGalleryDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
