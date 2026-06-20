import 'server-only';

import { sanityClient } from '@/sanity/lib/client';
import type { TStarterHealthAssessment } from '@/lib/analyze/types';

export interface ISaveStarterAnalysisInput extends TStarterHealthAssessment {
  imageBuffer: Buffer;
  filename: string;
  mimeType: string;
}

export interface ISavedStarterAnalysis {
  id: string;
  imageUrl: string;
  analyzedAt: string;
}

/**
 * Uploads the starter photo to Sanity and stores the health assessment for gallery use.
 */
export async function saveStarterAnalysis(
  input: ISaveStarterAnalysisInput,
): Promise<ISavedStarterAnalysis> {
  const asset = await sanityClient.assets.upload('image', input.imageBuffer, {
    filename: input.filename,
    contentType: input.mimeType,
  });

  const analyzedAt = new Date().toISOString();
  const document = await sanityClient.create({
    _type: 'starterAnalysis',
    photo: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: asset._id,
      },
    },
    score: input.score,
    status: input.status,
    observations: input.observations,
    recommendations: input.recommendations,
    analyzedAt,
    published: false,
  });

  return {
    id: document._id,
    imageUrl: asset.url,
    analyzedAt,
  };
}
