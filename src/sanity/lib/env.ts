function getRequiredPublicEnv(value: string | undefined, name: string): string {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export function getSanityEnv() {
  // NOTE: For client bundles, Next/Turbopack only inlines `NEXT_PUBLIC_*` when accessed
  // via a direct property read (not `process.env[name]`).
  const projectId = getRequiredPublicEnv(
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    'NEXT_PUBLIC_SANITY_PROJECT_ID',
  );
  const dataset = getRequiredPublicEnv(
    process.env.NEXT_PUBLIC_SANITY_DATASET,
    'NEXT_PUBLIC_SANITY_DATASET',
  );

  return {
    projectId,
    dataset,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-01',
    readToken: process.env.SANITY_API_WRITE_KEY,
  };
}

