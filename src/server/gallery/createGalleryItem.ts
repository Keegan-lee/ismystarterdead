import 'server-only';

import { randomUUID } from 'node:crypto';

import type { StarterResult } from '@/lib/evaluateScore';
import { evaluateStarterScore } from '@/lib/evaluateScore';

import { getSanityWriteClient } from './sanityWriteClient';

const VALID_STATUSES = new Set<StarterResult['status']>([
  'Alive',
  'Needs Love',
  'At Risk',
  'Likely Dead',
  'Contaminated',
]);

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']);

export interface ICreateGalleryItemInput {
  imageBuffer: Buffer;
  filename: string;
  contentType: string;
  score: number;
  status?: StarterResult['status'];
  userLabel?: string;
}

export interface ICreateGalleryItemResult {
  documentId: string;
  slug: string;
}

function resolveStatus(score: number, status?: StarterResult['status']): StarterResult['status'] {
  if (status && VALID_STATUSES.has(status)) {
    return status;
  }
  return evaluateStarterScore(score).status;
}

/**
 * Uploads a starter photo to Sanity CDN and creates a published gallery document.
 */
export async function createGalleryItem(input: ICreateGalleryItemInput): Promise<ICreateGalleryItemResult> {
  if (input.imageBuffer.byteLength > MAX_IMAGE_BYTES) {
    throw new Error('Image exceeds the 10 MB size limit.');
  }

  if (!ALLOWED_MIME_TYPES.has(input.contentType)) {
    throw new Error('Unsupported image type. Use JPG, PNG, WEBP, or HEIC.');
  }

  const client = getSanityWriteClient();
  const slug = randomUUID();
  const status = resolveStatus(input.score, input.status);

  const asset = await client.assets.upload('image', input.imageBuffer, {
    filename: input.filename,
    contentType: input.contentType,
  });

  const document = await client.create({
    _type: 'galleryItem',
    image: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    },
    score: Math.round(input.score),
    status,
    userLabel: input.userLabel?.trim() || undefined,
    submittedAt: new Date().toISOString(),
    slug: { _type: 'slug', current: slug },
    active: true,
  });

  return {
    documentId: document._id,
    slug,
  };
}
