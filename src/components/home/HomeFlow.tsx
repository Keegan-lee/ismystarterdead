'use client';

import React, { useState } from 'react';

import ImageUploadFlow from '@/components/ImageUploadFlow';
import QuestionFlow from '@/components/QuestionFlow';
import ResultScreen from '@/components/ResultScreen';
import StartPage from '@/components/StartPage';
import { StarterHealthAnalysisResultsDisplay } from '@/components/starter-health/StarterHealthAnalysisResultsDisplay/StarterHealthAnalysisResultsDisplay';
import type { IStarterHealthAnalysis } from '@/lib/starterHealthAnalysis';
import type { TProductCheckoutSummary } from '@/sanity/lib/types';

export interface IHomeFlowProps {
  revivalGuideProduct: TProductCheckoutSummary | null;
  cheatSheetProduct: TProductCheckoutSummary | null;
}

type TFlow = 'start' | 'questions' | 'photo' | 'photo-results' | 'done';

export function HomeFlow({ revivalGuideProduct, cheatSheetProduct }: IHomeFlowProps) {
  const [flow, setFlow] = useState<TFlow>('start');
  const [finalScore, setFinalScore] = useState<number | null>(null);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [photoAnalysis, setPhotoAnalysis] = useState<IStarterHealthAnalysis | null>(null);

  const handleQuizComplete = (score: number, image?: File) => {
    setFinalScore(score);
    if (image) setUploadedPhoto(image);
    setPhotoAnalysis(null);
    setFlow('done');
  };

  const handlePhotoAnalysisComplete = (analysis: IStarterHealthAnalysis, image: File) => {
    setPhotoAnalysis(analysis);
    setUploadedPhoto(image);
    setFinalScore(null);
    setFlow('photo-results');
  };

  const handlePhotoRetry = () => {
    setPhotoAnalysis(null);
    setUploadedPhoto(null);
    setFlow('photo');
  };

  const handleRetry = () => {
    setFinalScore(null);
    setUploadedPhoto(null);
    setPhotoAnalysis(null);
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
      {flow === 'questions' && <QuestionFlow onComplete={handleQuizComplete} />}
      {flow === 'photo' && (
        <ImageUploadFlow
          onAnalysisComplete={handlePhotoAnalysisComplete}
          onFallbackToQuestions={() => setFlow('questions')}
        />
      )}
      {flow === 'photo-results' && photoAnalysis && (
        <StarterHealthAnalysisResultsDisplay
          analysis={photoAnalysis}
          image={uploadedPhoto}
          onTryAgain={handlePhotoRetry}
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
