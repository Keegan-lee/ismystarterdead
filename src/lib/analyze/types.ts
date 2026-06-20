import { z } from 'zod';

export const STARTER_HEALTH_STATUSES = ['healthy', 'struggling', 'dead'] as const;

export type TStarterHealthStatus = (typeof STARTER_HEALTH_STATUSES)[number];

export const starterHealthAssessmentSchema = z.object({
  score: z.number().int().min(0).max(100),
  status: z.enum(STARTER_HEALTH_STATUSES),
  observations: z.array(z.string().min(1)).min(1),
  recommendations: z.array(z.string().min(1)).min(1),
});

export type TStarterHealthAssessment = z.infer<typeof starterHealthAssessmentSchema>;

export interface IStarterAnalysisRecord extends TStarterHealthAssessment {
  id: string;
  imageUrl: string;
  analyzedAt: string;
}
