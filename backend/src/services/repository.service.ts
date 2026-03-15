import { createHash } from 'node:crypto';
import { isValidRegexPattern, matchesPath } from '../domain/path-match.js';
import { normalizeDomain } from '../domain/normalize.js';
import { computeRepositoryScore } from '../domain/ranking.js';
import { AppError } from '../http/error.js';
import type { RepositoryStore } from '../repositories/repository.repo.js';
import type {
  GetContentResult,
  GroupedMcp,
  InstallSnapshotResult,
  McpPrompt,
  McpResource,
  McpTool,
  RankingItem,
  RepositoryRelease,
  SearchRepositoriesResult,
} from '../types.js';

export class RepositoryService {
  constructor(private readonly store: RepositoryStore) {}

  private filterByPath<T extends { path: string }>(items: T[], path?: string): T[] {
    if (!path) {
      return items;
    }
    return items.filter((item) => matchesPath(item.path, path));
  }

  private async getReleaseOrThrow(repositoryId: string, version?: string): Promise<RepositoryRelease> {
    const release = await this.store.getRelease(repositoryId, version);
    if (!release) {
      throw new AppError(404, 'RELEASE_NOT_FOUND', 'Requested release not found');
    }
    return release;
  }

  private async getGroupedMcp(
    repositoryId: string,
    releaseId: string,
    path?: string
  ): Promise<GroupedMcp> {
    const [prompts, resources, tools] = await Promise.all([
      this.store.listPrompts(repositoryId, releaseId),
      this.store.listResources(repositoryId, releaseId),
      this.store.listTools(repositoryId, releaseId),
    ]);

    return {
      prompts: this.filterByPath(prompts, path),
      resources: this.filterByPath(resources, path),
      tools: this.filterByPath(tools, path),
    };
  }

  async search(input: {
    q?: string;
    domain?: string;
    authorId?: string;
    page: number;
    pageSize: number;
  }): Promise<SearchRepositoriesResult> {
    const result = await this.store.searchRepositories(input);
    const items = result.items.map<RankingItem>((item) => ({
      ...item,
      score: computeRepositoryScore({
        starsCount: item.starsCount,
        usageCount: item.usageCount,
        lastActiveAt: item.lastActiveAt,
      }),
    }));

    return {
      items,
      page: input.page,
      pageSize: input.pageSize,
      total: result.total,
    };
  }

  async getRepository(repositoryId: string) {
    const repository = await this.store.getRepositoryById(repositoryId);
    if (!repository) {
      throw new AppError(404, 'REPOSITORY_NOT_FOUND', `Repository ${repositoryId} not found`);
    }
    return repository;
  }

  async getContent(input: {
    repositoryId: string;
    path?: string;
    release?: string;
  }): Promise<GetContentResult> {
    const repository = await this.getRepository(input.repositoryId);
    const release = await this.getReleaseOrThrow(input.repositoryId, input.release);
    const mcp = await this.getGroupedMcp(input.repositoryId, release.id, input.path);

    return {
      repository,
      release,
      mcp,
    };
  }

  async getReleases(repositoryId: string): Promise<RepositoryRelease[]> {
    await this.getRepository(repositoryId);
    return this.store.listReleases(repositoryId);
  }

  async getInstallSnapshot(input: {
    repositoryId: string;
    release?: string;
  }): Promise<InstallSnapshotResult> {
    const repository = await this.getRepository(input.repositoryId);
    const release = await this.getReleaseOrThrow(input.repositoryId, input.release);
    const snapshot = {
      mcp: await this.getGroupedMcp(input.repositoryId, release.id),
      skills: [] as unknown[],
    };
    const digest = createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');

    return {
      repository,
      release,
      snapshot,
      integrity: {
        algorithm: 'sha256',
        digest,
      },
    };
  }

