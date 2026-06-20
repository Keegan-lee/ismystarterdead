import { NextResponse } from 'next/server';

import type { IStarterAnalysisRecord } from '@/lib/analyze/types';
import { ImageValidationError, validateStarterImage } from '@/lib/analyze/validateImage';
import { analyzeStarterImage } from '@/server/analyze/analyzeStarterImage';
import { checkAnalyzeRateLimit } from '@/server/analyze/analyzeRateLimit';
import { getClientIp } from '@/server/analyze/getClientIp';
import { logFailedAnalysis } from '@/server/analyze/logFailedAnalysis';
import { saveStarterAnalysis } from '@/server/analyze/saveStarterAnalysis';

export const runtime = 'nodejs';

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export async function POST(req: Request) {
  const ip = getClientIp(req);

  try {
    const rateLimit = await checkAnalyzeRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many analysis requests. Please try again in an hour.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': String(rateLimit.remaining),
          },
        },
      );
    }

    const formData = await req.formData();
    const imageField = formData.get('image');

    if (!(imageField instanceof File)) {
      logFailedAnalysis({ reason: 'Missing image field', ip });
      return NextResponse.json({ error: 'Missing image upload.' }, { status: 400 });
    }

    let validatedImage;
    try {
      validatedImage = await validateStarterImage(imageField);
    } catch (err) {
      const reason = toErrorMessage(err);
      logFailedAnalysis({
        reason,
        ip,
        filename: imageField.name,
        mimeType: imageField.type,
      });

      if (err instanceof ImageValidationError) {
        return NextResponse.json({ error: reason }, { status: 400 });
      }

      return NextResponse.json({ error: 'Invalid image upload.' }, { status: 400 });
    }

    const assessment = await analyzeStarterImage(validatedImage);

    let saved: Awaited<ReturnType<typeof saveStarterAnalysis>> | null = null;
    try {
      saved = await saveStarterAnalysis({
        ...assessment,
        imageBuffer: validatedImage.buffer,
        filename: validatedImage.filename,
        mimeType: validatedImage.mimeType,
      });
    } catch (err) {
      logFailedAnalysis({
        reason: `Storage failed: ${toErrorMessage(err)}`,
        ip,
        filename: validatedImage.filename,
        mimeType: validatedImage.mimeType,
      });
    }

    const payload: IStarterAnalysisRecord = {
      ...assessment,
      id: saved?.id ?? 'unstored',
      imageUrl: saved?.imageUrl ?? '',
      analyzedAt: saved?.analyzedAt ?? new Date().toISOString(),
    };

    return NextResponse.json(payload, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': String(rateLimit.remaining),
      },
    });
  } catch (err) {
    const reason = toErrorMessage(err);
    logFailedAnalysis({ reason, ip });

    return NextResponse.json(
      { error: 'Starter analysis failed. Please try again or use the question flow.' },
      { status: 500 },
    );
  }
}
