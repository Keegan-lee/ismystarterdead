import { brandAccentForCategory } from '@/lib/faq/brandAccentForCategory';
import type { IFaqItem, TFaqItemCategoryRef } from '@/sanity/lib/types';

import { FAQItem } from '../FAQItem/FAQItem';

export interface IFAQListProps {
  /** Full set of FAQs in canonical order (already filtered to `active`). */
  faqs: IFaqItem[];
  /** Slug of the active category filter, or `null` to render every FAQ grouped by category. */
  activeCategorySlug: string | null;
}

interface ICategoryGroup {
  category: TFaqItemCategoryRef;
  items: IFaqItem[];
}

/**
 * Groups FAQs by their resolved category while preserving the order in which
 * each category first appears in the source array. This keeps category headings
 * in the editor-defined order without a second sort pass.
 */
function groupByCategory(faqs: IFaqItem[]): ICategoryGroup[] {
  const groups = new Map<string, ICategoryGroup>();
  for (const faq of faqs) {
    const key = faq.category.slug;
    const existing = groups.get(key);
    if (existing) {
      existing.items.push(faq);
    } else {
      groups.set(key, { category: faq.category, items: [faq] });
    }
  }
  return Array.from(groups.values());
}

/**
 * Server-rendered list of FAQs.
 *
 * - When `activeCategorySlug` is null, renders every category as a labelled
 *   section so users can scan across topics.
 * - When a category is selected, renders a flat list with a thin category-
 *   tinted accent bar so the visible filter state is always obvious.
 */
export function FAQList({ faqs, activeCategorySlug }: IFAQListProps) {
  const visible = activeCategorySlug
    ? faqs.filter((faq) => faq.category.slug === activeCategorySlug)
    : faqs;

  if (visible.length === 0) {
    return (
      <p className="mt-8 rounded-lg border border-dashed border-dough bg-crumb px-4 py-6 text-center text-sm text-beaver">
        No questions in this category yet — check back soon.
      </p>
    );
  }

  if (activeCategorySlug) {
    const activeCategory = visible[0]?.category;
    const accent = brandAccentForCategory(activeCategory?.colorAccent);

    return (
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-3">
          <span aria-hidden="true" className={`h-3 w-1 rounded-full ${accent.bar}`} />
          <h2 className="font-serif text-lg font-semibold text-blackish">
            {activeCategory?.title}
          </h2>
        </div>
        <div>
          {visible.map((faq) => (
            <FAQItem key={faq._id} faq={faq} />
          ))}
        </div>
      </div>
    );
  }

  const groups = groupByCategory(visible);

  return (
    <div className="mt-8 space-y-10">
      {groups.map((group) => {
        const accent = brandAccentForCategory(group.category.colorAccent);
        return (
          <section
            key={group.category._id}
            aria-labelledby={`faq-category-${group.category.slug}`}
          >
            <div className="mb-4 flex items-center gap-3">
              <span aria-hidden="true" className={`h-3 w-1 rounded-full ${accent.bar}`} />
              <h2
                id={`faq-category-${group.category.slug}`}
                className="font-serif text-lg font-semibold text-blackish"
              >
                {group.category.title}
              </h2>
            </div>
            <div>
              {group.items.map((faq) => (
                <FAQItem key={faq._id} faq={faq} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
