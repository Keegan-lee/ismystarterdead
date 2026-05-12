import { OG_IMAGE_SIZE, createOgImage } from '@/lib/seo/og';
import { getBookBySlug } from '@/sanity/lib/queries';
import { formatPriceInCents } from '@/lib/pricing/formatPrice';

export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';
export const alt = 'Book preview — IsMyStarterDead';

function truncate(input: string, max: number): string {
  const flat = input.replace(/\s+/g, ' ').trim();
  if (flat.length <= max) return flat;
  return `${flat.slice(0, max - 1).trimEnd()}…`;
}

export default async function TwitterImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await getBookBySlug(slug);

  if (!book) {
    return createOgImage({
      eyebrow: 'Books',
      title: 'Book not found',
      subtitle: 'Browse other sourdough cookbooks at ismystarterdead.com/books.',
    });
  }

  const priceLabel = formatPriceInCents(book.priceInCents);

  return createOgImage({
    eyebrow: `Book · ${priceLabel}`,
    title: truncate(book.title, 60),
    subtitle: truncate(book.description, 140),
  });
}
