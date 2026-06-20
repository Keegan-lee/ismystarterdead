/** Maximum allowed image upload size (10 MB). */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

/** MIME types accepted for starter photo uploads. */
export const ACCEPTED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
] as const;

/** File extensions accepted when MIME type is missing (common for HEIC on some devices). */
export const ACCEPTED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.heic', '.heif'] as const;

/** `accept` attribute value for the hidden file input. */
export const IMAGE_FILE_INPUT_ACCEPT = 'image/jpeg,image/png,image/heic,image/heif,.heic,.heif';
