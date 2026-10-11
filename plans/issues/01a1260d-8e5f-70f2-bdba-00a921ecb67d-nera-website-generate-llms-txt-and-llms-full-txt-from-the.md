# Plan: [nera-website] Generate llms.txt and llms-full.txt from the English docs

- **Issue:** `01a1260d-8e5f-70f2-bdba-00a921ecb67d`
- **Type:** feature
- **Plan written:** 2026-10-11

## Context

Slice 2 (L2) of `../nera-cli/ROADMAP-ai.md`: nera.js.org publishes `/llms.txt` (the
llmstxt.org index: H1, one-paragraph summary, linked sections with one-line
descriptions) and `/llms-full.txt` (all English docs and tutorials as one Markdown
file, frontmatter stripped, in navigation order). English only (D3). A new local
plugin `plugins/llms-txt/index.js` reads the Markdown sources behind the English
pages in `pages/docs/` and `pages/tutorials/`, orders them by `pagination_order`,
and hands both files to core through `getAssets`. The "Using Nera with AI" page and
the raw `/<page>.md` files (slice 2b) are separate work and out of scope here.

## Design decisions

**D1 — Page selection from `pagesData`, body from the source file.** English pages
(`meta.lang` `en`) whose `meta.dirname` is exactly `/docs` or `/tutorials` and which
carry `pagination_order`; the body is read from `pages/<dirname>/<name>.md` and the
leading `---` frontmatter block is cut off by a small split, no new dependency.
**D2 — Files are written to `.nera-cache/llms-txt/` inside `getAssets`** and returned
as `{ from, to: 'llms.txt' | 'llms-full.txt' }`; `.nera-cache/` is gitignored.
**D3 — Root-relative Markdown links (`](/…)`) become absolute** with the site origin,
so the text works out of context; the origin comes from `config/llms-txt.yaml`
(`origin`), falling back to `https://nera.js.org`.
**D4 — `llms.txt` sections:** Docs, Tutorials (title + `description` per page),
Plugins (from the English plugins page's `plugins:` frontmatter), CLI (the CLI
reference + the `@nera-static/nera` npm page), and an `Optional` section linking
`llms-full.txt`. Starters are omitted until one exists. Summary and H1 come from
`config/llms-txt.yaml` with JS fallbacks.
**D5 — Tests with `node:test`** in `plugins/llms-txt/index.test.js`, run by a new
`npm test` (`node --test plugins/`) and a CI step — no new dependency.

## Acceptance criteria

- [ ] `npm run build` emits `public/llms.txt`: an H1, a one-paragraph summary, then linked sections (Docs, Tutorials, Plugins, CLI), each link with a one-line description
- [ ] `npm run build` emits `public/llms-full.txt`: every English docs and tutorials page, frontmatter stripped, in `pagination_order` (docs first, then tutorials)
- [ ] Both files are produced by `plugins/llms-txt/` through `getAssets` — nothing written into `public/` directly
- [ ] English only: no `/de/` or `/es/` page appears in either file
- [ ] `npm run lint && npm run validate && npm run build -- --check` passes
- [ ] The decisions are written back into `../nera-cli/ROADMAP-ai.md` (slice 2 progress)

## Steps

### Step 1 — Plugin emits llms-full.txt from the English docs and tutorials — ✅ done

- **Goal:** `plugins/llms-txt/index.js` selects the English docs/tutorials pages, orders them (docs by `pagination_order`, then tutorials by `pagination_order`), strips frontmatter, absolutises root-relative links, writes `.nera-cache/llms-txt/llms-full.txt` and returns it from `getAssets`; a page in those folders without `pagination_order` (other than the tutorials index) logs a warning.
- **Files:** `plugins/llms-txt/index.js` — new plugin; `plugins/llms-txt/index.test.js` — `node:test` tests on a fixture `pagesData` + temp `pages/`; `config/llms-txt.yaml` — `origin`, `title`, `summary`; `.gitignore` — add `.nera-cache`; `package.json` — `"test": "node --test plugins/"`
- **Verify:** `npm test && npm run lint && npm run build && head -40 public/llms-full.txt && grep -c '^---$' public/llms-full.txt` — tests pass, the file starts with the Introduction page body, no frontmatter block survives, no `/de/`/`/es/` content
- **Review hardest:** the frontmatter split — a page body containing `---` (a horizontal rule or a YAML code block) must not be cut
- **Risks:** `getAssets` is called once per build; writing under `process.cwd()` assumes the build runs from the site root, like every plugin's config lookup
- **Walkthrough:** none

