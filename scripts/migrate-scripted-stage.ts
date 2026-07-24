// One-time migration for the new "Scripted" pipeline stage: any existing
// ContentItem sitting in "idea" that already has a script linked — either
// directly (contentItem.scriptId) or through its linked idea already
// having a script — moves to "scripted". Nothing else is touched: cards
// already in filming/editing/published stay exactly where they are, and
// cards genuinely still at the idea stage (no script yet) are untouched.
//
// Uses `pg` directly (the same driver Prisma's adapter uses under the
// hood) rather than the generated Prisma client — the generated client's
// own internal imports aren't extension-qualified, which Node's native
// ESM loader (used here via --experimental-strip-types) can't resolve
// without a bundler. Raw SQL against two tables is simple enough not to
// need the ORM for a script this small.
//
// Not part of the app's runtime code path — a standalone script, run once,
// by hand, against the real database, only when Ayaan says go.
//
// Dry run (list only, no writes):
//   node --env-file=.env --experimental-strip-types scripts/migrate-scripted-stage.ts --dry-run
//
// Real run:
//   node --env-file=.env --experimental-strip-types scripts/migrate-scripted-stage.ts

import { Client } from "pg";

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  const { rows: candidates } = await client.query<{
    id: string;
    title: string;
  }>(`
    SELECT ci.id, ci.title
    FROM content_item ci
    WHERE ci.status = 'idea'
      AND (
        ci."scriptId" IS NOT NULL
        OR EXISTS (
          SELECT 1 FROM script s WHERE s."ideaId" = ci."ideaId"
        )
      )
  `);

  console.log(
    `Found ${candidates.length} card(s) currently in "Idea" that already have a script linked:`,
  );
  for (const c of candidates) console.log(`  - ${c.title} (${c.id})`);

  if (candidates.length === 0) {
    console.log("Nothing to migrate.");
    await client.end();
    return;
  }

  if (dryRun) {
    console.log("\n--dry-run: no changes made.");
    await client.end();
    return;
  }

  const ids = candidates.map((c) => c.id);
  const { rowCount } = await client.query(
    `UPDATE content_item SET status = 'scripted' WHERE id = ANY($1::text[])`,
    [ids],
  );

  console.log(`\nMoved ${rowCount} card(s) from "Idea" to "Scripted".`);
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
