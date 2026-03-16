# Documentation Page Design

## Goal

Add a global Documentation page linked from the site navigation. The page serves both end users and developers with clear, market-aligned guidance.

## Scope

- Frontend-only: add a `/docs` route and a new documentation page.
- Update navigation links to point to `/docs`.
- Content sections:
  - For users: plugin installation, marketplace repository install.
  - For developers: MCP resource definition (based on `@page-mcp/protocol`) and repository file layout.

Out of scope:
- Backend changes
- Authenticated content
- Multi-language support

## Architecture

Add a new `DocsPage` React component, register it in `App` routing, and connect existing "Documentation/Docs" links in `Layout` to `/docs`. The page content is static and does not require API calls or state.

## Components

- `DocsPage` (new): single page with two top-level sections and structured subsections.
- `Layout` (existing): update nav/footer links to use internal routing.
- `App` (existing): register `/docs` route.

## Content Structure

1. Page header: title + short summary.
2. Section: 面向使用者
   - 安装插件
   - 安装市场的仓库
3. Section: 面向开发者
   - MCP 资源定义规范（提示基于 `@page-mcp/protocol`，列出关键字段与示例）
   - MCP 仓库文件规范（固定文件名）
     - `repository.json`
     - `mcp/prompts.json`
     - `mcp/resources.json`
     - `mcp/tools.json`

## Data Flow

No data flow; static content only.

## Error Handling

None required.

## Testing

Frontend typecheck and build:
- `cd frontend && bunx tsc -b`
- `cd frontend && bun run build`
