'use client';

import Link from 'next/link';
import { useEffect, useMemo } from 'react';

import {
  getStarterHealthStatusConfig,
  type IStarterHealthAnalysis,
} from '@/lib/starterHealthAnalysis';

import { HealthScoreRing } from '../HealthScoreRing/HealthScoreRing';

export interface IStarterHealthAnalysisResultsDisplayProps {
  analysis: IStarterHealthAnalysis;
  image?: File | null;
  onTryAgain: () => void;
}

/**
 * Presents AI starter health assessment results in a warm, actionable layout.
 */
export function StarterHealthAnalysisResultsDisplay({
  analysis,
  image,
  onTryAgain,
}: IStarterHealthAnalysisResultsDisplayProps) {
  const statusConfig = getStarterHealthStatusConfig(analysis.status);
  const imageUrl = useMemo(
    () => (image ? URL.createObjectURL(image) : null),
    [image],
  );

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageUrl]);

  return (
    <div className="flex flex-1 flex-col pb-20 animate-slide-up">
      <div className={`${statusConfig.bgColor} border-b ${statusConfig.borderColor} px-4 pt-10 pb-8`}>
        <div className="max-w-lg mx-auto text-center">
          <div className="flex justify-center mb-5">
            <HealthScoreRing score={analysis.score} ringColor={statusConfig.ringColor} />
          </div>

          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xl" aria-hidden="true">
              {statusConfig.emoji}
            </span>
            <span
              className={`text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full ${statusConfig.badgeClass}`}
            >
              {statusConfig.label}
            </span>
          </div>

          <h1 className={`font-serif text-2xl font-bold mb-2 ${statusConfig.color}`}>
            {analysis.summary}
          </h1>
          <p className="text-sm text-beaver leading-relaxed max-w-sm mx-auto">
            {statusConfig.encouragement}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6 w-full">
        {imageUrl && (
          <div className="card">
            <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-3">
              Your Starter
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Your uploaded starter"
              className="rounded-xl w-full h-48 object-cover"
            />
          </div>
        )}

        {analysis.observations.length > 0 && (
          <div className="card">
            <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-3">
              What we noticed
            </p>
            <ul className="space-y-2.5">
              {analysis.observations.map((observation, index) => (
                <li key={index} className="flex items-start gap-2.5 text-sm text-blackish">
                  <span className="text-umber mt-0.5 shrink-0" aria-hidden="true">
                    •
                  </span>
                  <span className="leading-relaxed">{observation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.recommendedActions.length > 0 && (
          <div className="card">
            <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-3">
              Recommended actions
            </p>
            <ol className="space-y-3">
              {analysis.recommendedActions.map((action, index) => (
                <li key={index} className="flex items-start gap-3 text-sm text-blackish">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-dough text-umber text-xs font-bold flex items-center justify-center mt-0.5">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{action}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button type="button" onClick={onTryAgain} className="btn-secondary flex-1 text-center">
            Try Again
          </button>
          <Link href="/gallery" className="btn-primary flex-1 text-center">
            Save to Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
