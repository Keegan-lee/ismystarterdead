import { defineField, defineType } from 'sanity';

/**
 * `faqCategory` — taxonomy for grouping `faqItem` documents.
 *
 * Each category drives a filter pill on `/faq`. The `colorAccent` field is
 * intentionally a constrained list so editors can tint pills on-brand without
 * touching CSS (the frontend maps these values to Tailwind tokens via
 * `brandAccentForCategory`).
 */
export const faqCategory = defineType({
  name: 'faqCategory',
  title: 'FAQ Categories',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Short, human-readable category name shown on the filter pill (e.g. "Feeding").',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      description: 'Used in the `?category=<slug>` URL on /faq.',
      options: { source: 'title', maxLength: 64 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
      description: 'Optional 1–2 sentences describing the category. Used as supporting copy and meta hints.',
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: 'order',
      title: 'Order',
      type: 'number',
      description: 'Ascending sort. Lower numbers appear first.',
      initialValue: 100,
    }),
    defineField({
      name: 'colorAccent',
      title: 'Color Accent',
      type: 'string',
      description: 'Tints the active filter pill on /faq. Maps to a brand Tailwind token.',
      options: {
        list: [
          { title: 'Crust (warm tan)', value: 'crust' },
          { title: 'Umber (deep brown)', value: 'umber' },
          { title: 'Alive (green)', value: 'alive' },
          { title: 'Warn (amber)', value: 'warn' },
          { title: 'Dough (light)', value: 'dough' },
        ],
        layout: 'dropdown',
      },
      initialValue: 'crust',
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'Inactive categories are hidden from /faq and the sitemap.',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'description',
    },
  },
});
