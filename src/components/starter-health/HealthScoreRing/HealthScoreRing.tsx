'use client';

import { useEffect, useState } from 'react';

import { clampHealthScore } from '@/lib/starterHealthAnalysis';

export interface IHealthScoreRingProps {
  score: number;
  ringColor: string;
  size?: number;
}

const ANIMATION_MS = 1200;

/**
 * Circular 0–100 health score indicator with an animated fill on mount.
 */
export function HealthScoreRing({ score, ringColor, size = 140 }: IHealthScoreRingProps) {
  const target = clampHealthScore(score);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedOffset, setAnimatedOffset] = useState(100);

  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - start) / ANIMATION_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.round(target * eased);
      const currentOffset = circumference * (1 - (target * eased) / 100);

      setAnimatedScore(currentScore);
      setAnimatedOffset(currentOffset);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, circumference]);

  const center = size / 2;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Health score: ${target} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e8d5b7"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          style={{ transition: 'stroke 0.3s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-serif text-4xl font-bold text-blackish tabular-nums">{animatedScore}</span>
        <span className="text-[10px] font-semibold uppercase tracking-widest text-beaver">/ 100</span>
      </div>
    </div>
  );
}
