'use client';
import React, { useState } from 'react';

import { ProductCheckoutCta } from '@/components/checkout/ProductCheckoutCta/ProductCheckoutCta';
import { evaluateStarterScore } from '@/lib/evaluateScore';
import { formatPriceInCents } from '@/lib/pricing/formatPrice';
import type { TProductCheckoutSummary } from '@/sanity/lib/types';

import StarterMeter from './StarterMeter';

const FALLBACK_REVIVAL_TITLE = 'The Sourdough Revival Guide';
const FALLBACK_REVIVAL_DESCRIPTION =
  'A step-by-step 5-day rescue plan for starters that are struggling or dead. Written by an expert baker. Includes troubleshooting for every scenario.';

const FALLBACK_CHEAT_SHEET_TITLE = 'Sourdough Starter Cheat Sheet';
const FALLBACK_CHEAT_SHEET_DESCRIPTION =
  'Feeding ratios, signs of life, smell guide — all on one page. Free PDF, no spam.';

export interface IResultScreenProps {
  score: number;
  image?: File | null;
  onRetry: () => void;
  revivalGuideProduct: TProductCheckoutSummary | null;
  cheatSheetProduct: TProductCheckoutSummary | null;
}

const AFFILIATE_TOOLS = [
  {
    name: 'King Arthur Bread Flour',
    desc: 'The gold standard for sourdough. Consistent, high-protein, reliable.',
    price: 'From $12',
    url: 'https://www.kingarthurbaking.com/shop/items/king-arthur-bread-flour-5-lb',
    badge: '⭐ Most Popular',
  },
  {
    name: 'Challenger Bread Pan',
    desc: 'The best cast iron pan for a bakery-quality crust at home.',
    price: 'From $199',
    url: 'https://challengerbreadware.com/',
    badge: '🏆 Pro Pick',
  },
  {
    name: 'Kitchen Scale (0.1g precision)',
    desc: 'Accurate feeding ratios are the #1 key to a healthy starter.',
    price: 'From $15',
    url: 'https://www.amazon.com/s?k=kitchen+scale+0.1g+baking',
    badge: '🔧 Essential',
  },
];

const DISCARD_RECIPES = [
  { name: 'Sourdough Pancakes', time: '15 min', emoji: '🥞' },
  { name: 'Chocolate Chip Cookies', time: '25 min', emoji: '🍪' },
  { name: 'Sourdough Crackers', time: '30 min', emoji: '🫓' },
  { name: 'Banana Bread', time: '60 min', emoji: '🍌' },
  { name: 'Pizza Dough', time: '20 min', emoji: '🍕' },
  { name: 'Blueberry Muffins', time: '30 min', emoji: '🫐' },
];

