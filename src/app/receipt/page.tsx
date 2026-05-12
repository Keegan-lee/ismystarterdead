import Link from 'next/link';
import type { Metadata } from 'next';

import { ReceiptConfetti } from '@/components/receipt/ReceiptConfetti';
import { getStripe } from '@/server/stripe/getStripe';

export const metadata: Metadata = {
  title: 'Receipt',
  description:
    'Confirm your payment status and access your Stripe receipt. Your digital product is delivered by email after successful payment.',
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: 'Receipt',
    description: 'Confirm payment status and access your Stripe receipt.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Receipt',
    description: 'Confirm payment status and access your Stripe receipt.',
  },
};

type TReceiptSearchParams = {
  payment_intent_id?: string;
  checkout_session_id?: string;
};

function getReceiptUrlFromPaymentIntent(pi: import('stripe').Stripe.PaymentIntent): string | null {
  const latestCharge = typeof pi.latest_charge === 'string' ? null : pi.latest_charge;
  return latestCharge?.receipt_url ?? null;
}

function ReceiptSiteNav() {
  return (
    <nav className="flex shrink-0 items-center justify-between px-6 py-4 border-b border-dough">
      <Link href="/" className="font-serif font-bold text-blackish text-sm">
        🫙 Is My Starter Dead?
      </Link>
      <div className="flex items-center gap-4 text-xs text-beaver">
        <Link href="/gallery" className="hover:text-umber transition-colors">
          Gallery
        </Link>
        <Link href="/discard-recipes" className="hover:text-umber transition-colors">
          Recipes
        </Link>
      </div>
    </nav>
  );
}

type TReceiptHeroCopy = {
  headline: string;
  supporting: string;
};

function getReceiptHeroCopy(status: import('stripe').Stripe.PaymentIntent.Status): TReceiptHeroCopy {
  switch (status) {
    case 'succeeded':
      return {
        headline: 'Your digital goods are on their way — check your email.',
        supporting: 'Payment confirmed. Thank you for your purchase.',
      };
    case 'processing':
      return {
        headline: "We're confirming your payment.",
        supporting: "When it's complete, we'll send your digital goods to the email you used at checkout.",
      };
    case 'requires_payment_method':
      return {
        headline: "This payment didn't go through.",
        supporting: 'Return to checkout to try again or use a different payment method.',
      };
    default:
      return {
        headline: 'We could not confirm this payment yet.',
        supporting:
          'If you just finished checkout, wait a moment and refresh. Otherwise start again from the shop.',
      };
  }
}

export default async function ReceiptPage({ searchParams }: { searchParams: Promise<TReceiptSearchParams> }) {
  const params = await searchParams;
  const stripe = getStripe();

  let paymentIntentId = params.payment_intent_id || null;

  if (!paymentIntentId && params.checkout_session_id) {
    const session = await stripe.checkout.sessions.retrieve(params.checkout_session_id, {
      expand: ['payment_intent'],
    });
    const paymentIntent = session.payment_intent;
    paymentIntentId = typeof paymentIntent === 'string' ? paymentIntent : paymentIntent?.id ?? null;
  }

  if (!paymentIntentId) {
    return (
      <div className="min-h-screen bg-flour flex flex-col">
        <ReceiptSiteNav />
        <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
          <div className="max-w-md w-full text-center animate-fade-in">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-blackish leading-tight">
              We need a valid receipt link
            </h1>
            <p className="text-base text-beaver mt-4 leading-relaxed">
              Missing receipt details. Please return to checkout or use the link from your confirmation email.
            </p>
            <div className="mt-8">
              <Link
                href="/"
                className="text-sm text-beaver hover:text-umber transition-colors underline underline-offset-2"
              >
                ← Back home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ['latest_charge'],
  });

  const receiptUrl = getReceiptUrlFromPaymentIntent(paymentIntent);
  const status = paymentIntent.status;
  const { headline, supporting } = getReceiptHeroCopy(status);
  const showCelebration = status === 'succeeded';

  return (
    <div className="min-h-screen bg-flour flex flex-col">
      <ReceiptConfetti enabled={showCelebration} />
      <ReceiptSiteNav />

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
        <div className="max-w-md w-full text-center animate-fade-in space-y-6">
          <header className="space-y-4">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-blackish leading-tight">{headline}</h1>
            <p className="text-base text-beaver leading-relaxed">{supporting}</p>
          </header>

          <div className="flex flex-col items-stretch gap-4 pt-2">
            {receiptUrl ? (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary text-sm inline-flex items-center justify-center"
              >
                View Stripe receipt →
              </a>
            ) : null}

            {status === 'succeeded' ? (
              <p className="text-sm text-beaver leading-relaxed">
                If you don&apos;t see the message, check spam or promotions. Questions?{' '}
                <span className="text-umber">support@palwefrancis.com</span>
              </p>
            ) : (
              <p className="text-sm text-beaver leading-relaxed">
                Need help? <span className="text-umber">support@palwefrancis.com</span>
              </p>
            )}

            <Link
              href="/discard-recipes"
              className="text-sm text-beaver hover:text-umber transition-colors underline underline-offset-2"
            >
              ← Back to recipes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
