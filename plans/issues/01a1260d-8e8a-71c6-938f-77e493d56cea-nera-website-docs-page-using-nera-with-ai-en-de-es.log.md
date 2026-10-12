# Work log — 01a1260d-8e8a-71c6-938f-77e493d56cea-nera-website-docs-page-using-nera-with-ai-en-de-es

- **Issue:** `01a1260d-8e8a-71c6-938f-77e493d56cea`

## Issue snapshot (2026-10-12)

- **Id:** `01a1260d-8e8a-71c6-938f-77e493d56cea`
- **Type:** feature
- **Group:** S2 AI docs
- **Status:** in_progress
- **Title:** [nera-website] Docs page "Using Nera with AI" (en/de/es)

Spec: `nera-cli/ROADMAP-ai.md` — L2.

How to point Claude Code / Codex / Cursor at a site, AGENTS.md, the skill, later the MCP server; example prompts. Three languages.

## Decision (2026-10-12)

- **Worked in a Claude Code cloud session**, outside the local plan → implement → review → approve loop (the maintainer's call, to use the cloud credit). The gate was not armed locally.
- Brief handed to the cloud: `plans/cloud/01a1260d-8e8a-71c6-938f-77e493d56cea-brief.md`. The cloud works on branch `issue/01a1260d-using-nera-with-ai` and returns `plans/cloud/01a1260d-8e8a-71c6-938f-77e493d56cea-result.md` on that branch.
- On return: review the branch locally, log the result here, then triage (Step 7), reconcile (ROADMAP in `nera-cli`) and resolve.

## Cloud result (2026-10-12)

- **Branch:** `issue/01a1260d-using-nera-with-ai` · 9 commits · result file `plans/cloud/01a1260d-8e8a-71c6-938f-77e493d56cea-result.md`
- **Summary:** New docs page "Using Nera with AI" at `/docs/using-ai.html` in en/de/es (pagination_order 8, sidebar key `docs_nav_ai`, linked from docs intro + getting started): AGENTS.md/CLAUDE.md and site notes, `nera update`, per assistant, llms.txt / llms-full.txt / per-page .md, the check loop, six example prompts, a "planned" list.
- **Verified locally (Node 22.22.0):** `npm ci`; lint clean; `npm test` 23/23; `nera validate` no problems; `build --check` 72 pages, 0 errors, only the 3 known warnings; 3 HTML pages + `/docs/using-ai.md`, no `.md` under de/es; sidebar active + previous → CLI in all three; `llms.txt` line 14; scripted link check: 103 internal links, 0 missing.
- **Review findings:** page omitted that AGENTS.md links llms.txt since nera 1.8.0 (`pages/*/docs/using-ai.md` "What every site ships"); add-a-page prompt assumed a navigation the scaffold lacks.

### Decisions
- URL `/docs/using-ai.html`, titles "Using Nera with AI" / "Nera mit KI nutzen" / "Usar Nera con IA"; after the CLI reference.
- Assistants as one bullet list (Claude Code, Codex, Cursor/Copilot/others, chat without file access); no vendor setup steps.
- "Planned": skill, `--json`, `nera publish`, MCP server — no dates/versions/URLs.
- Six example prompts; second-language prompt localized; de/es state the AI docs are English only.
- No heading anchors; search indexes committed.

### Carry forward
- AGENTS.md llms.txt link (nera 1.8.0) missing on the page
- add-a-page prompt vs. scaffold without navigation
- README.md stale (views/, src/plugins, npm run render)
- issue-conventions "Never push" vs. cloud issue branch

## Triage (2026-10-12)

| # | Item | Verdict | Done |
|---|---|---|---|
| 1 | Page: AGENTS.md links llms.txt since nera 1.8.0 | fix | `af7777c` |
| 2 | Add-a-page prompt: install plugin-navigation if no menu | fix | `af7777c` |
| 3 | README stale paths/scripts | fix | `db17321` |
| 4 | issue-conventions: cloud may push its issue branch | fix | `2e33737` |

Maintainer chose "fix all 4". CI re-run after the fixes: exit 0, same results.

## Reconciled (2026-10-12)

- Merged into `main` by fast-forward (not pushed); plan files committed `1bfecf9`.
- Spec: `nera-cli` `d3673dd` — slice 2 marked complete in `ROADMAP-ai.md` (status header, slice list, "Slice 2 — progress").
- No release (site, not on npm). Deploy = `git push` in `nera-website`, handed to the maintainer.
