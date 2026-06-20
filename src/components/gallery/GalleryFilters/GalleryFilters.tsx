'use client';

import type { TGalleryFilterGroup, TGallerySort } from '@/sanity/lib/types';

import { GALLERY_FILTER_OPTIONS, GALLERY_SORT_OPTIONS } from '@/lib/gallery/constants';

export interface IGalleryFiltersProps {
  activeFilter: TGalleryFilterGroup;
  activeSort: TGallerySort;
  onFilterChange: (filter: TGalleryFilterGroup) => void;
  onSortChange: (sort: TGallerySort) => void;
}

const BASE_PILL_CLASSES =
  'rounded-full px-3 py-1 text-xs font-medium border transition-colors focus-visible:outline-2 focus-visible:outline-crust focus-visible:outline-offset-2';
const INACTIVE_PILL_CLASSES =
  'bg-crumb text-beaver border-dough hover:border-crust hover:text-blackish';
const ACTIVE_PILL_CLASSES = 'bg-umber text-flour border-umber';

/**
 * Client-side filter and sort controls for the gallery grid. Updates happen
 * in memory without a full page navigation.
 */
export function GalleryFilters({
  activeFilter,
  activeSort,
  onFilterChange,
  onSortChange,
}: IGalleryFiltersProps) {
  return (
    <div className="mb-6 space-y-4">
      <div
        role="tablist"
        aria-label="Filter gallery by health status"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {GALLERY_FILTER_OPTIONS.map((option) => {
          const isActive = activeFilter === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`${BASE_PILL_CLASSES} ${isActive ? ACTIVE_PILL_CLASSES : INACTIVE_PILL_CLASSES}`}
              onClick={() => onFilterChange(option.id)}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2">
        <label htmlFor="gallery-sort" className="text-xs text-beaver">
          Sort by
        </label>
        <select
          id="gallery-sort"
          value={activeSort}
          onChange={(event) => onSortChange(event.target.value as TGallerySort)}
          className="rounded-lg border border-dough bg-flour px-2.5 py-1.5 text-xs text-blackish focus:outline-none focus-visible:ring-2 focus-visible:ring-crust"
        >
          {GALLERY_SORT_OPTIONS.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
