import type { TPortableTextBlock } from '@/sanity/lib/types';

interface IPortableTextChild {
  _type?: string;
  text?: string;
}

interface IPortableTextBlockShape {
  _type?: string;
  children?: IPortableTextChild[];
}

/**
 * Best-effort conversion of a Portable Text array to flat plain text.
 *
 * Walks each block, concatenates `children[].text` for text spans, and joins
 * blocks with a newline. Non-text block types (images, embeds, etc.) are
 * skipped — the FAQ schema does not allow them today, but this function is
 * defensive enough to ignore them if they appear.
 *
 * Used as a fallback for `FAQPage` JSON-LD `acceptedAnswer.text` whenever an
 * editor has not supplied an `answerPlain` value.
 *
 * @param blocks Portable Text blocks straight from the GROQ projection.
 * @returns A trimmed plain-text representation suitable for schema.org.
 */
export function portableTextToPlainText(blocks: TPortableTextBlock[] | undefined): string {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';

  const lines: string[] = [];

  for (const rawBlock of blocks) {
    const block = rawBlock as IPortableTextBlockShape;
    if (block._type !== 'block' || !Array.isArray(block.children)) {
      continue;
    }

    const text = block.children
      .filter((child) => child._type === 'span' && typeof child.text === 'string')
      .map((child) => child.text ?? '')
      .join('')
      .trim();

    if (text) lines.push(text);
  }

  return lines.join('\n\n').trim();
}
