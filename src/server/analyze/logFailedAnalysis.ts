import 'server-only';

export interface IFailedAnalysisLogContext {
  reason: string;
  ip?: string;
  filename?: string;
  mimeType?: string;
}

/**
 * Structured logging for failed starter analyses.
 */
export function logFailedAnalysis(context: IFailedAnalysisLogContext): void {
  console.error('[analyze] failed', {
    at: new Date().toISOString(),
    ...context,
  });
}
