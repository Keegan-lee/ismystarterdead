import {
  starterHealthAssessmentSchema,
  type TStarterHealthAssessment,
} from '@/lib/analyze/types';

/**
 * Extracts and validates the model JSON payload from a Claude text response.
 */
export function parseVisionResponse(rawText: string): TStarterHealthAssessment {
  const trimmed = rawText.trim();
  const jsonText = extractJsonObject(trimmed);
  const parsed: unknown = JSON.parse(jsonText);
  return starterHealthAssessmentSchema.parse(parsed);
}

function extractJsonObject(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Model response did not contain JSON.');
  }

  return text.slice(start, end + 1);
}
