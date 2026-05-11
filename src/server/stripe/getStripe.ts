import 'server-only';

import Stripe from 'stripe';

let stripe: Stripe | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getStripe(): Stripe {
  if (stripe) return stripe;

  stripe = new Stripe(getRequiredEnv('STRIPE_SECRET_KEY'), {
    apiVersion: '2026-04-22.dahlia',
    typescript: true,
  });

  return stripe;
}

