import { OG_IMAGE_SIZE, createOgImage } from '@/lib/seo/og';

export const size = OG_IMAGE_SIZE;
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return createOgImage({
    eyebrow: 'Receipt',
    title: 'Receipt',
    subtitle: 'Confirm your payment status and access your Stripe receipt.',
  });
}

