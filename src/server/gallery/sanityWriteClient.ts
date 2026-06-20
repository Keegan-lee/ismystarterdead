import 'server-only';

import { createClient } from 'next-sanity';

import { getSanityEnv } from '@/sanity/lib/env';

/**
 * Sanity client with write permissions for gallery asset uploads and document
 * creation. Uses the same token as FAQ imports (`SANITY_API_WRITE_KEY`).
 */
export function getSanityWriteClient() {
  const env = getSanityEnv();

  if (!env.readToken) {
    throw new Error('Missing required environment variable: SANITY_API_WRITE_KEY');
  }

  return createClient({
    projectId: env.projectId,
    dataset: env.dataset,
    apiVersion: env.apiVersion,
    token: env.readToken,
    useCdn: false,
  });
}
