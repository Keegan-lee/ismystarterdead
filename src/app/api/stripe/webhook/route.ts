import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { getSanityFileAsBuffer } from '@/server/delivery/getSanityFileAsBuffer';
import { sendAdminAlertEmail } from '@/server/email/sendAdminAlertEmail';
import { sendProductDeliveryEmail } from '@/server/email/sendProductDeliveryEmail';
import { getStripe } from '@/server/stripe/getStripe';

export const runtime = 'nodejs';

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function getBuyerEmail(paymentIntent: import('stripe').Stripe.PaymentIntent): string | null {
  if (paymentIntent.receipt_email) return paymentIntent.receipt_email;

  // `PaymentIntent.charges` is not available on modern API versions/types.
  // Prefer `latest_charge` if it was expanded when retrieving the intent.
  const latestCharge =
    typeof paymentIntent.latest_charge === 'string' ? null : paymentIntent.latest_charge;
  const chargeEmail = latestCharge?.billing_details?.email ?? null;
  return chargeEmail;
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const signature = (await headers()).get('stripe-signature');
  const webhookSecret = getRequiredEnv('STRIPE_WEBHOOK_SECRET');

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event: import('stripe').Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ received: true });
  }

  const paymentIntent = event.data.object as import('stripe').Stripe.PaymentIntent;
  const paymentIntentId = paymentIntent.id;

  try {
    const fresh = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['latest_charge'],
    });

    if (fresh.metadata?.deliveryStatus === 'sent') {
      return NextResponse.json({ ok: true });
    }

    const buyerEmail = getBuyerEmail(fresh);
    if (!buyerEmail) {
      throw new Error('Missing buyer email (receipt_email / billing_details.email).');
    }

    const assetUrl = fresh.metadata?.sanityAssetUrl;
    const assetFilename = fresh.metadata?.sanityAssetFilename;
    const assetMimeType = fresh.metadata?.sanityAssetMimeType;

    const productTitle = fresh.metadata?.sanityProductTitle || 'Your purchase';
    const productDescription = fresh.metadata?.sanityProductDescription || 'Your file is attached to this email.';
    const productDisplayPrice = fresh.metadata?.sanityProductDisplayPrice || '';
    const productImageUrl = fresh.metadata?.sanityProductImageUrl || undefined;

    if (!assetUrl || !assetFilename || !assetMimeType) {
      throw new Error('Missing required asset metadata on payment intent.');
    }

    const file = await getSanityFileAsBuffer({
      url: assetUrl,
      filename: assetFilename,
      mimeType: assetMimeType,
    });

    const emailResult = await sendProductDeliveryEmail({
      to: buyerEmail,
      productTitle,
      productDescription,
      productDisplayPrice,
      productImageUrl,
      attachment: {
        filename: file.filename,
        mimeType: file.mimeType,
        buffer: file.buffer,
      },
    });

    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        ...fresh.metadata,
        deliveryStatus: 'sent',
        deliveredAt: new Date().toISOString(),
        resendMessageId: (emailResult as { data?: { id?: string } })?.data?.id ?? '',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook handler failed';

    // Best-effort admin alert (never throw from this).
    try {
      await sendAdminAlertEmail({
        subject: `Delivery failed for ${paymentIntentId}`,
        text: `Stripe payment_intent: ${paymentIntentId}\n\nError:\n${message}`,
      });
    } catch {
      // ignore
    }

    try {
      await stripe.paymentIntents.update(paymentIntentId, {
        metadata: {
          ...(paymentIntent.metadata || {}),
          deliveryStatus: 'error',
          deliveryError: message.slice(0, 450),
        },
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