  async rankings(input: { limit: number; domain?: string }): Promise<RankingItem[]> {
    const items = await this.store.listRankingCandidates(input);

    return items
      .map<RankingItem>((item) => ({
        ...item,
        score: computeRepositoryScore({
          starsCount: item.starsCount,
          usageCount: item.usageCount,
          lastActiveAt: item.lastActiveAt,
        }),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, input.limit);
  }

  async createRepository(input: {
    name: string;
    description?: string;
    siteDomain: string;
    authorId: string;
    authorName: string;
  }) {
    return this.store.createRepository({
      ...input,
      siteDomain: normalizeDomain(input.siteDomain),
    });
  }

  async createRelease(input: {
    repositoryId: string;
    version: string;
    name?: string;
    changelog?: string;
    isLatest?: boolean;
  }): Promise<RepositoryRelease> {
    await this.getRepository(input.repositoryId);
    return this.store.createRelease({
      repositoryId: input.repositoryId,
      version: input.version,
      name: input.name,
      changelog: input.changelog,
      isLatest: input.isLatest ?? true,
    });
  }

  async createPrompt(input: {
    repositoryId: string;
    releaseVersion: string;
    name: string;
    description?: string;
    arguments?: McpPrompt['arguments'];
    messages: McpPrompt['messages'];
    path: string;
  }): Promise<McpPrompt> {
    if (!isValidRegexPattern(input.path)) {
      throw new AppError(422, 'INVALID_PATH_PATTERN', 'Invalid regex path');
    }

    const release = await this.getReleaseOrThrow(input.repositoryId, input.releaseVersion);
    return this.store.createPrompt({
      repositoryId: input.repositoryId,
      releaseId: release.id,
      name: input.name,
      description: input.description,
      arguments: input.arguments,
      messages: input.messages,
      path: input.path,
    });
  }

  async createResource(input: {
    repositoryId: string;
    releaseVersion: string;
    name: string;
    description?: string;
    uri: McpResource['uri'];
    mimeType?: McpResource['mimeType'];
    path: string;
  }): Promise<McpResource> {
    if (!isValidRegexPattern(input.path)) {
      throw new AppError(422, 'INVALID_PATH_PATTERN', 'Invalid regex path');
    }

    const release = await this.getReleaseOrThrow(input.repositoryId, input.releaseVersion);
    return this.store.createResource({
      repositoryId: input.repositoryId,
      releaseId: release.id,
      name: input.name,
      description: input.description,
      uri: input.uri,
      mimeType: input.mimeType,
      path: input.path,
    });
  }

  async createTool(input: {
    repositoryId: string;
    releaseVersion: string;
    name: string;
    description?: string;
    inputSchema: McpTool['inputSchema'];
    execute: string;
    path: string;
  }): Promise<McpTool> {
    if (!isValidRegexPattern(input.path)) {
      throw new AppError(422, 'INVALID_PATH_PATTERN', 'Invalid regex path');
    }

    const release = await this.getReleaseOrThrow(input.repositoryId, input.releaseVersion);
    return this.store.createTool({
      repositoryId: input.repositoryId,
      releaseId: release.id,
      name: input.name,
      description: input.description,
      inputSchema: input.inputSchema,
      execute: input.execute,
      path: input.path,
    });
  }

  async updateRepository(input: {
    repositoryId: string;
    name?: string;
    description?: string;
    siteDomain?: string;
  }) {
    const updated = await this.store.updateRepository(input);
    if (!updated) {
      throw new AppError(404, 'REPOSITORY_NOT_FOUND', `Repository ${input.repositoryId} not found`);
    }
    return updated;
  }

  async deleteRepository(repositoryId: string): Promise<void> {
    const deleted = await this.store.deleteRepository(repositoryId);
    if (!deleted) {
      throw new AppError(404, 'REPOSITORY_NOT_FOUND', `Repository ${repositoryId} not found`);
    }
  }

  async updateRelease(input: {
    repositoryId: string;
    version: string;
    name?: string;
    changelog?: string;
    isLatest?: boolean;
  }): Promise<RepositoryRelease> {
    const updated = await this.store.updateRelease(input);
    if (!updated) {
      throw new AppError(404, 'RELEASE_NOT_FOUND', 'Requested release not found');
    }
    return updated;
  }

  async deleteRelease(repositoryId: string, version: string): Promise<void> {
    const deleted = await this.store.deleteRelease(repositoryId, version);
    if (!deleted) {
      throw new AppError(404, 'RELEASE_NOT_FOUND', 'Requested release not found');
    }
  }

  async updatePrompt(input: {
    repositoryId: string;
    itemId: string;
    name?: string;
    description?: string;
    arguments?: McpPrompt['arguments'];
    messages?: McpPrompt['messages'];
    path?: string;
  }): Promise<McpPrompt> {
    if (input.path !== undefined && !isValidRegexPattern(input.path)) {
      throw new AppError(422, 'INVALID_PATH_PATTERN', 'Invalid regex path');
    }
    const updated = await this.store.updatePrompt(input);
    if (!updated) {
      throw new AppError(404, 'PROMPT_NOT_FOUND', 'Prompt not found');
    }
    return updated;
  }

  async deletePrompt(repositoryId: string, itemId: string): Promise<void> {
    const deleted = await this.store.deletePrompt(repositoryId, itemId);
    if (!deleted) {
      throw new AppError(404, 'PROMPT_NOT_FOUND', 'Prompt not found');
    }
  }

  async updateResource(input: {
    repositoryId: string;
    itemId: string;
    name?: string;
    description?: string;
    uri?: McpResource['uri'];
    mimeType?: McpResource['mimeType'];
    path?: string;
  }): Promise<McpResource> {
    if (input.path !== undefined && !isValidRegexPattern(input.path)) {
      throw new AppError(422, 'INVALID_PATH_PATTERN', 'Invalid regex path');
    }
    const updated = await this.store.updateResource(input);
    if (!updated) {
      throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Resource not found');
    }
    return updated;
  }

  async deleteResource(repositoryId: string, itemId: string): Promise<void> {
    const deleted = await this.store.deleteResource(repositoryId, itemId);
    if (!deleted) {
      throw new AppError(404, 'RESOURCE_NOT_FOUND', 'Resource not found');
    }
  }

  async updateTool(input: {
    repositoryId: string;
    itemId: string;
    name?: string;
    description?: string;
    inputSchema?: McpTool['inputSchema'];
    execute?: string;
    path?: string;
  }): Promise<McpTool> {
    if (input.path !== undefined && !isValidRegexPattern(input.path)) {
      throw new AppError(422, 'INVALID_PATH_PATTERN', 'Invalid regex path');
    }
    const updated = await this.store.updateTool(input);
    if (!updated) {
      throw new AppError(404, 'TOOL_NOT_FOUND', 'Tool not found');
    }
    return updated;
  }

  async deleteTool(repositoryId: string, itemId: string): Promise<void> {
    const deleted = await this.store.deleteTool(repositoryId, itemId);
    if (!deleted) {
      throw new AppError(404, 'TOOL_NOT_FOUND', 'Tool not found');
    }
  }
}
