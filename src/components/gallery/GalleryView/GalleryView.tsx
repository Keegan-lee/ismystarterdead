'use client';

import { useMemo, useState } from 'react';

import { GALLERY_PAGE_SIZE, statusToFilterGroup } from '@/lib/gallery/constants';
import type { IGalleryItem, TGalleryFilterGroup, TGallerySort } from '@/sanity/lib/types';

import { GalleryCard } from '../GalleryCard/GalleryCard';
import { GalleryFilters } from '../GalleryFilters/GalleryFilters';

export interface IGalleryViewProps {
  items: IGalleryItem[];
}

function sortItems(items: IGalleryItem[], sort: TGallerySort): IGalleryItem[] {
  const copy = [...items];
  if (sort === 'score') {
    return copy.sort((a, b) => b.score - a.score);
  }
  return copy.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );
}

function filterItems(items: IGalleryItem[], filter: TGalleryFilterGroup): IGalleryItem[] {
  if (filter === 'all') return items;
  return items.filter((item) => statusToFilterGroup(item.status) === filter);
}

export function GalleryView({ items }: IGalleryViewProps) {
  const [activeFilter, setActiveFilter] = useState<TGalleryFilterGroup>('all');
  const [activeSort, setActiveSort] = useState<TGallerySort>('date');
  const [visibleCount, setVisibleCount] = useState(GALLERY_PAGE_SIZE);

  const filteredAndSorted = useMemo(() => {
    return sortItems(filterItems(items, activeFilter), activeSort);
  }, [items, activeFilter, activeSort]);

  const visibleItems = filteredAndSorted.slice(0, visibleCount);
  const hasMore = visibleCount < filteredAndSorted.length;

  const handleFilterChange = (filter: TGalleryFilterGroup) => {
    setActiveFilter(filter);
    setVisibleCount(GALLERY_PAGE_SIZE);
  };

  const handleSortChange = (sort: TGallerySort) => {
    setActiveSort(sort);
    setVisibleCount(GALLERY_PAGE_SIZE);
  };

  return (
    <>
      <GalleryFilters
        activeFilter={activeFilter}
        activeSort={activeSort}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
      />

      {filteredAndSorted.length === 0 ? (
        <div className="card border-2 border-dashed border-crust text-center">
          <p className="text-3xl mb-2" aria-hidden="true">
            🫙
          </p>
          <h2 className="font-serif font-bold text-blackish mb-1">No photos yet</h2>
          <p className="text-xs text-beaver">
            {items.length === 0
              ? 'Run a photo diagnostic to be the first starter in the gallery.'
              : 'No starters match this filter. Try another category.'}
          </p>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {visibleItems.map((item) => (
              <li key={item._id}>
                <GalleryCard item={item} />
              </li>
            ))}
          </ul>

          {hasMore && (
            <div className="text-center mb-8">
              <button
                type="button"
                className="btn-secondary text-xs"
                onClick={() => setVisibleCount((count) => count + GALLERY_PAGE_SIZE)}
              >
                Load more ({filteredAndSorted.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
