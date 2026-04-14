# UI/UX Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the frontend presentation to match `DESIGN.md` across the shared layout, home page, docs page, and repository detail page without changing routes, core content, or existing behaviors.

**Architecture:** Consolidate the redesign around a single global visual system in `src/styles.css`, then update each page component to consume that system with page-specific hero, section, card, and control structures. Keep data flow and API usage unchanged while replacing the current theme-toggle-based styling with section-level light/dark rhythm and consistent interaction states.

**Tech Stack:** React 19, React Router 7, TypeScript, Vite, existing i18n provider, utility-style class names backed by global CSS

---

## File Structure

- Modify: `src/styles.css`
  - Replace the minimal global stylesheet with the design tokens, shared layout primitives, typography, button styles, card styles, section wrappers, and responsive rules needed by all pages.
- Modify: `src/components/Layout.tsx`
  - Remove dark mode state/effects and rebuild the header/footer around the new shell, nav, language switcher, and content framing.
- Modify: `src/pages/HomePage.tsx`
  - Recompose the page into a dark hero search area plus a light results section while preserving current search logic and result rendering.
- Modify: `src/pages/DocsPage.tsx`
  - Reframe documentation into clearer intro, content sections, and example cards using the shared design system.
- Modify: `src/components/ExpandableCode.tsx`
  - Update the expandable code container so detail-page code blocks visually match the new documentation and repository card styling.
- Modify: `src/pages/RepositoryDetailPage.tsx`
  - Rebuild the detail page shell, hero/meta areas, release controls, install CTA presentation, side panels, and MCP item cards without changing behavior.
- Optional modify: `src/i18n/messages.ts`
  - Only if the refreshed UI needs small wording refinements for labels or state copy.

## Task 1: Establish The Global Visual System

**Files:**
- Modify: `src/styles.css`
- Modify: `src/components/Layout.tsx`
- Test: `package.json` scripts `npm run typecheck` and `npm run build`

- [ ] **Step 1: Write the failing shell snapshot mentally and identify what must disappear**

Current shell behavior to remove:

```tsx
const [isDark, setIsDark] = useState(true);

useEffect(() => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}, [isDark]);
```

Expected failure condition after deleting this logic: `Layout.tsx` will no longer compile until the header actions and root wrappers are rewritten without `isDark`, `setIsDark`, and `aria.toggleDarkMode`.

- [ ] **Step 2: Remove theme-toggle state and rebuild the top-level shell in `Layout.tsx`**

Replace the old shell structure with a fixed glass nav, stable page wrapper, and quieter footer:

