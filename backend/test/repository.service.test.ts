import { describe, expect, it } from 'bun:test';
import { RepositoryService } from '../src/services/repository.service.js';
import type { RepositoryStore } from '../src/repositories/repository.repo.js';

const baseRepository = {
  id: 'repo-1',
  name: 'Repo One',
  description: 'desc',
  siteDomain: 'example.com',
  author: { id: 'author-1', name: 'Alice' },
  starsCount: 10,
  usageCount: 20,
  lastActiveAt: '2026-03-06T00:00:00.000Z',
  latestReleaseVersion: '1.0.0',
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-06T00:00:00.000Z',
};

function createStore(): RepositoryStore {
  return {
    searchRepositories: async () => ({ items: [baseRepository], total: 1 }),
    getRepositoryById: async (id) => (id === 'repo-1' ? baseRepository : null),
    getRelease: async () => ({
      id: 'rel-1',
      repositoryId: 'repo-1',
      version: '1.0.0',
      name: 'stable',
      changelog: null,
      isLatest: true,
      createdAt: '2026-03-06T00:00:00.000Z',
    }),
    listReleases: async () => [
      {
        id: 'rel-1',
        repositoryId: 'repo-1',
        version: '1.0.0',
        name: 'stable',
        changelog: null,
        isLatest: true,
        createdAt: '2026-03-06T00:00:00.000Z',
      },
    ],
    listPrompts: async () => [
      {
        id: 'p1',
        repositoryId: 'repo-1',
        releaseId: 'rel-1',
        name: 'checkout-helper',
        description: '',
        arguments: [],
        messages: [],
        path: '^/checkout$',
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
    ],
    listResources: async () => [
      {
        id: 'r1',
        repositoryId: 'repo-1',
        releaseId: 'rel-1',
        name: 'product-page',
        description: '',
        uri: 'resource://product-page',
        mimeType: 'application/json',
        path: '^/products/.+$',
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
    ],
    listTools: async () => [
      {
        id: 't1',
        repositoryId: 'repo-1',
        releaseId: 'rel-1',
        name: 'search-products',
        description: '',
        inputSchema: { type: 'object', properties: {} },
        execute: 'return searchProducts()',
        path: '^/products/.+$',
        createdAt: '2026-03-01T00:00:00.000Z',
        updatedAt: '2026-03-01T00:00:00.000Z',
      },
    ],
    listRankingCandidates: async () => [
      baseRepository,
      {
        ...baseRepository,
        id: 'repo-2',
        name: 'Repo Two',
        starsCount: 1,
        usageCount: 1,
        lastActiveAt: null,
      },
    ],
    createRepository: async (input) => ({
      ...baseRepository,
      id: 'repo-created',
      name: input.name,
      siteDomain: input.siteDomain,
      author: { id: input.authorId, name: input.authorName },
      createdAt: '2026-03-07T00:00:00.000Z',
      updatedAt: '2026-03-07T00:00:00.000Z',
    }),
    createRelease: async (input) => ({
      id: 'rel-created',
      repositoryId: input.repositoryId,
      version: input.version,
      name: input.name ?? null,
      changelog: input.changelog ?? null,
      isLatest: input.isLatest,
      createdAt: '2026-03-07T00:00:00.000Z',
    }),
    createPrompt: async (input) => ({
      id: 'prompt-created',
      repositoryId: input.repositoryId,
      releaseId: input.releaseId,
      name: input.name,
      description: input.description ?? '',
      arguments: input.arguments ?? [],
      messages: input.messages,
      path: input.path,
      createdAt: '2026-03-07T00:00:00.000Z',
      updatedAt: '2026-03-07T00:00:00.000Z',
    }),
    createResource: async (input) => ({
      id: 'resource-created',
      repositoryId: input.repositoryId,
      releaseId: input.releaseId,
      name: input.name,
      description: input.description ?? '',
      uri: input.uri,
      mimeType: input.mimeType,
      path: input.path,
      createdAt: '2026-03-07T00:00:00.000Z',
      updatedAt: '2026-03-07T00:00:00.000Z',
    }),
    createTool: async (input) => ({
      id: 'tool-created',
      repositoryId: input.repositoryId,
      releaseId: input.releaseId,
      name: input.name,
      description: input.description ?? '',
      inputSchema: input.inputSchema,
      execute: input.execute,
      path: input.path,
      createdAt: '2026-03-07T00:00:00.000Z',
      updatedAt: '2026-03-07T00:00:00.000Z',
    }),
    updateRepository: async (input) => ({
      ...baseRepository,
      id: input.repositoryId,
      name: input.name ?? baseRepository.name,
      description: input.description ?? baseRepository.description,
      siteDomain: input.siteDomain ?? baseRepository.siteDomain,
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-07T00:00:00.000Z',
    }),
    deleteRepository: async () => true,
    updateRelease: async (input) => ({
      id: 'rel-1',
      repositoryId: input.repositoryId,
      version: input.version,
      name: input.name ?? 'stable',
      changelog: input.changelog ?? null,
      isLatest: input.isLatest ?? true,
      createdAt: '2026-03-07T00:00:00.000Z',
    }),
    deleteRelease: async () => true,
    updatePrompt: async (input) => ({
      id: input.itemId,
      repositoryId: input.repositoryId,
      releaseId: 'rel-1',
      name: input.name ?? 'checkout-helper',
      description: input.description ?? '',
      arguments: input.arguments ?? [],
      messages: input.messages ?? [],
      path: input.path ?? '^/checkout$',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-07T00:00:00.000Z',
    }),
    deletePrompt: async () => true,
    updateResource: async (input) => ({
      id: input.itemId,
      repositoryId: input.repositoryId,
      releaseId: 'rel-1',
      name: input.name ?? 'product-page',
      description: input.description ?? '',
      uri: input.uri ?? 'resource://product-page',
      mimeType: input.mimeType ?? 'application/json',
      path: input.path ?? '^/products/.+$',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-07T00:00:00.000Z',
    }),
    deleteResource: async () => true,
    updateTool: async (input) => ({
      id: input.itemId,
      repositoryId: input.repositoryId,
      releaseId: 'rel-1',
      name: input.name ?? 'search-products',
      description: input.description ?? '',
      inputSchema: input.inputSchema ?? { type: 'object', properties: {} },
      execute: input.execute ?? 'return searchProducts()',
      path: input.path ?? '^/products/.+$',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-07T00:00:00.000Z',
    }),
    deleteTool: async () => true,
    listSyncTargets: async () => [],
    recordSyncStatus: async () => {},
    assignRepositoryAuthorByName: async () => {},
    upsertRelease: async (input) => ({
      id: 'rel-1',
      repositoryId: input.repositoryId,
      version: input.version,
      name: input.name ?? null,
      changelog: input.changelog ?? null,
      isLatest: true,
      createdAt: '2026-03-08T00:00:00.000Z',
    }),
    clearReleaseItems: async () => {},
  };
}

describe('RepositoryService', () => {
  it('returns filtered content by path and release', async () => {
    const service = new RepositoryService(createStore());
    const result = await service.getContent({ repositoryId: 'repo-1', path: '/products/123' });

    expect(result.mcp.prompts).toHaveLength(0);
    expect(result.mcp.resources).toHaveLength(1);
    expect(result.mcp.resources[0]?.path).toBe('^/products/.+$');
    expect(result.mcp.tools).toHaveLength(1);
    expect(result.mcp.tools[0]?.execute).toBe('return searchProducts()');
    expect(result).not.toHaveProperty('skills');
  });

  it('returns rankings sorted by score desc', async () => {
    const service = new RepositoryService(createStore());
    const result = await service.rankings({ limit: 10 });

    expect(result[0]?.id).toBe('repo-1');
    expect(result[0]?.score).toBeGreaterThan(result[1]?.score ?? 0);
  });

  it('returns install snapshot with grouped mcp only', async () => {
    const service = new RepositoryService(createStore());
    const result = await service.getInstallSnapshot({ repositoryId: 'repo-1', release: '1.0.0' });

    expect(result.snapshot.mcp.prompts).toHaveLength(1);
    expect(result.snapshot.mcp.resources).toHaveLength(1);
    expect(result.snapshot.mcp.tools).toHaveLength(1);
    expect(result.snapshot.mcp.tools[0]?.execute).toBe('return searchProducts()');
    expect(result.snapshot).not.toHaveProperty('skills');
  });
});
