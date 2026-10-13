# Work log — 01a136ac-bff6-731b-9d57-2302a580a85e-nera-website-tutorial-build-a-blog-complete-end-to-end-blog

- **Issue:** `01a136ac-bff6-731b-9d57-2302a580a85e`

## Issue snapshot (2026-10-13)

- **Id:** `01a136ac-bff6-731b-9d57-2302a580a85e`
- **Type:** improvement
- **Group:** Tutorials
- **Status:** in_progress
- **Title:** [nera-website] Tutorial "Build a blog": complete end-to-end blog with a real post index (plugin-simple-page-list)

## Today
`pages/tutorials/build-a-blog.md` is the first tutorial (`pagination_order: 1`, tag `getting-started`) and the thinnest. Steps 1, 2 and 4 are fine; step 3 ("List them") has **no code**: "A tiny local plugin under `src/plugins/` can collect every post into `app.posts` … Your index layout then loops over that list." No plugin code, no index page, no template. A reader ends with posts but no blog index. It ignores `@nera-static/plugin-simple-page-list` (2.3.3), the published plugin for exactly this, and never points at tags, pagination, images, code blocks or a sitemap.

## Instead
An end-to-end blog that works when followed literally in a fresh `nera new` site:
1. Scaffold (`npx @nera-static/nera new my-blog`). The scaffold has `theme/views/layouts/layout.pug` and `theme/views/pages/default.pug`, no `src/plugins/`.
2. Posts under `pages/posts/` with `title`, `description`, `createdAt` (needed for stable order on CI) and `layout`.
3. The index: `plugin-simple-page-list` (`page_paths` / grouped output, its published template via `npx nera-simple-page-list`), with an index page and the template code shown in full. Decide in the plan whether the local-plugin route stays as an aside (link the local-plugin tutorial) or goes.
4. Grow it: tags (link the tags tutorial), prev/next (link the pagination tutorial), and one-line pointers to the images, code-blocks and sitemap tutorials where they exist.
5. Preview with `npm run dev`.

Related open work: `[nera-starter-blog] Blog starter kit` and `[nera-cli] nera new --starter …` (S5 Starters). Don't wait for them; once `nera new --starter blog` ships, add one line "or start from the blog starter".

## Why
It is the entry tutorial. A first-time reader who can't finish it leaves.

## Where
- `pages/tutorials/build-a-blog.md` (+ de, es)
- Sources: `../nera-plugin-simple-page-list/README.md`, `../nera-cli/template/`

## Acceptance criteria
- [ ] Following the English tutorial literally in a fresh site yields an index listing the posts newest-first, verified in the browser.
- [ ] Every snippet is complete (no "a tiny plugin can…" without code).
- [ ] en/de/es match.
- [ ] English stamp lists `nera`, `core`, `plugin-simple-page-list` and every other plugin it now teaches, with current versions; `verified_on` today.

## How to work it

- Work from `nera-website/` (`/work-issue <id>`). Read `.claude/issue-conventions.md` there and the rule "Check the tutorials too" in the workspace `../CLAUDE.md`.
- Tutorials live in three languages: `pages/tutorials/<slug>.md` (en), `pages/de/tutorials/<slug>.md`, `pages/es/tutorials/<slug>.md`. Every change lands in all three, translated, with the same `## ` sections.
- Frontmatter as in the neighbouring tutorials: `layout: pages/tutorial.pug`, `title`, `slug`, `lang`, `description`, `keywords`, `tags` (comma-separated; existing tags include getting-started, blog, plugins, search, seo, navigation, links, pagination, tags, local-plugins, advanced, case-study), `pagination_order`, `createdAt`. The **English** page also carries `verified_on` (today) and `verified_with` (package names without `@nera-static/` → the version the text was checked against). de/es carry no stamp.
- Test every command and snippet the tutorial shows in a throwaway site, never only by reading: `T=$(mktemp -d) && cd "$T" && npx @nera-static/nera new site && cd site` (if npm crashes, put Node 22 first: `PATH=~/.nvm/versions/node/v22.22.0/bin:$PATH`). Delete `$T` afterwards.
- Done means: `node ../.claude/skills/tutorial-review/drift.mjs` shows the tutorial `current` with de/es parity, and `npm run lint && npm test && npm run validate && npm run build -- --check` passes in `nera-website`.
- Never push: a push to `main` deploys nera.js.org. Hand over the `git push`.

## Cloud launch (2026-10-13)

