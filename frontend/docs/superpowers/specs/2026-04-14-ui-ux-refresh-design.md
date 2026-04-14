# UI/UX Refresh Design

## Summary

Refresh the frontend UI/UX of the MCP Marketplace to align with the visual system defined in `DESIGN.md`, while preserving the current product scope, page set, routes, and feature behavior.

This is a visual and interaction upgrade only. The implementation must not introduce new business features, remove existing content, or materially change the information architecture of the site.

## Goals

- Unify the entire site under the Apple-inspired visual system from `DESIGN.md`.
- Improve hierarchy, readability, and perceived product quality across all pages.
- Preserve all current page functionality and core content structures.
- Make interactive states clearer, especially around search, release selection, install actions, and expandable code.
- Improve mobile and desktop responsiveness without changing route structure.

## Non-Goals

- No new routes or pages.
- No changes to backend contracts or API payloads.
- No changes to search semantics, install semantics, or repository content semantics.
- No new content modules that change the current product scope.
- No user-controlled theme switcher.

## Constraints

- The redesign must follow `DESIGN.md` as the authoritative design source.
- The current light/dark mode toggle must be removed.
- The site must use a single brand theme with section-level black/light-gray rhythm, not a user-selectable theme.
- Existing pages remain:
  - `/`
  - `/docs`
  - `/repositories/:repositoryId`
- Existing information architecture should be preserved. Visual grouping, spacing, emphasis, and interaction treatment may change, but content should not be restructured into new product concepts.
- Existing i18n support for English and Chinese must remain intact.

## Chosen Direction

The selected direction is **Structured Premium Refresh**.

This direction keeps the current page structures and functional flows, but upgrades the interface to a more controlled, premium presentation:

- stronger page-level hero treatment
- clearer visual sectioning
- tighter typography and spacing discipline
- more deliberate CTA hierarchy
- more refined cards, panels, and code containers

This avoids the weak uplift of a conservative reskin and avoids the usability risk of a near-literal Apple landing-page translation.

## Visual System

### Theme

Adopt the Apple-inspired visual language from `DESIGN.md`:

- black hero or emphasis surfaces: `#000000`
- light content surfaces: `#f5f5f7`
- primary text on light: `#1d1d1f`
- white text on dark sections
- blue used only for interactive emphasis

The site should feel restrained and product-focused. Decorative color, large border systems, and heavy chrome should be removed.

### Typography

Typography should shift from the current generic sans presentation toward the tighter, more editorial hierarchy defined in `DESIGN.md`.

Implementation intent:

- use an SF Pro-compatible stack with appropriate system fallbacks
- tighten headline line-height
- use stronger display hierarchy for page titles and section titles
- use calmer, more readable body copy for descriptive text
- keep body copy left-aligned
- reserve blue for actionable text and buttons, not general emphasis

### Surfaces and Depth

- Use a translucent dark glass navigation bar.
- Favor solid surfaces and very limited shadow use.
- Replace many visible borders with contrast, spacing, and restrained elevation.
- Use rounded corners in the small-to-medium range only, except pill controls where the radius may be fully rounded.

## Global Layout Changes

### Header

Replace the current utility-style header with a compact sticky navigation bar that follows the design spec:

- dark translucent background
- blur/saturation treatment
- simplified navigation emphasis
- persistent brand identity
- language switch retained
- GitHub link retained
- dark mode toggle removed

The header should remain practical for navigation and not become a large marketing masthead.

### Footer

The footer should be visually quieter and more deliberate:

- cleaner spacing
- lighter information density
- stronger alignment with the overall brand system
- link treatments consistent with the rest of the site

### Shared Container Strategy

Adopt a consistent page container strategy:

- full-width page background sections
- centered content container for readable widths
- stronger vertical spacing rhythm
- responsive padding that feels premium rather than cramped

## Page-Level Design

### Home Page

#### Current Functionality to Preserve

- search by repository name or domain
- submit and reset actions
- repository list results
- empty, loading, and error states
- repository cards linking to detail pages

#### Design Treatment

The home page should become the clearest expression of the new system:

- a dark hero section introducing the marketplace and search action
- a light results section for repository discovery
- tighter grouping of search type selector, search input, and CTA buttons
- improved distinction between the primary action and the secondary reset action
- repository cards upgraded for hierarchy, scanning, and consistency

#### Card Design

Repository cards should retain the same data points, but present them with more control:

- clearer title prominence
- description with better line length and muted body tone
- metadata chips styled within the brand system
- more stable bottom row for author and score
- cleaner hover and focus behavior

#### State Design

Loading, error, and empty states should feel designed rather than incidental:

