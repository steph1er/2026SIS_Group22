/**
 * One-off backfill: embeds every catalogue_items row that doesn't have an embedding yet,
 * so similarity-based recommendations (CatalogueService.getCatalogueReccomendations) have
 * something to rank against. Re-run safely any time new catalogue items are imported -
 * it only touches rows where embedding is still null.
 *
 * Usage (from backend/):
 *   npx ts-node -O '{"module":"commonjs"}' scripts/backfill-catalogue-embeddings.ts
 *
 * Requires SUPABASE_URL, SUPABASE_SECRET_KEY and ML_SERVICE_URL in backend/.env - the
 * service role key is required (not the anon/publishable key) because catalogue_items
 * only has a public select policy, not an update policy.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';

// standalone script - not run through Nest, so load backend/.env by hand
function loadEnvFile() {
  const envPath = resolve(__dirname, '../.env');
  if (!existsSync(envPath)) return;

  for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (!match) continue;
    const [, key, rawValue = ''] = match;
    if (process.env[key] === undefined) {
      process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
    }
  }
}
loadEnvFile();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const ML_SERVICE_URL = process.env.ML_SERVICE_URL ?? 'http://localhost:8000';
const BATCH_SIZE = 50;
const CONCURRENCY = 5;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('SUPABASE_URL and SUPABASE_SECRET_KEY (service role key) must be set.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);

interface CatalogueItemRow {
  id: string;
  image_url: string | null;
}

async function embedImage(imageUrl: string): Promise<number[]> {
  const imageRes = await fetch(imageUrl);
  if (!imageRes.ok) {
    throw new Error(`could not download image (${imageRes.status})`);
  }
  const imageBytes = await imageRes.arrayBuffer();

  const form = new FormData();
  form.append('file', new Blob([imageBytes]), 'catalogue-item.jpg');

  const res = await fetch(`${ML_SERVICE_URL}/embed-image`, { method: 'POST', body: form });
  if (!res.ok) {
    throw new Error(`ml-service /embed-image failed (${res.status})`);
  }

  const { embedding } = (await res.json()) as { embedding: number[] };
  return embedding;
}

async function processItem(item: CatalogueItemRow): Promise<{ id: string; ok: boolean; reason?: string }> {
  if (!item.image_url) {
    return { id: item.id, ok: false, reason: 'no image_url' };
  }

  try {
    const embedding = await embedImage(item.image_url);
    const { error } = await supabase.from('catalogue_items').update({ embedding }).eq('id', item.id);
    if (error) {
      return { id: item.id, ok: false, reason: error.message };
    }
    return { id: item.id, ok: true };
  } catch (error) {
    return { id: item.id, ok: false, reason: (error as Error).message };
  }
}

// small fixed-size worker pool so we don't fire hundreds of concurrent requests at ml-service
async function runWithConcurrency(items: CatalogueItemRow[], limit: number) {
  const results: { id: string; ok: boolean; reason?: string }[] = [];
  let next = 0;

  async function worker() {
    while (next < items.length) {
      const item = items[next++];
      results.push(await processItem(item));
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function main() {
  let totalOk = 0;
  const failures: { id: string; reason?: string }[] = [];
  // items that fail stay embedding=null, so exclude already-attempted ids or we'd loop forever re-fetching them
  const skipIds = new Set<string>();

  while (true) {
    let query = supabase.from('catalogue_items').select('id, image_url').is('embedding', null);
    if (skipIds.size !== 0) {
      query = query.not('id', 'in', `(${Array.from(skipIds).join(',')})`);
    }
    const { data, error } = await query.limit(BATCH_SIZE);

    if (error) {
      console.error('Failed to fetch catalogue_items batch:', error.message);
      process.exit(1);
    }

    const batch = data as CatalogueItemRow[];
    if (batch.length === 0) break;

    const results = await runWithConcurrency(batch, CONCURRENCY);
    for (const result of results) {
      if (result.ok) {
        totalOk++;
      } else {
        failures.push({ id: result.id, reason: result.reason });
        skipIds.add(result.id);
      }
    }

    console.log(`Embedded ${totalOk} item(s) so far, ${failures.length} failure(s)...`);
  }

  console.log(`\nDone. Embedded ${totalOk} item(s).`);
  if (failures.length !== 0) {
    console.log(`${failures.length} item(s) failed and were left without an embedding:`);
    for (const failure of failures) {
      console.log(`  ${failure.id}: ${failure.reason}`);
    }
  }
}

main();
