#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required"
  exit 1
fi

if command -v psql >/dev/null 2>&1; then
  psql "$DATABASE_URL" -f sql/001_init.sql
  psql "$DATABASE_URL" -f sql/003_sync_schema.sql
  psql "$DATABASE_URL" -f sql/004_protocol_3_1.sql
  psql "$DATABASE_URL" -f sql/002_seed.sql
else
  echo "psql not found, fallback to bun db init"
  bun run db:init
fi

echo "Database initialized with schema + seed."
