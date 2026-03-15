#!/usr/bin/env bash
set -euo pipefail

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required"
  exit 1
fi

BASE_URL="${BASE_URL:-http://localhost:3000/api/v1}"

echo "[1/10] health"
curl -fsS "$BASE_URL/health" >/dev/null

echo "[2/10] create repository"
REPO_JSON="$(curl -fsS -X POST "$BASE_URL/repositories" \
  -H 'content-type: application/json' \
  -d '{
    "name":"smoke-repo",
    "siteDomain":"https://smoke.example.com/",
    "authorId":"33333333-3333-3333-3333-333333333333",
    "authorName":"Smoke Bot"
  }')"
REPO_ID="$(echo "$REPO_JSON" | jq -r '.id')"

echo "[3/10] create release"
curl -fsS -X POST "$BASE_URL/repositories/$REPO_ID/releases" \
  -H 'content-type: application/json' \
  -d '{"version":"1.0.0","name":"stable"}' >/dev/null

echo "[4/10] create mcp item"
MCP_JSON="$(curl -fsS -X POST "$BASE_URL/repositories/$REPO_ID/mcp-items" \
  -H 'content-type: application/json' \
  -d '{
    "release":"1.0.0",
    "name":"search-products",
    "itemType":"tool",
    "manifest":{},
    "pathPattern":"^/products/.+$"
  }')"
MCP_ID="$(echo "$MCP_JSON" | jq -r '.id')"

echo "[5/10] create skill item"
SKILL_JSON="$(curl -fsS -X POST "$BASE_URL/repositories/$REPO_ID/skill-items" \
  -H 'content-type: application/json' \
  -d '{
    "release":"1.0.0",
    "name":"checkout-flow",
    "version":"1.0.0",
    "skillMd":"# checkout-flow",
    "pathPattern":"^/checkout$"
  }')"
SKILL_ID="$(echo "$SKILL_JSON" | jq -r '.id')"

echo "[6/10] query content"
curl -fsS "$BASE_URL/repositories/$REPO_ID/content?path=/products/123" | jq -e '.mcp | length >= 1' >/dev/null

echo "[7/10] patch repository"
curl -fsS -X PATCH "$BASE_URL/repositories/$REPO_ID" \
  -H 'content-type: application/json' \
  -d '{"name":"smoke-repo-updated"}' | jq -e '.name == "smoke-repo-updated"' >/dev/null

echo "[8/10] patch items"
curl -fsS -X PATCH "$BASE_URL/repositories/$REPO_ID/mcp-items/$MCP_ID" \
  -H 'content-type: application/json' \
  -d '{"name":"search-products-v2"}' | jq -e '.name == "search-products-v2"' >/dev/null
curl -fsS -X PATCH "$BASE_URL/repositories/$REPO_ID/skill-items/$SKILL_ID" \
  -H 'content-type: application/json' \
  -d '{"name":"checkout-flow-v2"}' | jq -e '.name == "checkout-flow-v2"' >/dev/null

echo "[9/10] rankings + search"
curl -fsS "$BASE_URL/repositories/rankings?limit=5" | jq -e '.items | type == "array"' >/dev/null
curl -fsS "$BASE_URL/repositories/search?q=smoke&page=1&pageSize=10" | jq -e '.items | type == "array"' >/dev/null

echo "[10/10] cleanup"
curl -fsS -X DELETE "$BASE_URL/repositories/$REPO_ID/mcp-items/$MCP_ID" >/dev/null
curl -fsS -X DELETE "$BASE_URL/repositories/$REPO_ID/skill-items/$SKILL_ID" >/dev/null
curl -fsS -X DELETE "$BASE_URL/repositories/$REPO_ID/releases/1.0.0" >/dev/null
curl -fsS -X DELETE "$BASE_URL/repositories/$REPO_ID" >/dev/null

echo "smoke test passed"
