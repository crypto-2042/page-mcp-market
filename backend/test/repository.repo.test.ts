import { describe, expect, it } from 'bun:test';
import type { Queryable } from '../src/db/types.js';
import { PostgresRepositoryStore } from '../src/repositories/repository.repo.js';

describe('PostgresRepositoryStore', () => {
  it('fetches repository by id', async () => {
    const db: Queryable = {
      query: async <T>() => ({
        rows: [
          {
            id: 'repo-1',
            name: 'Repo One',
            description: null,
            site_domain: 'example.com',
            author_id: 'author-1',
            author_name: 'Alice',
            stars_count: 1,
            usage_count: 1,
            last_active_at: null,
            latest_release_version: '1.0.0',
            created_at: '2026-03-01T00:00:00.000Z',
            updated_at: '2026-03-01T00:00:00.000Z',
          } as T,
        ],
      }),
    };

    const store = new PostgresRepositoryStore(db);
    const repository = await store.getRepositoryById('repo-1');

    expect(repository?.id).toBe('repo-1');
    expect(repository?.author.name).toBe('Alice');
  });

  it('lists tools from mcp_tools table', async () => {
    const calls: string[] = [];
    const db: Queryable = {
      query: async <T>(sql: string) => {
        calls.push(sql);
        return {
          rows: [
            {
              id: 'tool-1',
              repository_id: 'repo-1',
              release_id: 'rel-1',
              name: 'search-products',
              description: 'Search products',
              input_schema: { type: 'object', properties: {} },
              execute: 'return searchProducts()',
              path_pattern: '^/products/.+$',
              created_at: '2026-03-01T00:00:00.000Z',
              updated_at: '2026-03-01T00:00:00.000Z',
            } as T,
          ],
        };
      },
    };

    const store = new PostgresRepositoryStore(db);
    const tools = await store.listTools('repo-1', 'rel-1');

    expect(calls[0]).toContain('FROM mcp_tools');
    expect(tools).toHaveLength(1);
    expect(tools[0]?.execute).toBe('return searchProducts()');
    expect(tools[0]?.path).toBe('^/products/.+$');
  });
});
