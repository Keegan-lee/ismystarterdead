'use client';

export interface Question {
  text: string;
  hint?: string;
  options: { label: string; score: number }[];
}

const questions: Question[] = [
  {
    text: 'Does your starter smell tangy, earthy, or sour?',
    hint: 'A healthy starter smells like yogurt, beer, or vinegar — all signs of active fermentation.',
    options: [
      { label: 'Yes — tangy or sour', score: 20 },
      { label: 'No — smells off or like nail polish remover', score: -20 },
      { label: 'Barely any smell', score: -5 },
      { label: 'Not sure', score: 0 },
    ],
  },
  {
    text: 'Do you see bubbles in your starter?',
    hint: 'Even tiny bubbles throughout the jar are a great sign — it means yeast is producing CO₂.',
    options: [
      { label: 'Yes — lots of bubbles', score: 25 },
      { label: 'A few small bubbles', score: 10 },
      { label: 'No bubbles at all', score: -20 },
      { label: 'Not sure', score: 0 },
    ],
  },
  {
    text: 'Has your starter risen (doubled) within 4–8 hours after feeding?',
    hint: 'Peak rise is the clearest sign of a healthy, active starter.',
    options: [
      { label: 'Yes — it doubled or more', score: 30 },
      { label: 'It rose a little but not much', score: 10 },
      { label: 'No rise at all', score: -30 },
      { label: "I haven't fed it recently", score: -10 },
    ],
  },
  {
    text: 'What does your starter look like right now?',
    hint: 'Texture tells a lot. Frothy = active. Liquid on top (hooch) = hungry but alive. Pink/orange = danger.',
    options: [
      { label: 'Frothy and bubbly', score: 20 },
      { label: 'Thick and paste-like', score: 10 },
      { label: 'Liquid on top (hooch)', score: -5 },
      { label: 'Watery and flat', score: -15 },
    ],
  },
  {
    text: 'When did you last feed your starter?',
    hint: 'Starters need regular feeding. At room temp, every 12–24 hours. In the fridge, once a week.',
    options: [
      { label: 'Within the last 12 hours', score: 20 },
      { label: '1–3 days ago', score: 5 },
      { label: 'More than 3 days ago (room temp)', score: -25 },
      { label: 'More than a week ago (fridge)', score: -10 },
    ],
  },
  {
    text: 'What temperature is your kitchen?',
    hint: 'Fermentation slows dramatically below 18°C / 65°F. Cold ≠ dead, just slow.',
    options: [
      { label: 'Warm: 21–26°C / 70–80°F', score: 10 },
      { label: 'Cool: 15–20°C / 59–68°F', score: 0 },
      { label: 'Cold: below 15°C / 59°F', score: -10 },
      { label: 'Not sure', score: 0 },
    ],
  },
  {
    text: 'Is there any visible mold — colored fuzzy patches?',
    hint: 'Pink, orange, black, or green fuzzy patches = mold. White film on top is usually fine.',
    options: [
      { label: 'Yes — colored fuzzy patches', score: -100 },
      { label: 'Just a white film on top', score: 5 },
      { label: 'No mold at all', score: 10 },
      { label: 'Not sure', score: 0 },
    ],
  },
  {
    text: 'Any unusual color changes — pink, orange, or gray?',
    hint: 'Pink or orange tints are a serious warning sign of contamination.',
    options: [
      { label: 'Yes — pink or orange tint', score: -50 },
      { label: 'Slightly gray on top', score: -10 },
      { label: 'Normal cream or off-white color', score: 10 },
      { label: 'Not sure', score: 0 },
    ],
  },
  {
    text: 'Did you recently change flour, water, or container?',
    hint: 'Changes can temporarily stress your starter. Chlorinated tap water is a common culprit.',
    options: [
      { label: 'Yes — changed recently', score: -10 },
      { label: 'No changes', score: 5 },
    ],
  },
  {
    text: 'Has it been stored in the fridge for more than 2 weeks without feeding?',
    hint: 'Fridge starters can survive months, but they need a revival feeding cycle to wake back up.',
    options: [
      { label: 'Yes — more than 2 weeks', score: -15 },
      { label: 'Yes — 1–2 weeks', score: -5 },
      { label: 'No — I feed it regularly', score: 5 },
    ],
  },
];

export default questions;
