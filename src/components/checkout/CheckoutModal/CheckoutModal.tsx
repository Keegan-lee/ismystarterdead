'use client';

import { useEffect, useId, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import { CheckoutForm } from '../CheckoutForm/CheckoutForm';

export interface ICheckoutModalProduct {
  productId: string;
  title: string;
  description: string;
  displayPrice: string;
  imageUrl?: string;
}

export interface ICheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ICheckoutModalProduct;
  onPaymentSucceeded: (paymentIntentId: string) => void;
  paymentIntentId: string | null;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));
}

export function CheckoutModal({
  isOpen,
  onClose,
  product,
  onPaymentSucceeded,
  paymentIntentId,
}: ICheckoutModalProps) {
  const titleId = useId();
  const descId = useId();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const receiptHref = useMemo(() => {
    if (!paymentIntentId) return null;
    return `/receipt?payment_intent_id=${encodeURIComponent(paymentIntentId)}`;
  }, [paymentIntentId]);

  useEffect(() => {
    if (!isOpen) return;

    previouslyFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const container = containerRef.current;
    if (container) {
      const focusables = getFocusableElements(container);
      (focusables[0] ?? container).focus();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key !== 'Tab') return;
      const currentContainer = containerRef.current;
      if (!currentContainer) return;

      const focusables = getFocusableElements(currentContainer);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first || !currentContainer.contains(active)) {
          e.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close checkout"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-crust bg-crumb shadow-xl animate-slide-up focus:outline-none"
      >
        <div className="flex items-center justify-between gap-4 border-b border-dough px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-beaver uppercase tracking-wider">Secure checkout</p>
            <h2 id={titleId} className="mt-1 font-serif text-lg font-bold leading-tight text-blackish">
              {product.title}
            </h2>
          </div>

          <button
            type="button"
            className="flex-shrink-0 rounded-md px-2 py-1 text-xs text-beaver transition-colors hover:bg-flour/60 hover:text-umber"
            onClick={onClose}
          >
            ESC
          </button>
        </div>

        <div className="grid max-h-[calc(100svh-6.5rem)] grid-cols-1 md:grid-cols-2">
          <div className="min-h-0 overflow-y-auto border-b border-dough p-5 md:border-b-0 md:border-r">
            <p id={descId} className="text-xs text-beaver">
              {product.description}
            </p>

            {product.imageUrl ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-dough bg-flour p-3">
                <div className="relative mx-auto w-full max-w-[280px] aspect-[2/3]">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="(min-width: 768px) 280px, 240px"
                    className="object-contain"
                    quality={90}
                    priority
                  />
                </div>
              </div>
            ) : null}

            <div className="mt-4 rounded-xl border border-dough bg-flour p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-beaver">Purchase</p>
              <div className="mt-2 flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-blackish">Recipe book</p>
                <p className="text-sm font-bold text-blackish">${product.displayPrice}</p>
              </div>
              <ul className="mt-3 space-y-1.5 text-[11px] leading-relaxed text-beaver">
                <li>Delivered by email after payment is confirmed</li>
                <li>No account required for purchase</li>
                <li>Secure payment powered by Stripe</li>
              </ul>
            </div>
          </div>

          <div className="min-h-0 overflow-y-auto p-5">
            {paymentIntentId && receiptHref ? (
              <div className="rounded-xl border border-dough bg-flour p-4">
                <p className="text-sm font-semibold text-blackish">Payment confirmed</p>
                <p className="mt-1 text-xs text-beaver">
                  Your email delivery is processing. You can also view your receipt status in-app.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link href={receiptHref} className="btn-primary inline-flex items-center text-xs">
                    Go to receipt →
                  </Link>
                  <button type="button" className="text-xs text-beaver underline hover:text-umber" onClick={onClose}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <CheckoutForm productId={product.productId} onPaymentSucceeded={onPaymentSucceeded} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

