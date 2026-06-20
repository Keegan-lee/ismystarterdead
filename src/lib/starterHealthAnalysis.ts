/**
 * Structured payload returned by the AI starter health analysis backend.
 * Score is 0–100; status maps to the three user-facing health tiers.
 */
export type TStarterHealthStatus = 'Healthy' | 'Struggling' | 'Dead';

export interface IStarterHealthAnalysis {
  score: number;
  status: TStarterHealthStatus;
  summary: string;
  observations: string[];
  recommendedActions: string[];
}

export interface IStarterHealthStatusConfig {
  label: TStarterHealthStatus;
  emoji: string;
  color: string;
  ringColor: string;
  bgColor: string;
  borderColor: string;
  badgeClass: string;
  encouragement: string;
}

const STATUS_CONFIG: Record<TStarterHealthStatus, IStarterHealthStatusConfig> = {
  Healthy: {
    label: 'Healthy',
    emoji: '🎉',
    color: 'text-alive',
    ringColor: '#3a7d44',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    badgeClass: 'bg-green-100 text-green-800',
    encouragement:
      'Your starter looks active and well cared for. Keep up your feeding routine and enjoy the bake!',
  },
  Struggling: {
    label: 'Struggling',
    emoji: '🤔',
    color: 'text-warn',
    ringColor: '#c47c2b',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badgeClass: 'bg-amber-100 text-amber-800',
    encouragement:
      'A few tweaks to feeding or temperature can often bring a sluggish starter back. You are closer than you think!',
  },
  Dead: {
    label: 'Dead',
    emoji: '🌱',
    color: 'text-dead',
    ringColor: '#b94040',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    badgeClass: 'bg-red-100 text-red-800',
    encouragement:
      'Even quiet starters can often be revived with patience and consistent care. Many bakers have brought theirs back from here.',
  },
};

/** Returns display config for a health status tier. */
export function getStarterHealthStatusConfig(status: TStarterHealthStatus): IStarterHealthStatusConfig {
  return STATUS_CONFIG[status];
}

/** Clamps and normalizes an AI score to the 0–100 range. */
export function clampHealthScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Derives status tier from a numeric score when the API omits it. */
export function deriveStatusFromScore(score: number): TStarterHealthStatus {
  const clamped = clampHealthScore(score);
  if (clamped >= 70) return 'Healthy';
  if (clamped >= 35) return 'Struggling';
  return 'Dead';
}

/** Normalizes a raw API payload into a validated analysis result. */
export function normalizeStarterHealthAnalysis(raw: IStarterHealthAnalysis): IStarterHealthAnalysis {
  const score = clampHealthScore(raw.score);
  const status = raw.status ?? deriveStatusFromScore(score);

  return {
    score,
    status,
    summary: raw.summary.trim(),
    observations: raw.observations.filter(Boolean),
    recommendedActions: raw.recommendedActions.filter(Boolean),
  };
}

/**
 * Placeholder analyzer until the AI vision backend is wired.
 * Replace the body with a fetch to `/api/analyze-starter` when available.
 */
export async function analyzeStarterPhoto(_file: File): Promise<IStarterHealthAnalysis> {
  await new Promise((resolve) => setTimeout(resolve, 600));

  return normalizeStarterHealthAnalysis({
    score: 52,
    status: 'Struggling',
    summary:
      'Your starter shows some signs of life, but activity looks low. A consistent feeding schedule and warmer spot could help it bounce back.',
    observations: [
      'Surface appears mostly flat with limited dome or rise',
      'Bubble activity is sparse rather than evenly distributed',
      'Color is within a normal cream-to-tan range — no obvious contamination',
      'Texture looks thicker than a peak-active starter',
    ],
    recommendedActions: [
      'Feed at a 1:1:1 ratio (starter : flour : water) twice daily for 3–4 days',
      'Move to a warmer spot — aim for 21–26°C (70–80°F)',
      'Discard half before each feeding to keep acidity in check',
      'Look for doubling within 4–6 hours as a sign of recovery',
    ],
  });
}
