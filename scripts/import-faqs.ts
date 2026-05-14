/**
 * Bulk-import FAQ categories and items into Sanity.
 *
 * Usage (Doppler injects `SANITY_API_WRITE_KEY`):
 *
 *   doppler run -c dev -- pnpm faqs:import ./path/to/faqs.json
 *   doppler run -c dev -- pnpm faqs:import ./path/to/faqs.json --dry-run
 *
 * Required env vars (all provided by Doppler in the standard configs):
 *   - NEXT_PUBLIC_SANITY_PROJECT_ID
 *   - NEXT_PUBLIC_SANITY_DATASET
 *   - SANITY_API_WRITE_KEY            (token with create+update+createIfNotExists scopes)
 *   - NEXT_PUBLIC_SANITY_API_VERSION  (optional, defaults to 2025-02-01)
 *
 * The script is idempotent: documents are written with deterministic `_id`s
 * derived from their slug, so re-running with the same JSON updates existing
 * documents rather than creating duplicates.
 */

import { readFileSync } from 'node:fs';
import { resolve as resolvePath } from 'node:path';
import process from 'node:process';

import { createClient, type SanityClient } from 'next-sanity';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Allowed brand-token names for the `colorAccent` field on `faqCategory`. */
type TColorAccent = 'crust' | 'umber' | 'alive' | 'warn' | 'dough';
const VALID_ACCENTS: ReadonlySet<TColorAccent> = new Set<TColorAccent>([
  'crust',
  'umber',
  'alive',
  'warn',
  'dough',
]);

interface IInputCategory {
  slug: string;
  title: string;
  description?: string;
  order?: number;
  colorAccent?: TColorAccent;
  active?: boolean;
}

/**
 * A Portable Text answer can be authored in two ways:
 *   - As a plain string. Double-newline-separated paragraphs become individual
 *     `block` nodes with a single `span` child.
 *   - As an already-formed Portable Text array, passed straight through.
 */
type TInputAnswer = string | unknown[];

interface IInputItem {
  categorySlug: string;
  question: string;
  slug?: string;
  answer: TInputAnswer;
  answerPlain?: string;
  order?: number;
  seoKeywords?: string[];
  active?: boolean;
}

interface IInputFile {
  categories?: IInputCategory[];
  items: IInputItem[];
}

interface IPortableTextSpan {
  _type: 'span';
  _key: string;
  text: string;
  marks: string[];
}

interface IPortableTextBlock {
  _type: 'block';
  _key: string;
  style: 'normal';
  markDefs: never[];
  children: IPortableTextSpan[];
}

interface ICategoryDoc {
  _id: string;
  _type: 'faqCategory';
  title: string;
  slug: { _type: 'slug'; current: string };
  description?: string;
  order?: number;
  colorAccent?: TColorAccent;
  active?: boolean;
}

interface IItemDoc {
  _id: string;
  _type: 'faqItem';
  question: string;
  slug: { _type: 'slug'; current: string };
  answer: IPortableTextBlock[] | unknown[];
  answerPlain?: string;
  order?: number;
  seoKeywords?: string[];
  active?: boolean;
  category: { _type: 'reference'; _ref: string };
}

// ---------------------------------------------------------------------------
// CLI parsing
// ---------------------------------------------------------------------------

interface ICliArgs {
  filePath: string;
  dryRun: boolean;
}

function parseCliArgs(argv: string[]): ICliArgs {
  const args = argv.slice(2);
  let filePath: string | undefined;
  let dryRun = false;

  for (const arg of args) {
    if (arg === '--dry-run') {
      dryRun = true;
      continue;
    }
    if (arg === '-h' || arg === '--help') {
      printUsageAndExit(0);
    }
    if (arg.startsWith('--')) {
      console.error(`Unknown flag: ${arg}`);
      printUsageAndExit(1);
    }
    if (!filePath) {
      filePath = arg;
    } else {
      console.error(`Unexpected positional argument: ${arg}`);
      printUsageAndExit(1);
    }
  }

  if (!filePath) {
    console.error('Missing required positional argument: path to the FAQs JSON file.');
    printUsageAndExit(1);
  }

  return { filePath: resolvePath(process.cwd(), filePath), dryRun };
}

