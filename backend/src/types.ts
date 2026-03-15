import type {
  AnthropicMcpPrompt,
  AnthropicMcpPromptMessage,
  AnthropicMcpResource,
  AnthropicMcpTool,
  JsonSchema,
} from '@page-mcp/protocol';

export interface Author {
  id: string;
  name: string;
}

export interface RepositorySummary {
  id: string;
  name: string;
  description: string | null;
  siteDomain: string;
  author: Author;
  starsCount: number;
  usageCount: number;
  lastActiveAt: string | null;
  latestReleaseVersion: string | null;
}

export interface RepositoryDetail extends RepositorySummary {
  createdAt: string;
  updatedAt: string;
}

export interface RepositoryRelease {
  id: string;
  repositoryId: string;
  version: string;
  name: string | null;
  changelog: string | null;
  isLatest: boolean;
  createdAt: string;
}

interface MarketMcpMetadata {
  id: string;
  repositoryId: string;
  releaseId: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export type McpPrompt = AnthropicMcpPrompt & {
  messages?: AnthropicMcpPromptMessage[];
} & MarketMcpMetadata;
export type McpResource = AnthropicMcpResource & MarketMcpMetadata;
export type McpTool = AnthropicMcpTool & {
  execute: string;
} & MarketMcpMetadata;

export interface GroupedMcp {
  prompts: McpPrompt[];
  resources: McpResource[];
  tools: McpTool[];
}

export interface RankingItem extends RepositorySummary {
  score: number;
}

export interface SearchRepositoriesInput {
  q?: string;
  domain?: string;
  authorId?: string;
  page: number;
  pageSize: number;
}

export interface SearchRepositoriesResult {
  items: RankingItem[];
  page: number;
  pageSize: number;
  total: number;
}

export interface GetContentInput {
  repositoryId: string;
  path?: string;
  release?: string;
}

export interface GetContentResult {
  repository: RepositorySummary;
  release: RepositoryRelease;
  mcp: GroupedMcp;
}

export interface InstallSnapshotResult {
  repository: RepositorySummary;
  release: RepositoryRelease;
  snapshot: {
    mcp: GroupedMcp;
    skills: unknown[];
  };
  integrity: {
    algorithm: 'sha256';
    digest: string;
  };
}

export interface CreateRepositoryInput {
  name: string;
  description?: string;
  siteDomain: string;
  authorId: string;
  authorName: string;
}

export interface CreateReleaseInput {
  repositoryId: string;
  version: string;
  name?: string;
  changelog?: string;
  isLatest: boolean;
}

export interface CreatePromptInput {
  repositoryId: string;
  releaseId: string;
  name: string;
  description?: string;
  arguments?: AnthropicMcpPrompt['arguments'];
  messages?: AnthropicMcpPromptMessage[];
  path: string;
}

export interface CreateResourceInput {
  repositoryId: string;
  releaseId: string;
  name: string;
  description?: string;
  uri: AnthropicMcpResource['uri'];
  mimeType?: AnthropicMcpResource['mimeType'];
  path: string;
}

export interface CreateToolInput {
  repositoryId: string;
  releaseId: string;
  name: string;
  description?: string;
  inputSchema?: JsonSchema;
  execute: string;
  path: string;
}

export interface UpdateRepositoryInput {
  repositoryId: string;
  name?: string;
  description?: string;
  siteDomain?: string;
}

export interface UpdateReleaseInput {
  repositoryId: string;
  version: string;
  name?: string;
  changelog?: string;
  isLatest?: boolean;
}

export interface UpdatePromptInput {
  repositoryId: string;
  itemId: string;
  name?: string;
  description?: string;
  arguments?: AnthropicMcpPrompt['arguments'];
  messages?: AnthropicMcpPromptMessage[];
  path?: string;
}

export interface UpdateResourceInput {
  repositoryId: string;
  itemId: string;
  name?: string;
  description?: string;
  uri?: AnthropicMcpResource['uri'];
  mimeType?: AnthropicMcpResource['mimeType'];
  path?: string;
}

export interface UpdateToolInput {
  repositoryId: string;
  itemId: string;
  name?: string;
  description?: string;
  inputSchema?: JsonSchema;
  execute?: string;
  path?: string;
}

export interface SyncTarget {
  repositoryId: string;
  githubOwner: string;
  githubRepo: string;
  defaultBranch: string;
}

export interface RecordSyncStatusInput {
  repositoryId: string;
  status: 'success' | 'failed';
  commitSha: string | null;
  error: string | null;
  triggeredBy: 'cron' | 'manual';
}
