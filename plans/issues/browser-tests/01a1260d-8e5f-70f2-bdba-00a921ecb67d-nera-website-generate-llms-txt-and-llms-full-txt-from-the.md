# Browser test: 01a1260d-8e5f-70f2-bdba-00a921ecb67d — [nera-website] Generate llms.txt and llms-full.txt from the English docs

**Date:** 2026-10-11 · **Branch:** main · **Base URL:** http://localhost:3124/
**AC source:** plan + snapshot 2026-10-11 · re-run after fix step 5 (commit dd8e49b)

Not browser-observable, so not cases here (proven by the loop's steps 1–4, see the log):
AC 3 "produced through `getAssets`" (only its outcome — the files exist after a clean
build that deletes `public/` — is checked in TC-1/TC-3), AC 5 "lint && validate &&
build --check passes", AC 6 "decisions written back into ROADMAP-ai.md".

## Preconditions

- **Role / user:** visitor, no login
- **Test data:** none — a fresh `npm run build`, then `npx nera serve --port 3124`

## Test cases

### TC-1 — /llms.txt has an H1, a summary paragraph and the four linked sections

**AC:** "`npm run build` emits `public/llms.txt`: an H1, a one-paragraph summary, then linked sections (Docs, Tutorials, Plugins, CLI), each link with a one-line description"
**Status:** PASS

1. Navigate to `/llms.txt`.
2. Expect: the file is shown as plain text (not downloaded, no 404), special characters such as the em dash render correctly.
3. Expect: the first line is `# Nera`, followed by one `> …` summary paragraph.
4. Expect: `## Docs`, `## Tutorials`, `## Plugins`, `## CLI` headings in this order (plus `## Optional`), and every list item has the form `- [Title](url): description`.

**Expected:** the index follows the llmstxt.org shape with all four sections and no link lacking a description.
**Evidence:** PASS — `# Nera`, one `> …` summary, `## Docs/Tutorials/Plugins/CLI/Optional` in order, 35 items all `- [Title](url): description`; served `text/plain` without charset, so the em dash shows mis-decoded in the browser locally (file is valid UTF-8; screenshot 01a1260d-tc-1-llms-txt.png).

---

### TC-2 — the links in /llms.txt are absolute and lead to real pages

**AC:** "… then linked sections (Docs, Tutorials, Plugins, CLI), each link with a one-line description" (derived outcome: the links work)
**Status:** PASS

1. On `/llms.txt`, read the Docs and Tutorials links.
2. Expect: each starts with `https://nera.js.org/`.
3. Open the local equivalent of the first Docs link and one Tutorials link (`/docs/index.html`, `/tutorials/build-a-blog.html`).
4. Expect: both pages load with the title the link names.

**Expected:** links are absolute and point at existing pages.
**Evidence:** PASS — all Docs/Tutorials links absolute `https://nera.js.org/…`; all 17 nera.js.org links answer 200 locally with the named title (e.g. /docs/index.html → "Introduction | Nera"); no console errors.

---

### TC-3 — /llms-full.txt holds every English docs and tutorials page, frontmatter stripped, in order

**AC:** "`npm run build` emits `public/llms-full.txt`: every English docs and tutorials page, frontmatter stripped, in `pagination_order` (docs first, then tutorials)"
**Status:** PASS

1. Navigate to `/llms-full.txt`.
2. Expect: served as plain text.
3. Expect: the 7 docs pages (Introduction → CLI reference) and then the 9 tutorials (Build a blog → How this website is built) appear in that order, matching the order in `/llms.txt`.
4. Expect: no frontmatter block (`---` followed by `layout:`, `title:`, `pagination_order:` …) at the start of any page.

**Expected:** all 16 pages, docs before tutorials, each in `pagination_order`, no frontmatter.
**Evidence:** PASS — 16 H1s outside code fences, 7 docs (Documentation → CLI reference) then 9 tutorials (Build a blog → How this website is built), same order as llms.txt; no frontmatter line outside code fences; no root-relative links left.

---

### TC-4 — English only: no German or Spanish page in either file (negative)

**AC:** "English only: no `/de/` or `/es/` page appears in either file"
**Status:** PASS

1. On `/llms.txt` and `/llms-full.txt`, search for `/de/` and `/es/`.
2. Expect: no link or page from those trees; no German/Spanish page title (e.g. the German docs intro).
3. Navigate to `/de/llms.txt` and `/es/llms.txt`.
4. Expect: no `llms` text file is served there (local `nera serve` falls back to the home page HTML for unknown paths), and `public/` holds no `de/llms*.txt` or `es/llms*.txt`.

**Expected:** neither file contains a `/de/` or `/es/` page, and no language copies exist.
**Evidence:** PASS — 0 `/de/` or `/es/` links, no DE/ES titles in either file; `/de/llms.txt`, `/es/llms.txt`, `/de/llms-full.txt` return the dev server's HTML fallback, no text file; `public/` holds only `llms.txt` and `llms-full.txt`.

---

### TC-5 — the Tags link in build-a-blog points at the tags tutorial (derived, fix step 5)

**AC:** derived — fix step 5 of the plan, which repaired a wrong link carried into `/llms-full.txt`
**Status:** PASS

1. Navigate to `/tutorials/build-a-blog.html` and find the closing sentence "That's a working blog. From here, add **Tags** or pagination …".
2. Click **Tags**.
3. Expect: the tags tutorial opens (`/tutorials/tag-your-content.html`), not "Add search".
4. On `/llms-full.txt`, find the same sentence.
5. Expect: the link reads `[Tags](https://nera.js.org/tutorials/tag-your-content.html)`.

**Expected:** both the page and llms-full.txt send "Tags" to the tags tutorial.
**Evidence:** PASS — real click on **Tags** in build-a-blog opens /tutorials/tag-your-content.html ("Tag your content and get topic pages for free"); llms-full.txt reads `[Tags](https://nera.js.org/tutorials/tag-your-content.html)`.

---

