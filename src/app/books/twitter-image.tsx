import { OG_IMAGE_SIZE, createOgImage } from '@/lib/seo/og';
import { getBooks } from '@/sanity/lib/queries';

export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';
export const alt = 'Sourdough Books — IsMyStarterDead';

export default async function TwitterImage() {
  const books = await getBooks();
  const count = books.length;

  const subtitle =
    count > 0
      ? `${count} cookbook${count === 1 ? '' : 's'} for using your discard and saving your starter.`
      : 'Cookbooks for using your discard and saving your starter — coming soon.';

  return createOgImage({
    eyebrow: 'Library',
    title: 'Sourdough Books',
    subtitle,
  });
}
