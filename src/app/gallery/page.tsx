import React from 'react';
import Link from 'next/link';

const GALLERY_ITEMS = [
  { label: 'Thriving', emoji: '🎉', color: 'bg-green-50 border-green-200', desc: 'Doubled in 6h, lots of bubbles, domed top', tag: 'Alive' },
  { label: 'Needs Love', emoji: '🤔', color: 'bg-amber-50 border-amber-200', desc: 'Some bubbles, slight rise, hooch on top', tag: 'Needs Love' },
  { label: 'At Risk', emoji: '🛠️', color: 'bg-yellow-50 border-yellow-200', desc: 'Flat, watery, no bubbles after 24h', tag: 'At Risk' },
  { label: 'Likely Dead', emoji: '😢', color: 'bg-orange-50 border-orange-200', desc: 'No activity for 5+ days, foul smell', tag: 'Likely Dead' },
  { label: 'Contaminated', emoji: '🚫', color: 'bg-red-50 border-red-200', desc: 'Pink/orange tint, fuzzy mold patches visible', tag: 'Contaminated' },
  { label: 'Thriving', emoji: '🎉', color: 'bg-green-50 border-green-200', desc: 'Fed with rye flour, tripled in 4h', tag: 'Alive' },
  { label: 'Needs Love', emoji: '🤔', color: 'bg-amber-50 border-amber-200', desc: 'Stored in fridge 2 weeks, slow to wake up', tag: 'Needs Love' },
  { label: 'At Risk', emoji: '🛠️', color: 'bg-yellow-50 border-yellow-200', desc: 'Changed to tap water, activity dropped', tag: 'At Risk' },
  { label: 'Thriving', emoji: '🎉', color: 'bg-green-50 border-green-200', desc: 'Warm kitchen, 100% hydration, very active', tag: 'Alive' },
];

const TAG_COLORS: Record<string, string> = {
  'Alive': 'bg-green-100 text-green-800',
  'Needs Love': 'bg-amber-100 text-amber-800',
  'At Risk': 'bg-yellow-100 text-yellow-800',
  'Likely Dead': 'bg-orange-100 text-orange-800',
  'Contaminated': 'bg-red-100 text-red-800',
};

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-flour">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-dough">
        <Link href="/" className="font-serif font-bold text-blackish text-sm">🫙 IsMyStarterDead</Link>
        <div className="flex items-center gap-4 text-xs text-beaver">
          <Link href="/gallery" className="text-umber font-semibold">Gallery</Link>
          <Link href="/discard-recipes" className="hover:text-umber transition-colors">Recipes</Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-blackish mb-2">Starter Gallery</h1>
          <p className="text-beaver text-sm">Real examples of healthy, struggling, and dead starters. Use these to compare with your own.</p>
        </div>

        {/* Filter hint */}
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {Object.entries(TAG_COLORS).map(([tag, cls]) => (
            <span key={tag} className={`text-xs px-2.5 py-1 rounded-full font-medium ${cls}`}>{tag}</span>
          ))}
        </div>

        {/* Gallery grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {GALLERY_ITEMS.map((item, i) => (
            <div key={i} className={`rounded-2xl border-2 ${item.color} p-5 flex gap-4 items-start`}>
              <div className="text-4xl">{item.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-serif font-bold text-blackish text-sm">{item.label}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[item.tag]}`}>{item.tag}</span>
                </div>
                <p className="text-xs text-beaver">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Submit CTA */}
        <div className="card text-center border-2 border-dashed border-crust">
          <p className="text-2xl mb-2">📸</p>
          <h3 className="font-serif font-bold text-blackish mb-1">Submit your starter photo</h3>
          <p className="text-xs text-beaver mb-4">Help other bakers by sharing what your starter looks like — healthy or not. Community submissions are reviewed before posting.</p>
          <a
            href="mailto:support@palwefrancis.com?subject=Gallery Submission"
            className="btn-primary text-xs inline-block"
          >
            Submit via Email →
          </a>
        </div>

        {/* Back to diagnostic */}
        <div className="text-center mt-8">
          <Link href="/" className="text-sm text-beaver hover:text-umber transition-colors underline">
            ← Check your own starter
          </Link>
        </div>
      </div>

      <footer className="border-t border-dough px-6 py-4 flex items-center justify-between text-[11px] text-beaver mt-8">
        <span>© 2025 IsMyStarterDead.com</span>
        <div className="flex gap-4">
          <Link href="/gallery" className="hover:text-umber transition-colors">Gallery</Link>
          <Link href="/discard-recipes" className="hover:text-umber transition-colors">Discard Recipes</Link>
        </div>
      </footer>
    </div>
  );
}
