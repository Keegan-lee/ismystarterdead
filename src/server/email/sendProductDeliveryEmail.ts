import 'server-only';

import { render } from '@react-email/render';

import { ProductDeliveryEmail } from '@/emails/templates/ProductDeliveryEmail';
import { getResend } from './getResend';

export interface ISendProductDeliveryEmailArgs {
  to: string;
  productTitle: string;
  productDescription: string;
  productDisplayPrice: string;
  productImageUrl?: string;
  attachment?: {
    filename: string;
    mimeType: string;
    buffer: Buffer;
  };
  downloadUrl?: string;
}

function getFromEmail(): string {
  // Keep this predictable; you can override by setting RESEND_FROM_EMAIL in Doppler.
  return process.env.RESEND_FROM_EMAIL || 'Mrugakshee from IsMyStarterDead <m@palwefrancis.com>';
}

export async function sendProductDeliveryEmail(args: ISendProductDeliveryEmailArgs) {
  const resend = getResend();

  const react = ProductDeliveryEmail({
    productTitle: args.productTitle,
    productDescription: args.productDescription,
    productDisplayPrice: args.productDisplayPrice,
    productImageUrl: args.productImageUrl,
    downloadUrl: args.downloadUrl,
  });

  const html = await render(react);

  return resend.emails.send({
    from: getFromEmail(),
    to: args.to,
    subject: `Your purchase: ${args.productTitle}`,
    html,
    attachments: args.attachment
      ? [
          {
            filename: args.attachment.filename,
            content: args.attachment.buffer.toString('base64'),
            contentType: args.attachment.mimeType,
          },
        ]
      : undefined,
  });
}

