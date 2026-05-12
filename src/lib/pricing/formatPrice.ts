const DEFAULT_CURRENCY = 'USD';
const DEFAULT_LOCALE = 'en-US';

/**
 * Formats a price expressed in the smallest currency unit (e.g. cents)
 * into a localized currency string. Returns "Free" for zero.
 *
 * @example
 *   formatPriceInCents(1200) // "$12.00"
 *   formatPriceInCents(0)    // "Free"
 */
export function formatPriceInCents(
  priceInCents: number,
  options: { currency?: string; locale?: string; freeLabel?: string } = {},
): string {
  const { currency = DEFAULT_CURRENCY, locale = DEFAULT_LOCALE, freeLabel = 'Free' } = options;

  if (!Number.isFinite(priceInCents) || priceInCents <= 0) {
    return freeLabel;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(priceInCents / 100);
}

/** Convenience for the most common UI case: prefer Stripe currency when known. */
export function formatStripeAmount(
  unitAmount: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (typeof unitAmount !== 'number' || !Number.isFinite(unitAmount) || unitAmount <= 0) {
    return 'Free';
  }
  const resolvedCurrency = (currency || DEFAULT_CURRENCY).toUpperCase();
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: resolvedCurrency,
  }).format(unitAmount / 100);
}
