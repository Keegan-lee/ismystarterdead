import type { MetadataRoute } from 'next';

/**
 * Web app manifest for installable PWA metadata and maskable launcher icons.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Is My Starter Dead?',
    short_name: 'IMSD',
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    theme_color: '#fdf8f2',
    background_color: '#fdf8f2',
    display: 'standalone',
  };
}