### Step 2 — Plugin emits the llms.txt index — ✅ done

- **Goal:** `getAssets` also writes and returns `llms.txt`: `# <title>`, `> <summary>`, then `## Docs`, `## Tutorials`, `## Plugins`, `## CLI`, `## Optional`, each item `- [Title](absolute URL): description`.
- **Files:** `plugins/llms-txt/index.js` — index builder; `plugins/llms-txt/index.test.js` — section/order/link tests; `config/llms-txt.yaml` — final summary text
- **Verify:** `npm test && npm run lint && npm run build && cat public/llms.txt` — every link absolute (`https://nera.js.org/…`), every item has a description, Plugins lists the 16 catalog entries
- **Review hardest:** page URLs — `meta.href` for an index page (`/docs/index.html`) and whether links should be `.html` paths as the site serves them
- **Risks:** a plugin `description` with Markdown-significant characters (`<link>`) passes through verbatim — acceptable in Markdown, check it reads cleanly
- **Walkthrough:** none

### Step 3 — Wire the tests into CI and prove the full check — ✅ done

- **Goal:** CI runs the plugin tests; the full hygiene check passes on the built site.
- **Files:** `.github/workflows/test.yml` — a "Run local plugin tests" step (`npm test`) after lint
- **Verify:** `npm run lint && npm test && npm run validate && npm run build -- --check && ls -l public/llms.txt public/llms-full.txt` — all pass, both files present, no new check warnings
- **Review hardest:** that `node --test plugins/` picks up the test file on Node 20 and 22 (glob/dir semantics differ between versions)
- **Risks:** the husky pre-push hook runs `nera validate` only — unaffected
- **Walkthrough:** none

### Step 4 — Record the slice-2 progress in the spec — ✅ done

- **Goal:** `../nera-cli/ROADMAP-ai.md` records D1–D5 and that the `llms.txt`/`llms-full.txt` part of slice 2 is done (remaining: the "Using Nera with AI" page, 2b raw `.md` pages, the `llms.txt` link in the template's `AGENTS.md`); committed in `nera-cli` and named in the work log.
- **Files:** `../nera-cli/ROADMAP-ai.md` — slice 2 progress note + status header
- **Verify:** `git -C ../nera-cli diff --stat && grep -n 'llms-full.txt' ../nera-cli/ROADMAP-ai.md` — only the ROADMAP changed; the note names the plugin path and the five decisions
- **Review hardest:** that the note states only what is true after the build (not yet deployed — no push)
- **Risks:** none outside the doc
- **Walkthrough:** none

### Step 5 — Fix the Tags link in build-a-blog and the stale test note in the conventions — ✅ done

- **Goal:** the "Tags" link at the end of the build-a-blog tutorial points at the tag tutorial in all three languages (so `llms-full.txt` carries the right target too), and `.claude/issue-conventions.md` describes the local plugin tests that CI now runs.
- **Files:** `pages/tutorials/build-a-blog.md:50`, `pages/de/tutorials/build-a-blog.md:52`, `pages/es/tutorials/build-a-blog.md:52` — `add-search.html` → `tag-your-content.html` (keep the language prefix); `.claude/issue-conventions.md` (Tests & hygiene) — hygiene check gains `npm test`, "There is no unit-test suite" becomes "local plugins carry `node --test` files beside them (`plugins/*/*.test.js`), run by `npm test` in CI"
- **Verify:** `grep -rn 'add-search' pages/*/tutorials/build-a-blog.md pages/tutorials/build-a-blog.md` prints nothing; `npm run build && grep -c 'tag-your-content.html' public/llms-full.txt` ≥ 1; `npm run lint && npm test && npm run validate && npm run build -- --check` passes
- **Review hardest:** that each link keeps its language prefix (`/de/…`, `/es/…`) and the target files exist; that the conventions text matches `package.json`'s `test` script and `test.yml`
- **Risks:** none outside content and project docs
- **Walkthrough:** none