function printUsageAndExit(code: number): never {
  const usage = [
    'Usage: pnpm faqs:import <path-to-json> [--dry-run]',
    '',
    'Examples:',
    '  doppler run -c dev -- pnpm faqs:import ./scripts/faqs.example.json',
    '  doppler run -c dev -- pnpm faqs:import ./scripts/faqs.example.json --dry-run',
  ].join('\n');
  console.log(usage);
  process.exit(code);
}

// ---------------------------------------------------------------------------
// Env + Sanity client
// ---------------------------------------------------------------------------

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildWriteClient(): SanityClient {
  return createClient({
    projectId: getRequiredEnv('NEXT_PUBLIC_SANITY_PROJECT_ID'),
    dataset: getRequiredEnv('NEXT_PUBLIC_SANITY_DATASET'),
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-02-01',
    token: getRequiredEnv('SANITY_API_WRITE_KEY'),
    useCdn: false,
    perspective: 'raw',
  });
}

// ---------------------------------------------------------------------------
// Slug + ID helpers
// ---------------------------------------------------------------------------

const SLUG_MAX_LENGTH = 96;

/** Standard kebab-case slugifier. Strips non-alphanumerics, collapses dashes. */
function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH);
}

const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/;

function assertValidSlug(slug: string, context: string): void {
  if (!SLUG_PATTERN.test(slug)) {
    throw new Error(
      `${context}: slug "${slug}" must be lowercase alphanumeric with hyphens, e.g. "feeding-schedule".`,
    );
  }
}

function categoryIdFromSlug(slug: string): string {
  return `faqCategory.${slug}`;
}