```tsx
export function Layout({ children }: LayoutProps) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="shell-container site-header__inner">
          <div className="site-brand">
            <span className="material-icons site-brand__mark">hub</span>
            <Link to="/" className="site-brand__link">
              {t('brand.name')}
            </Link>
          </div>

          <nav className="site-nav" aria-label="Primary">
            <Link className="site-nav__link" to="/">{t('nav.explore')}</Link>
            <Link className="site-nav__link" to="/docs">{t('nav.documentation')}</Link>
          </nav>

          <div className="site-header__actions">
            <div className="locale-switch" role="group" aria-label="Language switcher">
              <button
                type="button"
                onClick={() => setLocale('en')}
                className={locale === 'en' ? 'locale-switch__button is-active' : 'locale-switch__button'}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLocale('zh')}
                className={locale === 'zh' ? 'locale-switch__button is-active' : 'locale-switch__button'}
              >
                中文
              </button>
            </div>

            <a
              aria-label={t('aria.githubRepository')}
              className="icon-link"
              href="https://github.com/page-mcp-sdk"
              rel="noopener noreferrer"
              target="_blank"
            >
              <svg className="icon-link__svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
              </svg>
            </a>
          </div>
        </div>
      </header>

      <div className="site-main">{children}</div>

      <footer className="site-footer">
        <div className="shell-container site-footer__inner">
          <div className="site-footer__brand">
            <span className="material-icons site-footer__mark">hub</span>
            <span>{t('footer.copyright')}</span>
          </div>
          <div className="site-footer__links">
            <a href="#">{t('footer.terms')}</a>
            <a href="#">{t('footer.privacy')}</a>
            <a href="#">{t('footer.security')}</a>
            <a href="#">{t('footer.status')}</a>
            <Link to="/docs">{t('footer.docs')}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

- [ ] **Step 3: Replace `src/styles.css` with the shared design system**

Add the global tokens, typography, shell, button, card, section, form, and responsive primitives that the updated pages will consume:

```css
:root {
  --color-black: #000000;
  --color-surface: #f5f5f7;
  --color-surface-elevated: #ffffff;
  --color-ink: #1d1d1f;
  --color-ink-muted: rgba(29, 29, 31, 0.72);
  --color-ink-soft: rgba(29, 29, 31, 0.56);
  --color-white: #ffffff;
  --color-blue: #0071e3;
  --color-blue-dark: #0066cc;
  --color-blue-on-dark: #2997ff;
  --color-border-soft: rgba(29, 29, 31, 0.08);
  --shadow-card: 0 18px 48px rgba(0, 0, 0, 0.08);
  --radius-card: 24px;
  --radius-control: 999px;
  --container-width: 1120px;
  --font-display: "SF Pro Display", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
  --font-text: "SF Pro Text", "SF Pro Icons", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

body {
  margin: 0;
  background: var(--color-surface);
  color: var(--color-ink);
  font-family: var(--font-text);
}

.shell-container {
  width: min(var(--container-width), calc(100% - 32px));
  margin: 0 auto;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: saturate(180%) blur(20px);
}

.site-button,
.site-button--secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 20px;
  border-radius: var(--radius-control);
  font: 400 17px/1 var(--font-text);
  text-decoration: none;
  transition: background-color 160ms ease, color 160ms ease, box-shadow 160ms ease, transform 160ms ease;
}

.site-button {
  background: var(--color-blue);
  color: var(--color-white);
}

.site-button--secondary {
  border: 1px solid var(--color-blue-dark);
  color: var(--color-blue-dark);
  background: transparent;
}

.page-section--dark {
  background: var(--color-black);
  color: var(--color-white);
}

.page-section--light {
  background: var(--color-surface);
  color: var(--color-ink);
}
```

- [ ] **Step 4: Run typecheck to catch missing class/state references early**

Run: `npm run typecheck`

Expected: PASS with no remaining references to `isDark`, `setIsDark`, `dark:` class assumptions, or removed aria keys.

- [ ] **Step 5: Commit the shell foundation**

```bash
git add src/styles.css src/components/Layout.tsx
git commit -m "feat: rebuild app shell with unified visual system"
```

## Task 2: Refresh The Home Page Search And Results Experience

**Files:**
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/styles.css`
- Test: `npm run typecheck`

- [ ] **Step 1: Write the failing UI expectation for the homepage**

Target render structure to introduce:

```tsx
<main className="home-page">
  <section className="page-section page-section--dark home-hero">...</section>
  <section className="page-section page-section--light home-results">...</section>
</main>
```

Expected failure condition before implementation: these classes and wrappers do not exist yet, so the page still renders as a single flat container without hero/result separation.

- [ ] **Step 2: Recompose `HomePage.tsx` into hero search + results grid while preserving logic**

Keep `loadData`, `onSubmit`, and `onReset`, but replace the JSX with a two-section layout:

