# Backend

Bun + TypeScript + Hono backend for repository search/detail/content/rankings.

## Requirements

- Bun >= 1.3
- PostgreSQL (managed service is recommended)

## Setup

```bash
cd backend
bun install
cp .env.example .env
```

Run DB migration manually:

```bash
psql "$DATABASE_URL" -f sql/001_init.sql
```

Or initialize schema + seed:

```bash
bash scripts/init-db.sh
```

Or directly via Bun:

```bash
bun run db:init
```

## Run

```bash
bun run dev
```

## Test

```bash
bun test
```

Real PostgreSQL integration test (requires `DATABASE_URL`):

```bash
bun run test:integration
```

End-to-end smoke test against running API (requires `jq`):

```bash
bun run smoke
```

## API

OpenAPI spec: `openapi.yaml` (includes reusable schemas and standardized error responses)

Field conventions (latest):
- Repository content/install responses use grouped `mcp` objects:
  - `mcp.prompts`
  - `mcp.resources`
  - `mcp.tools`
- `skills` are ignored in the current read/install flow.
- All MCP items include `path` for regex matching.
- MCP tools include `execute` script source.
- Sync reads from repository-root `repository.json` plus `mcp/prompts.json`, `mcp/resources.json`, `mcp/tools.json`.

- `POST /api/v1/repositories`
- `POST /api/v1/repositories/:repositoryId/releases`
- `GET /api/v1/repositories/:repositoryId/releases`
- `POST /api/v1/repositories/:repositoryId/prompts`
- `POST /api/v1/repositories/:repositoryId/resources`
- `POST /api/v1/repositories/:repositoryId/tools`
- `PATCH /api/v1/repositories/:repositoryId`
- `DELETE /api/v1/repositories/:repositoryId`
- `PATCH /api/v1/repositories/:repositoryId/releases/:version`
- `DELETE /api/v1/repositories/:repositoryId/releases/:version`
- `PATCH /api/v1/repositories/:repositoryId/prompts/:itemId`
- `DELETE /api/v1/repositories/:repositoryId/prompts/:itemId`
- `PATCH /api/v1/repositories/:repositoryId/resources/:itemId`
- `DELETE /api/v1/repositories/:repositoryId/resources/:itemId`
- `PATCH /api/v1/repositories/:repositoryId/tools/:itemId`
- `DELETE /api/v1/repositories/:repositoryId/tools/:itemId`
- `GET /api/v1/repositories/search?q=&domain=&authorId=&page=&pageSize=`
- `GET /api/v1/repositories/:repositoryId`
- `GET /api/v1/repositories/:repositoryId/install?release=`
- `GET /api/v1/repositories/:repositoryId/content?path=&release=` (`path` optional)
- `GET /api/v1/repositories/rankings?window=&limit=&domain=`

Internal (protected):
- `POST /api/internal/sync` (requires `Authorization: Bearer $SYNC_SECRET`)

## Deploy to Vercel

- Vercel project root: `backend/`
- Runtime: Bun
- Entry: `api/index.ts`
- Set `DATABASE_URL`, `SYNC_SECRET`, `GITHUB_TOKEN` in Vercel env variables.

Note: Local development uses `Bun.serve` from `src/index.ts`. Vercel uses `api/index.ts` handler.
