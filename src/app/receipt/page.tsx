import Link from 'next/link';
import type { Metadata } from 'next';

import { getStripe } from '@/server/stripe/getStripe';

export const metadata: Metadata = {
  title: 'Receipt',
  description:
    'Confirm your payment status and access your Stripe receipt. Your digital product is delivered by email after successful payment.',
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
      <div className="min-h-screen bg-flour px-4 py-12">
        <div className="max-w-lg mx-auto card">
          <h1 className="font-serif text-2xl font-bold text-blackish">Receipt</h1>
          <p className="text-sm text-beaver mt-2">Missing receipt identifier. Please return to the checkout flow.</p>
          <div className="mt-4">
            <Link href="/" className="text-sm text-beaver hover:text-umber transition-colors underline">
              ← Back home
            </Link>
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

  const statusLabel =
    status === 'succeeded'
      ? 'Payment confirmed'
      : status === 'processing'
        ? 'Payment processing'
        : status === 'requires_payment_method'
          ? 'Payment not completed'
          : 'Payment status';

  return (
    <div className="min-h-screen bg-flour">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-dough">
        <Link href="/" className="font-serif font-bold text-blackish text-sm">
          🫙 IsMyStarterDead
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

      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="card border-2 border-crust bg-crumb">
          <p className="text-xs font-semibold text-beaver uppercase tracking-wider">Receipt</p>
          <h1 className="font-serif text-2xl font-bold text-blackish mt-2">{statusLabel}</h1>

          <div className="mt-4 space-y-2 text-sm text-beaver">
            <p>
              <span className="font-semibold text-blackish">PaymentIntent:</span> {paymentIntent.id}
            </p>
            <p>
              <span className="font-semibold text-blackish">Status:</span> {status}
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2">
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

            <p className="text-xs text-beaver">
              Your digital product is delivered by email after successful payment. If you don’t see it, check spam or
              contact <span className="text-umber">support@palwefrancis.com</span>.
            </p>

            <Link href="/discard-recipes" className="text-xs text-beaver hover:text-umber transition-colors underline">
              ← Back to recipes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

