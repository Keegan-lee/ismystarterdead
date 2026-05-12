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

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
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
  const requestHeaders = await headers();
  const signature = requestHeaders.get('stripe-signature');

  let webhookSecret: string;
  try {
    webhookSecret = getRequiredEnv('STRIPE_WEBHOOK_SECRET');
  } catch (err) {
    // If this throws, Next will return 500. Log explicitly so Vercel shows it.
    console.error('[stripe-webhook] missing env', {
      error: toErrorMessage(err),
      hasSignature: Boolean(signature),
    });
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  if (!signature) {
    return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
  }

  let event: import('stripe').Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const message = toErrorMessage(err) || 'Invalid signature';
    console.warn('[stripe-webhook] signature verification failed', {
      error: message,
    });
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
    const assetSizeRaw = fresh.metadata?.sanityAssetSize;

    const productTitle = fresh.metadata?.sanityProductTitle || 'Your purchase';
    const productDescription = fresh.metadata?.sanityProductDescription || 'Your file is attached to this email.';
    const productDisplayPrice = fresh.metadata?.sanityProductDisplayPrice || '';
    const productImageUrl = fresh.metadata?.sanityProductImageUrl || undefined;

    if (!assetUrl || !assetFilename || !assetMimeType) {
      throw new Error('Missing required asset metadata on payment intent.');
    }

    // Resend (and most email providers) will reject large attachments, and base64 inflates size by ~33%.
    // If the asset is large, send a download link instead of attaching.
    const maxAttachmentBytes = 18 * 1024 * 1024; // conservative safety threshold
    const assetSize = assetSizeRaw ? Number(assetSizeRaw) : NaN;
    const shouldAttach = Number.isFinite(assetSize) ? assetSize <= maxAttachmentBytes : true;

    const file = shouldAttach
      ? await getSanityFileAsBuffer({
          url: assetUrl,
          filename: assetFilename,
          mimeType: assetMimeType,
        })
      : null;

    const emailResult = await sendProductDeliveryEmail({
      to: buyerEmail,
      productTitle,
      productDescription,
      productDisplayPrice,
      productImageUrl,
      downloadUrl: file ? undefined : assetUrl,
      attachment: file
        ? {
            filename: file.filename,
            mimeType: file.mimeType,
            buffer: file.buffer,
          }
        : undefined,
    });

    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: {
        ...fresh.metadata,
        deliveryStatus: 'sent',
        deliveredAt: new Date().toISOString(),
        resendMessageId: (emailResult as { data?: { id?: string } })?.data?.id ?? '',
        deliveryMethod: file ? 'attachment' : 'link',
      },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = toErrorMessage(err) || 'Webhook handler failed';

    // Log enough to debug in Vercel without leaking PII.
    console.error('[stripe-webhook] payment_intent.succeeded handler failed', {
      eventId: event.id,
      stripeRequestId: event.request?.id ?? null,
      paymentIntentId,
      error: message,
    });

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

