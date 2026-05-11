import 'server-only';

import { createClient } from 'next-sanity';

import { getSanityEnv } from './env';

const env = getSanityEnv();

export const sanityClient = createClient({
  projectId: env.projectId,
  dataset: env.dataset,
  apiVersion: env.apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
  token: env.readToken,
});