```tsx
return (
  <main className="home-page">
    <section className="page-section page-section--dark home-hero">
      <div className="shell-container home-hero__inner">
        <div className="eyebrow">MCP Marketplace</div>
        <h1 className="hero-title">{t('home.hero.title')}</h1>
        <p className="hero-copy">{t('home.hero.subtitle')}</p>

        <form className="search-panel" onSubmit={onSubmit}>
          <label className="search-panel__field search-panel__field--select">
            <span className="search-panel__label">{t('home.search.type.name')}</span>
            <select
              value={searchType}
              onChange={(event) => setSearchType(event.target.value as 'name' | 'domain')}
              className="site-select"
            >
              <option value="name">{t('home.search.type.name')}</option>
              <option value="domain">{t('home.search.type.domain')}</option>
            </select>
          </label>

          <label className="search-panel__field search-panel__field--input">
            <span className="search-panel__label">{t('home.search.submit')}</span>
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="site-input"
              placeholder={
                searchType === 'name'
                  ? t('home.search.placeholder.name')
                  : t('home.search.placeholder.domain')
              }
              type="text"
            />
          </label>

          <div className="search-panel__actions">
            <button type="submit" className="site-button">{t('home.search.submit')}</button>
            <button type="button" onClick={onReset} className="site-button--secondary">
              {t('home.search.reset')}
            </button>
          </div>
        </form>
      </div>
    </section>

    <section className="page-section page-section--light home-results">
      <div className="shell-container">
        <div className="section-heading">
          <h2>{t('home.featured.title')}</h2>
        </div>

        {loading ? <p className="state-message">{t('home.loading')}</p> : null}
        {error ? <p className="state-message state-message--error">{error}</p> : null}

        <div className="repository-grid">
          {items.map((repo) => (
            <Link to={`/repositories/${repo.id}`} key={repo.id} className="repository-card">
              <div className="repository-card__header">
                <h3>{repo.name}</h3>
              </div>
              <p className="repository-card__description">
                {repo.description ?? t('home.repository.noDescription')}
              </p>
              <div className="repository-card__meta">...</div>
              <div className="repository-card__footer">...</div>
            </Link>
          ))}
        </div>

        {items.length === 0 && !loading && !error ? (
          <div className="empty-state">
            <span className="material-icons empty-state__icon">search_off</span>
            <p>{t('home.empty')}</p>
          </div>
        ) : null}
      </div>
    </section>
  </main>
);
```

- [ ] **Step 3: Add homepage-specific shared styles in `src/styles.css`**

Define the page-level layout, search panel, repository grid, metadata chips, and state blocks:

```css
.home-hero {
  padding: 88px 0 64px;
}

.hero-title {
  margin: 0;
  font: 600 clamp(2.5rem, 6vw, 4.5rem) / 1.07 var(--font-display);
  letter-spacing: -0.03em;
}

.search-panel {
  display: grid;
  gap: 16px;
  margin-top: 32px;
  padding: 24px;
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.06);
}

.repository-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.repository-card {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100%;
  padding: 28px;
  border-radius: var(--radius-card);
  background: var(--color-surface-elevated);
  color: inherit;
  text-decoration: none;
  box-shadow: var(--shadow-card);
}

.repository-chip {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: var(--radius-control);
  background: rgba(0, 113, 227, 0.08);
  color: var(--color-blue-dark);
}
```

- [ ] **Step 4: Run typecheck after the homepage rewrite**

Run: `npm run typecheck`

Expected: PASS with `HomePage.tsx` using the new shell classes and no stale dark-mode utility references.

- [ ] **Step 5: Commit the homepage refresh**

```bash
git add src/pages/HomePage.tsx src/styles.css
git commit -m "feat: redesign homepage search and repository cards"
```

## Task 3: Rebuild The Documentation Page For Readability

**Files:**
- Modify: `src/pages/DocsPage.tsx`
- Modify: `src/styles.css`
- Test: `npm run typecheck`

- [ ] **Step 1: Write the failing target structure for docs**

Target page skeleton:

```tsx
<main className="docs-page">
  <section className="page-section page-section--light docs-intro">...</section>
  <section className="page-section page-section--light docs-content">...</section>
</main>
```

Expected failure condition before implementation: the current docs page is still a simple stacked text document with no elevated section or example-card structure.

- [ ] **Step 2: Rewrite `DocsPage.tsx` into a premium documentation layout**

Preserve all translated content keys, but wrap them in richer sections and example blocks:

