# Frontend i18n Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add lightweight EN/中文 i18n across all frontend UI with a manual toggle in the header, defaulting to English and persisted in localStorage. Remove the “Publish Skill” nav item.

**Architecture:** Introduce a small i18n layer (`messages.ts` + `I18nProvider` + `useI18n`) and wrap the app. Replace all UI copy with `t(key)` and add a top-right language switcher. Persist selected locale in `localStorage`.

**Tech Stack:** React, TypeScript, Vite.

---

### Task 1: Add i18n core (messages + provider + hook)

**Files:**
- Create: `frontend/src/i18n/messages.ts`
- Create: `frontend/src/i18n/I18nProvider.tsx`
- Modify: `frontend/src/App.tsx`

**Step 1: Write the failing test**

Reference the new provider in `App.tsx` before it exists to force a typecheck failure.

**Step 2: Run test to verify it fails**

Run: `cd frontend && bunx tsc -b`  
Expected: FAIL with missing module.

**Step 3: Write minimal implementation**

- `messages.ts`: define `en` + `zh` dictionary and `Locale` union.
- `I18nProvider.tsx`: context with `locale`, `setLocale`, `t(key)`.
- Default to `en` unless `localStorage` provides `mcp_market_locale`.
- `t(key)` returns key if missing.
- Wrap `App` routes in `I18nProvider`.

**Step 4: Run test to verify it passes**

Run: `cd frontend && bunx tsc -b`  
Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/i18n/messages.ts frontend/src/i18n/I18nProvider.tsx frontend/src/App.tsx
git commit -m "feat(frontend): add i18n provider and messages"
```

### Task 2: Replace Layout copy and add language switcher

**Files:**
- Modify: `frontend/src/components/Layout.tsx`
- Modify: `frontend/src/i18n/messages.ts`

**Step 1: Write the failing test**

Update `Layout.tsx` to use `t()` for nav/footer text and add the toggle, but don’t add keys yet.

**Step 2: Run test to verify it fails**

Run: `cd frontend && bunx tsc -b`  
Expected: FAIL due to missing imports/keys if referenced.

**Step 3: Write minimal implementation**

- Add language switcher in header (EN/中文).
- Remove “Publish Skill” from nav.
- Replace nav/footer strings with `t(key)`.
- Add corresponding keys to `messages.ts`.

**Step 4: Run test to verify it passes**

Run: `cd frontend && bunx tsc -b`  
Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/components/Layout.tsx frontend/src/i18n/messages.ts
git commit -m "feat(frontend): localize layout and add language toggle"
```

### Task 3: Localize HomePage and RepositoryDetailPage

**Files:**
- Modify: `frontend/src/pages/HomePage.tsx`
- Modify: `frontend/src/pages/RepositoryDetailPage.tsx`
- Modify: `frontend/src/i18n/messages.ts`

**Step 1: Write the failing test**

Switch hard-coded strings to `t(key)` in both pages without adding all keys yet.

**Step 2: Run test to verify it fails**

Run: `cd frontend && bunx tsc -b`  
Expected: FAIL until keys are added.

**Step 3: Write minimal implementation**

- Replace all user-visible strings with `t(key)`.
- Add keys in `messages.ts` for both pages.

**Step 4: Run test to verify it passes**

Run: `cd frontend && bunx tsc -b`  
Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/pages/HomePage.tsx frontend/src/pages/RepositoryDetailPage.tsx frontend/src/i18n/messages.ts
git commit -m "feat(frontend): localize home and repository detail pages"
```

### Task 4: Localize DocsPage

**Files:**
- Modify: `frontend/src/pages/DocsPage.tsx`
- Modify: `frontend/src/i18n/messages.ts`

**Step 1: Write the failing test**

Replace strings with `t(key)` but don’t add keys yet.

**Step 2: Run test to verify it fails**

Run: `cd frontend && bunx tsc -b`  
Expected: FAIL until keys are added.

**Step 3: Write minimal implementation**

- Replace all DocsPage strings with `t(key)`.
- Add keys in `messages.ts`.

**Step 4: Run test to verify it passes**

Run: `cd frontend && bunx tsc -b`  
Expected: PASS.

**Step 5: Commit**

```bash
git add frontend/src/pages/DocsPage.tsx frontend/src/i18n/messages.ts
git commit -m "feat(frontend): localize docs page"
```

### Task 5: Final verification

**Files:**
- Modify: any files required by fixes discovered during verification

**Step 1: Run typecheck and build**

Run:
- `cd frontend && bunx tsc -b`
- `cd frontend && bun run build`

Expected: PASS.

**Step 2: Commit any fixes**

```bash
git add -A
git commit -m "fix(frontend): resolve i18n build issues"
```
