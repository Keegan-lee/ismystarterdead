import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';

import { ProductCheckoutCta } from '@/components/checkout/ProductCheckoutCta/ProductCheckoutCta';
import { getProductBySlug } from '@/sanity/lib/queries';
import { urlForImage } from '@/sanity/lib/image';
import { formatPriceInCents } from '@/lib/pricing/formatPrice';

const RECIPES = [
  {
    name: 'Classic Sourdough Pancakes',
    time: '15 min',
    difficulty: 'Easy',
    emoji: '🥞',
    desc: 'Fluffy, tangy pancakes that use up a full cup of discard. The overnight version is even better.',
    ingredients: ['1 cup sourdough discard', '1 egg', '1 tbsp sugar', '1 tbsp butter', '½ tsp baking soda', 'Pinch of salt'],
    steps: ['Mix discard, egg, sugar, and melted butter.', 'Add baking soda and salt, stir gently.', 'Cook on a medium-hot buttered skillet, 2–3 min per side.'],
    tag: 'Breakfast',
  },
  {
    name: 'Sourdough Chocolate Chip Cookies',
    time: '25 min',
    difficulty: 'Easy',
    emoji: '🍪',
    desc: 'The tang from the discard makes these cookies taste bakery-quality. Crispy edges, chewy center.',
    ingredients: ['½ cup discard', '1 stick butter (softened)', '¾ cup brown sugar', '1 egg', '1½ cups flour', '1 cup chocolate chips', '½ tsp baking soda'],
    steps: ['Cream butter and sugar. Add egg and discard.', 'Fold in flour, baking soda, and chocolate chips.', 'Bake at 375°F / 190°C for 11–13 minutes.'],
    tag: 'Dessert',
  },
  {
    name: 'Sourdough Crackers',
    time: '30 min',
    difficulty: 'Easy',
    emoji: '🫓',
    desc: 'Crispy, savory crackers that are endlessly customizable. Add rosemary, sesame, or everything bagel seasoning.',
    ingredients: ['1 cup discard', '¼ cup olive oil', '½ tsp salt', 'Toppings of choice (herbs, seeds)'],
    steps: ['Mix discard, oil, and salt into a dough.', 'Roll very thin on parchment paper.', 'Score into squares, sprinkle toppings.', 'Bake at 350°F / 175°C for 20–25 min until golden.'],
    tag: 'Snack',
  },
  {
    name: 'Sourdough Banana Bread',
    time: '65 min',
    difficulty: 'Easy',
    emoji: '🍌',
    desc: 'Discard adds a subtle tang that balances the sweetness of banana perfectly.',
    ingredients: ['½ cup discard', '3 ripe bananas', '⅓ cup melted butter', '¾ cup sugar', '1 egg', '1½ cups flour', '1 tsp baking soda'],
    steps: ['Mash bananas, mix in butter, sugar, egg, and discard.', 'Fold in flour and baking soda.', 'Bake at 350°F / 175°C for 55–60 min.'],
    tag: 'Baking',
  },
  {
    name: 'Sourdough Pizza Dough',
    time: '20 min + rest',
    difficulty: 'Medium',
    emoji: '🍕',
    desc: "The best pizza dough you'll ever make. Discard gives it incredible flavor and a chewy, blistered crust.",
    ingredients: ['½ cup discard', '2 cups flour', '¾ cup warm water', '1 tsp salt', '1 tsp olive oil'],
    steps: ['Mix all ingredients into a shaggy dough.', 'Knead for 5 minutes, rest 30 min.', 'Stretch and top as desired. Bake at 500°F / 260°C.'],
    tag: 'Dinner',
  },
  {
    name: 'Sourdough Blueberry Muffins',
    time: '30 min',
    difficulty: 'Easy',
    emoji: '🫐',
    desc: 'Moist, tender muffins with a hint of tang. Frozen blueberries work just as well as fresh.',
    ingredients: ['½ cup discard', '1½ cups flour', '¾ cup sugar', '2 eggs', '⅓ cup oil', '1 cup blueberries', '1 tsp baking powder'],
    steps: ['Mix wet ingredients (discard, eggs, oil).', 'Fold in dry ingredients and blueberries.', 'Fill muffin cups ¾ full. Bake at 375°F / 190°C for 20–22 min.'],
    tag: 'Breakfast',
  },
];

