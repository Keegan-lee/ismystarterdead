import 'server-only';

import { getResend } from './getResend';

export interface ISendAdminAlertEmailArgs {
  subject: string;
  text: string;
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'm@palwefrancis.com';
}

export async function sendAdminAlertEmail({ subject, text }: ISendAdminAlertEmailArgs) {
  const resend = getResend();
  return resend.emails.send({
    from: getFromEmail(),
    to: 'admin@palwefrancis.com',
    subject,
    text,
  });
}

