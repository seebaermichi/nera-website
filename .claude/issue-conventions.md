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
- The site is not published to npm: no version bump, no `CHANGELOG.md`.
- Never edit `public/` — it is deleted on every build.
- Three languages (`pages/`, `pages/de/`, `pages/es/`): a change to a page or a
  catalog lands in all three, translated — unless the spec says English only (as
  for `llms.txt`, decision D3).
- Paste-ready text for the maintainer goes in a fenced code block between
  `----- START: … -----` and `----- END -----` lines, never in a blockquote.

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
- Hand over the deploy command (`git push` in `nera-website`) — do not run it.