- loading state presented as integrated page feedback
- empty state aligned with the visual language
- error state visible without visually overpowering the page

### Documentation Page

#### Current Functionality to Preserve

- user-facing guidance
- developer-facing guidance
- example prompt/resource/tool definitions
- repository file convention section

#### Design Treatment

The docs page should remain a documentation page, not a marketing page. The refresh should improve clarity and reading quality:

- stronger page heading and intro hierarchy
- section blocks with more deliberate spacing
- improved list spacing and text rhythm
- example code blocks upgraded into clearer documentation cards
- code samples visually separated from explanatory text

This page should read as a premium technical document with less visual noise and better pacing.

### Repository Detail Page

#### Current Functionality to Preserve

- back navigation
- repository title and version context
- release selection
- install/update action
- install state feedback
- repository metadata display
- grouped MCP content display
- expandable code blocks

#### Design Treatment

This page has the highest information density and should receive the most structural polish.

The refreshed page should emphasize:

- a clearer top section containing repository identity, selected release, and install action
- more legible grouping between core repository information and MCP content
- more refined cards for prompts, resources, and tools
- more deliberate treatment of the sidebar or support panels
- better distinction between descriptive metadata and expandable implementation details

#### Install Interaction

The install experience should become visually clearer without changing underlying behavior:

- install/update button gains stronger CTA treatment
- installed state remains obvious but not noisy
- disabled state remains legible
- success and error toast styling aligns with the rest of the design system

#### Release and Content Browsing

- release switching remains in place
- grouped MCP sections remain in place
- cards for prompts/resources/tools share a consistent shell
- expandable code remains functionally identical, but visually cleaner and easier to parse

## Interaction Rules

### Buttons and Links

- Blue is reserved for primary actions, interactive links, and focus treatments.
- Primary actions should be visually clear and visually heavier than secondary actions.
- Secondary actions should remain discoverable but not compete with primary actions.
- Hover states should be subtle.
- Focus states must remain explicit and keyboard-visible.

### Forms and Inputs

- Search controls and selectors should use pill or softly rounded shapes consistent with the design system.
- Inputs should rely on contrast and focus rings, not heavy borders.
- Control sizing should be consistent across pages.

### Motion

Use minimal motion only where it improves clarity:

- soft hover transitions
- subtle shadow/background shifts
- restrained toast entry/exit
- no decorative or theatrical animation

### Accessibility

- Maintain strong color contrast in light and dark sections.
- Keep keyboard focus obvious.
- Preserve semantic headings and button/link semantics.
- Ensure touch targets remain usable on mobile.
- Avoid making the Apple-inspired style reduce legibility for dense technical content.

## Responsive Behavior

The redesign must remain practical across screen sizes:

- mobile-first layout adjustments
- search controls stack cleanly on small screens
- header remains usable on narrow viewports
- cards collapse to one column on small screens and expand progressively
- detail page layout should reduce elegantly from multi-column to single-column without losing action visibility
- documentation text widths should remain readable on large screens and not become cramped on small screens

## Implementation Boundaries

The likely implementation scope includes:

- `src/styles.css`
- `src/components/Layout.tsx`
- `src/pages/HomePage.tsx`
- `src/pages/DocsPage.tsx`
- `src/pages/RepositoryDetailPage.tsx`
- possibly `src/components/ExpandableCode.tsx` if needed for visual consistency
- i18n copy updates only where the new UI requires minor wording refinement

No backend code changes are expected.

## Testing and Verification Expectations

The implementation should be verified with:

- build success
- manual inspection of all three pages
- checks for English and Chinese UI integrity
- responsive checks for mobile and desktop layouts
- validation that search, reset, release selection, install button states, and expandable code still work as before

## Risks

- Over-translating Apple visual language could make dense technical pages less usable.
- Removing too many borders or cues could reduce scanability on the repository detail page.
- Tight typography can hurt readability if not calibrated for long-form documentation.
- A strong hero treatment on every page can become repetitive if section rhythm is not controlled carefully.

## Mitigations

- Use the selected “Structured Premium Refresh” direction rather than a literal Apple clone.
- Preserve practical information density on docs and repository detail pages.
- Use visual restraint on shadows, color, and motion.
- Keep descriptive text widths and spacing tuned for reading comfort.

## Acceptance Criteria

- The site no longer exposes a user-controlled dark mode toggle.
- All pages visually align with `DESIGN.md`.
- Header, footer, controls, cards, and content containers feel consistent across the site.
- Home, docs, and repository detail pages all receive visible UI/UX improvement without changing their core functions.
- Search, install, release browsing, and MCP content browsing remain intact.
- English and Chinese continue to render correctly.
- The final result feels more premium and intentional, not just recolored.
