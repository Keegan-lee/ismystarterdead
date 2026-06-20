import { defineField, defineType } from 'sanity';

export const starterAnalysis = defineType({
  name: 'starterAnalysis',
  title: 'Starter Analyses',
  type: 'document',
  fields: [
    defineField({
      name: 'photo',
      title: 'Starter Photo',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'score',
      title: 'Health Score',
      type: 'number',
      validation: (rule) => rule.required().min(0).max(100).integer(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Healthy', value: 'healthy' },
          { title: 'Struggling', value: 'struggling' },
          { title: 'Dead', value: 'dead' },
        ],
        layout: 'radio',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'observations',
      title: 'Observations',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'recommendations',
      title: 'Recommendations',
      type: 'array',
      of: [{ type: 'string' }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'analyzedAt',
      title: 'Analyzed At',
      type: 'datetime',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'published',
      title: 'Published to Gallery',
      type: 'boolean',
      initialValue: false,
      description: 'When enabled, this analysis can appear in the public starter gallery.',
    }),
  ],
  preview: {
    select: {
      title: 'status',
      subtitle: 'score',
      media: 'photo',
    },
    prepare({ title, subtitle, media }) {
      return {
        title: typeof title === 'string' ? title : 'Starter analysis',
        subtitle: typeof subtitle === 'number' ? `Score: ${subtitle}` : undefined,
        media,
      };
    },
  },
});
