import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { mapAnalysisToDiagnosticScore } from './mapAnalysisToDiagnosticScore';
import { parseVisionResponse } from './parseVisionResponse';
import { ImageValidationError, validateStarterImageBuffer } from './validateImage';
import { checkMemoryRateLimit, resetMemoryRateLimitForTests } from './memoryRateLimit';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(__dirname, 'fixtures');

function loadFixture(name: string): Buffer {
  return readFileSync(join(fixturesDir, name));
}

test('parseVisionResponse validates healthy JSON', () => {
  const result = parseVisionResponse(
    JSON.stringify({
      score: 88,
      status: 'healthy',
      observations: ['Domed rise with visible bubbles'],
      recommendations: ['Feed on schedule and bake soon'],
    }),
  );

  assert.equal(result.status, 'healthy');
  assert.equal(result.score, 88);
});

test('parseVisionResponse extracts JSON from markdown fences', () => {
  const result = parseVisionResponse(`\`\`\`json
{"score":12,"status":"dead","observations":["Flat surface"],"recommendations":["Discard and restart"]}
\`\`\``);

  assert.equal(result.status, 'dead');
  assert.equal(result.score, 12);
});

test('validateStarterImageBuffer rejects invalid mime types', async () => {
  await assert.rejects(
    () =>
      validateStarterImageBuffer({
        mimeType: 'application/pdf',
        filename: 'starter.pdf',
        sizeBytes: 1024,
        buffer: Buffer.from('pdf'),
      }),
    ImageValidationError,
  );
});

test('validateStarterImageBuffer accepts a valid PNG', async () => {
  const buffer = loadFixture('healthy.png');
  const result = await validateStarterImageBuffer({
    mimeType: 'image/png',
    filename: 'healthy.png',
    sizeBytes: buffer.byteLength,
    buffer,
  });

  assert.equal(result.mimeType, 'image/png');
  assert.ok(result.width >= 200);
  assert.ok(result.height >= 200);
});

test('checkMemoryRateLimit returns 429 threshold after five requests', () => {
  resetMemoryRateLimitForTests();

  for (let i = 0; i < 5; i += 1) {
    const attempt = checkMemoryRateLimit('test-ip');
    assert.equal(attempt.allowed, true);
  }

  const blocked = checkMemoryRateLimit('test-ip');
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.remaining, 0);
});

test('mapAnalysisToDiagnosticScore maps dead assessments below zero', () => {
  const score = mapAnalysisToDiagnosticScore({
    score: 10,
    status: 'dead',
    observations: ['No bubbles'],
    recommendations: ['Restart'],
  });

  assert.ok(score < 0);
});
