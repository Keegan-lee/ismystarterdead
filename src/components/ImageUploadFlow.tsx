'use client';

import React, { useEffect, useState } from 'react';

import { analyzeStarterPhoto, type IStarterHealthAnalysis } from '@/lib/starterHealthAnalysis';

interface ImageUploadFlowProps {
  onAnalysisComplete: (analysis: IStarterHealthAnalysis, image: File) => void;
  onFallbackToQuestions: () => void;
}

const ANALYSIS_STEPS = [
  'Scanning for bubbles and activity...',
  'Checking color and texture...',
  'Assessing fermentation signs...',
  'Evaluating starter health...',
];

const ImageUploadFlow: React.FC<ImageUploadFlowProps> = ({
  onAnalysisComplete,
  onFallbackToQuestions,
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'error'>('idle');
  const [stepIdx, setStepIdx] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setUploadedFile(file);
      setPreview(URL.createObjectURL(file));
      setStatus('analyzing');
      setStepIdx(0);
      setErrorMessage(null);
    }
  };

  useEffect(() => {
    if (status !== 'analyzing' || !uploadedFile) return;

    if (stepIdx < ANALYSIS_STEPS.length - 1) {
      const t = setTimeout(() => setStepIdx((s) => s + 1), 900);
      return () => clearTimeout(t);
    }

    let cancelled = false;

    const runAnalysis = async () => {
      try {
        const analysis = await analyzeStarterPhoto(uploadedFile);
        if (!cancelled) {
          onAnalysisComplete(analysis, uploadedFile);
        }
      } catch {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage('We could not analyze your photo right now. Please try again or use the question flow.');
        }
      }
    };

    const t = setTimeout(() => {
      void runAnalysis();
    }, 900);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [status, stepIdx, uploadedFile, onAnalysisComplete]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📷</div>
          <h2 className="font-serif text-2xl font-bold text-blackish mb-2">Upload a photo of your starter</h2>
          <p className="text-sm text-beaver">
            We&apos;ll analyze your photo and share personalized observations and next steps.
          </p>
        </div>

        {!preview && (
          <label className="card border-2 border-dashed border-crust flex flex-col items-center justify-center py-12 cursor-pointer hover:bg-crumb transition-colors">
            <span className="text-3xl mb-3">🫙</span>
            <span className="text-sm font-medium text-umber mb-1">Tap to upload a photo</span>
            <span className="text-xs text-beaver">JPG, PNG, HEIC — any photo works</span>
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
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
                    key={i}
                    className={`flex items-center gap-2 text-sm transition-opacity duration-500 ${i <= stepIdx ? 'opacity-100' : 'opacity-20'}`}
                  >
                    <span>{i < stepIdx ? '✅' : i === stepIdx ? '⏳' : '○'}</span>
                    <span className={i <= stepIdx ? 'text-blackish' : 'text-beaver'}>{step}</span>
                  </div>
                ))}
              </div>
            )}
            {status === 'error' && errorMessage && (
              <p className="text-sm text-dead">{errorMessage}</p>
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
