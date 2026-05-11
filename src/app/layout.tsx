import './globals.css';
import { Merriweather } from 'next/font/google';
import type { Metadata } from 'next';

const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: 'Is My Starter Dead? | Sourdough Starter Diagnostic',
  description: 'Find out if your sourdough starter is alive, struggling, or dead — in under 2 minutes. Get expert revival tips, discard recipes, and community support.',
  openGraph: {
    title: 'Is My Starter Dead?',
    description: 'Diagnose your sourdough starter health in under 2 minutes. Free tool + expert revival guides.',
    url: 'https://ismystarterdead.com',
    siteName: 'IsMyStarterDead',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Is My Starter Dead?',
    description: 'Diagnose your sourdough starter health in under 2 minutes.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={merriweather.variable}>
      <body className="bg-flour text-blackish antialiased">{children}</body>
    </html>
  );
}