```tsx
return (
  <main className="docs-page">
    <section className="page-section page-section--light docs-intro">
      <div className="shell-container docs-intro__inner">
        <div className="eyebrow">Documentation</div>
        <h1 className="page-title">{t('docs.title')}</h1>
        <p className="page-copy">{t('docs.subtitle')}</p>
      </div>
    </section>

    <section className="page-section page-section--light docs-content">
      <div className="shell-container docs-layout">
        <section className="docs-section">
          <h2>{t('docs.user.title')}</h2>
          <div className="docs-block">...</div>
          <div className="docs-block">...</div>
        </section>

        <section className="docs-section">
          <h2>{t('docs.dev.title')}</h2>
          <div className="docs-example-grid">
            <article className="docs-example-card">
              <div className="docs-example-card__label">{t('docs.dev.mcpDef.prompt')}</div>
              <pre>{t('docs.dev.mcpDef.example.prompt')}</pre>
            </article>
          </div>
        </section>
      </div>
    </section>
  </main>
);
```

- [ ] **Step 3: Add the documentation-specific styles**

```css
.docs-layout {
  display: grid;
  gap: 40px;
  max-width: 980px;
}

.docs-section {
  display: grid;
  gap: 24px;
  padding: 32px;
  border-radius: 28px;
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow-card);
}

.docs-block {
  display: grid;
  gap: 12px;
}

.docs-example-grid {
  display: grid;
  gap: 20px;
}

.docs-example-card {
  padding: 24px;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid var(--color-border-soft);
}

.docs-example-card pre {
  margin: 0;
  padding: 18px;
  overflow-x: auto;
  border-radius: 18px;
  background: #f0f1f5;
}
```

- [ ] **Step 4: Run typecheck after the docs rewrite**

Run: `npm run typecheck`

Expected: PASS with docs content using only existing translation keys and no broken JSX structure.

- [ ] **Step 5: Commit the docs refresh**

```bash
git add src/pages/DocsPage.tsx src/styles.css
git commit -m "feat: redesign documentation page layout"
```

## Task 4: Upgrade Expandable Code And Repository Detail Presentation

**Files:**
- Modify: `src/components/ExpandableCode.tsx`
- Modify: `src/pages/RepositoryDetailPage.tsx`
- Modify: `src/styles.css`
- Optional modify: `src/i18n/messages.ts`
- Test: `npm run typecheck`

- [ ] **Step 1: Write the failing target shell for detail page density**

Target composition:

```tsx
<main className="repository-page">
  <section className="page-section page-section--light repository-hero">...</section>
  <section className="page-section page-section--light repository-content">...</section>
</main>
```

Expected failure condition before implementation: the current detail page still relies on old bordered cards, dark-mode utility classes, and a less structured top section.

- [ ] **Step 2: Update `ExpandableCode.tsx` to match the new design system**

Replace the current border-heavy dark/light toggle styling with a neutral code disclosure component:

```tsx
export function ExpandableCode({ label, content }: ExpandableCodeProps) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <div className={open ? 'expandable-code is-open' : 'expandable-code'}>
      <div className="expandable-code__header">
        <span className="expandable-code__label">{label}</span>
        <button
          className="expandable-code__toggle"
          onClick={() => setOpen((value) => !value)}
          type="button"
        >
          {open ? t('common.hide') : t('common.show')}
        </button>
      </div>
      {open ? (
        <pre className="expandable-code__body">
          <code>{content}</code>
        </pre>
      ) : null}
    </div>
  );
}
```

- [ ] **Step 3: Rebuild `RepositoryDetailPage.tsx` around a clearer hero, side panel, and content sections**

Keep all data fetching, install logic, toast timing, and release-loading logic. Replace the JSX with structured sections:

```tsx
return (
  <main className="repository-page">
    <section className="page-section page-section--light repository-hero">
      <div className="shell-container repository-hero__inner">
        <Link to="/" className="back-link">
          <span className="material-icons">arrow_back</span>
          {t('repo.backToList')}
        </Link>

        <div className="repository-hero__summary">
          <div className="repository-hero__copy">
            <h1 className="page-title">{detail?.name ?? t('repo.title.fallback')}</h1>
            {selectedRelease ? <span className="version-pill">{selectedRelease}</span> : null}
            <p className="page-copy">{detail?.description ?? t('repo.description.empty')}</p>
          </div>

          <div className="repository-hero__actions">
            <button
              onClick={handleInstall}
              disabled={installDisabled}
              className={installDisabled ? 'site-button is-disabled' : 'site-button'}
            >
              <span className="material-icons">{installActionIcon}</span>
              {installActionLabel}
            </button>
            {toast ? <div className={`toast toast--${toast.type}`}>{toast.message}</div> : null}
          </div>
        </div>
      </div>
    </section>

    <section className="page-section page-section--light repository-content">
      <div className="shell-container repository-layout">
        <aside className="repository-sidebar">...</aside>
        <div className="repository-content__main">
          <section className="repository-section">...</section>
          <section className="repository-section">...</section>
          <section className="repository-section">...</section>
        </div>
      </div>
    </section>
  </main>
);
```

