import type { Metadata, Viewport } from 'next';

/** Embedded Sanity Studio must not SSR: it touches `window` during init. */
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Studio',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      nosnippet: true,
      noarchive: true,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function StudioLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

