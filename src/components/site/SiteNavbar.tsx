'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import StarterMeter from '@/components/StarterMeter';

function navLinkClass(href: string, pathname: string | null) {
  const active = pathname === href || (pathname?.startsWith(`${href}/`) ?? false);
  return active ? 'text-umber font-semibold' : 'hover:text-umber transition-colors';
}

/**
 * Primary marketing navigation with StarterMeter as the home logo.
 */
export function SiteNavbar() {
  const pathname = usePathname();

  return (
    <nav className="flex shrink-0 items-center justify-between border-b border-dough px-6 py-2">
      <Link href="/" className="flex items-center gap-2 text-blackish" aria-label="IsMyStarterDead home">
        <span className="shrink-0 leading-none">
          <StarterMeter score={0} logo logoBrown showLabel={false} />
        </span>
        <span className="font-serif text-sm font-bold leading-tight">Is My Starter Dead?</span>
      </Link>
      <div className="flex items-center gap-3 text-xs text-beaver sm:gap-4">
        <Link href="/books" className={navLinkClass('/books', pathname)}>
          Books
        </Link>
        <Link href="/gallery" className={navLinkClass('/gallery', pathname)}>
          Gallery
        </Link>
        <Link href="/discard-recipes" className={navLinkClass('/discard-recipes', pathname)}>
          Recipes
        </Link>
        <Link href="/faq" className={navLinkClass('/faq', pathname)}>
          FAQ
        </Link>
      </div>
    </nav>
  );
}
