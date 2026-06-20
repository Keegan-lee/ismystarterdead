'use client';
import React, { useState, useEffect, useRef } from 'react';

interface IImageUploadFlowProps {
  onPhotoReady: (file: File) => void;
  onFallbackToQuestions: () => void;
}

const ANALYSIS_STEPS = [
  'Scanning for bubbles and activity...',
  'Checking color and texture...',
  'Assessing fermentation signs...',
  'Evaluating starter health...',
];

const ImageUploadFlow: React.FC<IImageUploadFlowProps> = ({ onPhotoReady, onFallbackToQuestions }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing'>('idle');
  const [stepIdx, setStepIdx] = useState(0);
  const fileRef = useRef<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      fileRef.current = file;
      setPreview(URL.createObjectURL(file));
      setStatus('analyzing');
      setStepIdx(0);
    }
  };

  useEffect(() => {
    if (status !== 'analyzing') return;
    if (stepIdx < ANALYSIS_STEPS.length - 1) {
      const t = setTimeout(() => setStepIdx((s) => s + 1), 900);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => {
      const file = fileRef.current;
      if (file) {
        onPhotoReady(file);
      } else {
        onFallbackToQuestions();
      }
    }, 900);

    return () => clearTimeout(t);
  }, [status, stepIdx, onPhotoReady, onFallbackToQuestions]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📷</div>
          <h2 className="font-serif text-2xl font-bold text-blackish mb-2">Upload a photo of your starter</h2>
          <p className="text-sm text-beaver">
            We&apos;ll scan it and ask a few quick follow-up questions to give you the most accurate
            diagnosis.
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
                    key={step}
                    className={`flex items-center gap-2 text-sm transition-opacity duration-500 ${i <= stepIdx ? 'opacity-100' : 'opacity-20'}`}
                  >
                    <span>{i < stepIdx ? '✅' : i === stepIdx ? '⏳' : '○'}</span>
                    <span className={i <= stepIdx ? 'text-blackish' : 'text-beaver'}>{step}</span>
                  </div>
                ))}
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