- [ ] **Step 4: Replace old detail/card styling with shared repository patterns in `src/styles.css`**

```css
.repository-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(280px, 0.8fr);
  gap: 24px;
}

.repository-sidebar,
.repository-section,
.mcp-card {
  border-radius: 28px;
  background: var(--color-surface-elevated);
  box-shadow: var(--shadow-card);
}

.repository-section {
  padding: 28px;
}

.mcp-card {
  padding: 24px;
}

.expandable-code {
  margin-top: 18px;
  border-radius: 20px;
  background: #f0f1f5;
  overflow: hidden;
}

.expandable-code__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
}

.expandable-code__body {
  margin: 0;
  padding: 18px;
  overflow-x: auto;
  border-top: 1px solid rgba(29, 29, 31, 0.08);
}
```

- [ ] **Step 5: Run typecheck after the detail page rewrite**

Run: `npm run typecheck`

Expected: PASS with repository detail logic unchanged and all new class names resolved.

- [ ] **Step 6: Commit the repository/detail refresh**

```bash
git add src/components/ExpandableCode.tsx src/pages/RepositoryDetailPage.tsx src/styles.css src/i18n/messages.ts
git commit -m "feat: redesign repository detail experience"
```

## Task 5: Build, Visual QA, And Responsive Verification

**Files:**
- Modify: `src/styles.css`
- Modify: `src/components/Layout.tsx`
- Modify: `src/pages/HomePage.tsx`
- Modify: `src/pages/DocsPage.tsx`
- Modify: `src/pages/RepositoryDetailPage.tsx`
- Modify: `src/components/ExpandableCode.tsx`
- Optional modify: `src/i18n/messages.ts`
- Test: `npm run build`

- [ ] **Step 1: Run a full production build**

Run: `npm run build`

Expected: PASS with TypeScript compilation and Vite build completing successfully.

- [ ] **Step 2: Run a local preview for manual QA**

Run: `npm run dev`

Expected: Vite starts successfully and prints a local URL such as `http://localhost:5173/`.

- [ ] **Step 3: Manually verify the home page in both locales**

Check these behaviors:

```text
1. Search type changes placeholder text correctly.
2. Submit still fetches repository results.
3. Reset clears the field and reloads default results.
4. Loading, empty, and error states remain readable.
5. Card layout stays usable on mobile and desktop widths.
```

- [ ] **Step 4: Manually verify docs and repository detail page behavior**

Check these behaviors:

```text
1. Docs page sections remain readable in English and Chinese.
2. Example code blocks scroll horizontally without layout breakage.
3. Release selection still reloads content on the detail page.
4. Install button label, disabled state, and toast state still behave correctly.
5. Expandable code opens and closes without layout overflow.
```

- [ ] **Step 5: Fix any responsive or spacing regressions discovered during QA**

Likely adjustments live in `src/styles.css`:

```css
@media (max-width: 900px) {
  .repository-layout,
  .repository-grid {
    grid-template-columns: 1fr;
  }

  .site-header__inner,
  .search-panel__actions {
    flex-direction: column;
    align-items: stretch;
  }
}
```

- [ ] **Step 6: Re-run the build after final polish**

Run: `npm run build`

Expected: PASS after the responsive fixes.

- [ ] **Step 7: Commit the verified final polish**

```bash
git add src/styles.css src/components/Layout.tsx src/pages/HomePage.tsx src/pages/DocsPage.tsx src/pages/RepositoryDetailPage.tsx src/components/ExpandableCode.tsx src/i18n/messages.ts
git commit -m "feat: finalize UI refresh polish and responsiveness"
```
