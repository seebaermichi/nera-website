# Work log — 01a1260d-8e75-7115-9c33-7c54f4639765-nera-website-raw-markdown-next-to-each-english-docs-page

- **Issue:** `01a1260d-8e75-7115-9c33-7c54f4639765`

## Issue snapshot (2026-10-11)

- **Id:** `01a1260d-8e75-7115-9c33-7c54f4639765`
- **Type:** feature
- **Group:** S2 AI docs
- **Status:** in_progress
- **Title:** [nera-website] Raw Markdown next to each English docs page
- **External ref:** roadmap-ai/s2/raw-md

Spec: `nera-cli/ROADMAP-ai.md` — L2, slice 2b.

Publish `/<page>.md` for every English docs page via the same plugin.

## Decision (2026-10-11)

**D1 — URL is `/<dirname>/<name>.md`.** Asked the user (2026-10-11): `/docs/cli.md` (spec), `/docs/cli.html.md` (llmstxt.org's "append .md to the URL"), or both. Chose the spec's form: short, maps 1:1 to `pages/docs/cli.md`; costs only guessability for agents that apply the llmstxt.org rule literally, which D4 offsets because `llms.txt` links the files directly. Both forms would have doubled the files for little gain.

**D2 — Same page set as `llms-full.txt` (docs + tutorials).** Asked the user; chose the 16 pages `selectPages` returns over the spec's literal "docs page" (7 pages). One selection means the `.md` files and `llms-full.txt` cannot drift, and tutorials are just as useful to an agent.

**D3 — Each `.md` is `renderPage`'s output, not the byte-for-byte source.** Alternative: copy `pages/<…>.md` verbatim. Lost because the frontmatter (layout, pagination keys, `plugins:` lists) is Nera build input, not reading material, and root-relative links would be useless out of context. Reusing `renderPage` keeps one rendering for both outputs. Costs: the file is not literally the source — documented in the spec.

**D4 — `llms.txt` links the `.md` files.** Asked the user; chosen as llmstxt.org intends (index → clean Markdown). `Source:` lines keep the `.html` URL so a human-facing link is still at hand. Reverses the slice-2 note "Links keep the `.html` paths the site serves" for page items; the plugin catalog, npm link and `llms-full.txt` link are unaffected. Written back to the spec in step 3.

**No UI surface touched.** The change adds static `.md` files and changes `llms.txt`; no template, layout or CSS. A `<link rel="alternate" type="text/markdown">` in the layout head was considered and left out to keep the scope to the issue — candidate for carry-forward.

## Carry forward (2026-10-11)

- design · S · `theme/views/layouts/layout.pug` — advertise each English docs/tutorial page's `.md` via `<link rel="alternate" type="text/markdown">` — not asked for by slice 2b; touches every page's head

## Step 1 — started (2026-10-11)

base_sha: 1802c5d8d88689e88a6448ee85121b4802e27cc1
mode: fresh

## Step 1 — implemented (2026-10-11)

base_sha: 1802c5d

### Changed
- `plugins/llms-txt/index.js` — `getAssets` renders each selected page once (`pageFiles`), joins them into `llms-full.txt`, and also writes each to `.nera-cache/llms-txt/pages/<dirname>/<name>.md`, returning `{ from, to: '<dirname>/<name>.md' }`; new exported `markdownPath(href)` (`/docs/cli.html` → `docs/cli.md`); the `pages/` cache folder is emptied first so a removed page leaves no stale file; header comment updated.
- `plugins/llms-txt/index.test.js` — asset list now includes the page `.md`; `markdownPath` mapping; one `.md` per selected page whose concatenation equals `llms-full.txt`, no file for `/de/`, `/es/` or the unordered `/tutorials/index.html`, no `layout:` frontmatter; a removed page leaves no `.md` in the cache.

### Fixed alongside
- none

### Carry forward
- none

### Verification
```
npm test → # tests 19 / # pass 19 / # fail 0
npm run lint → eslint . (no output, exit 0)
npm run build → 📄 Page processing complete: 69 success, 0 errors
ls public/docs/*.md public/tutorials/*.md | wc -l → 16
head -8 public/docs/cli.md → "# CLI reference" / "" / "Source: https://nera.js.org/docs/cli.html" / …
ls public/de/docs/*.md public/es/docs/*.md → (eval):1: no matches found: public/de/docs/*.md
find public -name '*.md' | grep -E '^public/(de|es)/' | wc -l → 0
npm run validate → ✓ No problems found.
npm run build -- --check → 0 error(s), 3 warning(s)   (all a11y-form-label on the three search.html pages — pre-existing, .html only)
```
Search index: the `.md` hits in `public/search-index.json` are page text mentioning `.md` filenames; the plugin indexes `pagesData`, so the new files cannot reach it.

### Self-critique
- Collision: page files live under `pages/` in the cache, so no `to`/`from` can equal `llms.txt`/`llms-full.txt`; within `pages/`, paths mirror distinct hrefs. `to` never has a leading slash (`markdownPath` strips all).
- Considered deriving the `.md` from the source file name directly; kept the href mapping because `to` must mirror the public URL, not the source path (identical today).
- `rmSync` of the cache `pages/` folder each build: cheap, and only stale-hygiene — core copies only returned entries anyway, so it is not load-bearing.
- Least sure: a public `/docs/index.md` beside `/docs/index.html` — fine for a static host, but GitHub Pages serves `.md` as `text/markdown`; not verifiable locally.

### Pressure-test questions for the reviewer
1. Does `llms-full.txt` stay byte-identical to the base for the same pages (it is now the join of the same `renderPage` outputs)?
2. Is there any page in `selectPages` whose href mapping could produce a path outside `docs/`/`tutorials/`?

## Step 1 — reviewed (2026-10-11)

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
Goal met (`getAssets` returns `llms.txt`, `llms-full.txt` + one `{ from: <cache>/pages/<dir>/<name>.md, to: '<dir>/<name>.md' }` per selected page; `llms-full.txt` = join of the same `renderPage` outputs) · Verify run: `npm test` → 19 pass / 0 fail; `npm run lint` → clean; `npm run build -- --check` → 0 errors, 3 pre-existing `a11y-form-label` warnings on `search.html`; `ls public/docs/*.md public/tutorials/*.md | wc -l` → 16; `head public/docs/cli.md` → `# CLI reference` / `Source: https://nera.js.org/docs/cli.html`; `public/de/docs/*.md` → no matches; `find public -name '*.md'` outside `docs/`/`tutorials/` → none; `npm run validate` → ✓ No problems found · Search index: 0 `.md"` entries in `public/search-index.json` · `.nera-cache` is gitignored (`.gitignore:10`) · Conventions: Non-negotiables (no public/ edits, English only per D3, no version bump), Framework correctness (sync `getAssets`, assets via core, eslint style, no new dependency), Tests & hygiene (node --test beside the plugin, CI command set passes) · Self-critique: collision claim holds — per-page files sit under `pages/` in the cache, `to` is always `<dir>/<name>.md` with no leading slash (`markdownPath` strips `^/+`) and cannot equal `llms.txt`/`llms-full.txt`; distinct hrefs give distinct paths; `rmSync` of only `pages/` is harmless · Walkthrough: n/a (`none`).

### Answers to the pressure-test questions
1. Yes. The base code was `pages.map(renderPage).join('\n\n')`; the new code maps the same pages through the same `renderPage` and joins the texts with the same `'\n\n'`, so the output is byte-for-byte the same. The test checks it too: the per-page sections joined with `\n\n` plus a trailing `\n` equal `llms-full.txt`. On the real build, the 16 `public/**/*.md` files read in `Source:` order and joined that way equal `public/llms-full.txt` (`true`).
2. No. `selectPages` keeps only `meta.dirname` in `['/docs', '/tutorials']`, so every href is `/docs/<name>.html` or `/tutorials/<name>.html`, and `markdownPath` maps it to `docs/<name>.md` or `tutorials/<name>.md`. Nested folders (`/docs/x/y.html`) have a different dirname and are excluded. `/de/` and `/es/` pages are dropped by the language filter: confirmed by the test and by the 0 `.md` files found under `public/de|es`.

## Step 1 — approved (2026-10-11)

snagio: ticked
commit: 665ca57

## Step 2 — started (2026-10-11)

base_sha: 665ca5789bb7941c32d95fa1668ade0918304f5c
mode: fresh

## Step 2 — implemented (2026-10-11)

base_sha: 665ca57

### Changed
- `plugins/llms-txt/index.js` — `pageItem` links `${origin}/${markdownPath(meta.href)}`, the same helper that builds the asset `to` path (D4); the CLI page is now taken from `pages` (the emitted set) instead of every English page, so `## CLI` can never link a `.md` that was not written; the `english`/`findPage` helpers, left with one caller, are inlined into the plugins-page lookup (same filter); docblock states the link/asset invariant.
- `plugins/llms-txt/index.test.js` — Docs/Tutorials/CLI and no-description assertions switched to `.md`; new test: every page link in `llms.txt` is a `.md` among the returned assets and no `.html` page link remains; new test: a CLI page without `pagination_order` (not emitted) is not linked under `## CLI`.

### Fixed alongside
- none

### Carry forward
- none

### Verification
```
npm test → # pass 21 / # fail 0
npm run lint → (eslint ., no output)
npm run validate → ✓ No problems found.
npm run build -- --check → 0 error(s), 3 warning(s)   (a11y-form-label on the three search.html pages — same 3 at base 665ca57, verified with the change stashed)
grep -c '\.md):' public/llms.txt → 17
grep -c '\.html):' public/llms.txt → 0
every https://nera.js.org/…\.md link in public/llms.txt exists as a file in public/ → no MISSING line
```
The only non-`.md` nera.js.org link left is `## Optional`'s `llms-full.txt`, as planned; plugin catalog and npm links unchanged.

### Self-critique
- Behaviour change: before, `## CLI` listed `/docs/cli.html` whenever an English page with that href existed, even without `pagination_order`. Now it needs to be in `pages`. Considered falling back to the `.html` link for that case and rejected it: it adds a branch for a state `selectPages` already warns about, and the plan's invariant ("a link can never point at a file that was not emitted") is simpler to hold with one source. On the live site the CLI page has `pagination_order`, so the output is unaffected (17 links as expected).
- `renderItem`'s missing-description warning now names the `.md` URL rather than the `.html` page; still identifies the page unambiguously.
- Least sure: whether the reviewer wants `Source:` lines in the `.md` files / llms-full.txt to stay `.html` — they do (D4), untouched in this step.

### Pressure-test questions for the reviewer
1. Can any page link in `llms.txt` point at a `.md` not in the assets? (Both come from `pages` + `markdownPath`; the new test asserts it.)
2. Does dropping an unordered CLI page from `## CLI` lose anything a user would miss, given `selectPages` warns about it?
3. Is the inlined plugins-page lookup exactly equivalent to the old `english`/`findPage` path (first English match by href)?

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
goal (Docs/Tutorials/CLI page items link `.md` via `markdownPath`, the same helper as the asset `to` at index.js:55; Plugins/npm/Optional unchanged) · verify run by reviewer: `npm test` → pass 21 / fail 0; `npm run lint` → clean; `npm run validate` → ✓ No problems found.; `npm run build -- --check` → 0 error(s), 3 warning(s) (pre-existing, per implementer's stash check); `grep -c '\.md):'` → 17; `grep -c '\.html):'` → 0; every nera.js.org `.md` link exists in public/ → no MISSING · conventions: Non-negotiables (no push, no public/ edit, English only per D3), Framework correctness (sync hooks, getAssets only, eslint style), Tests & hygiene (node --test beside the plugin, new tests) · self-critique claims verified · walkthrough n/a (none)

