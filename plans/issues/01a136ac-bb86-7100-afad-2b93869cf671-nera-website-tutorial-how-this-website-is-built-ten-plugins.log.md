# Work log — 01a136ac-bb86-7100-afad-2b93869cf671-nera-website-tutorial-how-this-website-is-built-ten-plugins

- **Issue:** `01a136ac-bb86-7100-afad-2b93869cf671`

## Issue snapshot (2026-10-13)

- **Id:** `01a136ac-bb86-7100-afad-2b93869cf671`
- **Type:** improvement
- **Group:** Tutorials
- **Status:** in_progress
- **Title:** [nera-website] Tutorial "How this website is built": ten plugins (skill-zip missing), checks and deploy

## Today
`pages/tutorials/how-this-site-is-built.md` (stamp `nera: 1.9.0`) says the site runs **nine** plugins (heading "Nine plugins, each doing one thing"; de "Neun Plugins …", es "Nueve plugins …"). Since `715fd85` (2026-10-13) there are ten: the local plugin `plugins/skill-zip/` is missing from the table. It publishes the Nera Agent Skill as `/downloads/nera-skill.zip`, read from the installed `@nera-static/nera` (`node_modules/@nera-static/nera/skills/nera`, shipped since nera 1.10.0), written to `.nera-cache/skill-zip/` and handed to core via `getAssets`.

The page also says nothing about how the site is checked: CI (`.github/workflows/test.yml`) runs lint, `npm test` (the `node --test` files beside the local plugins), `nera validate` and `nera build --check`, and a push to `main` deploys via `deploy.yml`.

## Instead
- Heading and intro say ten plugins (en/de/es).
- The plugin table gains a `skill-zip` (local) row: job "the Nera skill as a zip for claude.ai and Claude Desktop", config "—".
- The sentence about the local plugins names all three (`tutorials-list`, `llms-txt`, `skill-zip`) and that two of them hand files to the build through the `getAssets` hook (link the local-plugin tutorial, which is getting a `getAssets` section in its own issue).
- A short section on checks and deploy: what `test.yml` runs, that `nera build --check` keeps the output free of accessibility/privacy/legal warnings, and that `deploy.yml` publishes to GitHub Pages.
- Re-verify the rest against the repo: the table against `package.json` dependencies (canonical-links, code-blocks, link-attributes, navigation, page-pagination, search, tags) and `plugins/`; the YAML excerpt against `config/plugin-order.yaml`; the "Templates we own" paragraph against `theme/views/vendor/`.

## Why
It is the case study readers use to see "a real Nera site". A wrong plugin count is the first thing a reader comparing it with the repo notices.

## Where
- `pages/tutorials/how-this-site-is-built.md`, `pages/de/tutorials/…`, `pages/es/tutorials/…`
- Sources: `package.json`, `plugins/*/index.js`, `config/plugin-order.yaml`, `.github/workflows/test.yml`, `.github/workflows/deploy.yml`

## Acceptance criteria
- [ ] All three languages name ten plugins and list `skill-zip`.
- [ ] Every row of the table, the plugin-order excerpt and the folder names match the repo at the time of the change.
- [ ] A checks-and-deploy section exists in all three languages.
- [ ] English stamp updated: `verified_with: { nera: <current> }` plus every package the table now names with its current version; `verified_on` today.

## How to work it

