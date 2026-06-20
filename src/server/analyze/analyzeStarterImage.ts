import 'server-only';

import { getAnthropicClient } from '@/server/analyze/getAnthropicClient';
import {
  STARTER_VISION_SYSTEM_PROMPT,
  STARTER_VISION_USER_PROMPT,
} from '@/lib/analyze/prompt';
import { parseVisionResponse } from '@/lib/analyze/parseVisionResponse';
import { ANALYZE_VISION_MODEL } from '@/lib/analyze/constants';
import type { TStarterHealthAssessment } from '@/lib/analyze/types';
import type { IValidatedStarterImage } from '@/lib/analyze/validateImage';

export async function analyzeStarterImage(
  image: IValidatedStarterImage,
): Promise<TStarterHealthAssessment> {
  const client = getAnthropicClient();
  const base64 = image.buffer.toString('base64');

  const response = await client.messages.create({
    model: ANALYZE_VISION_MODEL,
    max_tokens: 1024,
    system: STARTER_VISION_SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: image.visionMimeType,
              data: base64,
            },
          },
          {
            type: 'text',
            text: STARTER_VISION_USER_PROMPT,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Vision model returned no text content.');
  }

  return parseVisionResponse(textBlock.text);
}