### Answers to the pressure-test questions
1. No. `pageItem` is only applied to members of `pages` (Docs/Tutorials filters at index.js:120–121, `cliPage` from `pages` at :118), and its URL is `${origin}/${markdownPath(meta.href)}`; getAssets emits exactly `markdownPath(meta.href)` for every member of the same `selectPages` result (:54–55). The new test "every page link in llms.txt points at a .md file getAssets emits" pins it; the live build shows no MISSING file.
2. No real loss. `selectPages` already warns for an unordered CLI page (index.js:166–168), so the maintainer sees the gap; on the live site the CLI page is ordered and `## CLI` still lists it (17 links). Linking a `.html` fallback would break the one-source invariant the plan asks for. The new test "a CLI page left out of llms-full.txt is not linked under CLI" documents the behaviour.
3. Yes. Old: filter English, then first `href === PLUGINS_PAGE`. New (index.js:106–108): first meta with `href === PLUGINS_PAGE && lang === en` — the first element satisfying both predicates is the same in either order. The existing test "llms.txt takes the plugins and the CLI page from the English pages only" (mislabelled `lang: de` on `/plugins/index.html`) still passes.

## Step 2 — approved (2026-10-11)

snagio: ticked
commit: 8ebd359

## Step 3 — started (2026-10-11)

