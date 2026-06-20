'use client';

import React, { useEffect, useState } from 'react';

import { mapAnalysisToDiagnosticScore } from '@/lib/analyze/mapAnalysisToDiagnosticScore';
import type { IStarterAnalysisRecord } from '@/lib/analyze/types';

interface ImageUploadFlowProps {
  onComplete: (score: number, image?: File) => void;
  onFallbackToQuestions: () => void;
}

const ANALYSIS_STEPS = [
  'Scanning for bubbles and activity...',
  'Checking color and texture...',
  'Assessing fermentation signs...',
  'Evaluating starter health...',
];

const ImageUploadFlow: React.FC<ImageUploadFlowProps> = ({ onComplete, onFallbackToQuestions }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'error'>('idle');
  const [stepIdx, setStepIdx] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setStatus('analyzing');
    setStepIdx(0);
    setErrorMessage(null);
  };

  useEffect(() => {
    if (status !== 'analyzing' || !selectedFile) return;

    if (stepIdx < ANALYSIS_STEPS.length - 1) {
      const timer = setTimeout(() => setStepIdx((current) => current + 1), 900);
      return () => clearTimeout(timer);
    }

    let cancelled = false;

    const runAnalysis = async () => {
      try {
        const formData = new FormData();
        formData.append('image', selectedFile);

        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData,
        });

        const data = (await response.json()) as IStarterAnalysisRecord & { error?: string };

        if (!response.ok) {
          throw new Error(data.error || 'Analysis failed. Please try again.');
        }

        if (cancelled) return;

        const diagnosticScore = mapAnalysisToDiagnosticScore(data);
        onComplete(diagnosticScore, selectedFile);
      } catch (err) {
        if (cancelled) return;

        const message = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
        setErrorMessage(message);
        setStatus('error');
      }
    };

    void runAnalysis();

    return () => {
      cancelled = true;
    };
  }, [status, stepIdx, selectedFile, onComplete]);

  const handleRetryUpload = () => {
    setPreview(null);
    setSelectedFile(null);
    setStatus('idle');
    setStepIdx(0);
    setErrorMessage(null);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📷</div>
          <h2 className="font-serif text-2xl font-bold text-blackish mb-2">Upload a photo of your starter</h2>
          <p className="text-sm text-beaver">
            We&apos;ll scan it with AI and give you a health assessment based on rise, bubbles, colour, and texture.
          </p>
        </div>

        {!preview && (
          <label className="card border-2 border-dashed border-crust flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-crumb transition-colors">
            <span className="text-3xl mb-3">🫙</span>
            <span className="text-sm font-medium text-umber mb-1">Tap to upload a photo</span>
            <span className="text-xs text-beaver">JPG, PNG, or WEBP — up to 10 MB</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} className="hidden" />
          </label>
        )}

        {preview && (
          <div className="card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Your starter" className="rounded-xl w-full h-56 object-cover mb-4" />
            {status === 'analyzing' && (
              <div className="space-y-2">
                {ANALYSIS_STEPS.map((step, i) => (
                  <div
                    key={step}
                    className={`flex items-center gap-2 text-sm transition-opacity duration-500 ${i <= stepIdx ? 'opacity-100' : 'opacity-20'}`}
                  >
                    <span>{i < stepIdx ? '✅' : i === stepIdx ? '⏳' : '○'}</span>
                    <span className={i <= stepIdx ? 'text-blackish' : 'text-beaver'}>{step}</span>
                  </div>
                ))}
              </div>
            )}
            {status === 'error' && (
              <div className="space-y-3">
                <p className="text-sm text-dead">{errorMessage}</p>
                <button onClick={handleRetryUpload} className="btn-secondary text-xs w-full">
                  Try another photo
                </button>
              </div>
            )}
          </div>
        )}

        <button
          onClick={onFallbackToQuestions}
          className="mt-6 w-full text-center text-sm text-beaver hover:text-umber transition-colors"
        >
          Skip photo — answer questions instead →
        </button>
      </div>
    </div>
  );
};

export default ImageUploadFlow;
