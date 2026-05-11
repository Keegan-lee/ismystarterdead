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
        className="relative w-full max-w-lg rounded-2xl border-2 border-crust bg-crumb shadow-xl animate-slide-up focus:outline-none"
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-dough">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-beaver uppercase tracking-wider">Secure checkout</p>
            <h2 id={titleId} className="font-serif font-bold text-blackish text-lg leading-tight mt-1">
              {product.title}
            </h2>
            <p id={descId} className="text-xs text-beaver mt-1.5">
              {product.description}
            </p>
            {product.imageUrl ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-dough bg-flour p-3">
                <div className="relative mx-auto w-full max-w-[220px] aspect-[2/3]">
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    fill
                    sizes="220px"
                    className="object-contain"
                    quality={90}
                  />
                </div>
              </div>
            ) : null}
            <p className="text-xs font-semibold text-blackish mt-2">${product.displayPrice}</p>
          </div>

          <button
            type="button"
            className="flex-shrink-0 rounded-md px-2 py-1 text-xs text-beaver hover:text-umber hover:bg-flour/60 transition-colors"
            onClick={onClose}
          >
            ESC
          </button>
        </div>

        <div className="p-5">
          {paymentIntentId && receiptHref ? (
            <div className="rounded-xl border border-dough bg-flour p-4">
              <p className="text-sm font-semibold text-blackish">Payment confirmed</p>
              <p className="text-xs text-beaver mt-1">
                Your email delivery is processing. You can also view your receipt status in-app.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Link href={receiptHref} className="btn-primary text-xs inline-flex items-center">
                  Go to receipt →
                </Link>
                <button
                  type="button"
                  className="text-xs text-beaver hover:text-umber underline"
                  onClick={onClose}
                >
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
  );
}

