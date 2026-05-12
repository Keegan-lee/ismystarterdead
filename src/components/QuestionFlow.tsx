'use client';
import React, { useState } from 'react';
import questions from '@/lib/questions';
import StarterMeter from './StarterMeter';

interface QuestionFlowProps {
  onComplete: (score: number, image?: File) => void;
}

const QuestionFlow: React.FC<QuestionFlowProps> = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  const q = questions[current];
  const progress = ((current) / questions.length) * 100;

  const handleSelect = (idx: number, pts: number) => {
    setSelected(idx);
    const newScore = score + pts;
    setDirection('forward');
    setTimeout(() => {
      if (current + 1 < questions.length) {
        setScore(newScore);
        setCurrent(current + 1);
        setSelected(null);
      } else {
        onComplete(newScore);
      }
    }, 300);
  };

  const handleBack = () => {
    if (current > 0) {
      setDirection('back');
      setCurrent(current - 1);
      setSelected(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-start px-4 pb-16 pt-6">

      {/* Sticky progress header */}
      <div className="w-full max-w-lg pt-6 pb-4 sticky top-0 bg-flour z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-beaver font-medium">Question {current + 1} of {questions.length}</span>
          <span className="text-xs text-beaver">{Math.round(progress)}% complete</span>
        </div>
        <div className="w-full bg-dough rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-crust h-1.5 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Compact jar meter — shows live score as user answers */}
      <div className="my-4">
        <StarterMeter score={score} compact />
      </div>

      {/* Question Card */}
      <div
        key={`${current}-${direction}`}
        className="w-full max-w-lg animate-slide-up"
      >
        <div className="card mb-4">
          <h2 className="font-serif text-lg font-bold text-blackish mb-2 leading-snug">{q.text}</h2>
          {q.hint && (
            <p className="text-xs text-beaver bg-crumb rounded-lg px-3 py-2 border border-dough leading-relaxed">
              💡 {q.hint}
            </p>
          )}
        </div>

        <div className="space-y-2">
          {q.options.map((opt, i) => (
            <button
              key={i}
              className={`answer-btn${selected === i ? ' selected' : ''}`}
              onClick={() => handleSelect(i, opt.score)}
              disabled={selected !== null}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Back button */}
      {current > 0 && (
        <button
          onClick={handleBack}
          className="mt-6 text-sm text-beaver hover:text-umber transition-colors"
        >
          ← Back
        </button>
      )}
    </div>
  );
};

export default QuestionFlow;
