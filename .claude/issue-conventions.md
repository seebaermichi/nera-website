# Issue conventions

Review rules for work on the Nera website (https://nera.js.org), run through Snagio
from `nera-website/`. The Snagio project **"Nera AI"** tracks
`../nera-cli/ROADMAP-ai.md`; its issues carry the target repo as a title prefix.
**Work only `[nera-website]` issues here** — the step skills commit in the current
repo. Issues for other repos are worked from those repos.

The workspace `../CLAUDE.md` holds the fleet-wide rules (plugin contract, catalogs,
releases); this file only adds what a reviewer checks per diff.

## Non-negotiables

- **`../nera-cli/ROADMAP-ai.md` is the spec and the single source of truth.** A
  decision made while working an issue is written back into it (Decisions or the
  slice's "Done" note) — a commit in `nera-cli`, named in the work log. Never only
  into the issue.
- **Never push or publish.** No `git push` (a push to `main` deploys the live site
  via CI), no tags, no posts anywhere public. The session hands over the commands.
  Exception: a Claude Code cloud session (`/work-issue-cloud`) pushes its own
  `issue/…` branch, which its brief names — never `main`.
- The site is not published to npm: no version bump, no `CHANGELOG.md`.
- Never edit `public/` — it is deleted on every build.
- Three languages (`pages/`, `pages/de/`, `pages/es/`): a change to a page or a
  catalog lands in all three, translated — unless the spec says English only (as
  for `llms.txt`, decision D3).
- Paste-ready text for the maintainer goes in a fenced code block between
  `----- START: … -----` and `----- END -----` lines, never in a blockquote.
- **Tutorials carry a `verified_with` stamp** (English page only; de/es follow
  the English text): package names without `@nera-static/` → the version the
  text is accurate for, plus `verified_on`. A tutorial issue bumps the stamp of
  the packages it re-checked; a new tutorial ships with one. Never bump a stamp
  without reading the CHANGELOG entries it skips. Report:
  `node ../.claude/skills/tutorial-review/drift.mjs` (see `/tutorial-review`,
  started from the workspace root).

## Framework correctness

- The site is a thin `@nera-static/nera` site. Local plugins live in
  `plugins/<name>/index.js` (`folders.plugins: ./plugins` in `config/app.yaml`) and
  follow the plugin contract: synchronous `getAppData`/`getMetaData`/`getAssets`,
  return a fresh object/array, read config from `config/<name>.yaml` with per-key
  JS fallbacks.
- Files a plugin wants in `public/` go through `getAssets` (core ≥ 4.13.0) — never
  written into `public/` directly (deleted before render).
- ESM, eslint style: 4-space indent, no semicolons, single quotes. No new runtime
  dependency without a stated reason.

## UI / template rules

- Templates in `theme/views/` are Pug; styling via the site tokens in
  `theme/assets/css/main.css` (IBM Plex + amber). Interface text exists in
  en/de/es via `app.translations`.
- Build output must stay clean under `nera build --check` (what CI runs).

## UI walkthrough

- Browser tooling: Playwright MCP (`mcp__playwright__browser_navigate`,
  `mcp__playwright__browser_click`, `mcp__playwright__browser_snapshot`,
  `mcp__playwright__browser_console_messages`).
- Boot: `npm run build && npx nera serve --port 3124` (serves `public/` without
  rebuilding; `nera serve` opens a browser tab on its own).
- Base URL / login: http://localhost:3124/, no login.
- Surfaces:
    | surface | url | role | how to open |
    |---|---|---|---|
    | `theme/views/` layouts | `/` and any page | visitor | open the page |
    | docs | `/docs/` | visitor | open the URL |
    | tutorials | `/tutorials/` | visitor | open the URL |

## Tests & hygiene

- `npm run lint && npm test && npm run validate && npm run build -- --check` must
  pass — the same as CI (`test.yml`). Local plugins carry `node --test` files
  beside them (`plugins/*/*.test.js`), run by `npm test` in CI; a new local plugin
  gets one too, stated in the plan.
- Instruments: `nera validate` proves layouts/includes/YAML; `nera build --check`
  proves the built output (a11y/privacy/legal); inspecting the files in `public/`
  proves what a plugin emitted. None of them prove an AI reads the result well —
  that is the ROADMAP's cold agent test.

## Reconciliation steps (run when resolving an issue)

- Update `../nera-cli/ROADMAP-ai.md`: mark the slice item done with the date and
  any choice made on the way (a commit in `nera-cli`).
- Tutorial changed or added: the English page's `verified_with`/`verified_on`
  are current, and `node ../.claude/skills/tutorial-review/drift.mjs` shows it
  `current` with de/es parity.
- Remove the issue's plan files last, once nothing else needs them:
  `git rm` its tracked files under `plans/` (`plans/issues/<id>-*`,
  `plans/issues/browser-tests/<first 8 chars>-*`, `plans/cloud/<id>-*`), delete
  the untracked ones, and commit
  `chore(plan): remove the plan files of the resolved <short title> issue`.
  Git history keeps them; `plans/` holds only open issues.
- Hand over the deploy command (`git push` in `nera-website`) — do not run it.

## Step order

<!-- The dependency ladder /plan-issue orders steps by: one rung per line, in
     dependency order, each with what it holds in THIS codebase and the Verify
     that proves a step on it is done. Leave "…" to use the skill's default
     (Data → Contract → Behaviour → UI → Docs). Examples to replace:

     Laravel:
     1. Data — migration, enum, model cast / relation, seeder — migrates up and down
     2. Contract — route + middleware, policy, Form Request, feature flag — feature
        test: valid input accepted, invalid refused
     3. Behaviour — actions, services, jobs, events, queries — `php artisan test --filter=…`
     4. UI — Livewire / Blade / Vue pages and components, labels — tests + walkthrough
     5. Docs — handbook, README

     Node / TypeScript:
     0. Toolchain — dependencies, tsconfig, build config — build and `tsc --noEmit` pass
     1. Data — Prisma / Drizzle migration, schema — applies and rolls back
     2. Contract — handler registration, guard, zod schema — `vitest run -t …`
     3. Behaviour — services, repositories, jobs — `vitest run -t …`
     4. Client — API functions, hooks, stores — `tsc --noEmit`
     5. UI — components, i18n strings — `tsc` + walkthrough
     6. Docs — README, ADRs -->

- …

## Static analysis

<!-- Read by /implement-step, /review-step and /work-issue: the command runs over the
     WHOLE project before review, in review and before resolving; red blocks all three. -->

- Command: `npm run lint` (ESLint over the whole package; plain JavaScript, no type checker)
- Green: exit code 0, no output
- Suppressions: fix every finding at its cause — no `eslint-disable` comments, no rule switched off to get green.
