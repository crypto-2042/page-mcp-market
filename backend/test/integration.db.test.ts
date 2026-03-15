import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Pool } from 'pg';
import { createApp } from '../src/app.js';
import { PostgresRepositoryStore } from '../src/repositories/repository.repo.js';
import { RepositoryService } from '../src/services/repository.service.js';

const hasDatabase =
  process.env.RUN_DB_INTEGRATION_TESTS === '1' &&
  Boolean(process.env.DATABASE_URL);
const dbIt = hasDatabase ? it : it.skip;

describe('postgres integration', () => {
  dbIt('runs against real postgres and returns seeded data', async () => {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
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

      const store = new PostgresRepositoryStore({
        query: async <T>(sql: string, params?: unknown[]) => {
          const result = await client.query(sql, params);
          return { rows: result.rows as T[] };
        },
      });
      const service = new RepositoryService(store);
      const app = createApp(service);

      const detailRes = await app.request(
        'http://localhost/api/v1/repositories/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
      );
      expect(detailRes.status).toBe(200);
      const detail = await detailRes.json();
      expect(detail.name).toBe('example-store-alice');

      const contentRes = await app.request(
        'http://localhost/api/v1/repositories/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/content?path=/products/123'
      );
      expect(contentRes.status).toBe(200);
      const content = await contentRes.json();
      expect(content.mcp.tools.length).toBeGreaterThan(0);
      expect(content.mcp.prompts.length).toBe(0);

      const githubSearchRes = await app.request(
        'http://localhost/api/v1/repositories/search?domain=github.com&page=1&pageSize=20'
      );
      expect(githubSearchRes.status).toBe(200);
      const githubSearch = await githubSearchRes.json();
      expect(githubSearch.total).toBeGreaterThanOrEqual(2);

      const githubContentRes = await app.request(
        'http://localhost/api/v1/repositories/cccccccc-cccc-cccc-cccc-cccccccccccc/content?path=/octocat/hello-world/issues/123'
      );
      expect(githubContentRes.status).toBe(200);
      const githubContent = await githubContentRes.json();
      expect(githubContent.mcp.tools.length).toBeGreaterThanOrEqual(1);
      expect(githubContent.mcp.resources.length).toBeGreaterThanOrEqual(1);
      expect(githubContent).not.toHaveProperty('skills');

      const installRes = await app.request(
        'http://localhost/api/v1/repositories/cccccccc-cccc-cccc-cccc-cccccccccccc/install?release=1.0.0'
      );
      expect(installRes.status).toBe(200);
      const install = await installRes.json();
      expect(install.snapshot.mcp.tools.length).toBeGreaterThanOrEqual(1);
      expect(install.integrity.algorithm).toBe('sha256');
      expect(typeof install.integrity.digest).toBe('string');
    } finally {
      client.release();
      await pool.end();
    }
  });
});
