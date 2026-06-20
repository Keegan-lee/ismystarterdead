import sizeOf from 'image-size';

import {
  ANALYZE_ALLOWED_MIME_TYPES,
  ANALYZE_MAX_DIMENSION_PX,
  ANALYZE_MAX_FILE_BYTES,
  ANALYZE_MIN_DIMENSION_PX,
  ANALYZE_VISION_MIME_TYPES,
  type TAnalyzeAllowedMimeType,
  type TAnalyzeVisionMimeType,
} from '@/lib/analyze/constants';

export interface IValidatedStarterImage {
  buffer: Buffer;
  mimeType: TAnalyzeAllowedMimeType;
  visionMimeType: TAnalyzeVisionMimeType;
  width: number;
  height: number;
  filename: string;
}

export class ImageValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ImageValidationError';
  }
}

function isAllowedMimeType(value: string): value is TAnalyzeAllowedMimeType {
  return (ANALYZE_ALLOWED_MIME_TYPES as readonly string[]).includes(value);
}

function isVisionMimeType(value: string): value is TAnalyzeVisionMimeType {
  return (ANALYZE_VISION_MIME_TYPES as readonly string[]).includes(value);
}

function extensionForMime(mimeType: TAnalyzeAllowedMimeType): string {
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/heic':
      return 'heic';
    case 'image/heif':
      return 'heif';
    default:
      return 'img';
  }
}

/**
 * Validates uploaded starter image size, format, and dimensions.
 */
export async function validateStarterImage(file: File): Promise<IValidatedStarterImage> {
  return validateStarterImageBuffer({
    mimeType: file.type,
    filename: file.name,
    sizeBytes: file.size,
    loadBuffer: async () => Buffer.from(await file.arrayBuffer()),
  });
}

export async function validateStarterImageBuffer(args: {
  buffer?: Buffer;
  mimeType: string;
  filename: string;
  sizeBytes: number;
  loadBuffer?: () => Promise<Buffer>;
}): Promise<IValidatedStarterImage> {
  if (!args.mimeType || !isAllowedMimeType(args.mimeType)) {
    throw new ImageValidationError(
      'Invalid file type. Upload a JPG, PNG, WEBP, or HEIC image.',
    );
  }

  if (args.sizeBytes <= 0) {
    throw new ImageValidationError('Image file is empty.');
  }

  if (args.sizeBytes > ANALYZE_MAX_FILE_BYTES) {
    throw new ImageValidationError('Image is too large. Maximum size is 10 MB.');
  }

  if (!isVisionMimeType(args.mimeType)) {
    throw new ImageValidationError(
      'HEIC/HEIF uploads are not supported yet. Please convert to JPG or PNG.',
    );
  }

  const buffer = args.buffer?.length ? args.buffer : await args.loadBuffer?.();
  if (!buffer?.length) {
    throw new ImageValidationError('Could not read image file.');
  }

  let dimensions: { width?: number; height?: number };
  try {
    dimensions = sizeOf(buffer);
  } catch {
    throw new ImageValidationError('Could not read image dimensions.');
  }

  const width = dimensions.width ?? 0;
  const height = dimensions.height ?? 0;

  if (width < ANALYZE_MIN_DIMENSION_PX || height < ANALYZE_MIN_DIMENSION_PX) {
    throw new ImageValidationError(
      `Image is too small. Minimum size is ${ANALYZE_MIN_DIMENSION_PX}px on each side.`,
    );
  }

  if (width > ANALYZE_MAX_DIMENSION_PX || height > ANALYZE_MAX_DIMENSION_PX) {
    throw new ImageValidationError(
      `Image is too large. Maximum dimension is ${ANALYZE_MAX_DIMENSION_PX}px.`,
    );
  }

  return {
    buffer,
    mimeType: args.mimeType,
    visionMimeType: args.mimeType,
    width,
    height,
    filename: args.filename || `starter.${extensionForMime(args.mimeType)}`,
  };
}
