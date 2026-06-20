'use client';

import React, { useCallback, useState } from 'react';

import ImageUploadFlow from '@/components/ImageUploadFlow';
import QuestionFlow from '@/components/QuestionFlow';
import ResultScreen from '@/components/ResultScreen';
import StartPage from '@/components/StartPage';
import { evaluateStarterScore } from '@/lib/evaluateScore';
import { submitToGallery } from '@/lib/gallery/submitToGallery';
import type { TProductCheckoutSummary } from '@/sanity/lib/types';

export interface IHomeFlowProps {
  revivalGuideProduct: TProductCheckoutSummary | null;
  cheatSheetProduct: TProductCheckoutSummary | null;
}

type TFlow = 'start' | 'questions' | 'photo' | 'done';

export function HomeFlow({ revivalGuideProduct, cheatSheetProduct }: IHomeFlowProps) {
  const [flow, setFlow] = useState<TFlow>('start');
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);

  const persistToGallery = useCallback(async (score: number, image: File) => {
    const result = evaluateStarterScore(score);
    await submitToGallery({
      image,
      score,
      status: result.status,
    });
  }, []);

  const handleComplete = useCallback(
    (score: number, image?: File) => {
      setFinalScore(score);
      if (image) {
        setUploadedPhoto(image);
        void persistToGallery(score, image);
      }
      setFlow('done');
    },
    [persistToGallery],
  );

  const handleRetry = () => {
    setFinalScore(null);
    setUploadedPhoto(null);
    setFlow('start');
  };

  return (
    <div className="flex flex-1 flex-col">
      {flow === 'start' && (
        <StartPage
          cheatSheetProduct={cheatSheetProduct}
          onStart={() => setFlow('questions')}
          onPhotoStart={() => setFlow('photo')}
        />
      )}
      {flow === 'questions' && (
        <QuestionFlow onComplete={(score) => handleComplete(score, uploadedPhoto ?? undefined)} />
      )}
      {flow === 'photo' && (
        <ImageUploadFlow
          onPhotoReady={(file) => {
            setUploadedPhoto(file);
            setFlow('questions');
          }}
          onFallbackToQuestions={() => setFlow('questions')}
        />
      )}
      {flow === 'done' && finalScore !== null && (
        <ResultScreen
          cheatSheetProduct={cheatSheetProduct}
          revivalGuideProduct={revivalGuideProduct}
          score={finalScore}
          image={uploadedPhoto}
          onRetry={handleRetry}
        />
      )}
    </div>
  );
}
