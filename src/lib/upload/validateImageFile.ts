import {
  ACCEPTED_IMAGE_EXTENSIONS,
  ACCEPTED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from '@/lib/upload/constants';

export type TImageValidationErrorCode = 'too_large' | 'invalid_format';

export interface IImageValidationError {
  code: TImageValidationErrorCode;
  message: string;
}

export type TImageValidationResult =
  | { valid: true }
  | { valid: false; error: IImageValidationError };

function getFileExtension(filename: string): string {
  const dotIndex = filename.lastIndexOf('.');
  if (dotIndex === -1) return '';
  return filename.slice(dotIndex).toLowerCase();
}

function isAcceptedMimeType(mimeType: string): boolean {
  const normalized = mimeType.toLowerCase();
  return ACCEPTED_IMAGE_MIME_TYPES.some((type) => type === normalized);
}

/**
 * Validates a user-selected image against upload constraints.
 * Checks size (max 10 MB) and format (JPG, PNG, HEIC).
 */
export function validateImageFile(file: File): TImageValidationResult {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: {
        code: 'too_large',
        message: 'That photo is too large. Please choose an image under 10 MB.',
      },
    };
  }

  const mimeType = file.type.toLowerCase();
  const extension = getFileExtension(file.name);

  const hasValidMime = mimeType.length > 0 && isAcceptedMimeType(mimeType);
  const hasValidExtension =
    extension.length > 0 &&
    ACCEPTED_IMAGE_EXTENSIONS.some((accepted) => accepted === extension);

  if (!hasValidMime && !hasValidExtension) {
    return {
      valid: false,
      error: {
        code: 'invalid_format',
        message: 'Please upload a JPG, PNG, or HEIC photo of your starter.',
      },
    };
  }

  return { valid: true };
}
