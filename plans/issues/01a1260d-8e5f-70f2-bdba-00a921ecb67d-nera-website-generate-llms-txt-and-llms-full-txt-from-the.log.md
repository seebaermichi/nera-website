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
commit: ec5e60b

## Step 2 — started (2026-10-11)

base_sha: ec5e60bce66898b6953cf11d2d798fd7235870ee
mode: fresh

## Step 2 — implemented (2026-10-11)

base_sha: ec5e60bce66898b6953cf11d2d798fd7235870ee

### Changed
- `plugins/llms-txt/index.js` — new exported `renderIndex()` builds `llms.txt` (`# title`, `> summary`, then `## Docs`/`## Tutorials` from the same `selectPages()` list as llms-full.txt, `## Plugins` from the English `/plugins/index.html` `plugins:` frontmatter, `## CLI` = CLI reference page + `@nera-static/nera` npm page, `## Optional` = llms-full.txt); `getAssets` now writes and returns both files (`llms.txt` first); title/summary fallbacks; empty sections left out; missing description → bare item + warning; missing plugins list → warning
- `plugins/llms-txt/index.test.js` — `build()` picks files by `to`; asset test covers both files; the pagination warning test filters to its own warnings; 5 new tests: H1 + folded summary as one blockquote line, default title/summary/origin without config, section order + exact items, English-only plugins/CLI source (a `/de/` catalog and a mislabelled `lang: de` one are ignored), bare item + warning without description
- `config/llms-txt.yaml` — unchanged: `title`/`summary` already landed in Step 1 with their final text

### Fixed alongside
- none

### Carry forward
- none

### Verification
```
npm test → # tests 16 / # pass 16 / # fail 0
npm run lint → eslint . (no output, exit 0)
npm run build → 📄 Page processing complete: 69 success, 0 errors (no llms-txt warning)
cat public/llms.txt → H1 "# Nera", one-line "> Nera is a lightweight…" summary, sections Docs (7), Tutorials (9), Plugins (16), CLI (2), Optional (1)
awk Plugins section | grep -c '^- ' → 16
grep '^- ' public/llms.txt | grep -vcE '\]\(https://[^)]*\): .' → 0   (every item absolute + described)
```

