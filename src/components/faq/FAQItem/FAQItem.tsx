'use client';

import { PortableText } from '@portabletext/react';

import type { IFaqItem } from '@/sanity/lib/types';

import { portableTextComponents } from './portableTextComponents';

export interface IFAQItemProps {
  faq: IFaqItem;
}

/**
 * A single accordion entry for `/faq`.
 *
 * Uses the native `<details>`/`<summary>` element so the component is
 * keyboard-accessible and progressively enhances if JavaScript is unavailable.
 * The `id` on `<details>` doubles as a shareable in-page anchor (e.g.
 * `/faq#how-to-revive-starter`).
 */
export function FAQItem({ faq }: IFAQItemProps) {
  return (
    <details
      id={faq.slug}
      className="group scroll-mt-24 border-b border-dough py-4 last:border-b-0"
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 focus-visible:outline-2 focus-visible:outline-crust focus-visible:outline-offset-2">
        <h3 className="font-serif text-base font-semibold leading-snug text-blackish">
          {faq.question}
        </h3>
        <span
          aria-hidden="true"
          className="mt-1 shrink-0 text-beaver transition-transform duration-200 group-open:rotate-180"
        >
          {/* chevron-down */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 6L8 10L12 6"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>
      <div className="mt-3">
        <PortableText value={faq.answer} components={portableTextComponents} />
      </div>
    </details>
  );
}
