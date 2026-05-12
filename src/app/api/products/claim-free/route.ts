import { NextResponse } from 'next/server';

import { getProductForCheckoutById } from '@/sanity/lib/queries';
import { getSanityFileAsBuffer } from '@/server/delivery/getSanityFileAsBuffer';
import { sendAdminAlertEmail } from '@/server/email/sendAdminAlertEmail';
import { sendProductDeliveryEmail } from '@/server/email/sendProductDeliveryEmail';

export const runtime = 'nodejs';

// Same conservative threshold as the Stripe webhook: above this, send a download link
// instead of attaching to keep deliverability healthy.
const MAX_ATTACHMENT_BYTES = 18 * 1024 * 1024;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface IClaimFreeBody {
  productId?: unknown;
  email?: unknown;
}

function toErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export async function POST(req: Request) {
  let productId: string | null = null;

  try {
    const body = (await req.json()) as IClaimFreeBody;
    productId = typeof body.productId === 'string' ? body.productId : null;
    const email = typeof body.email === 'string' ? body.email.trim() : '';

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const product = await getProductForCheckoutById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.priceInCents > 0) {
      return NextResponse.json(
        { error: 'This product is not free. Use checkout instead.', code: 'paid_product' },
        { status: 400 },
      );
    }

    if (!product.asset?.url || !product.asset.originalFilename || !product.asset.mimeType) {
      return NextResponse.json({ error: 'Product is missing deliverable asset.' }, { status: 500 });
    }

    const assetSize = typeof product.asset.size === 'number' ? product.asset.size : NaN;
    const shouldAttach = Number.isFinite(assetSize) ? assetSize <= MAX_ATTACHMENT_BYTES : true;

    const file = shouldAttach
      ? await getSanityFileAsBuffer({
          url: product.asset.url,
          filename: product.asset.originalFilename,
          mimeType: product.asset.mimeType,
        })
      : null;

    await sendProductDeliveryEmail({
      to: email,
      productTitle: product.title,
      productDescription: product.description,
      productPriceLabel: 'Free',
      productImageUrl: product.imageUrl ?? undefined,
      downloadUrl: file ? undefined : product.asset.url,
      attachment: file
        ? {
            filename: file.filename,
            mimeType: file.mimeType,
            buffer: file.buffer,
          }
        : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = toErrorMessage(err) || 'Free claim failed';

    console.error('[claim-free] failed', {
      productId,
      error: message,
    });

    try {
      await sendAdminAlertEmail({
        subject: `Free claim failed for ${productId ?? 'unknown product'}`,
        text: `Product: ${productId ?? 'unknown'}\n\nError:\n${message}`,
      });
    } catch {
      // ignore
    }

    return NextResponse.json({ error: 'Could not send your file. Please try again.' }, { status: 500 });
  }
}
