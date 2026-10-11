# Work log — 01a1260d-8e5f-70f2-bdba-00a921ecb67d-nera-website-generate-llms-txt-and-llms-full-txt-from-the

- **Issue:** `01a1260d-8e5f-70f2-bdba-00a921ecb67d`

## Issue snapshot (2026-10-11)

- **Id:** `01a1260d-8e5f-70f2-bdba-00a921ecb67d`
- **Type:** feature
- **Group:** S2 AI docs
- **Status:** in_progress
- **Title:** [nera-website] Generate llms.txt and llms-full.txt from the English docs

Spec: `nera-cli/ROADMAP-ai.md` — L2, decision D3.

Local plugin `plugins/llms-txt/` reads `pages/docs/` + `pages/tutorials/` (by `pagination_order`), strips frontmatter, returns both files via `getAssets`. English only.

## Decision (2026-10-11)

**D1 — Selection from `pagesData`, body from the source `.md`.** `pagesData.content` is rendered HTML, so the Markdown must come from disk; `pagesData` still gives lang/dirname/order/title for free, so only the body is read. A full YAML parse of frontmatter (the `yaml` package) was rejected: the plugin only needs to cut the block, and core already parsed it into `meta`. Cost: the split must be anchored to the file start so a `---` rule in a body survives.

**D2 — Write to `.nera-cache/llms-txt/` in `getAssets`.** `getAssets` needs a `from` on disk; writing into `public/` is lost (deleted before render). `.nera-cache/` matches plugin-images' convention; an OS tmpdir was rejected as harder to inspect. Costs a `.gitignore` line.

**D3 — Absolute links.** llms.txt is read out of context, so root-relative links (`/search.html`) are useless there. Origin from `config/llms-txt.yaml` with a `https://nera.js.org` fallback rather than reading canonical-links' config (no cross-plugin config coupling).

**D4 — Sections Docs/Tutorials/Plugins/CLI/Optional; Starters omitted.** The spec lists Starters, but none exist until slice 5 — an empty section would mislead. Plugins come from the English plugins page frontmatter, the single manually maintained website catalog, so no third copy. Links point at the `.html` pages; `.md` twins are slice 2b.

**D5 — `node:test`.** The site has no test runner; vitest would add a devDependency for one file. `node --test` is built into Node 20+, wired as `npm test` and a CI step.

**Out of scope (carry forward):**
- design · S · nera-website — "Using Nera with AI" page in en/de/es — separate L2 deliverable, not in this issue
- design · S · nera-website — raw `/<page>.md` next to each English docs page (slice 2b) — spec'd as its own sub-slice
- debt · S · nera-cli template `AGENTS.md` — add the https://nera.js.org/llms.txt link — only valid once deployed
- debt · S · nera-website tutorials/how-this-site-is-built (en/de/es) — mention the llms-txt local plugin — trilingual content change, not needed for the AC

## Step 1 — started (2026-10-11)

base_sha: b513ad8d8370a735cd73cf409e8f00520322aacb
mode: fresh

## Step 1 — implemented (2026-10-11)

base_sha: b513ad8

