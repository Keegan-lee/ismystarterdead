'use client';

import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export type TCheckoutSuccess =
  | { kind: 'paid'; paymentIntentId: string }
  | { kind: 'free' };

export interface ICheckoutFormProps {
  productId: string;
  priceInCents: number;
  onSucceeded: (result: TCheckoutSuccess) => void;
}

interface ICreatePaymentIntentResponse {
  clientSecret: string;
}

function StripePaymentInner({ onPaymentSucceeded }: { onPaymentSucceeded: (paymentIntentId: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements) return;

    setIsSubmitting(true);
    try {
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/receipt`,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        setError(result.error.message || 'Payment failed. Please try again.');
        return;
      }

      const paymentIntentId = result.paymentIntent?.id;
      if (paymentIntentId) {
        onPaymentSucceeded(paymentIntentId);
        router.push(`/receipt?payment_intent_id=${encodeURIComponent(paymentIntentId)}`);
      } else {
        router.push('/receipt');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="space-y-4 pr-1">
        <PaymentElement />

        {error ? (
          <p className="text-xs text-dead" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="sticky bottom-0 -mx-5 mt-4 border-t border-dough bg-crumb/95 px-5 pb-5 pt-4 backdrop-blur supports-[backdrop-filter]:bg-crumb/80">
        <button type="submit" className="btn-primary w-full text-sm" disabled={!stripe || isSubmitting}>
          {isSubmitting ? 'Processing…' : 'Pay now'}
        </button>

        <p className="mt-3 text-[11px] leading-relaxed text-beaver">
          By paying, you’ll receive the digital asset by email after payment is confirmed.
        </p>
      </div>
    </form>
  );
}

function FreeClaimForm({
  productId,
  email,
  setEmail,
  onSucceeded,
}: {
  productId: string;
  email: string;
  setEmail: (next: string) => void;
  onSucceeded: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email so we can send the file.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/products/claim-free', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data?.error || 'Could not send your file. Please try again.');
      }
      onSucceeded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your file. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block">
        <span className="text-[11px] font-semibold text-beaver uppercase tracking-wider">Email for delivery</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="you@example.com"
          className="mt-1 w-full rounded-xl border border-dough bg-flour px-3 py-2 text-sm text-blackish placeholder:text-beaver/70 focus:outline-none focus:ring-2 focus:ring-crust"
          autoComplete="email"
        />
      </label>

      {error ? (
        <p className="text-xs text-dead" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="btn-primary w-full text-sm" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Get it free →'}
      </button>

      <p className="text-[11px] leading-relaxed text-beaver">
        We’ll email your file right away. No account or payment required.
      </p>
    </form>
  );
}

export function CheckoutForm({ productId, priceInCents, onSucceeded }: ICheckoutFormProps) {
  const isFree = priceInCents <= 0;

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const appearance = useMemo(
    () => ({
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#6f5e53',
        colorText: '#1f1f1f',
        colorDanger: '#b94040',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        borderRadius: '12px',
      },
    }),
    [],
  );

  async function handleStartCheckout() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, email }),
      });
      if (!res.ok) throw new Error('Failed to start checkout. Please try again.');
      const data = (await res.json()) as ICreatePaymentIntentResponse;
      if (!data?.clientSecret) throw new Error('Missing payment client secret.');
      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout.');
    } finally {
      setIsLoading(false);
    }
  }

  if (error) {
    return (
      <div className="rounded-xl border border-dough bg-flour p-4">
        <p className="text-sm font-semibold text-blackish">Checkout unavailable</p>
        <p className="text-xs text-beaver mt-1">{error}</p>
      </div>
    );
  }

  if (isFree) {
    return (
      <FreeClaimForm
        productId={productId}
        email={email}
        setEmail={setEmail}
        onSucceeded={() => onSucceeded({ kind: 'free' })}
      />
    );
  }

  return (
    <div className="space-y-3">
      <label className="block">
        <span className="text-[11px] font-semibold text-beaver uppercase tracking-wider">Email for delivery</span>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="you@example.com"
          className="mt-1 w-full rounded-xl border border-dough bg-flour px-3 py-2 text-sm text-blackish placeholder:text-beaver/70 focus:outline-none focus:ring-2 focus:ring-crust"
          autoComplete="email"
        />
      </label>

      {!clientSecret ? (
        <button
          type="button"
          className="btn-primary w-full text-sm"
          onClick={handleStartCheckout}
          disabled={isLoading}
        >
          {isLoading ? 'Starting checkout…' : 'Continue to payment'}
        </button>
      ) : (
        <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
          <StripePaymentInner onPaymentSucceeded={(id) => onSucceeded({ kind: 'paid', paymentIntentId: id })} />
        </Elements>
      )}
    </div>
  );
}
