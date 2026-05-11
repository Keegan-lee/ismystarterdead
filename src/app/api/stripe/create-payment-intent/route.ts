import { NextResponse } from 'next/server';

import { getProductForCheckoutById } from '@/sanity/lib/queries';
import { getStripe } from '@/server/stripe/getStripe';

interface ICreatePaymentIntentRequestBody {
  productId?: unknown;
  email?: unknown;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ICreatePaymentIntentRequestBody;
    const productId = typeof body.productId === 'string' ? body.productId : null;
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    const product = await getProductForCheckoutById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const stripe = getStripe();
    const price = await stripe.prices.retrieve(product.stripePriceId);

    if (!price.active) {
      return NextResponse.json({ error: 'This product is not available for purchase.' }, { status: 409 });
    }

    if (typeof price.unit_amount !== 'number' || !price.currency) {
      return NextResponse.json({ error: 'Stripe price is missing amount/currency.' }, { status: 500 });
    }

    if (!product.asset?.url || !product.asset.originalFilename || !product.asset.mimeType) {
      return NextResponse.json({ error: 'Product is missing deliverable asset.' }, { status: 500 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: price.unit_amount,
      currency: price.currency,
      automatic_payment_methods: { enabled: true },
      receipt_email: email || undefined,
      metadata: {
        sanityProductId: product._id,
        sanityProductTitle: product.title,
        sanityProductDescription: product.description,
        sanityProductDisplayPrice: product.displayPrice,
        sanityProductImageUrl: product.imageUrl ?? '',
        sanityAssetUrl: product.asset.url,
        sanityAssetFilename: product.asset.originalFilename,
        sanityAssetMimeType: product.asset.mimeType,
        sanityAssetSize: String(product.asset.size ?? ''),
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

