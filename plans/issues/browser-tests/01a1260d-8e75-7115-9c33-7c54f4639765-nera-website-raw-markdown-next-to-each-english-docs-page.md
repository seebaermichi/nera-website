# Browser test: 01a1260d-8e75-7115-9c33-7c54f4639765 — [nera-website] Raw Markdown next to each English docs page

**Date:** 2026-10-11 (re-run after step 4) · **Branch:** main · **Base URL:** http://localhost:3124/
**AC source:** plan + snapshot 2026-10-11

Not browser-observable, so not cases here (proven by the loop's steps 1–3, see the log):
AC 3 "produced through `getAssets`" (only its outcome — the files exist after a build
that deletes `public/` — is checked in TC-1), AC 5 "lint && test && validate &&
build --check passes", AC 6 "decisions written back into ROADMAP-ai.md".

## Preconditions

- **Role / user:** visitor, no login
- **Test data:** none — a fresh `npm run build`, then `npx nera serve --port 3124`

## Test cases

### TC-1 — every English docs and tutorials page has its .md beside the .html

**AC:** "`npm run build` emits `public/<dirname>/<name>.md` for every English docs and tutorials page in `llms-full.txt` (16 files), none for `/de/` or `/es/`"
**Status:** PASS

1. Navigate to `/docs/cli.md`, then `/tutorials/build-a-blog.md`.
2. Expect: each is shown as text (status 200, no 404, not the HTML page).
3. For all 16 pages listed in `/llms-full.txt` (`Source:` lines), request `/<dirname>/<name>.md`.
4. Expect: all 16 return 200.

**Expected:** all 16 English docs/tutorials `.md` URLs are served.
**Evidence:** PASS — all 16 `Source:` pages of /llms-full.txt answer `/<dirname>/<name>.md` with 200 `text/markdown`, none is HTML.

---

### TC-2 — no .md for the German and Spanish pages (negative)

**AC:** "… none for `/de/` or `/es/`"
**Status:** PASS

1. Navigate to `/de/docs/cli.md` and `/es/docs/cli.md` (the `.html` versions exist).
2. Expect: neither serves Markdown (404 / not found).

**Expected:** no translated page has a `.md` file.
**Evidence:** PASS — `/de/docs/cli.md`, `/es/docs/cli.md`, `/de/` and `/es/tutorials/build-a-blog.md` return the server's SPA fallback (`text/html`, byte-identical to `/`), not Markdown.

---

### TC-3 — a .md file holds clean Markdown with absolute links and a Source line

**AC:** "Each `.md` holds the page's Markdown without frontmatter, with absolute links and a `Source:` line naming the `.html` page"
**Status:** PASS

1. Navigate to `/docs/cli.md`.
2. Expect: no `---` frontmatter block (no `layout:`, `title:` keys) at the top; one `# ` H1.
3. Expect: a `Source:` line with `https://nera.js.org/docs/cli.html`.
4. Expect: every Markdown link to a site page starts with `https://nera.js.org/` (no root-relative `](/…`).
5. Repeat 2–4 on `/tutorials/build-a-blog.md` and `/docs/index.md`.

**Expected:** the three sampled files are frontmatter-free, single-H1, absolute-linked, with the right `Source:` URL.
**Evidence:** PASS — cli, build-a-blog, index: no leading `---`, one H1 outside code fences, correct `Source: https://nera.js.org/<page>.html`, 0 root-relative links (e.g. `https://nera.js.org/tutorials/tag-your-content.html`).

---

### TC-4 — llms.txt links the .md files, and the links resolve

**AC:** "`llms.txt` links the `.md` file of each docs/tutorials/CLI page"
**Status:** PASS

1. Navigate to `/llms.txt`.
2. Expect: every link under `## Docs`, `## Tutorials` and `## CLI` ends in `.md` (`https://nera.js.org/docs/….md`), none in `.html`.
3. Expect: `## Plugins` links are unaffected (npm/GitHub URLs).
4. Open the local equivalent of the first Docs, the first Tutorials and the CLI link.
5. Expect: each returns the Markdown file (200).

**Expected:** all docs/tutorials/CLI items point to existing `.md` files.
**Evidence:** PASS — Docs 7/7, Tutorials 9/9 and the CLI page link end in `.md` (second CLI item is the npm package); Plugins keep 16 GitHub URLs; all 17 site links resolve 200 locally.

---

### TC-5 — the HTML pages are unaffected

**AC:** derived — the `.md` files sit *next to* the pages, not instead of them
**Status:** PASS

1. Navigate to `/docs/cli.html`.
2. Expect: the normal rendered page, no console errors.

**Expected:** the HTML page still renders as before.
**Evidence:** PASS — /docs/cli.html renders normally (screenshot 01a1260d-8e75-tc-5-cli-html.png), 0 console errors/warnings, no failed requests; clicking **Getting started** in the sidebar navigates (click probe).

---

### TC-6 — each English docs/tutorials page advertises its .md in the head

**AC:** plan step 4 (triage item, user decision 2026-10-11) — "`layout.pug` renders `link(rel="alternate", type="text/markdown", href=meta.markdown_href)` in `head`" on exactly the pages `selectPages` returns
**Status:** PASS

1. Navigate to `/docs/cli.html`, `/tutorials/build-a-blog.html`, `/docs/index.html`.
2. Expect: the `head` holds one `<link rel="alternate" type="text/markdown">` whose `href` is the page's own `.md` (`/docs/cli.md`, …), no `hreflang`.
3. Follow each `href` (resolved against the page).
4. Expect: 200 with the page's Markdown (`Source:` line names that page).

**Expected:** the head link exists on the sampled English pages and resolves to their Markdown file.
**Evidence:** PASS — cli, build-a-blog, docs/index each carry exactly one `link rel=alternate type=text/markdown`, no `hreflang`, resolving 200 `text/markdown` with the matching `Source:` line. Observation: href carries core's cache-buster, e.g. `/docs/cli.md?v=b199fa56ea`, not bare `/docs/cli.md`.

---

### TC-7 — no Markdown link on translated or non-docs pages (negative)

**AC:** plan step 4 — "`/de/`, `/es/` and non-docs pages get no link"
**Status:** PASS

1. Navigate to `/de/docs/cli.html`, `/es/tutorials/build-a-blog.html`, `/` and `/plugins/`.
2. Expect: no `link[type="text/markdown"]` in the head; the hreflang alternates of canonical-links are still there.

**Expected:** only the 16 English docs/tutorials pages carry the link.
**Evidence:** PASS — `/de/docs/cli.html`, `/de/docs/index.html`, `/es/docs/cli.html`, `/es/tutorials/build-a-blog.html`, `/`, `/plugins/index.html`: 0 Markdown links; canonical-links hreflang alternates still present (1–2 each).

