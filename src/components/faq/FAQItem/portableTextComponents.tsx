import type { PortableTextComponents } from '@portabletext/react';

/**
 * Brand-aware serializers for FAQ answer Portable Text.
 *
 * The FAQ schema constrains authoring to a small surface (paragraphs, h4,
 * bullet/numbered lists, strong/em/code, and links), so we only need to map
 * those nodes. Anything outside that set falls back to the library defaults.
 */
export const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mb-3 last:mb-0 text-sm leading-relaxed text-beaver">{children}</p>
    ),
    h4: ({ children }) => (
      <h4 className="mt-3 mb-2 font-serif text-sm font-semibold text-blackish">{children}</h4>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mb-3 ml-5 list-disc space-y-1 text-sm text-beaver">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="mb-3 ml-5 list-decimal space-y-1 text-sm text-beaver">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-blackish">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-crumb px-1 py-0.5 font-mono text-xs text-blackish">{children}</code>
    ),
    link: ({ value, children }) => {
      const href = typeof value?.href === 'string' ? value.href : '#';
      const isExternal = /^https?:\/\//i.test(href);
      return (
        <a
          href={href}
          className="text-umber underline underline-offset-2 hover:text-blackish transition-colors"
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
        >
          {children}
        </a>
      );
    },
  },
};
