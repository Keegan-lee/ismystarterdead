import { defineField, defineType } from 'sanity';

const STRIPE_PRICE_ID_REGEX = /^price_/;

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
      name: 'type',
      title: 'Type',
      type: 'string',
      description: 'Product kind. Drives surface (e.g. "book" → /books listing).',
      options: {
        list: [{ title: 'Book', value: 'book' }],
        layout: 'radio',
      },
      initialValue: 'book',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required().min(10),
    }),
    defineField({
      name: 'priceInCents',
      title: 'Price (in cents)',
      type: 'number',
      description:
        'Authoritative price in the smallest currency unit (e.g. 1200 = $12.00). Use 0 for free products.',
      validation: (rule) =>
        rule
          .required()
          .integer()
          .min(0)
          .error('Price must be a non-negative integer (in cents).'),
    }),
    defineField({
      name: 'stripePriceId',
      title: 'Stripe Price ID',
      type: 'string',
      description:
        'Required when Price (in cents) is greater than 0. Leave empty for free products.',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { priceInCents?: number } | undefined;
          const priceInCents = parent?.priceInCents;
          const isPaid = typeof priceInCents === 'number' && priceInCents > 0;

          if (isPaid) {
            if (!value || typeof value !== 'string') {
              return 'Stripe Price ID is required for paid products.';
            }
            if (!STRIPE_PRICE_ID_REGEX.test(value)) {
              return 'Stripe Price ID must start with "price_".';
            }
            return true;
          }

          if (value && typeof value === 'string' && !STRIPE_PRICE_ID_REGEX.test(value)) {
            return 'Stripe Price ID must start with "price_".';
          }

          return true;
        }),
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