base_sha: 8ebd3598df242a7970580862502504e109062582
nera_cli_base_sha: 29239f5d8e520b1ec3fc73e943c82c94ea0ffa79
mode: fresh

## Step 3 — implemented (2026-10-11)

base_sha: 8ebd359 (nera-website, unchanged by this step); nera-cli base 29239f5 → commit 049a8f5

### Changed
- `../nera-cli/ROADMAP-ai.md` (status header) — names 2b as done (`/docs/cli.md`, linked from `llms.txt`); "Still open in slice 2" now only the "Using Nera with AI" page
- `../nera-cli/ROADMAP-ai.md` (L2 bullet) — `/<page>.md` now "docs and tutorials", example `/docs/cli.md` beside `/docs/cli.html`, and that `llms.txt` links these files
- `../nera-cli/ROADMAP-ai.md` (slice order, item 2) — "raw `.md` pages (2b) done 2026-10-11"
- `../nera-cli/ROADMAP-ai.md` (Slice 2 progress, earlier D3) — "Links keep the `.html` paths" amended: since 2b `llms.txt` links `.md`; `Source:` lines and in-body links still `.html`
- `../nera-cli/ROADMAP-ai.md` (Slice 2 progress) — new "Done 2026-10-11 … (2b)" block: mechanism, D6–D9 (= this plan's D1–D4, renumbered to avoid clashing with the section's D1–D5), verification from steps 1–2, deploy note; "Still open" keeps only the "Using Nera with AI" page
- Committed in nera-cli as `049a8f5` (`docs(roadmap): ROADMAP-ai.md records the raw Markdown pages (2b)`), not pushed

