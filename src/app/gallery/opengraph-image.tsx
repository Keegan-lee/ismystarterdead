import { OG_IMAGE_SIZE, createOgImage } from '@/lib/seo/og';

export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: 'Gallery',
    title: 'Starter Gallery',
    subtitle: 'Real examples of thriving, struggling, and dead starters—compare with yours.',
  });
}

