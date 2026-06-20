'use client';

import type { StarterResult } from '@/lib/evaluateScore';

export interface ISubmitGalleryPayload {
  image: File;
  score: number;
  status: StarterResult['status'];
  userLabel?: string;
}

export interface ISubmitGalleryResult {
  ok: boolean;
  slug?: string;
  error?: string;
}

/**
 * Uploads an analyzed starter photo to the gallery API. Fire-and-forget from
 * the diagnostic flow — failures are logged but do not block the results screen.
 */
export async function submitToGallery(payload: ISubmitGalleryPayload): Promise<ISubmitGalleryResult> {
  const formData = new FormData();
  formData.append('image', payload.image);
  formData.append('score', String(payload.score));
  formData.append('status', payload.status);
  if (payload.userLabel) {
    formData.append('userLabel', payload.userLabel);
  }

  try {
    const response = await fetch('/api/gallery/submit', {
      method: 'POST',
      body: formData,
    });

    const data = (await response.json()) as { ok?: boolean; slug?: string; error?: string };

    if (!response.ok) {
      return { ok: false, error: data.error ?? 'Gallery submission failed' };
    }

    return { ok: true, slug: data.slug };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gallery submission failed';
    console.error('[submitToGallery]', message);
    return { ok: false, error: message };
  }
}
