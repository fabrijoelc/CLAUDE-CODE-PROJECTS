# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Critical: Next.js version

This is **Next.js 16.2.9** with breaking changes vs. earlier versions you may know. APIs, conventions, and file structure may differ from training data. The full docs ship locally — **read the relevant guide in `node_modules/next/dist/docs/` before writing Next.js code.** Structure:

- `01-app/01-getting-started`, `01-app/02-guides`, `01-app/03-api-reference` — App Router (this project uses it)
- `01-app/02-guides/instant-navigation.mdx` — for slow client navigations, `Suspense` is not enough; you must also `export const unstable_instant` from the route. Read this before touching navigation perf.
- `02-pages` (Pages Router), `03-architecture`, `04-community`

## Commands

```bash
npm run dev      # dev server at http://localhost:3000
npm run build    # production build
npm run start    # serve production build
npm run lint     # eslint (flat config, eslint.config.mjs)
```

No test runner is configured.

## Architecture

App Router project (`app/` directory). Currently the create-next-app boilerplate — `app/layout.tsx` (root layout, Geist fonts) and `app/page.tsx` (home).

- **React 19** + Server Components by default.
- **Tailwind CSS v4** — configured in CSS, not a JS config file. Theme tokens live in `app/globals.css` via `@import "tailwindcss"` and the `@theme inline` block (e.g. `--color-background`, `--font-sans`). PostCSS plugin in `postcss.config.mjs`.
- **TypeScript** strict mode. Path alias `@/*` → repo root (tsconfig `paths`).

## Skills

Usa siempre /frontend-design para diseñar la interfanz de usuario