- **Worked in a Claude Code cloud session**, outside the local plan → implement → review → approve loop (to use the cloud credit). The gate was not armed.
- **Brief:** `plans/cloud/01a136ac-bff6-731b-9d57-2302a580a85e-brief.md` · **Branch:** `issue/01a136ac-build-a-blog` · **Session:** launched by the user (URL to be added)
- **Decided in the brief:** local-plugin route reduced to a one-line link; home page = blog index; images/code blocks pointed at `/plugins/` (no tutorials yet); no starter mention; flat vs grouped config left to the cloud.
- **On return:** `/work-issue-cloud 01a136ac-bff6-731b-9d57-2302a580a85e` — verify locally (incl. browser test), triage, merge, reconcile, resolve.

## Cloud result (2026-10-13)

- **Branch:** `issue/01a136ac-build-a-blog` · 10 commits (after dropping 1) · result file `plans/cloud/01a136ac-bff6-731b-9d57-2302a580a85e-result.md`
- **Summary:** `build-a-blog` (en/de/es) rewritten end to end in five sections: scaffold → two posts with `createdAt` → home page as index via `plugin-simple-page-list` (flat `page_path: /posts`, `theme/views/pages/blog.pug`, full `pages/index.md`, published template shown in full) → one-line pointers (tags, prev/next, sitemap, images, code blocks) → `npm run dev`/`build`. Local-plugin route is a one-line link. Stamp: nera 1.11.0, core 4.16.0, plugin-simple-page-list 2.3.3.
- **Verified locally** (worktree, Node 22.22.0, rebased onto `main` 7abf3f1 without conflicts): `npm ci && npm run lint && npm test` → 37 pass / 0 fail; `npm run validate` → no problems; `npm run build -- --check` → no problems, tree unchanged afterwards (search index consistent).
- **drift.mjs** (run against the worktree): build-a-blog `current` for nera/core/plugin-simple-page-list; "Every tutorial has de and es with the same number of sections".
- **Literal replay:** fresh `npx @nera-static/nera new my-blog`, every block of the English page written/run in order → published template byte-identical to the shown block; `public/index.html` lists second-post, then hello-world.
- **Review findings:** the cloud committed the maintainer's uncommitted local change to the bb86 work log (`5004c73 chore(plan): browser test log for the how-this-site-is-built issue`, byte-identical to the dirty local file) — dropped from the branch; the local file stays as it was. Lesson: the cloud bundle carries uncommitted tracked changes. Tutorial text: no findings (sitemap pointer correct — canonical-links-seo covers plugin-sitemap; de/es links all `/de/`, `/es/`).

### Decisions
- Flat `page_path: /posts`, not grouped (grouped prints the raw key `posts` as an h3).
- The published `simple-page-list.pug` is shown in full (issue asks for it; byte-identical to 2.3.3).
- Config shows all four keys, though three equal the defaults.
- Root-absolute include `/vendor/…`, one sentence on the slash.
- Post files stay English in de/es (blocks match the verified files).
- Sitemap pointer via the canonical-links tutorial + catalog; images/code blocks via the catalog.
- Regenerated `theme/assets/search-index*.json` committed.
- `pages/tutorials/index.md` (+ de/es) unchanged.

### Carry forward
- Once the blog starter ships (`[nera-starter-blog] Blog starter kit`, open), add "or start from the blog starter" to section 1 (en/de/es).

## Browser test (2026-10-13)

Result: PASS

| # | case | result |
|---|---|---|
| 1 | Fresh site built literally from the English tutorial, `npm run dev`, http://localhost:3000/ in Chrome | PASS — "My blog", "Recent Pages", "My second post" above "Hello world" |
| 2 | Each list link opens its post | PASS — both 200, h1 matches title |
| 3 | `/tutorials/build-a-blog.html`, `/de/…`, `/es/…` on the built site (`vite public`) | PASS — all 200, 5 h2 and 10 `.nera-code` blocks each, `lang` correct |
| 4 | Internal links of the de page (tutorials, catalog, tags) | PASS — all 200, `/de/`-prefixed |
| 5 | 45-line Pug template block renders highlighted (es) | PASS |

## Triage (2026-10-13)

| # | item | from | disposition | why |
|---|---|---|---|---|
| 1 | "or start from the blog starter" line in section 1 (en/de/es) | cloud carry-forward | file | blocked on a release in another repo (`nera-starter-blog`, open); a `[nera-website]` issue that waits for it |

Already done / elsewhere: stray commit `5004c73` dropped (local file untouched).
Planning signal: the cloud bundle includes uncommitted tracked changes — keep the tree clean before a launch, or expect them on the branch.

## Resolved (2026-10-13)

- Merged into `main` locally (fast-forward, cloud commits kept, stray `5004c73` dropped), brief + log in `chore(plan)`; not pushed. Triage item 1 filed as `[nera-website] Tutorial "Build a blog": point at the blog starter once it ships`. No release (site). Status resolved.