function itemIdFromSlug(slug: string): string {
  return `faqItem.${slug}`;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function loadInputFile(filePath: string): IInputFile {
  let raw: string;
  try {
    raw = readFileSync(filePath, 'utf8');
  } catch (err) {
    throw new Error(`Unable to read ${filePath}: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${filePath}: ${(err as Error).message}`);
  }

  if (!isPlainObject(parsed)) {
    throw new Error('Top-level JSON must be an object with `categories` and `items` keys.');
  }

  const { categories, items } = parsed as { categories?: unknown; items?: unknown };

  if (categories !== undefined && !Array.isArray(categories)) {
    throw new Error('`categories` must be an array (or omitted).');
  }
  if (!Array.isArray(items)) {
    throw new Error('`items` must be an array.');
  }

  const validatedCategories: IInputCategory[] = (categories ?? []).map((c, idx) =>
    validateCategory(c, `categories[${idx}]`),
  );
  const validatedItems: IInputItem[] = items.map((i, idx) => validateItem(i, `items[${idx}]`));

  return { categories: validatedCategories, items: validatedItems };
}

function validateCategory(input: unknown, context: string): IInputCategory {
  if (!isPlainObject(input)) {
    throw new Error(`${context}: must be an object.`);
  }
  const slug = requireString(input.slug, `${context}.slug`);
  assertValidSlug(slug, context);

  const title = requireString(input.title, `${context}.title`);
  if (title.trim().length < 2) {
    throw new Error(`${context}.title: must be at least 2 characters.`);
  }

  const description = optionalString(input.description, `${context}.description`);
  const order = optionalNumber(input.order, `${context}.order`);
  const colorAccent = optionalString(input.colorAccent, `${context}.colorAccent`);
  if (colorAccent !== undefined && !VALID_ACCENTS.has(colorAccent as TColorAccent)) {
    throw new Error(
      `${context}.colorAccent: must be one of ${[...VALID_ACCENTS].join(', ')} (got "${colorAccent}").`,
    );
  }
  const active = optionalBoolean(input.active, `${context}.active`);

  return {
    slug,
    title: title.trim(),
    description,
    order,
    colorAccent: colorAccent as TColorAccent | undefined,
    active,
  };
}

function validateItem(input: unknown, context: string): IInputItem {
  if (!isPlainObject(input)) {
    throw new Error(`${context}: must be an object.`);
  }

  const categorySlug = requireString(input.categorySlug, `${context}.categorySlug`);
  assertValidSlug(categorySlug, `${context}.categorySlug`);

  const question = requireString(input.question, `${context}.question`);
  if (question.trim().length < 8) {
    throw new Error(`${context}.question: must be at least 8 characters.`);
  }

  let slug = optionalString(input.slug, `${context}.slug`);
  if (slug === undefined) {
    slug = slugify(question);
    if (!slug) {
      throw new Error(
        `${context}.slug: could not derive a slug from the question; please provide one explicitly.`,
      );
    }
  } else {
    assertValidSlug(slug, `${context}.slug`);
  }

  const rawAnswer = input.answer;
  if (typeof rawAnswer !== 'string' && !Array.isArray(rawAnswer)) {
    throw new Error(`${context}.answer: must be a string or a Portable Text array.`);
  }
  if (typeof rawAnswer === 'string' && rawAnswer.trim().length === 0) {
    throw new Error(`${context}.answer: must not be empty.`);
  }
  if (Array.isArray(rawAnswer) && rawAnswer.length === 0) {
    throw new Error(`${context}.answer: Portable Text array must not be empty.`);
  }

  const answerPlain = optionalString(input.answerPlain, `${context}.answerPlain`);
  const order = optionalNumber(input.order, `${context}.order`);
  const seoKeywords = optionalStringArray(input.seoKeywords, `${context}.seoKeywords`);
  const active = optionalBoolean(input.active, `${context}.active`);

  return {
    categorySlug,
    question: question.trim(),
    slug,
    answer: rawAnswer as TInputAnswer,
    answerPlain,
    order,
    seoKeywords,
    active,
  };
}

function requireString(value: unknown, context: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${context}: required string, got ${typeof value}.`);
  }
  return value;
}

function optionalString(value: unknown, context: string): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') {
    throw new Error(`${context}: expected string, got ${typeof value}.`);
  }
  return value;
}

function optionalNumber(value: unknown, context: string): number | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error(`${context}: expected finite number, got ${typeof value}.`);
  }
  return value;
}

function optionalBoolean(value: unknown, context: string): boolean | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'boolean') {
    throw new Error(`${context}: expected boolean, got ${typeof value}.`);
  }
  return value;
}

function optionalStringArray(value: unknown, context: string): string[] | undefined {
  if (value === undefined || value === null) return undefined;
  if (!Array.isArray(value) || !value.every((v) => typeof v === 'string')) {
    throw new Error(`${context}: expected array of strings.`);
  }
  return value as string[];
}

// ---------------------------------------------------------------------------
// Document shaping
// ---------------------------------------------------------------------------

function randomKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Convert a plain-text answer into Portable Text, splitting on blank lines. */
function plainStringToPortableText(text: string): IPortableTextBlock[] {
  const paragraphs = text
    .split(/\r?\n\s*\r?\n/)
    .map((p) => p.replace(/\r?\n/g, ' ').trim())
    .filter(Boolean);

  if (paragraphs.length === 0) {
    paragraphs.push(text.trim());
  }

  return paragraphs.map<IPortableTextBlock>((p) => ({
    _type: 'block',
    _key: randomKey(),
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: randomKey(),
        text: p,
        marks: [],
      },
    ],
  }));
}

function buildCategoryDoc(input: IInputCategory): ICategoryDoc {
  return {
    _id: categoryIdFromSlug(input.slug),
    _type: 'faqCategory',
    title: input.title,
    slug: { _type: 'slug', current: input.slug },
    ...(input.description !== undefined ? { description: input.description } : {}),
    ...(input.order !== undefined ? { order: input.order } : {}),
    ...(input.colorAccent !== undefined ? { colorAccent: input.colorAccent } : {}),
    active: input.active ?? true,
  };
}

function buildItemDoc(input: IInputItem): IItemDoc {
  const answer =
    typeof input.answer === 'string' ? plainStringToPortableText(input.answer) : input.answer;

  if (!input.slug) {
    throw new Error('Internal error: item slug missing after validation.');
  }

  return {
    _id: itemIdFromSlug(input.slug),
    _type: 'faqItem',
    question: input.question,
    slug: { _type: 'slug', current: input.slug },
    answer,
    ...(input.answerPlain !== undefined ? { answerPlain: input.answerPlain } : {}),
    ...(input.order !== undefined ? { order: input.order } : {}),
    ...(input.seoKeywords !== undefined ? { seoKeywords: input.seoKeywords } : {}),
    active: input.active ?? true,
    category: {
      _type: 'reference',
      _ref: categoryIdFromSlug(input.categorySlug),
    },
  };
}

// ---------------------------------------------------------------------------
// Pre-flight: ensure every referenced category exists
// ---------------------------------------------------------------------------

/**
 * Returns the set of category slugs that exist in Sanity but are not in the
 * input file. Used to verify that an `item.categorySlug` referencing an
 * out-of-file category resolves to a real document.
 */
async function fetchExistingCategorySlugs(client: SanityClient): Promise<Set<string>> {
  const rows = await client.fetch<Array<{ slug?: string }>>(
    `*[_type == "faqCategory" && !(_id in path("drafts.**"))]{ "slug": slug.current }`,
  );
  return new Set(rows.map((row) => row.slug).filter((s): s is string => typeof s === 'string'));
}

function assertReferencedCategoriesExist(
  input: IInputFile,
  existingSlugs: Set<string>,
): void {
  const inFileSlugs = new Set(input.categories?.map((c) => c.slug) ?? []);
  const referenced = new Set(input.items.map((i) => i.categorySlug));

  const missing: string[] = [];
  for (const slug of referenced) {
    if (!inFileSlugs.has(slug) && !existingSlugs.has(slug)) {
      missing.push(slug);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `The following category slugs are referenced by items but do not exist in the input file or in Sanity: ${missing
        .map((s) => `"${s}"`)
        .join(', ')}. Add them to the \`categories\` array first.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const { filePath, dryRun } = parseCliArgs(process.argv);

  console.log(`→ Loading ${filePath}`);
  const input = loadInputFile(filePath);
  console.log(
    `  Parsed ${input.categories?.length ?? 0} categor${
      (input.categories?.length ?? 0) === 1 ? 'y' : 'ies'
    } and ${input.items.length} item${input.items.length === 1 ? '' : 's'}.`,
  );

  if (dryRun) {
    console.log('\n(DRY RUN — no writes will be made)');
    for (const cat of input.categories ?? []) {
      console.log(`  • category  ${categoryIdFromSlug(cat.slug)}  "${cat.title}"`);
    }
    for (const item of input.items) {
      const itemSlug = item.slug ?? slugify(item.question);
      console.log(
        `  • item      ${itemIdFromSlug(itemSlug)}  → category:${item.categorySlug}  "${item.question}"`,
      );
    }
    console.log('\nDry run complete. Re-run without --dry-run to write to Sanity.');
    return;
  }

  const client = buildWriteClient();
  console.log(
    `→ Connected to project ${client.config().projectId} / dataset ${client.config().dataset}`,
  );

  const existingSlugs = await fetchExistingCategorySlugs(client);
  assertReferencedCategoriesExist(input, existingSlugs);

  // Categories first, so item references resolve.
  let categoryWrites = 0;
  if (input.categories && input.categories.length > 0) {
    console.log(`\n→ Upserting ${input.categories.length} categor${input.categories.length === 1 ? 'y' : 'ies'}`);
    let tx = client.transaction();
    for (const cat of input.categories) {
      const doc = buildCategoryDoc(cat);
      tx = tx.createOrReplace(doc);
      console.log(`  ✓ ${doc._id}  "${doc.title}"`);
    }
    await tx.commit();
    categoryWrites = input.categories.length;
  }

  console.log(`\n→ Upserting ${input.items.length} item${input.items.length === 1 ? '' : 's'}`);
  let tx = client.transaction();
  for (const item of input.items) {
    const doc = buildItemDoc(item);
    tx = tx.createOrReplace(doc);
    console.log(`  ✓ ${doc._id}  "${doc.question}"`);
  }
  await tx.commit();

  console.log(
    `\n✓ Done. Upserted ${categoryWrites} categor${categoryWrites === 1 ? 'y' : 'ies'} and ${input.items.length} item${
      input.items.length === 1 ? '' : 's'
    }.`,
  );
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error(`\n✗ Import failed: ${message}`);
  process.exit(1);
});
