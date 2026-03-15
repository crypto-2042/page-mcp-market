import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    const schemaSql = readFileSync(resolve(process.cwd(), 'sql/001_init.sql'), 'utf8');
    const syncSchemaSql = readFileSync(resolve(process.cwd(), 'sql/003_sync_schema.sql'), 'utf8');
    const protocolMigrationSql = readFileSync(resolve(process.cwd(), 'sql/004_protocol_3_1.sql'), 'utf8');
    const seedSql = readFileSync(resolve(process.cwd(), 'sql/002_seed.sql'), 'utf8');
    await client.query(schemaSql);
    await client.query(syncSchemaSql);
    await client.query(protocolMigrationSql);
    await client.query(seedSql);
    // eslint-disable-next-line no-console
    console.log('Database initialized with schema + seed.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
