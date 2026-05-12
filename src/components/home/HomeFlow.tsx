'use client';

import React, { useState } from 'react';

import ImageUploadFlow from '@/components/ImageUploadFlow';
import QuestionFlow from '@/components/QuestionFlow';
import ResultScreen from '@/components/ResultScreen';
import StartPage from '@/components/StartPage';
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

  const handleComplete = (score: number, image?: File) => {
    setFinalScore(score);
    if (image) setUploadedPhoto(image);
    setFlow('done');
  };

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
      {flow === 'questions' && <QuestionFlow onComplete={handleComplete} />}
      {flow === 'photo' && (
        <ImageUploadFlow
          onComplete={handleComplete}
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
