import './globals.css';
import { Merriweather } from 'next/font/google';
import type { Metadata } from 'next';

import { SiteChrome } from '@/components/site/SiteChrome';
import { CANONICAL_ORIGIN } from '@/lib/seo/canonical';

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  metadataBase: new URL(CANONICAL_ORIGIN),
  title: 'Is My Starter Dead? | Sourdough Starter Diagnostic',
  description: 'Find out if your sourdough starter is alive, struggling, or dead — in under 2 minutes. Get expert revival tips, discard recipes, and community support.',
  openGraph: {
    title: 'Is My Starter Dead?',
    description: 'Diagnose your sourdough starter health in under 2 minutes. Free tool + expert revival guides.',
    url: CANONICAL_ORIGIN,
    siteName: 'IsMyStarterDead',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Is My Starter Dead?',
    description: 'Diagnose your sourdough starter health in under 2 minutes.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={merriweather.variable}>
      <body className="bg-flour text-blackish antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
