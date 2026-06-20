import { defineField, defineType } from 'sanity';

const STARTER_STATUSES = [
  { title: 'Alive', value: 'Alive' },
  { title: 'Needs Love', value: 'Needs Love' },
  { title: 'At Risk', value: 'At Risk' },
  { title: 'Likely Dead', value: 'Likely Dead' },
  { title: 'Contaminated', value: 'Contaminated' },
] as const;

export const galleryItem = defineType({
  name: 'galleryItem',
  title: 'Gallery Item',
  type: 'document',
  fields: [
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'score',
      title: 'Health Score',
      type: 'number',
      description: 'Diagnostic score from the questionnaire (-100 to 100).',
      validation: (rule) => rule.required().integer(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: [...STARTER_STATUSES], layout: 'radio' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'userLabel',
      title: 'User Label',
      type: 'string',
      description: 'Optional short note from the submitter (e.g. "Fed with rye flour").',
    }),
    defineField({
      name: 'submittedAt',
      title: 'Submitted At',
      type: 'datetime',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: '_id', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'active',
      title: 'Active',
      type: 'boolean',
      description: 'When false, the item is hidden from the public gallery.',
      initialValue: true,
    }),
  ],
  preview: {
    select: {
      title: 'status',
      subtitle: 'userLabel',
      media: 'image',
      score: 'score',
    },
    prepare({ title, subtitle, media, score }) {
      return {
        title: `${title ?? 'Unknown'} (${score ?? '?'})`,
        subtitle: subtitle ?? 'Analyzed starter photo',
        media,
      };
    },
  },
});
