'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useRef } from 'react';

import { brandAccentForCategory } from '@/lib/faq/brandAccentForCategory';
import type { IFaqCategory } from '@/sanity/lib/types';

export interface IFAQCategoryTabsProps {
  /** Categories to render, in display order. */
  categories: IFaqCategory[];
  /** Slug of the currently active category, or `null` for "All". */
  activeCategorySlug: string | null;
}

const ALL_TAB_ID = '__all__';

const BASE_PILL_CLASSES =
  'rounded-full px-3 py-1 text-xs font-medium border transition-colors focus-visible:outline-2 focus-visible:outline-crust focus-visible:outline-offset-2';
const INACTIVE_PILL_CLASSES =
  'bg-crumb text-beaver border-dough hover:border-crust hover:text-blackish';
const ACTIVE_ALL_PILL_CLASSES = 'bg-umber text-flour border-umber';

/**
 * Horizontal filter pills for `/faq` that update `?category=<slug>` without a
 * full navigation. Server-rendered first paint relies on `activeCategorySlug`,
 * so the visible filter matches the URL before hydration completes.
 *
 * Keyboard model follows the WAI-ARIA Authoring Practices "Tabs" pattern:
 * ArrowLeft/ArrowRight wrap through the tab list, Home/End jump to the ends.
 */
export function FAQCategoryTabs({ categories, activeCategorySlug }: IFAQCategoryTabsProps) {
  const router = useRouter();
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const tabs = useMemo(
    () => [
      { id: ALL_TAB_ID, slug: null as string | null, label: 'All', accent: undefined as IFaqCategory['colorAccent'] },
      ...categories.map((category) => ({
        id: category._id,
        slug: category.slug.current,
        label: category.title,
        accent: category.colorAccent,
      })),
    ],
    [categories],
  );

  const activeIndex = useMemo(() => {
    const idx = tabs.findIndex((tab) => tab.slug === activeCategorySlug);
    return idx === -1 ? 0 : idx;
  }, [tabs, activeCategorySlug]);

  const navigateToTab = useCallback(
    (slug: string | null) => {
      const target = slug ? `/faq?category=${encodeURIComponent(slug)}` : '/faq';
      router.replace(target, { scroll: false });
    },
    [router],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
      if (
        event.key !== 'ArrowLeft' &&
        event.key !== 'ArrowRight' &&
        event.key !== 'Home' &&
        event.key !== 'End'
      ) {
        return;
      }

      event.preventDefault();
      let nextIndex = currentIndex;
      if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = tabs.length - 1;

      const nextTab = tabs[nextIndex];
      if (!nextTab) return;

      buttonRefs.current[nextIndex]?.focus();
      navigateToTab(nextTab.slug);
    },
    [tabs, navigateToTab],
  );

  return (
    <div
      role="tablist"
      aria-label="Filter FAQs by category"
      className="flex flex-wrap items-center gap-2"
    >
      {tabs.map((tab, index) => {
        const isActive = index === activeIndex;
        const isAll = tab.slug === null;
        const accentClasses = isAll ? ACTIVE_ALL_PILL_CLASSES : brandAccentForCategory(tab.accent).active;
        const pillClasses = `${BASE_PILL_CLASSES} ${isActive ? accentClasses : INACTIVE_PILL_CLASSES}`;

        return (
          <button
            key={tab.id}
            ref={(el) => {
              buttonRefs.current[index] = el;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            className={pillClasses}
            onClick={() => navigateToTab(tab.slug)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
