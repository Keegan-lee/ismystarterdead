'use client';

import { useCallback, useEffect, useState } from 'react';

import { StarterPhotoUpload } from '@/components/starter-photo-upload/StarterPhotoUpload';
import {
  AnalyzeStarterPhotoError,
  analyzeStarterPhoto,
} from '@/lib/upload/analyzeStarterPhoto';
import type { IImageValidationError } from '@/lib/upload/validateImageFile';
import { validateImageFile } from '@/lib/upload/validateImageFile';

export interface IImageUploadFlowProps {
  onComplete: (score: number, image?: File) => void;
  onFallbackToQuestions: () => void;
}

const ANALYSIS_STEPS = [
  'Scanning for bubbles and activity...',
  'Checking color and texture...',
  'Assessing fermentation signs...',
  'Evaluating starter health...',
] as const;

type TUploadStatus = 'selecting' | 'analyzing';

export function ImageUploadFlow({ onComplete, onFallbackToQuestions }: IImageUploadFlowProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<IImageValidationError | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [status, setStatus] = useState<TUploadStatus>('selecting');
  const [stepIdx, setStepIdx] = useState(0);

  const handleFileSelect = useCallback((file: File) => {
    const result = validateImageFile(file);

    if (!result.valid) {
      setSelectedFile(null);
      setValidationError(result.error);
      setUploadError(null);
      return;
    }

    setSelectedFile(file);
    setValidationError(null);
    setUploadError(null);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    setValidationError(null);
    setUploadError(null);
    setStatus('selecting');
    setStepIdx(0);
  }, []);

  const handleAnalyze = async () => {
    if (!selectedFile || status === 'analyzing') return;

    const result = validateImageFile(selectedFile);
    if (!result.valid) {
      setValidationError(result.error);
      return;
    }

    setValidationError(null);
    setUploadError(null);
    setStatus('analyzing');
    setStepIdx(0);

    try {
      const { score } = await analyzeStarterPhoto(selectedFile);
      onComplete(score, selectedFile);
    } catch (error) {
      setStatus('selecting');

      if (error instanceof AnalyzeStarterPhotoError) {
        if (error.code === 'too_large' || error.code === 'invalid_format') {
          setValidationError({ code: error.code, message: error.message });
          return;
        }

        setUploadError(error.message);
        return;
      }

      setUploadError('Something went wrong while analyzing your starter. Please try again.');
    }
  };

  useEffect(() => {
    if (status !== 'analyzing') return;

    if (stepIdx < ANALYSIS_STEPS.length - 1) {
      const timer = window.setTimeout(() => {
        setStepIdx((current) => current + 1);
      }, 900);

      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [status, stepIdx]);

  const isAnalyzing = status === 'analyzing';

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 text-4xl" aria-hidden>
            📷
          </div>
          <h2 className="mb-2 font-serif text-2xl font-bold text-blackish">
            Upload a photo of your starter
          </h2>
          <p className="text-sm leading-relaxed text-beaver">
            We&apos;ll analyze your photo with AI and give you an instant health diagnosis.
          </p>
        </div>

        <StarterPhotoUpload
          selectedFile={selectedFile}
          onFileSelect={handleFileSelect}
          onClear={handleClear}
          disabled={isAnalyzing}
          validationError={validationError}
          uploadError={uploadError}
        />

        {selectedFile && !isAnalyzing ? (
          <button
            type="button"
            onClick={handleAnalyze}
            className="btn-primary mt-4 w-full py-4 text-base"
          >
            Analyze my starter →
          </button>
        ) : null}

        {isAnalyzing ? (
          <div className="card mt-4 animate-fade-in">
            <div className="mb-4 flex items-center gap-3">
              <span
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-dough text-base"
                aria-hidden
              >
                <span className="animate-pulse">⏳</span>
              </span>
              <div>
                <p className="text-sm font-semibold text-blackish">Analyzing your starter</p>
                <p className="text-xs text-beaver">This usually takes a few seconds.</p>
              </div>
            </div>

            <div className="space-y-2">
              {ANALYSIS_STEPS.map((step, index) => (
                <div
                  key={step}
                  className={`flex items-center gap-2 text-sm transition-opacity duration-500 ${
                    index <= stepIdx ? 'opacity-100' : 'opacity-20'
                  }`}
                >
                  <span aria-hidden>{index < stepIdx ? '✅' : index === stepIdx ? '⏳' : '○'}</span>
                  <span className={index <= stepIdx ? 'text-blackish' : 'text-beaver'}>{step}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onFallbackToQuestions}
          disabled={isAnalyzing}
          className="mt-6 w-full text-center text-sm text-beaver transition-colors hover:text-umber disabled:cursor-not-allowed disabled:opacity-60"
        >
          Skip photo — answer questions instead →
        </button>
      </div>
    </div>
  );
}

export default ImageUploadFlow;
