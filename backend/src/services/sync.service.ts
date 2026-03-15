import type { AnthropicMcpPromptMessage, JsonSchema } from '@page-mcp/protocol';
import { isValidRegexPattern } from '../domain/path-match.js';
import type { RepositoryStore } from '../repositories/repository.repo.js';

export interface SyncRunInput {
  triggeredBy: 'cron' | 'manual';
  dryRun: boolean;
  repositoryId?: string;
}

export interface SyncResultItem {
  repositoryId: string;
  status: 'success' | 'failed';
  commitSha: string | null;
  error: string | null;
}

export interface SyncRunResult {
  triggeredBy: 'cron' | 'manual';
  dryRun: boolean;
  scanned: number;
  synced: number;
  failed: number;
  results: SyncResultItem[];
}

interface GitHubBranchResponse {
  commit?: {
    sha?: string;
  };
}

interface RepositoryManifest {
  name: string;
  description?: string;
  siteDomain: string;
  version: string;
}

interface PromptManifestFile {
  name: string;
  description: string;
  arguments?: Array<{ name: string; description?: string; required?: boolean }>;
  messages?: AnthropicMcpPromptMessage[];
  path: string;
}

interface ResourceManifestFile {
  name: string;
  description: string;
  uri: string;
  mimeType?: string;
  path: string;
}

interface ToolManifestFile {
  name: string;
  description: string;
  inputSchema?: JsonSchema;
  execute: string;
  path: string;
}

function validatePath(path: string, fileName: string): void {
  if (!isValidRegexPattern(path)) {
    throw new Error(`Invalid path in ${fileName}`);
  }
}

export class SyncService {
  constructor(
    private readonly store: RepositoryStore,
    private readonly githubToken: string,
    private readonly fetchFn: typeof fetch = fetch
  ) {}

  private async fetchJson<T>(url: string): Promise<T> {
    const response = await this.fetchFn(url, {
      headers: this.githubToken
        ? {
            Authorization: `Bearer ${this.githubToken}`,
            'User-Agent': 'page-mcp-market-sync/0.1',
          }
        : { 'User-Agent': 'page-mcp-market-sync/0.1' },
    });
    if (!response.ok) {
      throw new Error(`Request failed ${response.status}: ${url}`);
    }
    return response.json() as Promise<T>;
  }

  async runSync(input: SyncRunInput): Promise<SyncRunResult> {
    const targets = await this.store.listSyncTargets(input.repositoryId);
    const results: SyncResultItem[] = [];

    for (const target of targets) {
      let status: 'success' | 'failed' = 'success';
      let commitSha: string | null = null;
      let error: string | null = null;

      try {
        const branchUrl = `https://api.github.com/repos/${target.githubOwner}/${target.githubRepo}/branches/${target.defaultBranch}`;
        const branch = await this.fetchJson<GitHubBranchResponse>(branchUrl);
        commitSha = branch.commit?.sha ?? null;

        const baseUrl = `https://raw.githubusercontent.com/${target.githubOwner}/${target.githubRepo}/${target.defaultBranch}`;
        const [repositoryManifest, prompts, resources, tools] = await Promise.all([
          this.fetchJson<RepositoryManifest>(`${baseUrl}/repository.json`),
          this.fetchJson<PromptManifestFile[]>(`${baseUrl}/mcp/prompts.json`),
          this.fetchJson<ResourceManifestFile[]>(`${baseUrl}/mcp/resources.json`),
          this.fetchJson<ToolManifestFile[]>(`${baseUrl}/mcp/tools.json`),
        ]);

        if (!repositoryManifest.name || !repositoryManifest.siteDomain || !repositoryManifest.version) {
          throw new Error('repository.json missing required fields');
        }

        prompts.forEach((item) => validatePath(item.path, 'mcp/prompts.json'));
        resources.forEach((item) => validatePath(item.path, 'mcp/resources.json'));
        tools.forEach((item) => {
          validatePath(item.path, 'mcp/tools.json');
          if (!item.execute) {
            throw new Error('Tool missing execute in mcp/tools.json');
          }
        });

        if (!input.dryRun) {
          await this.store.assignRepositoryAuthorByName(target.repositoryId, target.githubOwner);

          await this.store.updateRepository({
            repositoryId: target.repositoryId,
            name: repositoryManifest.name,
            description: repositoryManifest.description,
            siteDomain: repositoryManifest.siteDomain,
          });

          const release = await this.store.upsertRelease({
            repositoryId: target.repositoryId,
            version: repositoryManifest.version,
            name: 'synced',
            changelog: `Synced from ${target.githubOwner}/${target.githubRepo}@${target.defaultBranch}`,
          });

          await this.store.clearReleaseItems(target.repositoryId, release.id);

          for (const prompt of prompts) {
            await this.store.createPrompt({
              repositoryId: target.repositoryId,
              releaseId: release.id,
              name: prompt.name,
              description: prompt.description,
              arguments: prompt.arguments,
              messages: prompt.messages,
              path: prompt.path,
            });
          }

          for (const resource of resources) {
            await this.store.createResource({
              repositoryId: target.repositoryId,
              releaseId: release.id,
              name: resource.name,
              description: resource.description,
              uri: resource.uri,
              mimeType: resource.mimeType,
              path: resource.path,
            });
          }

          for (const tool of tools) {
            await this.store.createTool({
              repositoryId: target.repositoryId,
              releaseId: release.id,
              name: tool.name,
              description: tool.description,
              inputSchema: tool.inputSchema,
              execute: tool.execute,
              path: tool.path,
            });
          }
        }
      } catch (err) {
        status = 'failed';
        error = err instanceof Error ? err.message : 'Unknown sync error';
      }

      if (!input.dryRun) {
        await this.store.recordSyncStatus({
          repositoryId: target.repositoryId,
          status,
          commitSha,
          error,
          triggeredBy: input.triggeredBy,
        });
      }

      results.push({
        repositoryId: target.repositoryId,
        status,
        commitSha,
        error,
      });
    }

    return {
      triggeredBy: input.triggeredBy,
      dryRun: input.dryRun,
      scanned: targets.length,
      synced: results.filter((item) => item.status === 'success').length,
      failed: results.filter((item) => item.status === 'failed').length,
      results,
    };
  }
}
