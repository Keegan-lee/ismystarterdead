'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { SiteFooter } from '@/components/site/SiteFooter';
import { SiteNavbar } from '@/components/site/SiteNavbar';

export interface ISiteChromeProps {
  children: ReactNode;
}

/**
 * Wraps public pages with shared nav and footer. Sanity Studio stays bare.
 */
export function SiteChrome({ children }: ISiteChromeProps) {
  const pathname = usePathname();
  const isStudio = pathname?.startsWith('/studio') ?? false;

  if (isStudio) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-flour">
      <SiteNavbar />
      <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
