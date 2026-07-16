# Brand etymology design system

## 1. Visual theme and atmosphere

An editorial dictionary crossed with a world atlas: warm paper, black ink, compact marginal notes, and one vermilion annotation color. The experience should feel researched and tactile, not like a SaaS directory.

Visual thesis: erudite, worldly, tactile. The reflex choices would have been Newsreader, Cormorant, and Instrument Serif, so the interface instead uses Literata, designed by TypeTogether for sustained digital reading, paired with Source Sans 3 and system CJK fallbacks.

Content plan: orient with the search and corpus count, browse by country or industry, scan concise stories, then open a full entry for pronunciation, naming lineage, background, sources, and related names.

Interaction thesis: search results settle into place with a short opacity and translate transition; lineage nodes reveal from left to right; buttons compress slightly on press. All motion is disabled under `prefers-reduced-motion`.

## 2. Color palette and roles

- Canvas: `oklch(96.8% 0.012 79)`, warm paper.
- Raised paper: `oklch(99% 0.006 82)`, reading surfaces.
- Ink: `oklch(22% 0.018 58)`, primary text.
- Muted ink: `oklch(48% 0.018 62)`, metadata.
- Rule: `oklch(84% 0.018 74)`, dividers.
- Vermilion: `oklch(55% 0.18 35)`, active annotations and focus.
- Moss: `oklch(44% 0.065 142)`, confirmed evidence.

## 3. Typography rules

- Display and reading: Literata Variable, Songti SC, Noto Serif CJK SC, serif.
- UI and metadata: Source Sans 3 Variable, PingFang SC, Noto Sans CJK SC, sans-serif.
- Display: clamp 48px to 96px, weight 560, line-height .92, Latin tracking -.035em.
- H1 detail: clamp 44px to 72px, weight 560, line-height 1.
- H2: 28px, weight 560, line-height 1.2.
- Body: 17px, line-height 1.78 for Chinese.
- Metadata: 13px, weight 600, line-height 1.4, tracking .05em.

## 4. Component styling

- Buttons use a 4px radius, ink fill for primary actions, paper fill for secondary actions, and visible vermilion focus rings.
- Search is a ruled editorial field rather than a floating pill.
- Entries are separated by rules and whitespace. Elevated cards are reserved for the featured story and pronunciation panel.
- Tags are square-ended annotations with a 2px radius, not pills.

## 5. Layout principles

- Spacing scale: 4, 8, 12, 20, 32, 48, 72, 112.
- Desktop uses a 12-column grid with an intentionally narrow left index rail.
- Reading measure is capped at 68ch; metadata may span wider.
- Section spacing follows one responsive ladder rather than isolated values.

## 6. Depth and elevation

- Most sections are flush to the canvas and separated by hairline rules.
- Raised paper uses `0 12px 40px rgb(55 43 31 / 8%)` with no decorative border.
- The sticky header uses a solid paper tone, not backdrop blur.

## 7. Guardrails

- Do not use gradients, glass, generic three-card grids, or decorative logo scraping.
- Do not tighten tracking on Chinese, Japanese, or Korean text.
- Do not hide disputed origins behind a confident summary.
- Do not use rounded rectangles when a rule or typographic shift carries hierarchy.
- Do not load fonts, data, analytics, or search code from external domains at runtime.
- Do show source role and confidence next to every naming claim.

## 8. Responsive behavior

- Breakpoints: 720px and 1040px.
- At phone width the index rail becomes a horizontal corpus note and filters become two-column controls.
- Every interactive target is at least 40px high.
- Entry lineage scrolls horizontally only when its semantic order cannot wrap clearly.

## 9. Agent prompt guide

- Hero: canvas `oklch(96.8% 0.012 79)`, Literata 72px/0.92 weight 560, ink `oklch(22% 0.018 58)`, Latin tracking -.035em, one vermilion 4px annotation mark.
- Search field: 64px high, transparent background, bottom rule `oklch(64% 0.035 68)`, 22px Source Sans 3, 4px radius only on the submit button.
- Entry row: rule-separated, 24px vertical padding, 32px Literata name, 13px uppercase-like metadata without transforming CJK text, no shadow.
- Evidence panel: raised paper `oklch(99% 0.006 82)`, 12px radius, 32px padding, moss confidence marker, 17px body at 1.78.
