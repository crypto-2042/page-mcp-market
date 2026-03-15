import { normalizeDomain } from '../domain/normalize.js';
import type { Queryable } from '../db/types.js';
import type {
  CreatePromptInput,
  CreateReleaseInput,
  CreateRepositoryInput,
  CreateResourceInput,
  CreateToolInput,
  McpPrompt,
  McpResource,
  McpTool,
  RepositoryDetail,
  RepositoryRelease,
  RepositorySummary,
  RecordSyncStatusInput,
  SearchRepositoriesInput,
  SyncTarget,
  UpdatePromptInput,
  UpdateReleaseInput,
  UpdateRepositoryInput,
  UpdateResourceInput,
  UpdateToolInput,
} from '../types.js';

export interface RepositoryStore {
  searchRepositories(input: SearchRepositoriesInput): Promise<{ items: RepositorySummary[]; total: number }>;
  getRepositoryById(repositoryId: string): Promise<RepositoryDetail | null>;
  listReleases(repositoryId: string): Promise<RepositoryRelease[]>;
  getRelease(repositoryId: string, version?: string): Promise<RepositoryRelease | null>;
  listPrompts(repositoryId: string, releaseId: string): Promise<McpPrompt[]>;
  listResources(repositoryId: string, releaseId: string): Promise<McpResource[]>;
  listTools(repositoryId: string, releaseId: string): Promise<McpTool[]>;
  listRankingCandidates(input: { limit: number; domain?: string }): Promise<RepositorySummary[]>;
  createRepository(input: CreateRepositoryInput): Promise<RepositoryDetail>;
  createRelease(input: CreateReleaseInput): Promise<RepositoryRelease>;
  createPrompt(input: CreatePromptInput): Promise<McpPrompt>;
  createResource(input: CreateResourceInput): Promise<McpResource>;
  createTool(input: CreateToolInput): Promise<McpTool>;
  updateRepository(input: UpdateRepositoryInput): Promise<RepositoryDetail | null>;
  deleteRepository(repositoryId: string): Promise<boolean>;
  updateRelease(input: UpdateReleaseInput): Promise<RepositoryRelease | null>;
  deleteRelease(repositoryId: string, version: string): Promise<boolean>;
  updatePrompt(input: UpdatePromptInput): Promise<McpPrompt | null>;
  deletePrompt(repositoryId: string, itemId: string): Promise<boolean>;
  updateResource(input: UpdateResourceInput): Promise<McpResource | null>;
  deleteResource(repositoryId: string, itemId: string): Promise<boolean>;
  updateTool(input: UpdateToolInput): Promise<McpTool | null>;
  deleteTool(repositoryId: string, itemId: string): Promise<boolean>;
  listSyncTargets(repositoryId?: string): Promise<SyncTarget[]>;
  recordSyncStatus(input: RecordSyncStatusInput): Promise<void>;
  assignRepositoryAuthorByName(repositoryId: string, authorName: string): Promise<void>;
  upsertRelease(input: {
    repositoryId: string;
    version: string;
    name?: string;
    changelog?: string;
  }): Promise<RepositoryRelease>;
  clearReleaseItems(repositoryId: string, releaseId: string): Promise<void>;
}

interface RepositoryRow {
  id: string;
  name: string;
  description: string | null;
  site_domain: string;
  author_id: string;
  author_name: string;
  stars_count: number;
  usage_count: number;
  last_active_at: string | null;
  latest_release_version: string | null;
  created_at: string;
  updated_at: string;
}

interface ReleaseRow {
  id: string;
  repository_id: string;
  version: string;
  name: string | null;
  changelog: string | null;
  is_latest: boolean;
  created_at: string;
}

interface SyncTargetRow {
  id: string;
  github_owner: string;
  github_repo: string;
  default_branch: string;
}

interface PromptRow {
  id: string;
  repository_id: string;
  release_id: string;
  name: string;
  description: string | null;
  arguments: Array<Record<string, unknown>>;
  messages: Array<Record<string, unknown>>;
  path_pattern: string;
  created_at: string;
  updated_at: string;
}

