import { OG_IMAGE_SIZE, createOgImage } from '@/lib/seo/og';

export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default function TwitterImage() {
  return createOgImage({
    eyebrow: 'Sourdough Starter',
    title: 'Is My Starter Dead?',
    subtitle: 'Fast diagnosis, clear next steps, and discard recipes that actually work.',
  });
}

