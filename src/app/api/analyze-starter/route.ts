import { NextResponse } from 'next/server';

import { validateImageFile } from '@/lib/upload/validateImageFile';
import type { TAnalyzeStarterPhotoErrorCode } from '@/lib/upload/analyzeStarterPhoto';

export const runtime = 'nodejs';

const FORM_FIELD_NAME = 'image';

function errorResponse(
  status: number,
  code: TAnalyzeStarterPhotoErrorCode,
  message: string,
) {
  return NextResponse.json({ code, error: message }, { status });
}

/**
 * Accepts a starter photo and returns a health score.
 * AI vision integration will replace the placeholder scoring logic.
 */
export async function POST(req: Request) {
  let formData: FormData;

  try {
    formData = await req.formData();
  } catch {
    return errorResponse(400, 'upload_failed', 'Could not read the uploaded photo. Please try again.');
  }

  const image = formData.get(FORM_FIELD_NAME);

  if (!(image instanceof File) || image.size === 0) {
    return errorResponse(400, 'upload_failed', 'Please upload a photo of your starter.');
  }

  const validation = validateImageFile(image);
  if (!validation.valid) {
    return errorResponse(400, validation.error.code, validation.error.message);
  }

  try {
    // Placeholder until the AI backend ticket wires in vision analysis.
    const score = await analyzeStarterImagePlaceholder(image);
    return NextResponse.json({ score });
  } catch {
    return errorResponse(
      500,
      'analysis_failed',
      'We could not analyze your starter right now. Please try again in a moment.',
    );
  }
}

/**
 * Temporary stand-in for AI vision scoring. Returns a neutral mid-range score so
 * the photo flow can be tested end-to-end before the AI backend lands.
 */
async function analyzeStarterImagePlaceholder(_image: File): Promise<number> {
  return 15;
}