const ResultScreen: React.FC<IResultScreenProps> = ({
  score,
  image,
  onRetry,
  revivalGuideProduct,
  cheatSheetProduct,
}) => {
  const result = evaluateStarterScore(score);
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    const text = `I just diagnosed my sourdough starter — it's "${result.headline}" 🫙 Find out if yours is alive at ismystarterdead.com`;
    if (navigator.share) {
      navigator.share({ title: 'Is My Starter Dead?', text, url: 'https://ismystarterdead.com' });
    } else {
      navigator.clipboard.writeText(text + '\nhttps://ismystarterdead.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-1 flex-col pb-20">
      {/* Hero Result */}
      <div className={`${result.bgColor} border-b ${result.borderColor} px-4 pt-10 pb-8`}>
        <div className="max-w-lg mx-auto text-center">
          {/* Full-size jar meter as the hero visual */}
          <div className="flex justify-center mb-4">
            <StarterMeter score={score} />
          </div>
          <h1 className={`font-serif text-2xl font-bold mb-2 ${result.color}`}>{result.headline}</h1>
          <p className="text-sm text-beaver leading-relaxed max-w-sm mx-auto mb-4">{result.message}</p>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="btn-secondary text-xs inline-flex items-center gap-1.5"
          >
            {copied ? '✅ Copied!' : '↗ Share your result'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-6 space-y-6">

        {/* Uploaded photo */}
        {image && (
          <div className="card">
            <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-3">Your Starter</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={URL.createObjectURL(image)} alt="Your starter" className="rounded-xl w-full h-48 object-cover" />
          </div>
        )}

        {/* Action Steps */}
        <div className="card">
          <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-3">What to do next</p>
          <ol className="space-y-3">
            {result.actions.map((action, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-blackish">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-dough text-umber text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                <span className="leading-relaxed">{action}</span>
              </li>
            ))}
          </ol>
          {result.revivalTip && (
            <p className="mt-4 text-xs text-beaver bg-crumb rounded-lg px-3 py-2.5 border border-dough leading-relaxed">
              💡 {result.revivalTip}
            </p>
          )}
        </div>

        {/* Revival Guide CTA */}
        {result.showRevivalGuide && (
          <div className="card border-2 border-crust bg-crumb">
            <div className="flex items-start gap-4">
              <div className="text-3xl">📖</div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-1">Digital Guide</p>
                <h3 className="font-serif font-bold text-blackish mb-1">
                  {revivalGuideProduct?.title ?? FALLBACK_REVIVAL_TITLE}
                </h3>
                <p className="text-xs text-beaver mb-3 whitespace-pre-line">
                  {revivalGuideProduct?.description ?? FALLBACK_REVIVAL_DESCRIPTION}
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  {revivalGuideProduct ? (
                    <ProductCheckoutCta
                      product={revivalGuideProduct}
                      ctaLabel={
                        revivalGuideProduct.priceInCents <= 0
                          ? 'Get the Free Guide →'
                          : `Get the Guide — ${formatPriceInCents(revivalGuideProduct.priceInCents)} →`
                      }
                    />
                  ) : (
                    <span className="text-xs text-beaver">Checkout is coming soon.</span>
                  )}
                  <span className="text-xs text-beaver">PDF • Instant download</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Discard Recipes CTA */}
        {result.showDiscardRecipes && (
          <div className="card border-2 border-crust bg-crumb">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🍞</div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-1">Digital Recipe Book</p>
                <h3 className="font-serif font-bold text-blackish mb-1">100 Sourdough Discard Recipes</h3>
                <p className="text-xs text-beaver mb-3">Never waste discard again. From pancakes to pizza dough to brownies — 100 tested recipes for every skill level.</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <a
                    href="https://gumroad.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary text-xs"
                  >
                    Get the Book — $12
                  </a>
                  <span className="text-xs text-beaver">PDF • Instant download</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cheat sheet — Sanity checkout */}
        <div className="card border-dashed border-2 border-crust text-center">
          <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-1">Free Download</p>
          <p className="font-serif font-bold text-blackish mb-1">
            {cheatSheetProduct?.title ?? FALLBACK_CHEAT_SHEET_TITLE}
          </p>
          <p className="text-xs text-beaver mb-3 whitespace-pre-line">
            {cheatSheetProduct?.description ?? FALLBACK_CHEAT_SHEET_DESCRIPTION}
          </p>
          <div className="flex justify-center">
            {cheatSheetProduct ? (
              <ProductCheckoutCta
                product={cheatSheetProduct}
                ctaLabel={
                  cheatSheetProduct.priceInCents <= 0
                    ? 'Get the Free Cheat Sheet →'
                    : `Get the Cheat Sheet — ${formatPriceInCents(cheatSheetProduct.priceInCents)} →`
                }
              />
            ) : (
              <span className="text-xs text-beaver">Checkout is coming soon.</span>
            )}
          </div>
        </div>

        {/* Discard Recipe Quick Links */}
        {result.showDiscardRecipes && (
          <div>
            <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-3">Quick Discard Recipes</p>
            <div className="grid grid-cols-3 gap-2">
              {DISCARD_RECIPES.map((r) => (
                <a
                  key={r.name}
                  href="/discard-recipes"
                  className="card text-center hover:border-crust hover:bg-crumb transition-colors p-3"
                >
                  <div className="text-2xl mb-1">{r.emoji}</div>
                  <p className="text-xs font-medium text-blackish leading-tight">{r.name}</p>
                  <p className="text-[10px] text-beaver mt-0.5">{r.time}</p>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Affiliate Tools */}
        <div>
          <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-3">Recommended Tools</p>
          <div className="space-y-3">
            {AFFILIATE_TOOLS.map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card flex items-center gap-4 hover:border-crust hover:bg-crumb transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-xs font-bold text-blackish">{tool.name}</span>
                    <span className="text-[10px] bg-dough text-umber px-1.5 py-0.5 rounded-full">{tool.badge}</span>
                  </div>
                  <p className="text-xs text-beaver">{tool.desc}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-umber">{tool.price}</p>
                  <p className="text-[10px] text-beaver">→ Shop</p>
                </div>
              </a>
            ))}
          </div>
          <p className="text-[10px] text-beaver mt-2 text-center">We may earn a small commission on purchases. This helps keep the site free.</p>
        </div>

        {/* Community Gallery CTA */}
        <div className="card text-center">
          <p className="text-2xl mb-2">🖼️</p>
          <h3 className="font-serif font-bold text-blackish mb-1">See the Starter Gallery</h3>
          <p className="text-xs text-beaver mb-3">Compare your starter to hundreds of real photos from the community — healthy, struggling, and everything in between.</p>
          <a href="/gallery" className="btn-secondary text-xs inline-block">Browse the Gallery →</a>
        </div>

        {/* Retry */}
        <div className="text-center pt-2 pb-4">
          <button onClick={onRetry} className="text-sm text-beaver hover:text-umber transition-colors underline">
            Run the diagnostic again
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
