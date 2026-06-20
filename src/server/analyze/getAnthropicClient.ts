import 'server-only';

import Anthropic from '@anthropic-ai/sdk';

let anthropicClient: Anthropic | null = null;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getAnthropicClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: getRequiredEnv('ANTHROPIC_API_KEY'),
    });
  }

  return anthropicClient;
}
