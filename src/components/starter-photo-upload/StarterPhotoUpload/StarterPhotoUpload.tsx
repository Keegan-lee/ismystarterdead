'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { IMAGE_FILE_INPUT_ACCEPT } from '@/lib/upload/constants';
import type { IImageValidationError } from '@/lib/upload/validateImageFile';

export interface IStarterPhotoUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
  validationError?: IImageValidationError | null;
  uploadError?: string | null;
}

/**
 * Drag-and-drop and file-picker upload surface with client-side preview.
 */
export function StarterPhotoUpload({
  selectedFile,
  onFileSelect,
  onClear,
  disabled = false,
  validationError = null,
  uploadError = null,
}: IStarterPhotoUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      setPreviewFailed(false);
      return;
    }

    setPreviewFailed(false);
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const processFile = useCallback(
    (file: File | undefined) => {
      if (!file || disabled) return;
      onFileSelect(file);
    },
    [disabled, onFileSelect],
  );

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    processFile(event.target.files?.[0]);
    event.target.value = '';
  };

  const handleDragEnter = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    processFile(event.dataTransfer.files?.[0]);
  };

  const activeError = validationError?.message ?? uploadError;
  const showPreview = Boolean(selectedFile && (previewUrl || previewFailed));

  return (
    <div className="space-y-4">
      {activeError ? (
        <div
          role="alert"
          className="rounded-xl border border-dead/30 bg-dead/5 px-4 py-3 text-sm text-dead"
        >
          {activeError}
        </div>
      ) : null}

      {!showPreview ? (
        <label
          htmlFor={inputId}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            'card flex cursor-pointer flex-col items-center justify-center border-2 border-dashed py-10 transition-colors sm:py-12',
            disabled ? 'cursor-not-allowed opacity-60' : 'hover:bg-crumb',
            isDragging ? 'border-umber bg-crumb' : 'border-crust',
          ].join(' ')}
        >
          <span className="mb-3 text-3xl" aria-hidden>
            🫙
          </span>
          <span className="mb-1 text-sm font-medium text-umber">
            {isDragging ? 'Drop your photo here' : 'Drag and drop a photo'}
          </span>
          <span className="mb-4 text-xs text-beaver">or tap to choose from your device</span>
          <span className="rounded-full bg-dough px-3 py-1 text-xs text-beaver">
            JPG, PNG, or HEIC · up to 10 MB
          </span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={IMAGE_FILE_INPUT_ACCEPT}
            onChange={handleInputChange}
            disabled={disabled}
            className="sr-only"
          />
        </label>
      ) : (
        <div className="card space-y-4">
          <div className="overflow-hidden rounded-xl border border-dough bg-crumb">
            {previewUrl && !previewFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Preview of your sourdough starter"
                className="h-56 w-full object-cover sm:h-64"
                onError={() => setPreviewFailed(true)}
              />
            ) : (
              <div className="flex h-56 flex-col items-center justify-center px-6 text-center sm:h-64">
                <span className="mb-2 text-3xl" aria-hidden>
                  📷
                </span>
                <p className="text-sm font-medium text-blackish">{selectedFile?.name}</p>
                <p className="mt-1 text-xs text-beaver">
                  Preview is not available for this format in your browser, but we can still analyze
                  it.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={disabled}
              className="btn-secondary w-full py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              Choose a different photo
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="w-full rounded-lg border border-dough px-4 py-3 text-sm font-medium text-beaver transition-colors hover:border-crust hover:text-umber disabled:cursor-not-allowed disabled:opacity-60"
            >
              Remove
            </button>
          </div>

          <input
            ref={inputRef}
            id={`${inputId}-replace`}
            type="file"
            accept={IMAGE_FILE_INPUT_ACCEPT}
            onChange={handleInputChange}
            disabled={disabled}
            className="sr-only"
          />
        </div>
      )}
    </div>
  );
}
