import Link from 'next/link';

const year = new Date().getFullYear();

/**
 * Global site footer: copyright, centered attribution, utility links.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-dough px-6 py-4 text-[11px] text-beaver">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className="order-1 sm:order-none">© {year} IsMyStarterDead.com</span>
        <p className="order-2 text-center sm:order-none sm:flex-1">
          Built by{' '}
          <a
            href="https://palwefrancis.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-umber underline-offset-2 hover:text-blackish hover:underline"
          >
            palwefrancis.com
          </a>
        </p>
        <div className="order-3 flex flex-wrap justify-center gap-4 sm:order-none sm:justify-end">
          <Link href="/books" className="hover:text-umber transition-colors">
            Books
          </Link>
          <Link href="/gallery" className="hover:text-umber transition-colors">
            Gallery
          </Link>
          <Link href="/discard-recipes" className="hover:text-umber transition-colors">
            Discard Recipes
          </Link>
        </div>
      </div>
    </footer>
  );
}
