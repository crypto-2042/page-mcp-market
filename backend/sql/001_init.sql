CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  site_domain TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  stars_count INT NOT NULL DEFAULT 0,
  usage_count INT NOT NULL DEFAULT 0,
  github_owner TEXT,
  github_repo TEXT,
  default_branch TEXT NOT NULL DEFAULT 'main',
  sync_enabled BOOLEAN NOT NULL DEFAULT false,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT repositories_author_domain_name_unique UNIQUE (author_id, site_domain, name)
);

CREATE TABLE IF NOT EXISTS repository_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  name TEXT,
  changelog TEXT,
  is_latest BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT repository_release_version_unique UNIQUE (repository_id, version)
);

CREATE TABLE IF NOT EXISTS repo_sync_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  commit_sha TEXT,
  error TEXT,
  triggered_by TEXT NOT NULL,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcp_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  release_id UUID NOT NULL REFERENCES repository_releases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  arguments JSONB NOT NULL DEFAULT '[]'::jsonb,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  path_pattern TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcp_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  release_id UUID NOT NULL REFERENCES repository_releases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  uri TEXT NOT NULL,
  mime_type TEXT,
  path_pattern TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mcp_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id UUID NOT NULL REFERENCES repositories(id) ON DELETE CASCADE,
  release_id UUID NOT NULL REFERENCES repository_releases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  input_schema JSONB NOT NULL DEFAULT '{}'::jsonb,
  execute TEXT NOT NULL,
  path_pattern TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_repositories_name ON repositories (name);
CREATE INDEX IF NOT EXISTS idx_repositories_domain ON repositories (site_domain);
CREATE INDEX IF NOT EXISTS idx_releases_repo_latest ON repository_releases (repository_id, is_latest);
CREATE INDEX IF NOT EXISTS idx_repo_sync_status_repo_synced_at ON repo_sync_status (repository_id, synced_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcp_prompts_repo_release ON mcp_prompts (repository_id, release_id);
CREATE INDEX IF NOT EXISTS idx_mcp_resources_repo_release ON mcp_resources (repository_id, release_id);
CREATE INDEX IF NOT EXISTS idx_mcp_tools_repo_release ON mcp_tools (repository_id, release_id);
