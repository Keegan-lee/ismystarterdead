import type { Metadata } from 'next';

import { FAQCategoryTabs } from '@/components/faq/FAQCategoryTabs/FAQCategoryTabs';
import { FAQJsonLd } from '@/components/faq/FAQJsonLd/FAQJsonLd';
import { FAQList } from '@/components/faq/FAQList/FAQList';
import { toCanonicalUrl } from '@/lib/seo/canonical';
import { getAllFaqs, getFaqCategories } from '@/sanity/lib/queries';

const FAQ_DESCRIPTION =
  'Common questions about sourdough starters — how to feed, revive, store, and diagnose them. Quick answers from real bakers, updated regularly.';

const FAQ_CANONICAL = toCanonicalUrl('/faq');

/** Match Sanity FAQ fetches (`revalidate: 0`) so route output is not cached behind imports. */
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'FAQ',
  description: FAQ_DESCRIPTION,
  alternates: { canonical: FAQ_CANONICAL },
  openGraph: {
    title: 'Sourdough FAQ',
    description: FAQ_DESCRIPTION,
    url: FAQ_CANONICAL,
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sourdough FAQ',
    description: FAQ_DESCRIPTION,
  },
};

interface IFaqPageProps {
  searchParams: Promise<{ category?: string | string[] }>;
}

/**
 * Narrow a raw `?category=` value to a known category slug. Unknown or absent
 * values resolve to `null`, which signals "show all categories" — we
 * deliberately do not 404 on a bad slug so deep-linked shares stay graceful.
 */
function resolveActiveCategorySlug(
  raw: string | string[] | undefined,
  knownSlugs: Set<string>,
): string | null {
  const candidate = Array.isArray(raw) ? raw[0] : raw;
  if (typeof candidate !== 'string' || candidate.length === 0) return null;
  return knownSlugs.has(candidate) ? candidate : null;
}

export default async function FaqPage({ searchParams }: IFaqPageProps) {
  const [{ category: rawCategory }, categories, faqs] = await Promise.all([
    searchParams,
    getFaqCategories(),
    getAllFaqs(),
  ]);

  const knownSlugs = new Set(categories.map((c) => c.slug.current));
  const activeCategorySlug = resolveActiveCategorySlug(rawCategory, knownSlugs);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-10">
      <section aria-labelledby="faq-heading">
        <header className="mb-8 text-center">
          <h1
            id="faq-heading"
            className="mb-2 font-serif text-3xl font-bold leading-tight text-blackish"
          >
            Sourdough Starter FAQ
          </h1>
          <p className="mx-auto max-w-md text-sm text-beaver">
            Short answers to the questions we hear most often — feeding, reviving, storing, and
            diagnosing your starter.
          </p>
        </header>

        {categories.length > 0 && (
          <div className="mb-2 flex justify-center">
            <FAQCategoryTabs categories={categories} activeCategorySlug={activeCategorySlug} />
          </div>
        )}

        <FAQList faqs={faqs} activeCategorySlug={activeCategorySlug} />
      </section>

      <FAQJsonLd faqs={faqs} />
    </main>
  );
}