interface ResourceRow {
  id: string;
  repository_id: string;
  release_id: string;
  name: string;
  description: string | null;
  uri: string;
  mime_type: string | null;
  path_pattern: string;
  created_at: string;
  updated_at: string;
}

interface ToolRow {
  id: string;
  repository_id: string;
  release_id: string;
  name: string;
  description: string | null;
  input_schema: Record<string, unknown>;
  execute: string;
  path_pattern: string;
  created_at: string;
  updated_at: string;
}

function mapRepository(row: RepositoryRow): RepositorySummary {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    siteDomain: row.site_domain,
    author: { id: row.author_id, name: row.author_name },
    starsCount: row.stars_count,
    usageCount: row.usage_count,
    lastActiveAt: row.last_active_at,
    latestReleaseVersion: row.latest_release_version,
  };
}

function mapRepositoryDetail(row: RepositoryRow): RepositoryDetail {
  return {
    ...mapRepository(row),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRelease(row: ReleaseRow): RepositoryRelease {
  return {
    id: row.id,
    repositoryId: row.repository_id,
    version: row.version,
    name: row.name,
    changelog: row.changelog,
    isLatest: row.is_latest,
    createdAt: row.created_at,
  };
}

function mapPrompt(row: PromptRow): McpPrompt {
  return {
    name: row.name,
    description: row.description ?? '',
    arguments: row.arguments as unknown as McpPrompt['arguments'],
    messages: row.messages as unknown as McpPrompt['messages'],
    id: row.id,
    repositoryId: row.repository_id,
    releaseId: row.release_id,
    path: row.path_pattern,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapResource(row: ResourceRow): McpResource {
  return {
    name: row.name,
    description: row.description ?? '',
    uri: row.uri,
    mimeType: row.mime_type ?? undefined,
    id: row.id,
    repositoryId: row.repository_id,
    releaseId: row.release_id,
    path: row.path_pattern,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTool(row: ToolRow): McpTool {
  return {
    name: row.name,
    description: row.description ?? '',
    inputSchema: row.input_schema as unknown as McpTool['inputSchema'],
    execute: row.execute,
    id: row.id,
    repositoryId: row.repository_id,
    releaseId: row.release_id,
    path: row.path_pattern,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class PostgresRepositoryStore implements RepositoryStore {
  constructor(private readonly db: Queryable) {}

  async searchRepositories(input: SearchRepositoriesInput): Promise<{ items: RepositorySummary[]; total: number }> {
    const whereClauses: string[] = [];
    const params: unknown[] = [];

    if (input.q) {
      params.push(`%${input.q.toLowerCase()}%`);
      whereClauses.push(`LOWER(r.name) LIKE $${params.length}`);
    }

    if (input.domain) {
      params.push(normalizeDomain(input.domain));
      whereClauses.push(`r.site_domain = $${params.length}`);
    }

    if (input.authorId) {
      params.push(input.authorId);
      whereClauses.push(`r.author_id = $${params.length}`);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM repositories r
      ${whereSql}
    `;

    const offset = (input.page - 1) * input.pageSize;
    params.push(input.pageSize, offset);

    const listSql = `
      SELECT
        r.id, r.name, r.description, r.site_domain,
        r.author_id, a.name AS author_name,
        r.stars_count, r.usage_count, r.last_active_at,
        r.created_at, r.updated_at,
        rr.version AS latest_release_version
      FROM repositories r
      JOIN authors a ON a.id = r.author_id
      LEFT JOIN repository_releases rr
        ON rr.repository_id = r.id AND rr.is_latest = true
      ${whereSql}
      ORDER BY r.updated_at DESC
      LIMIT $${params.length - 1}
      OFFSET $${params.length}
    `;

    const [countResult, listResult] = await Promise.all([
      this.db.query<{ total: number }>(countSql, params.slice(0, params.length - 2)),
      this.db.query<RepositoryRow>(listSql, params),
    ]);

    return {
      total: countResult.rows[0]?.total ?? 0,
      items: listResult.rows.map(mapRepository),
    };
  }

  async getRepositoryById(repositoryId: string): Promise<RepositoryDetail | null> {
    const sql = `
      SELECT
        r.id, r.name, r.description, r.site_domain,
        r.author_id, a.name AS author_name,
        r.stars_count, r.usage_count, r.last_active_at,
        r.created_at, r.updated_at,
        rr.version AS latest_release_version
      FROM repositories r
      JOIN authors a ON a.id = r.author_id
      LEFT JOIN repository_releases rr
        ON rr.repository_id = r.id AND rr.is_latest = true
      WHERE r.id = $1
      LIMIT 1
    `;

    const result = await this.db.query<RepositoryRow>(sql, [repositoryId]);
    if (!result.rows[0]) return null;
    return mapRepositoryDetail(result.rows[0]);
  }

  async listReleases(repositoryId: string): Promise<RepositoryRelease[]> {
    const result = await this.db.query<ReleaseRow>(
      `
      SELECT id, repository_id, version, name, changelog, is_latest, created_at
      FROM repository_releases
      WHERE repository_id = $1
      ORDER BY created_at DESC
      `,
      [repositoryId]
    );
    return result.rows.map(mapRelease);
  }

  async getRelease(repositoryId: string, version?: string): Promise<RepositoryRelease | null> {
    const sql = version
      ? `
        SELECT id, repository_id, version, name, changelog, is_latest, created_at
        FROM repository_releases
        WHERE repository_id = $1 AND version = $2
        LIMIT 1
      `
      : `
        SELECT id, repository_id, version, name, changelog, is_latest, created_at
        FROM repository_releases
        WHERE repository_id = $1 AND is_latest = true
        LIMIT 1
      `;

    const params = version ? [repositoryId, version] : [repositoryId];
    const result = await this.db.query<ReleaseRow>(sql, params);
    if (!result.rows[0]) return null;
    return mapRelease(result.rows[0]);
  }

  async listPrompts(repositoryId: string, releaseId: string): Promise<McpPrompt[]> {
    const rows = await this.db.query<PromptRow>(
      `
      SELECT
        id, repository_id, release_id, name, description,
        arguments, messages, path_pattern,
        created_at, updated_at
      FROM mcp_prompts
      WHERE repository_id = $1 AND release_id = $2
      ORDER BY name ASC
      `,
      [repositoryId, releaseId]
    );
    return rows.rows.map(mapPrompt);
  }

  async listResources(repositoryId: string, releaseId: string): Promise<McpResource[]> {
    const rows = await this.db.query<ResourceRow>(
      `
      SELECT
        id, repository_id, release_id, name, description,
        uri, mime_type, path_pattern,
        created_at, updated_at
      FROM mcp_resources
      WHERE repository_id = $1 AND release_id = $2
      ORDER BY name ASC
      `,
      [repositoryId, releaseId]
    );
    return rows.rows.map(mapResource);
  }

  async listTools(repositoryId: string, releaseId: string): Promise<McpTool[]> {
    const rows = await this.db.query<ToolRow>(
      `
      SELECT
        id, repository_id, release_id, name, description,
        input_schema, execute, path_pattern,
        created_at, updated_at
      FROM mcp_tools
      WHERE repository_id = $1 AND release_id = $2
      ORDER BY name ASC
      `,
      [repositoryId, releaseId]
    );
    return rows.rows.map(mapTool);
  }

  async listRankingCandidates(input: { limit: number; domain?: string }): Promise<RepositorySummary[]> {
    const params: unknown[] = [input.limit];
    let whereSql = '';

    if (input.domain) {
      params.push(normalizeDomain(input.domain));
      whereSql = 'WHERE r.site_domain = $2';
    }

    const sql = `
      SELECT
        r.id, r.name, r.description, r.site_domain,
        r.author_id, a.name AS author_name,
        r.stars_count, r.usage_count, r.last_active_at,
        r.created_at, r.updated_at,
        rr.version AS latest_release_version
      FROM repositories r
      JOIN authors a ON a.id = r.author_id
      LEFT JOIN repository_releases rr
        ON rr.repository_id = r.id AND rr.is_latest = true
      ${whereSql}
      ORDER BY r.updated_at DESC
      LIMIT $1
    `;

    const result = await this.db.query<RepositoryRow>(sql, params);
    return result.rows.map(mapRepository);
  }

  async createRepository(input: CreateRepositoryInput): Promise<RepositoryDetail> {
    await this.db.query(
      `
      INSERT INTO authors (id, name)
      VALUES ($1, $2)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name
      `,
      [input.authorId, input.authorName]
    );

    const created = await this.db.query<{ id: string }>(
      `
      INSERT INTO repositories (name, description, site_domain, author_id)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [input.name, input.description ?? null, normalizeDomain(input.siteDomain), input.authorId]
    );

    const detail = await this.getRepositoryById(created.rows[0]!.id);
    if (!detail) {
      throw new Error('Failed to create repository');
    }
    return detail;
  }

  async createRelease(input: CreateReleaseInput): Promise<RepositoryRelease> {
    if (input.isLatest) {
      await this.db.query(
        `
        UPDATE repository_releases
        SET is_latest = false
        WHERE repository_id = $1
        `,
        [input.repositoryId]
      );
    }

    const result = await this.db.query<ReleaseRow>(
      `
      INSERT INTO repository_releases (repository_id, version, name, changelog, is_latest)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, repository_id, version, name, changelog, is_latest, created_at
      `,
      [input.repositoryId, input.version, input.name ?? null, input.changelog ?? null, input.isLatest]
    );

    return mapRelease(result.rows[0]!);
  }

  async createPrompt(input: CreatePromptInput): Promise<McpPrompt> {
    const result = await this.db.query<PromptRow>(
      `
      INSERT INTO mcp_prompts (repository_id, release_id, name, description, arguments, messages, path_pattern)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb, $7)
      RETURNING id, repository_id, release_id, name, description, arguments, messages, path_pattern, created_at, updated_at
      `,
      [
        input.repositoryId,
        input.releaseId,
        input.name,
        input.description ?? null,
        JSON.stringify(input.arguments ?? []),
        JSON.stringify(input.messages ?? []),
        input.path,
      ]
    );
    return mapPrompt(result.rows[0]!);
  }

  async createResource(input: CreateResourceInput): Promise<McpResource> {
    const result = await this.db.query<ResourceRow>(
      `
      INSERT INTO mcp_resources (repository_id, release_id, name, description, uri, mime_type, path_pattern)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, repository_id, release_id, name, description, uri, mime_type, path_pattern, created_at, updated_at
      `,
      [
        input.repositoryId,
        input.releaseId,
        input.name,
        input.description ?? null,
        input.uri,
        input.mimeType ?? null,
        input.path,
      ]
    );
    return mapResource(result.rows[0]!);
  }

  async createTool(input: CreateToolInput): Promise<McpTool> {
    const result = await this.db.query<ToolRow>(
      `
      INSERT INTO mcp_tools (repository_id, release_id, name, description, input_schema, execute, path_pattern)
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
      RETURNING id, repository_id, release_id, name, description, input_schema, execute, path_pattern, created_at, updated_at
      `,
      [
        input.repositoryId,
        input.releaseId,
        input.name,
        input.description ?? null,
        JSON.stringify(input.inputSchema ?? {}),
        input.execute,
        input.path,
      ]
    );
    return mapTool(result.rows[0]!);
  }

  async updateRepository(input: UpdateRepositoryInput): Promise<RepositoryDetail | null> {
    const updates: string[] = [];
    const params: unknown[] = [];

    if (input.name !== undefined) {
      params.push(input.name);
      updates.push(`name = $${params.length}`);
    }
    if (input.description !== undefined) {
      params.push(input.description);
      updates.push(`description = $${params.length}`);
    }
    if (input.siteDomain !== undefined) {
      params.push(normalizeDomain(input.siteDomain));
      updates.push(`site_domain = $${params.length}`);
    }

    if (updates.length === 0) {
      return this.getRepositoryById(input.repositoryId);
    }

    params.push(input.repositoryId);
    await this.db.query(
      `UPDATE repositories SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${params.length}`,
      params
    );
    return this.getRepositoryById(input.repositoryId);
  }

  async deleteRepository(repositoryId: string): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      `DELETE FROM repositories WHERE id = $1 RETURNING id`,
      [repositoryId]
    );
    return result.rows.length > 0;
  }

  async updateRelease(input: UpdateReleaseInput): Promise<RepositoryRelease | null> {
    if (input.isLatest) {
      await this.db.query(
        `UPDATE repository_releases SET is_latest = false WHERE repository_id = $1`,
        [input.repositoryId]
      );
    }

    const updates: string[] = [];
    const params: unknown[] = [];

    if (input.name !== undefined) {
      params.push(input.name);
      updates.push(`name = $${params.length}`);
    }
    if (input.changelog !== undefined) {
      params.push(input.changelog);
      updates.push(`changelog = $${params.length}`);
    }
    if (input.isLatest !== undefined) {
      params.push(input.isLatest);
      updates.push(`is_latest = $${params.length}`);
    }

    if (updates.length === 0) {
      return this.getRelease(input.repositoryId, input.version);
    }

    params.push(input.repositoryId, input.version);
    const result = await this.db.query<ReleaseRow>(
      `
      UPDATE repository_releases
      SET ${updates.join(', ')}
      WHERE repository_id = $${params.length - 1} AND version = $${params.length}
      RETURNING id, repository_id, version, name, changelog, is_latest, created_at
      `,
      params
    );

    return result.rows[0] ? mapRelease(result.rows[0]) : null;
  }

  async deleteRelease(repositoryId: string, version: string): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      `DELETE FROM repository_releases WHERE repository_id = $1 AND version = $2 RETURNING id`,
      [repositoryId, version]
    );
    return result.rows.length > 0;
  }

  async updatePrompt(input: UpdatePromptInput): Promise<McpPrompt | null> {
    const result = await this.db.query<PromptRow>(
      `
      UPDATE mcp_prompts
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        arguments = COALESCE($3::jsonb, arguments),
        messages = COALESCE($4::jsonb, messages),
        path_pattern = COALESCE($5, path_pattern),
        updated_at = NOW()
      WHERE repository_id = $6 AND id = $7
      RETURNING id, repository_id, release_id, name, description, arguments, messages, path_pattern, created_at, updated_at
      `,
      [
        input.name ?? null,
        input.description ?? null,
        input.arguments ? JSON.stringify(input.arguments) : null,
        input.messages ? JSON.stringify(input.messages) : null,
        input.path ?? null,
        input.repositoryId,
        input.itemId,
      ]
    );
    return result.rows[0] ? mapPrompt(result.rows[0]) : null;
  }

  async deletePrompt(repositoryId: string, itemId: string): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      `DELETE FROM mcp_prompts WHERE repository_id = $1 AND id = $2 RETURNING id`,
      [repositoryId, itemId]
    );
    return result.rows.length > 0;
  }

  async updateResource(input: UpdateResourceInput): Promise<McpResource | null> {
    const result = await this.db.query<ResourceRow>(
      `
      UPDATE mcp_resources
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        uri = COALESCE($3, uri),
        mime_type = COALESCE($4, mime_type),
        path_pattern = COALESCE($5, path_pattern),
        updated_at = NOW()
      WHERE repository_id = $6 AND id = $7
      RETURNING id, repository_id, release_id, name, description, uri, mime_type, path_pattern, created_at, updated_at
      `,
      [
        input.name ?? null,
        input.description ?? null,
        input.uri ?? null,
        input.mimeType ?? null,
        input.path ?? null,
        input.repositoryId,
        input.itemId,
      ]
    );
    return result.rows[0] ? mapResource(result.rows[0]) : null;
  }

  async deleteResource(repositoryId: string, itemId: string): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      `DELETE FROM mcp_resources WHERE repository_id = $1 AND id = $2 RETURNING id`,
      [repositoryId, itemId]
    );
    return result.rows.length > 0;
  }

  async updateTool(input: UpdateToolInput): Promise<McpTool | null> {
    const result = await this.db.query<ToolRow>(
      `
      UPDATE mcp_tools
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        input_schema = COALESCE($3::jsonb, input_schema),
        execute = COALESCE($4, execute),
        path_pattern = COALESCE($5, path_pattern),
        updated_at = NOW()
      WHERE repository_id = $6 AND id = $7
      RETURNING id, repository_id, release_id, name, description, input_schema, execute, path_pattern, created_at, updated_at
      `,
      [
        input.name ?? null,
        input.description ?? null,
        input.inputSchema ? JSON.stringify(input.inputSchema) : null,
        input.execute ?? null,
        input.path ?? null,
        input.repositoryId,
        input.itemId,
      ]
    );
    return result.rows[0] ? mapTool(result.rows[0]) : null;
  }

  async deleteTool(repositoryId: string, itemId: string): Promise<boolean> {
    const result = await this.db.query<{ id: string }>(
      `DELETE FROM mcp_tools WHERE repository_id = $1 AND id = $2 RETURNING id`,
      [repositoryId, itemId]
    );
    return result.rows.length > 0;
  }

  async listSyncTargets(repositoryId?: string): Promise<SyncTarget[]> {
    const params: unknown[] = [];
    let whereSql = `
      WHERE r.sync_enabled = true
        AND r.github_owner IS NOT NULL
        AND r.github_repo IS NOT NULL
    `;

    if (repositoryId) {
      params.push(repositoryId);
      whereSql += ` AND r.id = $${params.length}`;
    }

    const result = await this.db.query<SyncTargetRow>(
      `
      SELECT r.id, r.github_owner, r.github_repo, COALESCE(r.default_branch, 'main') AS default_branch
      FROM repositories r
      ${whereSql}
      ORDER BY r.updated_at DESC
      `,
      params
    );

    return result.rows.map((row) => ({
      repositoryId: row.id,
      githubOwner: row.github_owner,
      githubRepo: row.github_repo,
      defaultBranch: row.default_branch,
    }));
  }

  async recordSyncStatus(input: RecordSyncStatusInput): Promise<void> {
    await this.db.query(
      `
      INSERT INTO repo_sync_status (
        repository_id, status, commit_sha, error, triggered_by, synced_at
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      `,
      [input.repositoryId, input.status, input.commitSha, input.error, input.triggeredBy]
    );
  }

  async assignRepositoryAuthorByName(repositoryId: string, authorName: string): Promise<void> {
    const existing = await this.db.query<{ id: string }>(
      `SELECT id FROM authors WHERE name = $1 LIMIT 1`,
      [authorName]
    );

    let authorId = existing.rows[0]?.id;
    if (!authorId) {
      const created = await this.db.query<{ id: string }>(
        `INSERT INTO authors (name) VALUES ($1) RETURNING id`,
        [authorName]
      );
      authorId = created.rows[0]!.id;
    }

    await this.db.query(
      `UPDATE repositories SET author_id = $1, updated_at = NOW() WHERE id = $2`,
      [authorId, repositoryId]
    );
  }

  async upsertRelease(input: {
    repositoryId: string;
    version: string;
    name?: string;
    changelog?: string;
  }): Promise<RepositoryRelease> {
    await this.db.query(
      `UPDATE repository_releases SET is_latest = false WHERE repository_id = $1`,
      [input.repositoryId]
    );

    const result = await this.db.query<ReleaseRow>(
      `
      INSERT INTO repository_releases (repository_id, version, name, changelog, is_latest)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT (repository_id, version) DO UPDATE
      SET
        name = EXCLUDED.name,
        changelog = EXCLUDED.changelog,
        is_latest = true
      RETURNING id, repository_id, version, name, changelog, is_latest, created_at
      `,
      [input.repositoryId, input.version, input.name ?? null, input.changelog ?? null]
    );

    return mapRelease(result.rows[0]!);
  }

  async clearReleaseItems(repositoryId: string, releaseId: string): Promise<void> {
    await this.db.query(
      `DELETE FROM mcp_prompts WHERE repository_id = $1 AND release_id = $2`,
      [repositoryId, releaseId]
    );
    await this.db.query(
      `DELETE FROM mcp_resources WHERE repository_id = $1 AND release_id = $2`,
      [repositoryId, releaseId]
    );
    await this.db.query(
      `DELETE FROM mcp_tools WHERE repository_id = $1 AND release_id = $2`,
      [repositoryId, releaseId]
    );
  }
}
