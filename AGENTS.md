# Repository Guidelines — portfolio3

Personal portfolio static site built with Astro.

> Agent configuration is managed via [apm](https://github.com/microsoft/apm).
> Common conventions live in `mazrean/apm-plackage/common`; frontend rules come
> from `mazrean/apm-plackage/frontend`. Run `apm install` to materialise locally.

## Build & Test

- `npm install`
- `npm run dev` — dev server
- `npm run build` — produce `dist/`
- `npm run preview` — preview the production build

## Conventions

- Uses `npm` (not pnpm) — `package-lock.json` is committed.
- Specs go under `specs/`; use `mazrean/agent-skills/skills/writing-*`.
- Commit using Conventional Commits (`committing-code` skill).
- ESLint + Prettier configs live in repo root; respect them.
- For E2E / VRT, the `playwright-cli` Agent Skill + Playwright CLI is the path — do not register Playwright MCP.
