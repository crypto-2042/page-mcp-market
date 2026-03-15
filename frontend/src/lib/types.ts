import type {
  AnthropicMcpPrompt,
  AnthropicMcpPromptMessage,
  AnthropicMcpResource,
  AnthropicMcpTool,
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
  score?: number;
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

interface McpMetadata {
  id: string;
  repositoryId: string;
  releaseId: string;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export type McpPrompt = AnthropicMcpPrompt & {
  messages?: AnthropicMcpPromptMessage[];
} & McpMetadata;
export type McpResource = AnthropicMcpResource & McpMetadata;
export type McpTool = AnthropicMcpTool & {
  execute: string;
} & McpMetadata;

export interface GroupedMcpResponse {
  prompts: McpPrompt[];
  resources: McpResource[];
  tools: McpTool[];
}

export interface SearchRepositoriesResponse {
  items: RepositorySummary[];
  page: number;
  pageSize: number;
  total: number;
}

export interface RepositoryContentResponse {
  repository: RepositorySummary;
  release: RepositoryRelease;
  mcp: GroupedMcpResponse;
}

export interface InstallSnapshotResponse {
  repository: RepositorySummary;
  release: RepositoryRelease;
  snapshot: {
    mcp: GroupedMcpResponse;
  };
  integrity: {
    algorithm: 'sha256';
    digest: string;
  };
}
