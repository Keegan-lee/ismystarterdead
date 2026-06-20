export const ANALYZE_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const ANALYZE_MIN_DIMENSION_PX = 200;
export const ANALYZE_MAX_DIMENSION_PX = 4096;
export const ANALYZE_RATE_LIMIT_MAX = 5;
export const ANALYZE_RATE_LIMIT_WINDOW = '1 h' as const;
export const ANALYZE_VISION_MODEL = 'claude-sonnet-4-6' as const;

export const ANALYZE_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

export type TAnalyzeAllowedMimeType = (typeof ANALYZE_ALLOWED_MIME_TYPES)[number];

export const ANALYZE_VISION_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type TAnalyzeVisionMimeType = (typeof ANALYZE_VISION_MIME_TYPES)[number];
