# GooseAutomotive

This repository is a placeholder on `main` (only this file and `README.md`). The
actual applications live on separate long-lived feature branches that both
diverge from the initial commit — they are **not** co-located in a monorepo and
they never merge together:

| Branch | Product | Stack | Dev port |
|--------|---------|-------|----------|
| `cursor/goose-automotive-website-ab82` | **Goose Shop** — Tekmetric-style auto-shop management app (+ static marketing site in `website/`) | React 19, Vite 7, TypeScript, Zustand, Tailwind | `4173` |
| `cursor/meridian-ehr-a485` | **Meridian Clinical** — demo ambulatory EHR (sample data only) | Next.js 16 (App Router, Turbopack), React 19, TypeScript | `3000` |

Each product is a single npm package at the root of its branch. To work on one,
check out its branch and run `npm install` && `npm run dev` (both are documented
in each branch's `README.md`).

## Cursor Cloud specific instructions

- **Node:** Node 22 + npm 10 (preinstalled) build and run both products fine.
  Neither package pins an `engines` version.
- **`main` is empty by design.** The startup update script runs
  `npm install` only when a `package.json` exists at the repo root, so on `main`
  it is a no-op. On either product branch it installs that product's deps. When
  you switch to a product branch you may need to run `npm install` yourself
  (the update script only runs at pod startup, before you switch branches).
- **Working on both products at once:** `main` cannot contain both apps, so use
  `git worktree` instead of switching branches (this also keeps your current
  branch intact). Example:
  `git worktree add ../goose origin/cursor/goose-automotive-website-ab82` then
  `cd ../goose && npm install && npm run dev`.
- **Goose Shop (branch `...-ab82`):**
  - `npm run dev` serves both the React UI and an embedded mock API on the same
    port `4173` (via the Vite middleware plugin `vite.shopApi.ts`) — there is no
    separate backend process. Port is `strictPort`, so free `4173` before
    starting.
  - Sign in with a PIN: **Andi Garcia** `1002` (advisor) or **Marco Reyes**
    `2001` (tech). Sessions live in `sessionStorage` (per browser tab), so
    multiple users can be signed in at once.
  - Shop state persists to `data/shop.json` (gitignored) via `GET/PUT
    /api/state`; integration events log to `data/integrations.jsonl`. Delete
    `data/shop.json` (or use **Reset demo** in the sidebar) to reset.
  - VIN decode calls the live NHTSA API and falls back gracefully offline.
  - No lint or test scripts are configured. `npm run build` runs
    `tsc --noEmit && vite build` (use it as the typecheck gate).
- **Meridian Clinical (branch `...-a485`):**
  - `npm run dev` (`next dev --turbopack`) serves everything in-process on
    `3000`; all data is static seed data in `src/data/`. No database.
  - `next dev`/`next build` auto-generate `AGENTS.md` and `CLAUDE.md` in the
    working tree (untracked, gitignored) — this is expected, not your edit.
  - Lint: `npm run lint` (`eslint src --max-warnings 0`). Build: `npm run build`.
    No test script is configured.
