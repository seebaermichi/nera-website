# Plan: [nera-website] Raw Markdown next to each English docs page

- **Issue:** `01a1260d-8e75-7115-9c33-7c54f4639765`
- **Type:** feature
- **Plan written:** 2026-10-11

## Context

Slice 2b (L2) of `../nera-cli/ROADMAP-ai.md`: next to every English docs page,
nera.js.org serves the page's Markdown at `/<page>.md` (e.g. `/docs/cli.md` beside
`/docs/cli.html`), so an assistant can fetch one page as clean Markdown instead of
scraping HTML or loading all of `llms-full.txt`. English only (D3). The work lands in
the existing local plugin `plugins/llms-txt/index.js`, which already selects the
English docs and tutorials (`selectPages`) and renders one page as Markdown
(`renderPage`) for `llms-full.txt`; the new files go to `public/` through the same
`getAssets` hook via `.nera-cache/llms-txt/`. `llms.txt` then links these files. The
"Using Nera with AI" page is separate work, out of scope.

## Design decisions

**D1 — URL is `/<dirname>/<name>.md`** (`/docs/cli.md`), as the spec says — not the
llmstxt.org `.html.md` form. (User decision, 2026-10-11.)
**D2 — Same page set as `llms-full.txt`:** the 16 English docs + tutorials pages
`selectPages` returns, so the two outputs cannot drift. (User decision.)
**D3 — Each `.md` is exactly `renderPage`'s output:** frontmatter stripped, root-relative
links absolute, one H1, a `Source:` line with the page's `.html` URL. "Raw" means the
author's Markdown body, not the frontmatter (layout, pagination keys) only Nera needs.
**D4 — `llms.txt` links the `.md` files** for every page item (Docs, Tutorials and the
CLI page in `## CLI`); `Source:` lines keep the `.html` URL humans see. Reverses the
slice-2 "links keep `.html`" note for those items. (User decision.)

## Acceptance criteria

- [ ] `npm run build` emits `public/<dirname>/<name>.md` for every English docs and tutorials page in `llms-full.txt` (16 files), none for `/de/` or `/es/`
- [ ] Each `.md` holds the page's Markdown without frontmatter, with absolute links and a `Source:` line naming the `.html` page
- [ ] The files are produced by `plugins/llms-txt/` through `getAssets` — nothing written into `public/` directly
- [ ] `llms.txt` links the `.md` file of each docs/tutorials/CLI page
- [ ] `npm run lint && npm test && npm run validate && npm run build -- --check` passes
- [ ] The decisions are written back into `../nera-cli/ROADMAP-ai.md` (slice 2 progress)

## Steps

### Step 1 — Plugin emits a .md file next to each English docs and tutorials page — ✅ done

- **Goal:** `getAssets` also writes each selected page's `renderPage` output to `.nera-cache/llms-txt/pages/<dirname>/<name>.md` and returns `{ from, to: '<dirname>/<name>.md' }` beside `llms.txt` and `llms-full.txt`; `llms-full.txt` is the same pages' text joined, rendered once.
- **Files:** `plugins/llms-txt/index.js` — per-page assets, header comment; `plugins/llms-txt/index.test.js` — one `.md` per selected page, path mapping, content equals the page's section in `llms-full.txt`, no `/de/`/`/es/` file, nothing for an unordered page
- **Verify:** `npm test && npm run lint && npm run build && ls public/docs/*.md public/tutorials/*.md | wc -l && head -8 public/docs/cli.md && ls public/de/docs/*.md public/es/docs/*.md 2>&1 | head -2` — 16 files, `cli.md` opens with its H1 and `Source: https://nera.js.org/docs/cli.html`, no `.md` under `/de/` or `/es/`
- **Review hardest:** the cache path — a page's `.md` must not collide with `llms.txt`/`llms-full.txt` or with another page, and `to` must be relative to `public/` without a leading slash
- **Risks:** `.md` files in `public/` reaching the search index or tripping `nera build --check` (both should only read `.html` — check the build output)
- **Walkthrough:** none

