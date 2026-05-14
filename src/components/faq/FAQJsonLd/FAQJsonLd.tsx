import { portableTextToPlainText } from '@/lib/faq/portableTextToPlainText';
import type { IFaqItem } from '@/sanity/lib/types';

export interface IFAQJsonLdProps {
  /**
   * All active FAQs. Always pass the full set, not the filtered subset — every
   * question should remain indexable regardless of the user's UI filter.
   */
  faqs: IFaqItem[];
}

interface IQuestionEntity {
  '@type': 'Question';
  name: string;
  acceptedAnswer: {
    '@type': 'Answer';
    text: string;
  };
}

interface IFaqPageSchema {
  '@context': 'https://schema.org';
  '@type': 'FAQPage';
  mainEntity: IQuestionEntity[];
}

/**
 * Emits `schema.org/FAQPage` JSON-LD for the FAQ list.
 *
 * - Prefers the editor-authored `answerPlain` when present (avoids the lossy
 *   Portable Text → plain-text conversion for nuanced answers).
 * - Skips items whose plain-text representation is empty so we never emit a
 *   schema entry with `text: ''`.
 *
 * The JSON-LD is inlined via `dangerouslySetInnerHTML` because React escapes
 * the `<` character in `<script>` children, which breaks Google's parser.
 */
export function FAQJsonLd({ faqs }: IFAQJsonLdProps) {
  const mainEntity: IQuestionEntity[] = [];

  for (const faq of faqs) {
    const text = (faq.answerPlain ?? '').trim() || portableTextToPlainText(faq.answer);
    if (!text) continue;
    mainEntity.push({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text,
      },
    });
  }

  if (mainEntity.length === 0) return null;

  const jsonLd: IFaqPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  };

  return (
    <script
      type="application/ld+json"
      // The payload is fully derived from typed Sanity data, but we still
      // strip `<` to defend against any user-supplied URL that might smuggle a
      // closing script tag through future schema changes.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
    />
  );
}