### Changed
- `plugins/llms-txt/index.js` — new local plugin, `getAssets` only: selects English pages directly in `/docs` and `/tutorials` with `pagination_order` (docs first, then tutorials), reads each body from `pages/<href>.md`, strips the leading frontmatter by line split, absolutises `](/…)` links against `origin`, heads each page with its own H1 (or `# <title>`) plus a `Source: <url>` line, writes `.nera-cache/llms-txt/llms-full.txt`, returns `{ from, to: 'llms-full.txt' }`; warns for an unordered page except `/tutorials/index.html`
- `plugins/llms-txt/index.test.js` — 11 `node:test` tests on fixture `pagesData` + temp `pages/` (chdir into a tmp dir): frontmatter split incl. body `---` / YAML block / CRLF / unclosed, link rewriting, order, H1 handling, English-only, warnings (incl. `pagination_order: null`), origin fallback, asset entry + nothing in `public/`
- `config/llms-txt.yaml` — `origin`, `title`, `summary` (title/summary are for step 2's `llms.txt`)
- `.gitignore` — `.nera-cache` with a comment
- `package.json` / `package-lock.json` — `"test": "node --test plugins/*/*.test.js"`; `@nera-static/plugin-utils@^1.6.1` as a direct dependency (reason: `getConfig`, the plugin-contract config loader; already in the tree at 1.6.1 via every npm plugin, so the lockfile diff is the root entry only — importing it as an undeclared transitive dep would be fragile)

### Fixed alongside
- none

### Carry forward
- none

### Verification
```
npm test → # tests 11 / # pass 11 / # fail 0
npm run lint → (no output, exit 0)
npm run build → no ⚠ lines; "✅ Loaded local plugin: llms-txt"
head -1 public/llms-full.txt → # Documentation   (the Introduction page's own H1, then "Source: https://nera.js.org/docs/index.html")
grep -c '^Source:' public/llms-full.txt → 16   (7 docs + 9 tutorials)
grep -c '^---$' public/llms-full.txt → 12   (= the YAML code-block fences in 6 bodies, 2 each; no frontmatter survived)
grep -nE '/(de|es)/' public/llms-full.txt → 5 hits, all English code examples (impressum/datenschutz config, pages/de/blog/drafts, tag paths) — no German/Spanish page
npm run validate → ✓ No problems found.
npm run build -- --check → 0 error(s), 3 warning(s)   (pre-existing a11y-form-label on the search pages)
```

### Self-critique
- Deviation: the test script is `node --test plugins/*/*.test.js`, not the plan's `node --test plugins/` — Node 22+ treats `--test` args as globs and a bare directory finds nothing; the shell-expanded glob works on Node 20 and 22.
- Deviation: per-page heading + `Source:` line. The plan only said "frontmatter stripped"; tutorials have no H1 of their own, so without a heading the pages would run together. Docs keep their own H1 (`# Documentation` for the Introduction page, not its title "Introduction") to avoid two H1s. No `---` separators between pages, so the `^---$` count stays a frontmatter check.
- Rejected a regex frontmatter strip (`/^---[\s\S]*?---/`): it matches `---` mid-line too; the line-based split only counts exact `---` lines and only a block opening on line 1.
- Source path is `pages/` + href; a site with a custom `folders.pages` would break — this site uses the default, so not configurable.
- `absolutizeLinks` also rewrites `](/` inside code blocks; no body has one today.
- Least sure: whether `Source:` lines are wanted in `llms-full.txt` (llmstxt.org leaves the full file's format open).

### Pressure-test questions for the reviewer
1. Frontmatter split: does any body `---` (6 pages with ```yaml blocks) get cut, or could a page whose first line is not `---` lose content? (tests 1–3 + the `^---$` count of 12)
2. Is adding `@nera-static/plugin-utils` as a direct dependency acceptable, or would you rather parse with the transitive `yaml` package / no config file?
3. Is the H1 + `Source:` framing per page the right shape for step 2 and the cold agent test?

## Step 1 — reviewed (2026-10-11)

Verdict: approve

### 🔴 Blocking
- none

### Fixed in review
- none

### Fixed alongside
- none

### Carry forward
- bug · S · `pages/tutorials/build-a-blog.md:50` — the link text "Tags" points at `/tutorials/add-search.html` (same in `pages/de/tutorials/build-a-blog.md:52`), and the wrong target now also reaches `llms-full.txt` — unrelated to this step (a content fix in all three languages)

### Checked
goal (selection, order, strip, absolutise, cache + getAssets, warning) · Verify: `npm test` 11/11 on Node 20.20.0 and 22.22.0, `npm run lint` clean, `npm run build` no ⚠ and "Loaded local plugin: llms-txt", `head -40` starts with the Introduction body ("# Documentation" + Source line), `^---$` = 12 = 6 source files × 2 body fences (each of those sources has 4 `---` lines, 2 of them frontmatter), 16 `Source:` lines in docs 1–7 then tutorials 1–9 order, `npm run validate` clean · conventions: Non-negotiables (nothing in public/, English only per D3, no version/CHANGELOG), Framework correctness (sync `getAssets`, config from `config/llms-txt.yaml` with JS fallback, ESM/eslint style, new dependency has a stated reason), Tests & hygiene · self-critique: test-script glob deviation verified (shell-expanded by npm's sh, works on 20 and 22; step 3/4 should record `plugins/*/*.test.js` instead of the plan's `node --test plugins/`), H1 + Source framing verified on all 16 pages (tutorials take `title`, docs keep their own H1, no duplicate H1), `](/` in code blocks: none in the sources today · scope: the step's files only. The staged `.claude/`, `.mcp.json` and `plans/` files are the uncommitted Snagio setup and the work log, not this step's code, so /approve-step should commit the setup separately (`chore: install the Snagio issue workflow`). `.env` is gitignored · walkthrough n/a (none)

### Answers to the pressure-test questions
1. No body `---` is cut. `stripFrontmatter` only acts when line 1 is exactly `---`, and it cuts at the first exact `---` line after that. Every English docs/tutorials source starts with `---`, has no CRLF and no `---` with trailing spaces (checked with grep). The 12 surviving `^---$` lines match the 6 sources that have extra fences, 2 each. A source whose first line is not `---` is returned whole (test 3), so it loses nothing.
2. Acceptable. `getConfig` is the plugin-contract loader. It is already in the tree at 1.6.1 (`node_modules/@nera-static/plugin-utils`), and the lockfile diff is only the root entry. Declaring it is better than importing a transitive dependency without declaring it.
3. Yes. Each page opens with an H1 and then an absolute `Source:` URL, which gives step 2 and a cold agent a clear page boundary and a citable link. It also avoids `---` separators, so the `^---$` count still works as a frontmatter check.

## Step 1 — approved (2026-10-11)

snagio: ticked
