import { describe, expect, it } from 'bun:test';
import { createApp } from '../src/app.js';
import { RepositoryService } from '../src/services/repository.service.js';
import type { RepositoryStore } from '../src/repositories/repository.repo.js';

const store: RepositoryStore = {
  searchRepositories: async () => ({
    total: 1,
    items: [
      {
        id: 'repo-1',
        name: 'Repo One',
        description: '',
        siteDomain: 'example.com',
        author: { id: 'author-1', name: 'Alice' },
        starsCount: 10,
        usageCount: 5,
        lastActiveAt: '2026-03-06T00:00:00.000Z',
        latestReleaseVersion: '1.0.0',
      },
    ],
  }),
  getRepositoryById: async (id) =>
    id === 'repo-1'
      ? {
          id,
          name: 'Repo One',
          description: '',
          siteDomain: 'example.com',
          author: { id: 'author-1', name: 'Alice' },
          starsCount: 10,
          usageCount: 5,
          lastActiveAt: '2026-03-06T00:00:00.000Z',
          latestReleaseVersion: '1.0.0',
          createdAt: '2026-03-01T00:00:00.000Z',
          updatedAt: '2026-03-06T00:00:00.000Z',
        }
      : null,
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
      description: 'prompt desc',
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
    {
      id: 'repo-1',
      name: 'Repo One',
      description: '',
      siteDomain: 'example.com',
      author: { id: 'author-1', name: 'Alice' },
      starsCount: 10,
      usageCount: 5,
      lastActiveAt: '2026-03-06T00:00:00.000Z',
      latestReleaseVersion: '1.0.0',
    },
  ],
  createRepository: async (input) => ({
    id: 'repo-created',
    name: input.name,
    description: input.description ?? '',
    siteDomain: input.siteDomain,
    author: { id: input.authorId, name: input.authorName },
    starsCount: 0,
    usageCount: 0,
    lastActiveAt: null,
    latestReleaseVersion: null,
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
    id: input.repositoryId,
    name: input.name ?? 'Repo One',
    description: input.description ?? '',
    siteDomain: input.siteDomain ?? 'example.com',
    author: { id: 'author-1', name: 'Alice' },
    starsCount: 10,
    usageCount: 5,
    lastActiveAt: '2026-03-06T00:00:00.000Z',
    latestReleaseVersion: '1.0.0',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-07T00:00:00.000Z',
  }),
  deleteRepository: async () => true,
  updateRelease: async (input) => ({
    id: 'rel-1',
    repositoryId: input.repositoryId,
    version: input.version,
    name: input.name ?? null,
    changelog: input.changelog ?? null,
    isLatest: input.isLatest ?? true,
    createdAt: '2026-03-06T00:00:00.000Z',
  }),
  deleteRelease: async () => true,
  updatePrompt: async (input) => ({
    id: input.itemId,
    repositoryId: input.repositoryId,
    releaseId: 'rel-1',
    name: input.name ?? 'checkout-helper',
    description: input.description ?? 'prompt desc',
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
  upsertRelease: async () => ({
    id: 'rel-1',
    repositoryId: 'repo-1',
    version: '1.0.0',
    name: 'synced',
    changelog: null,
    isLatest: true,
    createdAt: '2026-03-08T00:00:00.000Z',
  }),
  clearReleaseItems: async () => {},
};

describe('API routes', () => {
  const service = new RepositoryService(store);
  const syncService = {
    runSync: async () => ({
      triggeredBy: 'cron',
      dryRun: false,
      scanned: 1,
      synced: 1,
      failed: 0,
      results: [{ repositoryId: 'repo-1', status: 'success', commitSha: 'abc', error: null }],
    }),
  };
  const app = createApp(service, { syncService: syncService as any, syncSecret: 'test-sync-secret' });

  it('GET /api/v1/health works', async () => {
    const res = await app.request('http://localhost/api/v1/health');
    expect(res.status).toBe(200);
  });

  it('POST /api/internal/sync rejects invalid credentials', async () => {
    const res = await app.request('http://localhost/api/internal/sync', {
      method: 'POST',
      headers: { authorization: 'Bearer wrong' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(403);
  });

  it('POST /api/internal/sync works with valid credentials', async () => {
    const res = await app.request('http://localhost/api/internal/sync', {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-sync-secret',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ dryRun: true, triggeredBy: 'manual' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.synced).toBe(1);
  });

  it('GET /api/v1/repositories/search works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/search?q=repo');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.total).toBe(1);
  });

  it('GET /api/v1/repositories/:id works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe('repo-1');
  });

  it('GET /api/v1/repositories/:id/content works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/content?path=/products/123');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.mcp.prompts).toHaveLength(0);
    expect(json.mcp.resources).toHaveLength(1);
    expect(json.mcp.tools).toHaveLength(1);
  });

  it('GET /api/v1/repositories/:id/releases works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/releases');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.items).toHaveLength(1);
  });

  it('GET /api/v1/repositories/:id/install works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/install?release=1.0.0');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.repository.id).toBe('repo-1');
    expect(json.release.version).toBe('1.0.0');
    expect(json.snapshot.mcp.prompts).toHaveLength(1);
    expect(json.snapshot.mcp.resources).toHaveLength(1);
    expect(json.snapshot.mcp.tools).toHaveLength(1);
    expect(json.snapshot).not.toHaveProperty('skills');
    expect(json.integrity.algorithm).toBe('sha256');
    expect(typeof json.integrity.digest).toBe('string');
  });

  it('GET /api/v1/repositories/rankings works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/rankings');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.items).toHaveLength(1);
  });

  it('POST /api/v1/repositories works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'My Repo',
        siteDomain: 'https://example.com/',
        authorId: 'author-1',
        authorName: 'Alice',
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe('repo-created');
    expect(json.siteDomain).toBe('example.com');
  });

  it('POST /api/v1/repositories/:id/releases works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/releases', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        version: '1.1.0',
        name: 'stable',
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.version).toBe('1.1.0');
  });

  it('POST /api/v1/repositories/:id/prompts works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/prompts', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        release: '1.0.0',
        name: 'checkout-helper',
        messages: [],
        path: '^/checkout$',
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe('prompt-created');
  });

  it('POST /api/v1/repositories/:id/resources works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/resources', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        release: '1.0.0',
        name: 'product-page',
        uri: 'resource://product-page',
        mimeType: 'application/json',
        path: '^/products/.+$',
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe('resource-created');
  });

  it('POST /api/v1/repositories/:id/tools works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/tools', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        release: '1.0.0',
        name: 'search-products',
        inputSchema: { type: 'object', properties: {} },
        execute: 'return searchProducts()',
        path: '^/products/.+$',
      }),
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.id).toBe('tool-created');
    expect(json.execute).toBe('return searchProducts()');
  });

  it('POST /api/v1/repositories/:id/tools rejects invalid regex', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/tools', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        release: '1.0.0',
        name: 'search-products',
        inputSchema: { type: 'object', properties: {} },
        execute: 'return searchProducts()',
        path: '[',
      }),
    });
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.code).toBe('INVALID_PATH_PATTERN');
  });

  it('PATCH /api/v1/repositories/:id works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'Repo One Updated',
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.name).toBe('Repo One Updated');
  });

  it('DELETE /api/v1/repositories/:id works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1', {
      method: 'DELETE',
    });
    expect(res.status).toBe(204);
  });

  it('PATCH /api/v1/repositories/:id/releases/:version works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/releases/1.0.0', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'stable-updated',
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.name).toBe('stable-updated');
  });

  it('DELETE /api/v1/repositories/:id/releases/:version works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/releases/1.0.0', {
      method: 'DELETE',
    });
    expect(res.status).toBe(204);
  });

  it('PATCH /api/v1/repositories/:id/prompts/:itemId works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/prompts/p1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'checkout-updated',
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.name).toBe('checkout-updated');
  });

  it('DELETE /api/v1/repositories/:id/prompts/:itemId works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/prompts/p1', {
      method: 'DELETE',
    });
    expect(res.status).toBe(204);
  });

  it('PATCH /api/v1/repositories/:id/resources/:itemId works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/resources/r1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'product-page-updated',
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.name).toBe('product-page-updated');
  });

  it('DELETE /api/v1/repositories/:id/resources/:itemId works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/resources/r1', {
      method: 'DELETE',
    });
    expect(res.status).toBe(204);
  });

  it('PATCH /api/v1/repositories/:id/tools/:itemId works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/tools/t1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: 'search-updated',
        execute: 'return updatedSearch()',
      }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.name).toBe('search-updated');
    expect(json.execute).toBe('return updatedSearch()');
  });

  it('DELETE /api/v1/repositories/:id/tools/:itemId works', async () => {
    const res = await app.request('http://localhost/api/v1/repositories/repo-1/tools/t1', {
      method: 'DELETE',
    });
    expect(res.status).toBe(204);
  });
});