### Step 2 — llms.txt links the .md files — ✅ done

- **Goal:** every page item in `llms.txt` (`## Docs`, `## Tutorials`, the CLI page in `## CLI`) links `<origin>/<dirname>/<name>.md`; the plugin catalog, the npm link and `## Optional` are unchanged.
- **Files:** `plugins/llms-txt/index.js` — `pageItem` URL; `plugins/llms-txt/index.test.js` — link assertions updated, one test that a linked `.md` is among the returned assets
- **Verify:** `npm test && npm run lint && npm run validate && npm run build -- --check && grep -c '\.md):' public/llms.txt && grep -c '\.html):' public/llms.txt` — 17 `.md` links (7 docs, 9 tutorials, the CLI page); no `.html` page link left
- **Review hardest:** the `.md` URL must be derived from the same mapping as the asset path in step 1 (one helper), so a link can never point at a file that was not emitted
- **Risks:** an assistant that already cached `llms.txt` links to `.html` — harmless, those pages still exist
- **Walkthrough:** none

### Step 3 — Write the decisions back into the spec — ✅ done

- **Goal:** `../nera-cli/ROADMAP-ai.md` "Slice 2 — progress" records 2b done (D1–D4 above, what was verified), the L2 bullet names `/docs/cli.md` as the example and that `llms.txt` links the `.md` files, and the "Still open in slice 2" line keeps only the "Using Nera with AI" page; the status header at the top agrees. Committed in `nera-cli` and named in the work log.
- **Files:** `../nera-cli/ROADMAP-ai.md` — slice 2 progress, L2 bullet, status header
- **Verify:** `git -C ../nera-cli diff --stat && grep -n "2b" ../nera-cli/ROADMAP-ai.md` — only the spec changed; every "2b" mention reads as done
- **Review hardest:** the earlier "Links keep the `.html` paths the site serves" sentence must be amended, not left contradicting D4
- **Risks:** none beyond the spec text
- **Walkthrough:** none

### Step 4 — Each English docs/tutorials page advertises its .md via a head link — ✅ done

- **Goal:** (triage item 1, user decision 2026-10-11: fix here) the plugin gains a `getMetaData` hook that sets `meta.markdown_href = '/' + markdownPath(meta.href)` on exactly the pages `selectPages` returns (one mapping with the emitted assets and the `llms.txt` links), and `theme/views/layouts/layout.pug` renders `link(rel="alternate", type="text/markdown", href=meta.markdown_href)` in `head` only when it is set; `/de/`, `/es/` and non-docs pages get no link. Spec note in `../nera-cli/ROADMAP-ai.md` slice 2 progress.
- **Files:** `plugins/llms-txt/index.js` — `getMetaData`, header comment; `plugins/llms-txt/index.test.js` — `markdown_href` set on selected pages only, equals `/` + the asset `to` path, other pages unchanged, returns an array; `theme/views/layouts/layout.pug` — conditional `link`; `../nera-cli/ROADMAP-ai.md` — one line under slice 2b
- **Verify:** `npm test && npm run lint && npm run validate && npm run build -- --check && grep -o '<link rel="alternate" type="text/markdown"[^>]*>' public/docs/cli.html && grep -c 'text/markdown' public/de/docs/cli.html public/index.html` — `cli.html` carries `href="/docs/cli.md"`, the German page and the home page carry none; `grep -l 'text/markdown' -r public --include=*.html | wc -l` is 16
- **Review hardest:** the link must never point at a `.md` that was not emitted — derive it from `selectPages` + `markdownPath`, not a second rule in Pug; `getMetaData` must return new page objects, not mutate `pagesData`
- **Risks:** the canonical-links plugin also writes `rel="alternate"` (hreflang) — the new link carries `type` and no `hreflang`, so it must not confuse `nera build --check`; check the build output
- **Walkthrough:** none
