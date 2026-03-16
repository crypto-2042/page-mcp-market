# Documentation Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a global Documentation page at `/docs` with user and developer sections, and wire navigation links to it.

**Architecture:** Introduce a new `DocsPage` React component with static content, register a `/docs` route in `App`, and update `Layout` links to use the internal route. No backend changes or API calls.

**Tech Stack:** React, TypeScript, Vite, Tailwind-style utility classes (existing styling approach).

---

### Task 1: Add Docs page component

**Files:**
- Create: `frontend/src/pages/DocsPage.tsx`

**Step 1: Write the failing test**

Frontend has no test framework; use typecheck/build as the red-green loop by adding a route import that currently does not exist.

**Step 2: Run test to verify it fails**

Run: `cd frontend && bunx tsc -b`  
Expected: FAIL with missing module `DocsPage`.

**Step 3: Write minimal implementation**

Create `DocsPage.tsx` with static content:
- Page header (title + summary)
- Section: 面向使用者
  - 安装插件
  - 安装市场的仓库
- Section: 面向开发者
  - MCP 资源定义规范（基于 `@page-mcp/protocol`，列关键字段与示例）
  - MCP 仓库文件规范（文件名列表）

**Step 4: Run test to verify it passes**

Run: `cd frontend && bunx tsc -b`  
Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/pages/DocsPage.tsx
git commit -m "feat(frontend): add documentation page"
```

### Task 2: Wire routing and navigation links

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/Layout.tsx`

**Step 1: Write the failing test**

Update `App.tsx` to reference `DocsPage` route and update `Layout` links to point to `/docs`, then run typecheck before creating the component or route.

**Step 2: Run test to verify it fails**

Run: `cd frontend && bunx tsc -b`  
Expected: FAIL until `DocsPage` exists and imports resolve.

**Step 3: Write minimal implementation**

- Add `<Route path="/docs" element={<DocsPage />} />`
- Change nav/footer `Documentation/Docs` links to `Link` or `to="/docs"`

**Step 4: Run test to verify it passes**

Run: `cd frontend && bunx tsc -b`  
Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/App.tsx frontend/src/components/Layout.tsx
git commit -m "feat(frontend): route docs page and update nav links"
```

### Task 3: Verify build output

**Files:**
- Modify: none (unless build errors reveal issues)

**Step 1: Run build**

Run: `cd frontend && bun run build`  
Expected: PASS.

**Step 2: Commit any fixes if needed**

```bash
git add -A
git commit -m "fix(frontend): resolve docs page build issues"
```
