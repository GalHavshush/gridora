# Contributing to Gridora

Thanks for helping make Gridora better! Bug reports, widgets, design polish and docs are all welcome.

## Getting started

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run build   # type-checks and builds
npm test
npm run lint
```

## Adding a widget

The README has a complete walkthrough ("Create a widget"). In short:

1. Create `src/widgets/<your-widget>/`.
2. Add `YourWidget.tsx` (content only — no card, title bar or edit controls; `WidgetContainer` provides those).
3. Add `manifest.ts` with a default export from `defineWidget(...)`.

The registry discovers it automatically.

Widgets that don't need to ship inside Gridora belong in [gridora-widgets](https://github.com/GalHavshush/gridora-widgets). Users install them at runtime from the Marketplace (see "Community widgets" in the README).

A good widget:

- works at its `minSize` and grows gracefully (use `size` or container-query units);
- uses the theme tokens (`text-fg`, `text-muted`, `bg-subtle`, `border-line`) instead of hard-coded colors;
- keeps network code in `src/services/` and never ships secrets;
- treats external data as untrusted — only link to `http(s)` URLs (see `safeUrl` in `src/lib/url.ts`);
- has a helpful empty state (`WidgetMessage` + `openSettings`).

**Never change a published widget's `id`** — it's stored in people's dashboards. If a settings shape changes, read old values defensively.

## Code style

- TypeScript strict mode, function components and hooks.
- Small, focused files. Prefer plain code over new abstractions.
- Comments explain *why*, not *what*.
- Tailwind for styling; shared design tokens live in `src/index.css`.

## Pull requests

- Keep PRs focused; include a screenshot or short clip for UI changes.
- Describe what changed and how you tested it.
