import { defineField, defineType } from 'sanity';

export const product = defineType({
  name: 'product',
  title: 'Products',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (rule) => rule.required().min(2),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().min(10),
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description: 'Price ID (e.g. price_...). Used for authoritative amount/currency in checkout.',
      validation: (rule) => rule.required().regex(/^price_/, { name: 'Stripe Price ID' }),
    }),
    defineField({
      name: 'displayPrice',
      title: 'Display Price',
      type: 'string',
      description: 'UI-only price label (not authoritative). Example: “$12”.',
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'asset',
      title: 'Deliverable Asset',
      type: 'file',
      options: { storeOriginalFilename: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
});

