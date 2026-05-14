import type { TFaqColorAccent } from '@/sanity/lib/types';

/** Tailwind class pair driving the active filter pill and category accent bar. */
export interface IFaqAccentClasses {
  /** Classes applied to the active filter pill (background + text + border). */
  active: string;
  /** Solid background class used for the category accent bar in filtered lists. */
  bar: string;
}

/**
 * Map a Sanity-authored `colorAccent` token to a Tailwind class pair.
 *
 * Keeping this in a single helper guarantees the same combinations are used by
 * {@link FAQCategoryTabs} and {@link FAQList}, and that any new accent added in
 * Studio fails closed to the default `crust` style instead of silently
 * disappearing.
 *
 * WCAG AA notes:
 * - `crust`, `umber`, `alive`, `warn` all clear AA on `text-flour`.
 * - `dough` deliberately uses `text-blackish` because the swatch is too light
 *   to pair with `flour`.
 *
 * @param accent The `colorAccent` value from a `faqCategory` doc.
 * @returns Tailwind class strings keyed by usage.
 */
export function brandAccentForCategory(
  accent: TFaqColorAccent | undefined,
): IFaqAccentClasses {
  switch (accent) {
    case 'umber':
      return { active: 'bg-umber text-flour border-umber', bar: 'bg-umber' };
    case 'alive':
      return { active: 'bg-alive text-flour border-alive', bar: 'bg-alive' };
    case 'warn':
      return { active: 'bg-warn text-flour border-warn', bar: 'bg-warn' };
    case 'dough':
      return { active: 'bg-dough text-blackish border-dough', bar: 'bg-dough' };
    case 'crust':
    default:
      return { active: 'bg-crust text-flour border-crust', bar: 'bg-crust' };
  }
}
