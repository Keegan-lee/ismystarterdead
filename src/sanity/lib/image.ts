import imageUrlBuilder from '@sanity/image-url';

import { getSanityEnv } from './env';
import type { ISanityImageAssetRef } from './types';

const env = getSanityEnv();
const builder = imageUrlBuilder({ projectId: env.projectId, dataset: env.dataset });

export function urlForImage(source: ISanityImageAssetRef) {
  return builder.image(source);
}

