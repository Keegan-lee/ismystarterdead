import type { TStarterHealthAssessment } from '@/lib/analyze/types';

/**
 * Maps the vision API's 0-100 score into the app's diagnostic score scale
 * used by `evaluateStarterScore` (question flow uses roughly -200 to +150).
 */
export function mapAnalysisToDiagnosticScore(assessment: TStarterHealthAssessment): number {
  if (assessment.status === 'dead') {
    return Math.round(Math.min(assessment.score * 0.35 - 40, -5));
  }

  if (assessment.status === 'struggling') {
    return Math.round(assessment.score * 0.55);
  }

  return Math.round(assessment.score * 0.85 + 10);
}
