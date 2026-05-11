import 'server-only';

function assertMaxAttachmentSize(bytes: number, maxBytes: number) {
  if (bytes > maxBytes) {
    throw new Error(`Asset too large to email as attachment (${bytes} bytes).`);
  }
}

export interface ISanityFileDownload {
  buffer: Buffer;
  filename: string;
  mimeType: string;
}

/**
 * Downloads a Sanity file asset URL into memory for email attachment delivery.
 * Intentionally enforces a size cap to avoid harming deliverability or memory usage.
 */
export async function getSanityFileAsBuffer(args: {
  url: string;
  filename: string;
  mimeType: string;
  maxBytes?: number;
}): Promise<ISanityFileDownload> {
  const maxBytes = args.maxBytes ?? 20 * 1024 * 1024; // 20MB default safety cap

  const res = await fetch(args.url);
  if (!res.ok) {
    throw new Error(`Failed to download asset (HTTP ${res.status})`);
  }

  const contentLengthHeader = res.headers.get('content-length');
  if (contentLengthHeader) {
    const contentLength = Number(contentLengthHeader);
    if (Number.isFinite(contentLength)) {
      assertMaxAttachmentSize(contentLength, maxBytes);
    }
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  assertMaxAttachmentSize(buffer.byteLength, maxBytes);

  return {
    buffer,
    filename: args.filename,
    mimeType: args.mimeType,
  };
}