### Fixed alongside
- none

### Carry forward
- none

### Verification
```
git -C ../nera-cli diff --stat (before commit) → ROADMAP-ai.md | 53 ++++++++++++++++++++++++++++++++++++++++++++---------  1 file changed, 44 insertions(+), 9 deletions(-)
grep -n "2b" ../nera-cli/ROADMAP-ai.md →
13:> 2b, done 2026-10-11), which `llms.txt` links (see "Slice 2 — progress").
163:  Markdown, e.g. `/docs/cli.md` beside `/docs/cli.html` (slice 2b). `llms.txt`
487:   pages (2b) done 2026-10-11**, see "Slice 2 — progress".
745:  context. Links keep the `.html` paths the site serves. (Since 2b,
780:next to each English docs and tutorials page (2b).** The same plugin writes
git -C ../nera-cli status --porcelain (after commit) → (empty)
```

### Self-critique
- Renumbered the plan's D1–D4 to D6–D9 in the spec: the "Slice 2 — progress" section already has its own D1–D5, and a second D1–D4 in the same section would be ambiguous. The plan's labels stay as they are.
- Wrote "Goes live on nera.js.org with the next `nera-website` push" rather than "live": `nera-website` is 2 commits ahead of origin, so claiming deployment would be false. Once pushed and checked, a follow-up note could say "deployed".
- Verification numbers (21/21 tests, 16 files, 17 `.md` links) are copied from the steps 1–2 reports, not re-run in this step (this step changed no site code).
- Did not push nera-cli (not asked).

### Pressure-test questions for the reviewer
1. Does any sentence still contradict D4/D9 — i.e. say `llms.txt` links `.html`? (Line ~745 is the one amended; check the D4 "sections" bullet too.)
2. Is "17 `.md` links" vs "16 pages" clear enough? (The CLI reference is linked under both Docs and `## CLI`.)
3. Is the "Goes live with the next push" phrasing the right call versus leaving deploy state out?

## Step 3 — reviewed (2026-10-11)

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
Goal (status header, L2 bullet, slice-order item 2, D3 amendment, new 2b "Done" block, "Still open" trimmed to the "Using Nera with AI" page) all present in nera-cli `049a8f5` (diff 29239f5..049a8f5: ROADMAP-ai.md only, +44/−9; `git -C ../nera-cli status --porcelain` empty) · Verify: `grep -n "2b"` → lines 13, 163, 487, 745, 780, each reads as done · Non-negotiables: decision written back to the spec as a nera-cli commit, named in the log; nothing pushed; no public/ edit · Self-critique claims checked against `plugins/llms-txt/index.js`: cache emptied first (:68 `rmSync`), same `markdownPath` helper for asset path and llms.txt link (:55, :102), `.md` text is the same `renderPage` output joined into llms-full.txt (:55–56) so D8's "exactly the page's section of llms-full.txt" is accurate · D6–D9 renumbering justified (section already has D1–D5) · Scope: nera-website diff is only the plan/log/active-marker bookkeeping · Walkthrough n/a (none).

### Answers to the pressure-test questions
1. No contradiction left. The only "Links keep the `.html` paths" sentence (:745) is amended in place to say `llms.txt` links `.md` since 2b while `Source:` lines and in-body links stay `.html`. The D4 "sections" bullet (:748–754) names no link form ("the CLI reference"), so it does not conflict with D9. `grep -n '\.html'` finds no other claim that llms.txt links `.html`.
2. Clear enough: D9 explicitly names "the CLI reference under `## CLI`" as a page item, which accounts for 17 links over 16 pages to a careful reader. An explicit "(the CLI reference appears twice)" would be marginally clearer but is not needed.
3. Right call. nera-website is ahead of origin and the conventions forbid pushing, so "live" would be false; "Goes live … with the next push" is accurate and tells the next session what to update once deployed.

## Step 3 — approved (2026-10-11)

snagio: ticked
