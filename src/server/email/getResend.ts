import 'server-only';

import { Resend } from 'resend';

let resend: Resend | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getResend(): Resend {
  if (resend) return resend;
  resend = new Resend(getRequiredEnv('RESEND_API_KEY'));
  return resend;
}

