import { OG_IMAGE_SIZE, createOgImage } from '@/lib/seo/og';

export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: 'Recipes',
    title: 'Discard Recipes',
    subtitle: 'Tested discard recipes—plus the full recipe book delivered after checkout.',
  });
}

