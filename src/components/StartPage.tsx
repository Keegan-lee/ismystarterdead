'use client';
import React, { useEffect, useState } from 'react';
import StarterMeter from './StarterMeter';

const SCENARIOS = [
  { emoji: '😬', text: '"It hasn\'t risen in days..."' },
  { emoji: '🤢', text: '"There\'s liquid on top..."' },
  { emoji: '😰', text: '"It smells really weird..."' },
  { emoji: '🧊', text: '"I forgot it in the fridge for weeks..."' },
];

// Simulated live counter — seeds from a base and increments slowly
function useLiveCount(base: number) {
  const [count, setCount] = useState(base);
  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 2));
    }, 4200);
    return () => clearInterval(interval);
  }, []);
  return count.toLocaleString();
}

const PREVIEW_SCORES = [-80, -20, 25, 55, 90];

const StartPage: React.FC<{ onStart: () => void; onPhotoStart: () => void }> = ({ onStart, onPhotoStart }) => {
  const liveCount = useLiveCount(14382);
  const [previewIdx, setPreviewIdx] = useState(2);

  useEffect(() => {
    const t = setInterval(() => {
      setPreviewIdx(i => (i + 1) % PREVIEW_SCORES.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen bg-flour flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-dough">
        <span className="font-serif font-bold text-blackish text-sm">🫙 IsMyStarterDead</span>
        <div className="flex items-center gap-4 text-xs text-beaver">
          <a href="/gallery" className="hover:text-umber transition-colors">Gallery</a>
          <a href="/discard-recipes" className="hover:text-umber transition-colors">Recipes</a>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
        <div className="max-w-md w-full">

          {/* Live social proof badge */}
          <div className="inline-flex items-center gap-1.5 bg-crumb border border-dough rounded-full px-3 py-1 text-xs text-beaver mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-alive animate-pulse inline-block" />
            <span><strong className="text-blackish">{liveCount}</strong> starters diagnosed</span>
          </div>

          {/* Animated jar preview */}
          <div className="flex justify-center mb-5">
            <StarterMeter score={PREVIEW_SCORES[previewIdx]} />
          </div>

          <h1 className="font-serif text-4xl font-bold text-blackish leading-tight mb-4">
            Is my sourdough<br />starter dead?
          </h1>

          <p className="text-beaver text-base mb-8 leading-relaxed">
            Answer 10 quick questions and get an instant diagnosis — plus a personalized revival plan if it needs help.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3 mb-8">
            <button
              onClick={onStart}
              className="btn-primary w-full text-base py-4"
            >
              Start the Diagnostic →
            </button>
            <button
              onClick={onPhotoStart}
              className="btn-secondary w-full text-base py-4"
            >
              📷 Upload a photo instead
            </button>
          </div>

          {/* Trust signals */}
          <div className="flex justify-center gap-6 flex-wrap mb-10 text-xs text-beaver">
            <span>🧑‍🍳 Built with a sourdough expert</span>
            <span>⚡ Results in under 2 minutes</span>
            <span>🆓 100% free to use</span>
          </div>

          {/* Scenarios */}
          <div className="text-left">
            <p className="text-xs font-semibold text-beaver uppercase tracking-wider text-center mb-3">Sound familiar?</p>
            <div className="grid grid-cols-2 gap-2">
              {SCENARIOS.map((s) => (
                <button
                  key={s.text}
                  onClick={onStart}
                  className="card p-3 text-xs text-blackish flex items-start gap-2 hover:border-crust hover:bg-crumb transition-colors text-left"
                >
                  <span>{s.emoji}</span>
                  <span className="italic">{s.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Email capture teaser */}
          <div className="mt-10 card border-dashed border-2 border-crust text-center">
            <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-1">Free Download</p>
            <p className="font-serif font-bold text-blackish text-sm mb-1">The Sourdough Starter Cheat Sheet</p>
            <p className="text-xs text-beaver mb-3">Quick-reference guide: feeding ratios, signs of life, and what every smell means. Free PDF.</p>
            <a
              href="https://gumroad.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs inline-block"
            >
              Get the Free Cheat Sheet →
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dough px-6 py-4 flex items-center justify-between text-[11px] text-beaver">
        <span>© 2025 IsMyStarterDead.com</span>
        <div className="flex gap-4">
          <a href="/gallery" className="hover:text-umber transition-colors">Starter Gallery</a>
          <a href="/discard-recipes" className="hover:text-umber transition-colors">Discard Recipes</a>
        </div>
      </footer>
    </div>
  );
};

export default StartPage;
