export interface IAnalyzeStarterPhotoResult {
  score: number;
}

export type TAnalyzeStarterPhotoErrorCode =
  | 'too_large'
  | 'invalid_format'
  | 'upload_failed'
  | 'analysis_failed';

export class AnalyzeStarterPhotoError extends Error {
  readonly code: TAnalyzeStarterPhotoErrorCode;

  constructor(code: TAnalyzeStarterPhotoErrorCode, message: string) {
    super(message);
    this.name = 'AnalyzeStarterPhotoError';
    this.code = code;
  }
}

interface IAnalyzeStarterErrorBody {
  error?: string;
  code?: TAnalyzeStarterPhotoErrorCode;
}

/**
 * Uploads a starter photo to the analysis API and returns a health score.
 */
export async function analyzeStarterPhoto(file: File): Promise<IAnalyzeStarterPhotoResult> {
  const formData = new FormData();
  formData.append('image', file);

  let response: Response;

  try {
    response = await fetch('/api/analyze-starter', {
      method: 'POST',
      body: formData,
    });
  } catch {
    throw new AnalyzeStarterPhotoError(
      'upload_failed',
      'We could not upload your photo. Check your connection and try again.',
    );
  }

  let body: IAnalyzeStarterErrorBody & Partial<IAnalyzeStarterPhotoResult> = {};

  try {
    body = (await response.json()) as IAnalyzeStarterErrorBody & Partial<IAnalyzeStarterPhotoResult>;
  } catch {
    body = {};
  }

  if (!response.ok) {
    throw new AnalyzeStarterPhotoError(
      body.code ?? 'analysis_failed',
      body.error ?? 'Something went wrong while analyzing your starter. Please try again.',
    );
  }

  if (typeof body.score !== 'number') {
    throw new AnalyzeStarterPhotoError(
      'analysis_failed',
      'We could not read a result from the analysis. Please try again.',
    );
  }

  return { score: body.score };
}
