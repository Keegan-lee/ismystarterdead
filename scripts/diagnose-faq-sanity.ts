/**
 * One-off diagnostics for `/faq` Sanity fetches (same env as Next + `faqs:import`).
 *
 *   doppler run -c dev -- pnpm exec tsx scripts/diagnose-faq-sanity.ts
 */

import process from 'node:process';

import { createClient, groq } from 'next-sanity';

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

async function main(): Promise<void> {
  const projectId = requireEnv('NEXT_PUBLIC_SANITY_PROJECT_ID');
  const dataset = requireEnv('NEXT_PUBLIC_SANITY_DATASET');
  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-01';
  const readToken = process.env.SANITY_API_WRITE_KEY;

  console.log('--- Dataset alignment (import + Next both use these public vars) ---');
  console.log(`NEXT_PUBLIC_SANITY_PROJECT_ID: ${projectId}`);
  console.log(`NEXT_PUBLIC_SANITY_DATASET:    ${dataset}`);
  console.log(`NEXT_PUBLIC_SANITY_API_VERSION: ${apiVersion}`);
  console.log(`SANITY_API_READ_TOKEN:         ${readToken ? 'set' : 'not set'}`);
  console.log('Use the same project + dataset in Vision when running manual GROQ.\n');

  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: readToken || undefined,
  });

  const countCategoriesRaw = groq`count(*[_type == "faqCategory" && !(_id in path("drafts.**"))])`;
  const countCategoriesApp = groq`count(*[
    _type == "faqCategory" &&
    (active == true || !defined(active)) &&
    !(_id in path("drafts.**"))
  ])`;
  const countItemsRaw = groq`count(*[_type == "faqItem" && !(_id in path("drafts.**"))])`;
  const countItemsResolved = groq`count(*[
    _type == "faqItem" &&
    !(_id in path("drafts.**")) &&
    defined(category->)
  ])`;
  const countItemsApp = groq`count(*[
    _type == "faqItem" &&
    (active == true || !defined(active)) &&
    !(_id in path("drafts.**")) &&
    defined(category->)
  ])`;

  const [rawCat, appCat, rawItem, resolvedItem, appItem] = await Promise.all([
    client.fetch<number>(countCategoriesRaw),
    client.fetch<number>(countCategoriesApp),
    client.fetch<number>(countItemsRaw),
    client.fetch<number>(countItemsResolved),
    client.fetch<number>(countItemsApp),
  ]);

  console.log('--- GROQ counts ---');
  console.log(`faqCategory (non-draft _id):                    ${rawCat}`);
  console.log(`faqCategory as getFaqCategories filters:      ${appCat}`);
  console.log(`faqItem (non-draft _id):                        ${rawItem}`);
  console.log(`faqItem with defined(category->):             ${resolvedItem}`);
  console.log(`faqItem as getAllFaqs filters (active + ref):  ${appItem}`);

  if (rawItem > 0 && resolvedItem === 0) {
    console.log(
      '\n>>> Items exist but category-> never resolves — broken _ref or categories only as drafts.\n',
    );
  } else if (resolvedItem > 0 && appItem === 0) {
    console.log(
      '\n>>> Items resolve category but active filter excludes them — check `active` is boolean true or unset.\n',
    );
  } else if (rawCat === 0 && rawItem === 0) {
    console.log(
      '\n>>> No faqCategory / faqItem in this dataset — import likely targeted a different dataset or project.\n',
    );
  }

  const sample = await client.fetch<unknown>(
    groq`*[_type == "faqItem" && !(_id in path("drafts.**"))][0]{
      _id,
      active,
      category,
      "resolvedCategoryId": category->_id
    }`,
  );

  console.log('--- Spot-check first non-draft faqItem ---');
  console.log(sample === null ? '(none)' : JSON.stringify(sample, null, 2));
}

main().catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