- Work from `nera-website/` (`/work-issue <id>`). Read `.claude/issue-conventions.md` there and the rule "Check the tutorials too" in the workspace `../CLAUDE.md`.
- Tutorials live in three languages: `pages/tutorials/<slug>.md` (en), `pages/de/tutorials/<slug>.md`, `pages/es/tutorials/<slug>.md`. Every change lands in all three, translated, with the same `## ` sections.
- Frontmatter as in the neighbouring tutorials: `layout: pages/tutorial.pug`, `title`, `slug`, `lang`, `description`, `keywords`, `tags` (comma-separated; existing tags include getting-started, blog, plugins, search, seo, navigation, links, pagination, tags, local-plugins, advanced, case-study), `pagination_order`, `createdAt`. The **English** page also carries `verified_on` (today) and `verified_with` (package names without `@nera-static/` → the version the text was checked against). de/es carry no stamp.
- Test every command and snippet the tutorial shows in a throwaway site, never only by reading: `T=$(mktemp -d) && cd "$T" && npx @nera-static/nera new site && cd site` (if npm crashes, put Node 22 first: `PATH=~/.nvm/versions/node/v22.22.0/bin:$PATH`). Delete `$T` afterwards.
- Done means: `node ../.claude/skills/tutorial-review/drift.mjs` shows the tutorial `current` with de/es parity, and `npm run lint && npm test && npm run validate && npm run build -- --check` passes in `nera-website`.
- Never push: a push to `main` deploys nera.js.org. Hand over the `git push`.

## Cloud launch (2026-10-13)

