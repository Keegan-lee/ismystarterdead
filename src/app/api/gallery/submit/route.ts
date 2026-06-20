import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import type { StarterResult } from '@/lib/evaluateScore';
import { createGalleryItem } from '@/server/gallery/createGalleryItem';

export const runtime = 'nodejs';

const VALID_STATUSES = new Set<StarterResult['status']>([
  'Alive',
  'Needs Love',
  'At Risk',
  'Likely Dead',
  'Contaminated',
]);

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/**
 * Accepts a multipart form upload from the diagnostic flow and persists the
 * analyzed starter photo to Sanity-backed gallery storage.
 */
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageEntry = formData.get('image');
    const scoreRaw = formData.get('score');
    const statusRaw = formData.get('status');
    const userLabelRaw = formData.get('userLabel');

    if (!(imageEntry instanceof File)) {
      return NextResponse.json({ error: 'Missing image file.' }, { status: 400 });
    }

    const score = typeof scoreRaw === 'string' ? Number.parseInt(scoreRaw, 10) : NaN;
    if (!Number.isFinite(score)) {
      return NextResponse.json({ error: 'Invalid score.' }, { status: 400 });
    }

    const status =
      typeof statusRaw === 'string' && VALID_STATUSES.has(statusRaw as StarterResult['status'])
        ? (statusRaw as StarterResult['status'])
        : undefined;

    const userLabel = typeof userLabelRaw === 'string' ? userLabelRaw.trim().slice(0, 120) : undefined;

    const buffer = Buffer.from(await imageEntry.arrayBuffer());
    const contentType = imageEntry.type || 'application/octet-stream';

    const result = await createGalleryItem({
      imageBuffer: buffer,
      filename: imageEntry.name || 'starter-photo.jpg',
      contentType,
      score,
      status,
      userLabel,
    });

    revalidatePath('/gallery');
    revalidatePath(`/gallery/${result.slug}`);

    return NextResponse.json({ ok: true, slug: result.slug });
  } catch (err) {
    const message = toErrorMessage(err);
    console.error('[gallery/submit] failed', message);
    return NextResponse.json({ error: 'Could not save photo to gallery.' }, { status: 500 });
  }
}
