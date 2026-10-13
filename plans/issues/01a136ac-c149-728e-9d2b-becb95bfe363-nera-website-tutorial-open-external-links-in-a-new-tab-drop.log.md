# Work log — 01a136ac-c149-728e-9d2b-becb95bfe363-nera-website-tutorial-open-external-links-in-a-new-tab-drop

- **Issue:** `01a136ac-c149-728e-9d2b-becb95bfe363`

## Issue snapshot (2026-10-13)

- **Id:** `01a136ac-c149-728e-9d2b-becb95bfe363`
- **Type:** improvement
- **Group:** Tutorials
- **Status:** in_progress
- **Title:** [nera-website] Tutorial "Open external links in a new tab": drop the obsolete Node note, show the config command

## Today
`pages/tutorials/external-links-new-tab.md` (stamp `plugin-link-attributes: 2.1.1`, `core: 4.13.0`) ends with "Node note: this plugin uses cheerio under the hood, so it needs Node ≥ 20.18.1 to build." That note is obsolete: since core 4.14.0 (`^20.19.0 || >=22.0.0`) and nera 1.4.0 (`^20.19.0 || >=22.12.0`), every Nera site already needs a newer Node than the plugin does.

It also never mentions `npx nera-link-attributes`, which copies the default `config/link-attributes.yaml` into the site (optional; `--force` replaces an existing one, since 2.1.0), and that the plugin is a no-op without any configured attributes.

## Instead
- Drop the Node note (en/de/es).
- Step 2 mentions `npx nera-link-attributes` as the quick way to get the config, and that without attributes the plugin leaves pages unchanged.
- Re-check the rest against the README (`a[href^="http"], a[href^="www"]` selection, layout links needing manual attributes).

## Why
A floor note readers can't act on only creates doubt; the publish command saves typing YAML by hand.

## Where
- `pages/tutorials/external-links-new-tab.md` (+ de, es)
- Sources: `../nera-plugin-link-attributes/README.md`, `CHANGELOG.md` 2.1.0–2.1.1; `../generator/CHANGELOG.md` 4.14.0

## Acceptance criteria
- [ ] No Node floor note; the config command is shown, in en/de/es.
- [ ] English stamp `plugin-link-attributes: <current>`, `core: <current>`, `verified_on` today.

## How to work it

- Work from `nera-website/` (`/work-issue <id>`). Read `.claude/issue-conventions.md` there and the rule "Check the tutorials too" in the workspace `../CLAUDE.md`.
- Tutorials live in three languages: `pages/tutorials/<slug>.md` (en), `pages/de/tutorials/<slug>.md`, `pages/es/tutorials/<slug>.md`. Every change lands in all three, translated, with the same `## ` sections.
- Frontmatter as in the neighbouring tutorials: `layout: pages/tutorial.pug`, `title`, `slug`, `lang`, `description`, `keywords`, `tags` (comma-separated; existing tags include getting-started, blog, plugins, search, seo, navigation, links, pagination, tags, local-plugins, advanced, case-study), `pagination_order`, `createdAt`. The **English** page also carries `verified_on` (today) and `verified_with` (package names without `@nera-static/` → the version the text was checked against). de/es carry no stamp.
- Test every command and snippet the tutorial shows in a throwaway site, never only by reading: `T=$(mktemp -d) && cd "$T" && npx @nera-static/nera new site && cd site` (if npm crashes, put Node 22 first: `PATH=~/.nvm/versions/node/v22.22.0/bin:$PATH`). Delete `$T` afterwards.
- Done means: `node ../.claude/skills/tutorial-review/drift.mjs` shows the tutorial `current` with de/es parity, and `npm run lint && npm test && npm run validate && npm run build -- --check` passes in `nera-website`.
- Never push: a push to `main` deploys nera.js.org. Hand over the `git push`.

## Cloud launch (2026-10-13)

- **Worked in a Claude Code cloud session**, outside the local plan → implement → review → approve loop (to use the cloud credit). The gate was not armed.
- **Brief:** `plans/cloud/01a136ac-c149-728e-9d2b-becb95bfe363-brief.md` · **Branch:** `issue/01a136ac-c149-link-attributes` · **Session:** launched by the user (URL to be added)
- **On return:** `/work-issue-cloud 01a136ac-c149-728e-9d2b-becb95bfe363` — verify locally, triage, merge, reconcile, resolve.

## Cloud result (2026-10-13)

- **Branch:** `issue/01a136ac-c149-link-attributes` · 11 commits (10 after rebuild on `main`) · result file `plans/cloud/01a136ac-c149-728e-9d2b-becb95bfe363-result.md`
- **Summary:** en/de/es tutorial drops the Node ≥ 20.18.1 note; step 2 leads with `npx nera-link-attributes` (skip existing / `--force`), keeps the YAML as hand-written alternative, says no `attributes` → pages unchanged, and that existing link attributes are kept. Stamp `core: 4.16.0`. Along the way: plugin-navigation floor `^3.1.1` + lockfile refresh.
- **Rebuild:** branch base was 26 commits behind `main`; cherry-picked onto `main` without conflicts, dropping `0db036d` (ten-plugins log section, already identical on `main` via `fb41cb1`).
- **Verified locally (Node 22.22.0):** `npm ci` 0 vulnerabilities; lint clean; `npm test` 37 pass / 0 fail; `npm run validate` ✓ No problems; `npm run build -- --check` 72 pages, 11 plugins, ✓ No problems; rebuild leaves the auto-merged search indexes unchanged; `npm ls` clean.
- **Drift:** `drift.mjs` → plugin-link-attributes 2.1.1 / core 4.16.0 `current`; de/es parity (3 `##` sections each, no `20.18` line).
- **Throwaway site (nera 1.11.0):** `npx nera-link-attributes` publish / skip / `--force` output as the tutorial describes; no config → links unchanged; with config → external gets `target`+`rel`, internal not.
- **Browser:** not needed — Markdown text only, no markup/CSS/JS change.
- **Review findings:** none.

### Decisions
- Command block before the YAML; YAML kept as "write it by hand".
- Tutorial keeps 4-space YAML (shipped default uses 2; content identical).
- Step 1 "No template to publish" kept plus one sentence pointing at the config file.
- "Existing attributes are kept" added (proved with `target="_self"`).
- plugin-navigation floor `^3.1.1` (vendored template and nav tutorial already at 3.1.1).

### Carry forward
- link-attributes README Node note — correct for the package itself, no action.
- Drift report / reconciliation — done locally above.

## Triage (2026-10-13)

| # | item | from | disposition | why |
|---|---|---|---|---|
| 1 | link-attributes README states Node ≥ 20.18.1 | cloud carry-forward | none | true for the package itself; other repo |
| 2 | drift report / reconciliation | cloud carry-forward | done | ran locally: `current`, parity ok |

Already done / elsewhere: ten-plugins log section already on `main` (`fb41cb1`), commit dropped.
Planning signal: none — the brief was sufficient; the 403-then-attach push pattern recurred.
