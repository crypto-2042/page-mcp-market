import { describe, expect, it } from 'bun:test';
import { SyncService } from '../src/services/sync.service.js';
import type { RepositoryStore } from '../src/repositories/repository.repo.js';

function createStore() {
  const records: Array<{ repositoryId: string; status: string }> = [];
  const writes = {
    assignedAuthor: 0,
    updatedRepo: 0,
    upsertRelease: 0,
    clearReleaseItems: 0,
    createdPrompts: 0,
    createdResources: 0,
    createdTools: 0,
  };

  const store: RepositoryStore = {
    searchRepositories: async () => ({ items: [], total: 0 }),
    getRepositoryById: async () => null,
    listReleases: async () => [],
    getRelease: async () => null,
    listPrompts: async () => [],
    listResources: async () => [],
    listTools: async () => [],
    listRankingCandidates: async () => [],
    createRepository: async () => {
      throw new Error('not used');
    },
    createRelease: async () => {
      throw new Error('not used');
    },
    createPrompt: async (input) => {
      writes.createdPrompts += 1;
      return {
        id: `prompt-${writes.createdPrompts}`,
        repositoryId: input.repositoryId,
        releaseId: input.releaseId,
        name: input.name,
        description: input.description ?? '',
        arguments: input.arguments ?? [],
        messages: input.messages ?? [],
        path: input.path,
        createdAt: '2026-03-08T00:00:00.000Z',
        updatedAt: '2026-03-08T00:00:00.000Z',
      };
    },
    createResource: async (input) => {
      writes.createdResources += 1;
      return {
        id: `resource-${writes.createdResources}`,
        repositoryId: input.repositoryId,
        releaseId: input.releaseId,
        name: input.name,
        description: input.description ?? '',
        uri: input.uri,
        mimeType: input.mimeType,
        path: input.path,
        createdAt: '2026-03-08T00:00:00.000Z',
        updatedAt: '2026-03-08T00:00:00.000Z',
      };
    },
    createTool: async (input) => {
      writes.createdTools += 1;
      return {
        id: `tool-${writes.createdTools}`,
        repositoryId: input.repositoryId,
        releaseId: input.releaseId,
        name: input.name,
        description: input.description ?? '',
        inputSchema: input.inputSchema,
        execute: input.execute,
        path: input.path,
        createdAt: '2026-03-08T00:00:00.000Z',
        updatedAt: '2026-03-08T00:00:00.000Z',
      };
    },
    updateRepository: async (input) => {
      writes.updatedRepo += 1;
      return {
        id: input.repositoryId,
        name: input.name ?? 'repo',
        description: input.description ?? null,
        siteDomain: input.siteDomain ?? 'github.com',
        author: { id: 'author-1', name: 'Alice' },
        starsCount: 0,
        usageCount: 0,
        lastActiveAt: null,
        latestReleaseVersion: null,
        createdAt: '2026-03-08T00:00:00.000Z',
        updatedAt: '2026-03-08T00:00:00.000Z',
      };
    },
    deleteRepository: async () => false,
    updateRelease: async () => null,
    deleteRelease: async () => false,
    updatePrompt: async () => null,
    deletePrompt: async () => false,
    updateResource: async () => null,
    deleteResource: async () => false,
    updateTool: async () => null,
    deleteTool: async () => false,
    listSyncTargets: async () => [
      {
        repositoryId: 'repo-1',
        githubOwner: 'owner',
        githubRepo: 'repo',
        defaultBranch: 'main',
      },
    ],
    recordSyncStatus: async (input) => {
      records.push({ repositoryId: input.repositoryId, status: input.status });
    },
    assignRepositoryAuthorByName: async () => {
      writes.assignedAuthor += 1;
    },
    upsertRelease: async (input) => {
      writes.upsertRelease += 1;
      return {
        id: 'rel-1',
        repositoryId: input.repositoryId,
        version: input.version,
        name: input.name ?? null,
        changelog: input.changelog ?? null,
        isLatest: true,
        createdAt: '2026-03-08T00:00:00.000Z',
      };
    },
    clearReleaseItems: async () => {
      writes.clearReleaseItems += 1;
    },
  };

  return { store, records, writes };
}

describe('SyncService', () => {
  it('records success when github files are reachable', async () => {
    const { store, records, writes } = createStore();
    const fetchFn = (async (input: string | URL | Request) => {
      const url = String(input);
      if (url.includes('/branches/')) {
        return new Response(JSON.stringify({ commit: { sha: 'abc123' } }), { status: 200 });
      }
      if (url.endsWith('/repository.json')) {
        return new Response(
          JSON.stringify({
            name: 'github-assistant',
            description: 'desc',
            siteDomain: 'github.com',
            version: '1.0.0',
          }),
          { status: 200 }
        );
      }
      if (url.endsWith('/mcp/prompts.json')) {
        return new Response(
          JSON.stringify([{ name: 'checkout-helper', description: 'desc', arguments: [], messages: [], path: '^/checkout$' }]),
          { status: 200 }
        );
      }
      if (url.endsWith('/mcp/resources.json')) {
        return new Response(
          JSON.stringify([{ name: 'product-page', description: 'desc', uri: 'resource://product-page', mimeType: 'application/json', path: '^/products/.+$' }]),
          { status: 200 }
        );
      }
      if (url.endsWith('/mcp/tools.json')) {
        return new Response(
          JSON.stringify([{ name: 'search-products', description: 'desc', inputSchema: { type: 'object', properties: {} }, execute: 'return searchProducts()', path: '^/products/.+$' }]),
          { status: 200 }
        );
      }
      return new Response(JSON.stringify({ name: 'sample' }), { status: 200 });
    }) as unknown as typeof fetch;

    const service = new SyncService(store, '', fetchFn);
    const result = await service.runSync({ triggeredBy: 'manual', dryRun: false });

    expect(result.synced).toBe(1);
    expect(records[0]?.status).toBe('success');
    expect(writes.assignedAuthor).toBe(1);
    expect(writes.updatedRepo).toBe(1);
    expect(writes.upsertRelease).toBe(1);
    expect(writes.clearReleaseItems).toBe(1);
    expect(writes.createdPrompts).toBe(1);
    expect(writes.createdResources).toBe(1);
    expect(writes.createdTools).toBe(1);
  });

  it('records failure when github request fails', async () => {
    const { store, records } = createStore();
    const fetchFn = (async () =>
      new Response(JSON.stringify({ message: 'not found' }), { status: 404 })) as unknown as typeof fetch;

    const service = new SyncService(store, '', fetchFn);
    const result = await service.runSync({ triggeredBy: 'cron', dryRun: false });

    expect(result.failed).toBe(1);
    expect(records[0]?.status).toBe('failed');
  });
});
