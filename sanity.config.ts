'use client';

import { defineConfig } from 'sanity';
import { deskTool } from 'sanity/desk';

import { schemaTypes } from './src/sanity/schemas';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || '';

export default defineConfig({
  name: 'default',
  title: 'IsMyStarterDead',

  projectId,
  dataset,

  basePath: '/studio',
  plugins: [deskTool()],
  schema: {
    types: schemaTypes,
  },
});

