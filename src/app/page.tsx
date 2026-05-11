'use client';
import React, { useState } from 'react';
import StartPage from '@/components/StartPage';
import QuestionFlow from '@/components/QuestionFlow';
import ImageUploadFlow from '@/components/ImageUploadFlow';
import ResultScreen from '@/components/ResultScreen';

type Flow = 'start' | 'questions' | 'photo' | 'done';

export default function Home() {
  const [flow, setFlow] = useState<Flow>('start');
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
    <>
      {flow === 'start' && (
        <StartPage
          onStart={() => setFlow('questions')}
          onPhotoStart={() => setFlow('photo')}
        />
      )}
      {flow === 'questions' && (
        <QuestionFlow onComplete={handleComplete} />
      )}
      {flow === 'photo' && (
        <ImageUploadFlow
          onComplete={handleComplete}
          onFallbackToQuestions={() => setFlow('questions')}
        />
      )}
      {flow === 'done' && finalScore !== null && (
        <ResultScreen
          score={finalScore}
          image={uploadedPhoto}
          onRetry={handleRetry}
        />
      )}
    </>
  );
}