- **Worked in a Claude Code cloud session**, outside the local plan → implement → review → approve loop (to use the cloud credit). The gate was not armed.
- **Brief:** `plans/cloud/01a136ac-bb86-7100-afad-2b93869cf671-brief.md` · **Branch:** `issue/01a136ac-how-this-site-is-built` · **Session:** launched by the user (`claude --cloud` needs an interactive terminal); URL to be added
- **Decided in the brief:** stamp = npm latest versions (drift.mjs's "current"), after reading the CHANGELOGs between lockfile and latest; no dependency bump in scope; link the local-plugin tutorial page, not the planned `getAssets` anchor.
- **On return:** `/work-issue-cloud 01a136ac-bb86-7100-afad-2b93869cf671` — verify locally, triage, merge, reconcile, resolve.

## Cloud result (2026-10-13)

- **Branch:** `issue/01a136ac-how-this-site-is-built` · 7 commits (rebased onto `main` `ebc16dd`) + 1 local fix · result file `plans/cloud/01a136ac-bb86-7100-afad-2b93869cf671-result.md`
- **Summary:** en/de/es name ten plugins, table gains `skill-zip` (local) linking `/docs/using-ai.html`, local-plugin sentence names all three + `getAssets` (links write-a-local-plugin), new `## Checks and deploy` section; English stamp nera 1.11.0 + seven plugins at npm latest.
- **Verified locally (Node 22.22.0):** `npm run lint && npm test && npm run validate && npm run build -- --check` → rc 0, 28/28 tests, 10 plugins loaded, 0 errors / 3 warnings (same as main); drift.mjs → all eight stamps `current`; en/de/es 7 `## ` sections, 10 table rows, no "nine/neun/nueve"; test.yml (Node 20/22, push+PR to main) and deploy.yml (push to main → Pages) match the text; "promote to error" matches nera-validate README.
- **Review findings:** paragraph under the table not rewrapped (one 110–130-char line in each language) — fixed locally on the branch.

### Decisions
- `## Checks and deploy` placed after "Build"; closing paragraph moved below it.
- `--check` described as reporting warnings that fail only when `config/validate.yaml` promotes a rule (accurate; the issue's "keeps the output free" would be wrong — the site has 3 warnings).
- test.yml trigger described as `main` only (workflow also lists the unused `master`).
- `description` updated in all three languages ("the local plugin" → "the local plugins, and how it is checked and deployed").
- Stamp at npm latest although the lockfile trails; no claim depends on the difference.

### Carry forward
- `package-lock.json` trails npm (nera 1.10.1, navigation 3.0.1, page-pagination 2.3.1, search 2.2.0, tags 3.2.2, …).
- Vendored `theme/views/vendor/plugin-{navigation,page-pagination,search}` lack the a11y fixes of navigation 3.1.0 / page-pagination 2.4.0 / search 2.3.0 → `a11y-nav-name` (51 pages), `a11y-form-label` (3 pages).
- `a11y-skip-link` (108 pages) — site layout.
- Link to write-a-local-plugin can gain a `getAssets` anchor once issue 01a136ac-bed8-73d3-9273-b65a49582f3c lands.

## Triage (2026-10-13)

| # | item | from | disposition | why |
|---|---|---|---|---|
| 1 | design · `pages/{,de/,es/}tutorials/how-this-site-is-built.md` "Checks and deploy" — `--check` "reports" warnings instead of the issue's "keeps the output free" | Cloud review hints | fix | default: keep "reports" (site has 3 warnings, no `config/validate.yaml`); nothing to change |
| 2 | infra · `package-lock.json` trails npm + `theme/views/vendor/plugin-{navigation,page-pagination,search}` lack the a11y fixes of 3.1.0 / 2.4.0 / 2.3.0 (`a11y-nav-name` 51 pages, `a11y-form-label` 3) | Cloud carry-forward | file | size + separate surface: dependency update and `--force` republish of three vendored template sets, merging the site's own edits; this issue is docs-only |
| 3 | a11y · site layout has no skip link (`a11y-skip-link`, 108 pages) | Cloud carry-forward | file | separate feature: layout change on a surface this issue does not touch |

Already done / elsewhere: 1 fixed on the branch (paragraph rewrap, `13da693`), 1 owned by 01a136ac-bed8-73d3-9273-b65a49582f3c (`getAssets` anchor).
Planning signal: none

## Decision (2026-10-13)

- **Triage overruled by the user:** "fix all of them now" — rows 2 (lockfile + vendored a11y fixes) and 3 (skip link) become `fix` on this branch instead of new issues.

## Triage fixes (2026-10-13)

- **#1** `--check` wording kept ("reports"; findings are warnings unless promoted) — no change.
- **#2** `efa696d` chore(deps): floors raised to nera 1.11.0, canonical-links 2.2.3, code-blocks 1.2.1, link-attributes 2.1.1, navigation 3.1.0, page-pagination 2.4.0, search 2.3.0, tags 3.3.0 (lockfile = the tutorial's stamp). `8510037` fix(a11y): vendored page-pagination, search, navigation were pristine old copies → replaced with the released templates (not `--force`, which would also have hit the customised tags/canonical-links copies); `theme/assets/js/search.js` is customised and stays. New keys `Pagination`, `search_label`, `Navigation` (en/de/es).
- **#3** `2b1add9` feat(a11y): `a.skip-link` first in `body`, `main#main(tabindex=-1)`, CSS hidden until focus, `skip_link` key en/de/es.
- **Verified (Node 22.22.0):** lint, 28/28 tests, validate, `build --check` → "✓ No problems found" (was 3 warnings). Output diff against the pre-change build: only skip link, `main` id/tabindex, `aria-label` on the pagination `<nav>` and the search input, main.css; header/footer nav byte-identical.
- **Not verified:** skip link visually (focus state) in a browser.

## Browser test (2026-10-13)

- **Run outside `/test-issue-in-chrome`** (that skill needs a plan file; cloud issues have none), in Claude in Chrome against live nera.js.org after the deploy, 2026-10-13.
- **Result:** pass, 5/5.

| # | case | result |
|---|---|---|
| 1 | `/docs/cli.html`: skip link is the first focusable element, off-screen before focus (bottom −33 px) | pass |
| 2 | focused: visible top-left at 8/8 px, amber background, light text, focus ring | pass |
| 3 | Enter → URL `#main`, focus on `main#main`, skip link hidden again | pass |
| 4 | pagination `<nav>` `aria-label="Previous and next page"` | pass |
| 5 | `/de/search.html`: "Zum Inhalt springen", input `aria-label="Suche"` | pass |

- **Limit:** the extension's Tab key does not reach a freshly loaded page (focus stays in the browser UI), so focus was set by script (`focus({focusVisible:true})`); tab order checked in the DOM.
