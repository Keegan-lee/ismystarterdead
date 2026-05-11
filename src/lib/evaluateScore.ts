export interface StarterResult {
  status: 'Alive' | 'Needs Love' | 'At Risk' | 'Likely Dead' | 'Contaminated';
  headline: string;
  message: string;
  color: string;
  bgColor: string;
  borderColor: string;
  emoji: string;
  actions: string[];
  revivalTip?: string;
  showRevivalGuide: boolean;
  showDiscardRecipes: boolean;
}

export function evaluateStarterScore(score: number): StarterResult {
  if (score <= -50) {
    return {
      status: 'Contaminated',
      headline: 'Your starter may be contaminated.',
      message: "The signs point to mold or harmful bacteria. It's safest to start fresh — your next starter will be stronger for it.",
      color: 'text-dead',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      emoji: '🚫',
      actions: [
        'Discard the current starter completely',
        'Sterilize your jar thoroughly',
        'Start fresh with filtered water and unbleached flour',
      ],
      revivalTip: "Starting over is not failure — it's wisdom. Most bakers have done it at least once.",
      showRevivalGuide: true,
      showDiscardRecipes: false,
    };
  } else if (score < 0) {
    return {
      status: 'Likely Dead',
      headline: 'Your starter is probably dead.',
      message: "The signs aren't great, but don't give up yet. Many starters that look dead can be revived with a few days of consistent feeding.",
      color: 'text-dead',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      emoji: '😢',
      actions: [
        'Discard all but 20g of starter',
        'Feed with 100g flour + 100g filtered water',
        'Keep at 24–26°C / 75–80°F',
        'Repeat for 3–5 days before giving up',
      ],
      revivalTip: 'Even a single surviving yeast cell can rebuild a colony. Warmth + fresh flour is the recipe.',
      showRevivalGuide: true,
      showDiscardRecipes: false,
    };
  } else if (score < 30) {
    return {
      status: 'At Risk',
      headline: 'Your starter needs attention.',
      message: "It's alive but stressed. A few days of consistent feeding in a warm spot should bring it back to full strength.",
      color: 'text-warn',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      emoji: '🛠️',
      actions: [
        'Feed twice daily for 3–5 days',
        'Keep in a warm spot (24°C / 75°F)',
        'Use whole wheat or rye flour for a boost',
        'Look for bubbles and rise within 8 hours',
      ],
      revivalTip: 'Whole wheat flour contains more wild yeast than white flour — it\'s a great booster.',
      showRevivalGuide: true,
      showDiscardRecipes: false,
    };
  } else if (score < 60) {
    return {
      status: 'Needs Love',
      headline: 'Your starter is alive but could be stronger.',
      message: "You're on the right track! A few consistent feedings and the right temperature will have it doubling reliably.",
      color: 'text-warn',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      emoji: '🤔',
      actions: [
        'Feed on a consistent schedule (every 12 hours)',
        'Ensure kitchen temp is above 21°C / 70°F',
        "Use the float test: drop a spoonful in water — if it floats, it's ready to bake",
      ],
      showRevivalGuide: false,
      showDiscardRecipes: true,
    };
  } else {
    return {
      status: 'Alive',
      headline: 'Your starter is alive and thriving!',
      message: 'Great news — your starter is healthy and active. Time to bake something delicious, or put that discard to work.',
      color: 'text-alive',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      emoji: '🎉',
      actions: [
        'Bake a classic sourdough loaf',
        'Make sourdough pancakes with your discard',
        'Try sourdough chocolate chip cookies',
        'Share your starter with a friend',
      ],
      showRevivalGuide: false,
      showDiscardRecipes: true,
    };
  }
}
