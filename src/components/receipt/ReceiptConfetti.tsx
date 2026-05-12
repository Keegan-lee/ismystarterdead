'use client';

import confetti from 'canvas-confetti';
import { useEffect, useRef } from 'react';

export interface IReceiptConfettiProps {
  /** When true, fires one tasteful burst after mount (unless reduced motion). */
  enabled: boolean;
}

/**
 * One-shot celebratory confetti for successful checkout. Skips entirely when
 * `prefers-reduced-motion: reduce` is set; does not loop or block interaction.
 */
export function ReceiptConfetti({ enabled }: IReceiptConfettiProps) {
  const hasFiredRef = useRef(false);

  useEffect(() => {
    if (!enabled || hasFiredRef.current) return;

    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    hasFiredRef.current = true;

    void confetti({
      particleCount: 72,
      spread: 68,
      startVelocity: 32,
      ticks: 200,
      origin: { y: 0.55 },
      disableForReducedMotion: true,
      colors: ['#c8a97e', '#6f5e53', '#3a7d44', '#fdf8f2', '#8a7968', '#e8d5b7'],
    });
  }, [enabled]);

  return null;
}