const TAG_COLORS: Record<string, string> = {
  Breakfast: 'bg-amber-100 text-amber-800',
  Dessert: 'bg-pink-100 text-pink-800',
  Snack: 'bg-green-100 text-green-800',
  Baking: 'bg-orange-100 text-orange-800',
  Dinner: 'bg-blue-100 text-blue-800',
};

export const metadata: Metadata = {
  title: 'Discard Recipes',
  description:
    'Never throw away sourdough discard again. Browse simple, tested recipes—plus get the full 100‑recipe book delivered to your inbox after checkout.',
  openGraph: {
    title: 'Discard Recipes',
    description:
      'Simple, tested sourdough discard recipes. Get the full 100‑recipe book delivered to your inbox after checkout.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discard Recipes',
    description:
      'Simple, tested sourdough discard recipes. Get the full 100‑recipe book delivered to your inbox after checkout.',
  },
};

const BOOK_PRODUCT_SLUG = '25-sourdough-discard-recipes';

export default async function DiscardRecipesPage() {
  const bookProduct = await getProductBySlug(BOOK_PRODUCT_SLUG);
  const bookImageUrl =
    bookProduct?.image?.asset?._ref ? urlForImage(bookProduct.image).width(120).height(120).fit('crop').url() : null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-blackish mb-2">Sourdough Discard Recipes</h1>
          <p className="text-beaver text-sm max-w-md mx-auto">Never throw away discard again. These recipes are tested, simple, and delicious — even if your starter is not at peak activity.</p>
        </div>

        <div className="card border-2 border-crust bg-crumb mb-8 flex items-start gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl border border-dough bg-flour flex items-center justify-center">
            {bookImageUrl ? (
              <Image
                src={bookImageUrl}
                alt={bookProduct?.title ? `${bookProduct.title} cover` : 'Recipe book cover'}
                fill
                sizes="56px"
                className="object-cover"
                priority
              />
            ) : (
              <span className="text-3xl" aria-hidden="true">
                📖
              </span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold text-beaver uppercase tracking-wider mb-1">Get the full collection</p>
            <h3 className="font-serif font-bold text-blackish mb-1">
              {bookProduct?.title ?? '100 Sourdough Discard Recipes'}
            </h3>
            <p className="text-xs text-beaver mb-3">
              {bookProduct?.description ??
                'The complete recipe book — 100 tested recipes from pancakes to pasta, cookies to focaccia. Organized by meal type with tips for every skill level.'}
            </p>

            {bookProduct ? (
              <ProductCheckoutCta
                product={bookProduct}
                ctaLabel={`Get the Book — ${formatPriceInCents(bookProduct.priceInCents)} →`}
              />
            ) : (
              <span className="text-xs text-beaver">
                Checkout is coming soon.
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {RECIPES.map((recipe) => (
            <div key={recipe.name} className="card">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{recipe.emoji}</span>
                <div>
                  <h2 className="font-serif font-bold text-blackish text-base">{recipe.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-beaver">⏱ {recipe.time}</span>
                    <span className="text-xs text-beaver">· {recipe.difficulty}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${TAG_COLORS[recipe.tag]}`}>{recipe.tag}</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-beaver mb-4 leading-relaxed">{recipe.desc}</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-beaver uppercase tracking-wider mb-1.5">Ingredients</p>
                  <ul className="space-y-1">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="text-xs text-blackish flex items-start gap-1.5">
                        <span className="text-crust mt-0.5">•</span><span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-beaver uppercase tracking-wider mb-1.5">Steps</p>
                  <ol className="space-y-1">
                    {recipe.steps.map((step, i) => (
                      <li key={i} className="text-xs text-blackish flex items-start gap-1.5">
                        <span className="text-crust font-bold flex-shrink-0">{i + 1}.</span><span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Link href="/" className="text-sm text-beaver hover:text-umber transition-colors underline">
            ← Check if your starter is alive
          </Link>
        </div>
    </div>
  );
}