### Self-critique
- Links use the `.html` paths the site serves (`/docs/index.html`, not `/docs/`), matching the `Source:` lines in llms-full.txt and the site's own internal links; GitHub Pages serves both forms, so this is the consistent choice, not a necessity.
- Plugin items use the **package name** as link text (`@nera-static/plugin-tags`), not the display name ("Tags"): what an assistant needs is the thing to `npm install`. Falls back to `name` when `package` is absent. Links go to the catalog's `url` (GitHub README), which is where the docs are.
- The CLI reference appears twice (Docs and CLI) — D4 asks for both; Docs mirrors the reading order of llms-full.txt, CLI is the quick entry point.
- `CLI_PACKAGE`'s description lists the seven commands by hand; checked against `pages/docs/cli.md` (all seven named there). It will drift if a command is added — acceptable for one line, not config-worthy.
- A plugin entry without a `url` would render `[name](undefined)`; the catalog is maintained by hand and every entry has one, so I did not add a guard. Least sure about this one.
- `<link>` in the canonical-links description passes through verbatim; inside a Markdown list item it reads as text in a plain .txt fetch, so left as is (plan's Risks line).

### Pressure-test questions for the reviewer
1. Is the package name the right link text for Plugins, or should it be `Name (package)`?
2. Should a catalog entry without `url` be skipped with a warning rather than rendered?
3. Is a section-order assertion via exact item arrays (`section()` helper regex) robust enough, or should the test compare the whole file?

## Step 2 — reviewed (2026-10-11)

Verdict: approve

### 🔴 Blocking
- none

### Fixed in review
- none

### Fixed alongside
- none

### Carry forward
- none

### Checked
Goal met (H1, one-line `>` summary, Docs/Tutorials/Plugins/CLI/Optional in order, `- [Title](url): description`; Starters omitted per plan D4) · Verify run: `npm test` → 16/16 pass, `npm run lint` → clean, `npm run build` → 69 success, no llms-txt warning; `cat public/llms.txt` → Docs 7, Tutorials 9, Plugins 16 (= 16 `package:` entries in `pages/plugins/index.md`), CLI 2, Optional 1; `grep '^- ' public/llms.txt | grep -vcE '\]\(https://[^)]*\): .'` → 0 · Non-negotiables (English only per D3, no `public/` edits, no bump/CHANGELOG, no push) · Framework (synchronous `getAssets`, files via cache + `getAssets`, per-key fallbacks for title/summary/origin, ESM/eslint style, no new dependency) · Tests & hygiene (test file beside the plugin, as planned) · Scope: only the step's files plus the log/marker · Self-critique claims verified: `.html` links match `Source:` lines in llms-full.txt; CLI_PACKAGE's seven commands match the table in `pages/docs/cli.md:26-31`; CLI reference listed in both Docs and CLI per plan D4; `pages/docs` and `pages/tutorials` have no subfolders, so the `dirname` filter loses nothing · Walkthrough: n/a (`none`).

### Answers to the pressure-test questions
1. Package name is right: the plugin section's job for an assistant is "what to `npm install`", and the descriptions already say what each one does. `Name (package)` would add noise; the display names ("Tags") are ambiguous without the scope.
2. Not needed now. All 16 catalog entries carry `url:` (16 `url:` lines in `pages/plugins/index.md`), and the site's own catalog page would show the same gap. Skipping vs. falling back to the npm URL would also be a design choice, so it is no fixed-alongside candidate either.
3. Robust enough. The headings assertion pins the section order, and the `section()` helper pins every item exactly and returns `null` for a missing section, which the English-only test relies on. A whole-file comparison would duplicate those assertions and break on any wording change.

## Step 2 — approved (2026-10-11)

snagio: ticked
commit: 0af5ea1

## Step 3 — started (2026-10-11)

base_sha: 0af5ea18c57791d18845f37b1cd6868523dd4ee6
mode: fresh

## Step 3 — implemented (2026-10-11)

base_sha: 0af5ea1

### Changed
- `.github/workflows/test.yml` — new "Run local plugin tests" step (`npm test`) right after the linter; the comment above "Validate site" reworded from "there is no unit-test suite" to "beyond the local plugins … no unit-test suite" so it no longer contradicts the new step, and rewrapped.

### Fixed alongside
- none

### Carry forward
- none

### Verification
```
npm run lint → eslint . (exit 0, no output)
npm test (Node v20.20.0) → # tests 16 / # pass 16 / # fail 0
npm test (Node v22.22.0) → # tests 16 / # pass 16 / # fail 0
npm run validate → ✓ No problems found.
npm run build -- --check → 0 error(s), 3 warning(s)   (a11y-skip-link, a11y-nav-name, a11y-form-label — all on .html pages, pre-existing; none on the .txt files)
ls -l public/llms.txt public/llms-full.txt → 5708 / 33472 bytes, both present
yaml.parse(.github/workflows/test.yml) → yaml ok
grep '/de/\|/es/' public/llms.txt → 0; public/llms-full.txt → 5 hits, all path examples inside English docs (impressum/datenschutz config sample, ignore pattern, per-language tag URLs) — not German/Spanish pages
```

### Self-critique
- Plan's "Review hardest" assumed `node --test plugins/`; the actual script (from Step 1) is `node --test plugins/*/*.test.js`. npm runs scripts through `sh`, so the shell expands the glob before Node sees it — the dir/glob semantics difference between Node 20 and 22 never comes into play. Proven by running it on both v20.20.0 and v22.22.0 locally (16/16 each). I kept the script as is rather than switching to the directory form, which is the version-sensitive one.
- Caveat of the shell glob: if no test file existed the literal pattern would reach Node and fail — acceptable, it would signal a deleted test.
- "No new check warnings": the 3 warnings are page-level a11y hints on HTML (skip link, nav name, search label); this step changes only CI YAML and `--check` does not inspect .txt, so they cannot be new. I did not rebuild at a pre-plugin commit to diff them.
- Not run in real GitHub Actions (no push allowed); YAML parsed and indentation matches the sibling steps.

### Pressure-test questions for the reviewer
1. Does `npm test` in CI run from the repo root with the shell glob matching `plugins/llms-txt/index.test.js` on ubuntu `sh` (dash)? (dash expands `*` the same way.)
2. Is placing the test step before "Validate site" right — fast unit failures first?

## Step 3 — reviewed (2026-10-11)

Verdict: approve

### 🔴 Blocking
- none

### Fixed in review
- none

### Fixed alongside
- none

### Carry forward
- debt · S · `.claude/issue-conventions.md` (Tests & hygiene) — still says "There is no unit-test suite" and lists the hygiene check without `npm test`, now that CI runs the local plugin tests — unrelated to this step's files (project workflow config, not the step's diff)

### Checked
goal (test.yml runs `npm test` after lint, before validate; comment no longer contradicts it) · verify run: lint exit 0; `npm test` 16/16 on Node v20.20.0 and v22.22.0; validate "✓ No problems found."; `build -- --check` 0 errors / 3 warnings (a11y-skip-link, a11y-nav-name, a11y-form-label, HTML pages only — the step changes only CI YAML, so none can be new); `public/llms.txt` 5708 B, `public/llms-full.txt` 33472 B · Non-negotiables (no push/tag, no version/CHANGELOG, no public/ edit), Framework correctness, Tests & hygiene · self-critique claims (shell-expanded glob, both Node versions) confirmed · walkthrough n/a (none)

### Answers to the pressure-test questions
1. Yes. npm runs scripts via `sh -c` from the package root (CI's working directory is the checkout root, no `working-directory` set); POSIX `sh`/dash performs pathname expansion, and `sh -c 'echo plugins/*/*.test.js'` here yields `plugins/llms-txt/index.test.js`. Node receives an explicit file path, so the Node 20/22 directory-vs-glob difference in `node --test` never applies. `plugins/tutorials-list/` has no test file and is simply not matched.
2. Yes. Unit tests take well under a second and fail with a precise assertion; running them before the slower validate/build steps gives the fastest, most specific signal. The steps are independent (tests do not need `public/`), so the order has no correctness impact.

## Step 3 — approved (2026-10-11)

snagio: ticked
