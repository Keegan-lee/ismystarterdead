import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * `faqItem` — a single question + answer pair, scoped to one `faqCategory`.
 *
 * Authoring guidance baked into help text:
 * - Each question must be **self-contained** (no "see above"). This is critical
 *   for AEO/GEO surfaces (Google AI Overviews, ChatGPT, Perplexity) which
 *   ingest each `Question`/`Answer` pair in isolation from the JSON-LD.
 * - `answerPlain` is an optional plain-text fallback used for JSON-LD when the
 *   automatic Portable Text → plain-text conversion would be lossy.
 */
export const faqItem = defineType({
  name: 'faqItem',
  title: 'FAQ Items',
  type: 'document',
  fields: [
    defineField({
      name: 'question',
      title: 'Question',
      type: 'string',
      description:
        'Write the literal question a visitor would ask (e.g. "How do I revive a sluggish starter?"). Each question must be self-contained — avoid "see above" or implicit context.',
      validation: (rule) => rule.required().min(8),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Used as the in-page anchor (#slug) on /faq for shareable deep-links.',
      options: { source: 'question', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'reference',
      to: [{ type: 'faqCategory' }],
      description: 'Drives the filter pill the question appears under on /faq.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Answer',
      type: 'array',
      description:
        'The visible, rendered answer. Supports paragraphs, h4 headings, bullet/numbered lists, bold, italic, inline code, and links.',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 4', value: 'h4' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
            ],
            annotations: [
              {
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  {
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (rule) =>
                      rule.required().uri({ scheme: ['http', 'https', 'mailto', 'tel'] }),
                  },
                ],
              },
            ],
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'answerPlain',
      title: 'Answer (plain text fallback)',
      type: 'text',
      rows: 4,
      description:
        'Optional plain-text version used in FAQPage JSON-LD when present. Leave empty to auto-derive from the rich answer.',
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Ascending sort within the category. Lower numbers appear first.',
      initialValue: 100,
    }),
    defineField({
      name: 'seoKeywords',
      title: 'SEO Keywords',
      type: 'array',
      description:
        'Internal content-strategy hint. Not rendered on the page; used to track which queries this Q is optimized for.',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Inactive items are hidden from /faq and the JSON-LD.',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'question',
      subtitle: 'category.title',
    },
  },
});
