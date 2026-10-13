# Cloud brief — Tutorial "Add client-side search": plugin-search 2.3 (01a136ac-bc82-70f7-9a8f-aaef6fddb2c3)

Snagio issue `01a136ac-bc82-70f7-9a8f-aaef6fddb2c3` (improvement, group "Tutorials").
You work it in a Claude Code cloud session on `seebaermichi/nera-website`. The
maintainer reviews your branch locally afterwards and closes the issue there, so
**your output is a branch plus one result file** (format at the end).

You have no access to Snagio, to the sibling repos on the maintainer's disk, or to
the workspace-level `CLAUDE.md`. Everything you need is in this brief, in the
repo, and in the npm registry. Do not run the `.claude/skills/*` loop commands or
`.claude/scripts/snagio`; they need a local token and are not part of this session.

## The task

The tutorial `pages/tutorials/add-search.md` (plus its de and es translations)
is stamped `plugin-search: 2.1.3`; the current release is **2.3.0**. Bring it up
to 2.3.0: teach `show_title` and the three translation keys
(`search_title`, `search_placeholder`, `search_label`), mention
`data-search-ignore` (2.2.0), settle the `description`-vs-`excerpt` question in
step 3, give step 4 ("Add a search page") real snippets, and replace the
July-migration upgrade paragraph with the general refresh rule. Docs change, in
three languages; edits, not a rewrite.

**The site half of the issue is already done on `main`** (checked by the
maintainer before launch): `theme/views/vendor/plugin-search/search.pug` already
has the 2.3.0 markup (`show_title`, `t()` texts, `aria-label`), `config/app.yaml`
has `search_title`/`search_placeholder`/`search_label` in en/de/es,
`package.json` has `"@nera-static/plugin-search": "^2.3.0"`, and
`npm run build -- --check` ends with "✓ No problems found." Re-confirm that, do
not redo it.

Issue text, verbatim:

```text
## Today
`pages/tutorials/add-search.md` is stamped `plugin-search: 2.1.3`; the current release is **2.3.0**. Two releases changed what the tutorial teaches:
- **2.2.0** — elements marked `data-search-ignore` are dropped from `content` before indexing (plugin-code-blocks ≥ 1.1.0 marks its code-block bar with it).
- **2.3.0** — `show_title` in `config/search.yaml` (default `true`, exposed as `app.searchShowTitle`): `false` leaves out the template's `h1.search__title`, for a search page whose Markdown brings its own `# Search` heading, so `nera build --check` finds one `h1` instead of warning `a11y-h1`. The template translates its heading and placeholder through `t()` (`search_title`, default `Search`; `search_placeholder`, default `Search...`) and gives the input an accessible name from `t('search_label')` (fallback `Search`), so `a11y-form-label` no longer fires.

Also stale or unclear:
- Step 3's config example indexes `description`, while the shipped `config/search.yaml` indexes `excerpt` — check which fields the scaffold's pages actually have and say why the example differs (or align it).
- The "Upgrading an existing site" paragraph is about the July 2.x per-language migration (`data-search-index`) — history now. Replace it with the general rule: `npx nera-search` skips an existing vendor folder; `--force` only if the copy was never edited, otherwise merge by hand (the plugin README's Template Publishing section).
- Step 4 ("Add a search page") has no snippet. Show the page: Markdown with `layout`, its own `# Search` heading, and `show_title: false`.

Related, on this site itself: the tutorial ends "This site's Search page is built exactly this way", but `nera build --check` in `nera-website` still warns `a11y-form-label` on `public/search.html`, `public/de/search.html`, `public/es/search.html`, because `theme/views/vendor/plugin-search/` predates 2.3.0. `config/app.yaml` already has `search_title`/`search_placeholder` in en/de/es but no `search_label`. The installed version is `^2.2.0` in `package.json`.

## Instead
The tutorial teaches 2.3.0: `show_title`, the three translation keys, `data-search-ignore`, the general refresh rule; and this site really is built that way (template refreshed by hand-merge if the vendor copy was edited, `search_label` in all three languages, dependency raised to `^2.3.0`).

## Why
A reader following the tutorial today gets a search page that fails `nera build --check`, the check another tutorial will recommend.

## Acceptance criteria
- [ ] The tutorial shows `show_title`, `search_title`/`search_placeholder`/`search_label` and `data-search-ignore`, in en/de/es.
- [ ] The search-page step has a working snippet; following the tutorial in a fresh site gives `nera build --check` without `a11y-h1` or `a11y-form-label` on the search page.
- [ ] The July-migration paragraph is replaced by the general refresh rule.
- [ ] `nera build --check` in `nera-website` no longer warns `a11y-form-label` on the three search pages.
- [ ] English stamp `plugin-search: 2.3.0` (or newer, checked), `verified_on` today.
```

(The `../nera-plugin-search/…` sources the issue names are a sibling repo you
cannot see; their relevant content is in "Facts" below, and the npm tarball
carries the README and CHANGELOG — read them under
`node_modules/@nera-static/plugin-search/` in this repo or the throwaway site.)

## Rules (read these first)

1. Read `README.md`, `.claude/issue-conventions.md` (the review rules for this
   repo — they apply to you), the three tutorial files
   (`pages/tutorials/add-search.md`, `pages/de/tutorials/add-search.md`,
   `pages/es/tutorials/add-search.md`), a neighbouring tutorial for tone and
   stamp format (`pages/tutorials/custom-navigation.md` and its de/es copies),
   and this site's own search setup: `config/search.yaml`,
   `config/plugin-order.yaml`, `theme/views/pages/search.pug`,
   `theme/views/vendor/plugin-search/search.pug`, `pages/search.md` (+ de, es),
   and the `search_*` keys in `config/app.yaml`.
2. Work on a branch named **`issue/01a136ac-bc82-search-tutorial`**, created
   from `main`. Commit in small, meaningful steps (conventional commits, e.g.
   `docs(tutorials): …`). End every commit message with
   `Co-Authored-By: Claude <noreply@anthropic.com>`.
3. **Never push to `main`, never merge, never tag, never publish to npm.**
   A push to `main` deploys the live site nera.js.org. Pushing your own branch
   is fine and expected. **Push early**: push the branch right after your first
   commit (the plan), so a push problem shows up at the start, not at the end.
   If there is no `origin` remote, add it: `git remote add origin
   https://github.com/seebaermichi/nera-website.git`. If the push fails with 403
   "… is not in this session's authorized repository set", attach
   `seebaermichi/nera-website` to this session (the error page or the session's
   repository settings offer it; it worked in earlier sessions) and push again.
   Do not fall back to a patch file unless attaching fails too. Then say so at
   the top of the result file and in your final chat message.
4. No version bump, no `CHANGELOG.md` — the site is not published to npm.
5. Code style: ESM, 4-space indent, no semicolons, single quotes (eslint). No new
   dependency. Never edit `public/` (deleted on every build).
6. **Come back finished: fix what you find, in this repo, on this branch.** The
   maintainer cannot file follow-up issues from your work, and every item you
   leave behind costs a second round. So anything wrong that you notice in this
   repo, whether your task caused it or it was already there, you fix: a warning
   from the repo's own checks, a stale lockfile or dependency floor, a template or
   copy that lags its package, an outdated sentence on a page you touched, a
   missing translation, a test gap. Put each such fix in its own commit
   (`fix(…)`, `chore(…)`), separate from the task's commits, and list it under
   "Fixed along the way". When a fix needs a decision, take the sensible default
   and write it under Decisions. The maintainer can overrule it in review.
   Carry-forwards are only for what you **cannot** do here: a change in another
   repo, a release/publish/tag/push to `main`, a GitHub setting, or something
   that needs a resource this session does not have. Each one says which of
   these it is.
7. Write a short plan into the result file (section "Plan") **before** you edit
   the tutorials, and commit it as your first commit.
8. **Before you finish, review your own branch the way the maintainer will**, and
   fix what the review finds (rule 6). Read `git diff main...HEAD` whole: scope,
   translations (every language the repo has), line wrapping and style of the
   surrounding file, claims you made that you did not check by a command. Then run
   the Done-when commands again from a clean `npm ci`. Repeat until the review
   finds nothing. Only then write the result file.

## Facts you need (the current truth, 2026-10-13)

**Three languages.** Every change lands in all three files, properly translated
(not machine-literal; match the existing de/es voice — German uses "du"), and
the three files must keep **the same number of `## ` sections** (the
maintainer's drift report checks this parity; today it is 5 each). Only the
English page carries `verified_on` / `verified_with`; de/es carry no stamp. Do
not change `description`/`keywords` unless they became wrong. Code blocks stay
identical across languages except comments and the sample Markdown page's
prose/heading, which may be translated (`# Suche`, `# Buscar`).

**The plugin, `@nera-static/plugin-search` 2.3.0** (latest on npm; from its
README, CHANGELOG and source):

- **Install** `npm install @nera-static/plugin-search`; Nera loads any
  `@nera-static/plugin-*` dependency automatically.
- **Publish** `npx nera-search` copies `search.pug` to
  `theme/views/vendor/plugin-search/` and the client to
  `theme/assets/js/search.js` (on a legacy site without `theme/`, to root
  `views/` and `assets/`). **Both skip if their destination exists** — for the
  template the check is on the **directory**, for the script on the file — so
  re-running never discards edits, and a template change in a new release never
  reaches a site that published once. `npx nera-search --force` overwrites both
  with the packaged versions: do that **only if you never edited them**;
  otherwise merge the changes by hand (diff first). This is the general refresh
  rule that replaces the July-migration paragraph.
- **Config** `config/search.yaml` is optional; every key falls back to its
  default. The defaults:

  ```yaml
  output_filename: search-index.json
  fields:
      - title
      - excerpt
      - content
      - href
  strip_html: true
  group_by_lang: false
  show_title: true
  ```

  `fields` **replaces** the default list (it does not extend it): `content` is
  the rendered body (omit it and only titles match), `href` the result link.
  Any other frontmatter key works (`description`, `keywords`, `tags`) as long as
  the page defines it; a field missing or empty on a page is left off that
  entry, not stored as `""`.
- **`data-search-ignore` (2.2.0):** elements carrying it are dropped from
  `content`, with everything inside them, whatever `strip_html` says.
  `@nera-static/plugin-code-blocks` ≥ 1.1.0 marks its code-block bar (file name,
  Copy button) with it. In Markdown, write it on raw HTML:
  `<aside data-search-ignore>…</aside>`.
- **`show_title` (2.3.0):** default `true`, exposed as `app.searchShowTitle`.
  `false` makes the shipped `search.pug` leave out its `h1.search__title`, for a
  search page whose Markdown brings its own `# Search` heading; then
  `nera build --check` finds one `h1` instead of warning `a11y-h1`. A page whose
  Markdown has **no** heading keeps the default and the template's `h1`.
- **Texts (2.3.0):** the template translates through the site's `t()`:
  `search_title` (the `h1`, default `Search`), `search_placeholder` (default
  `Search...`), and `search_label` → the input's `aria-label` (fallback
  `Search`), so `a11y-form-label` no longer fires. Translations go under
  `translations.<lang>` in `config/app.yaml` (look at this repo's
  `config/app.yaml` for the exact shape).
- **The page** (from the plugin README, adapt to the tutorial's tone): a view
  that includes the partial, and a Markdown page pointing at it. A page without
  `layout` is not rendered and not indexed.

  ```pug
  //- theme/views/pages/search.pug
  extends ../layouts/layout

  block content
    article!= content
    include /vendor/plugin-search/search.pug
  ```

  ```markdown
  ---
  title: Search
  layout: pages/search.pug
  ---

  # Search

  Search across the documentation.
  ```

  with `show_title: false` in `config/search.yaml`. The leading-slash include
  resolves from the views folder (core ≥ 4.3.0 compiles with `basedir`).
  **Check `layouts/layout` against what `nera new` actually scaffolds** in the
  throwaway site and use the real name.
- **Plugin order:** search should run last so it indexes final page data,
  including pages other plugins generate (`config/plugin-order.yaml`,
  `plugin-order: - end: - plugin-search`, as the tutorial already shows; this
  site's own file lists `plugin-canonical-links` and `plugin-search` under
  `end`). Verify the short name `plugin-search` is what core matches, in the
  throwaway site (e.g. with a second plugin that generates pages, or by reading
  `node_modules/@nera-static/core/src/setup-plugins.js`).

**Step 3, `description` vs `excerpt` — decided for you:** align the example
with the plugin's defaults (`title`, `excerpt`, `content`, `href`), then add one
sentence that `fields` replaces the list and that any frontmatter key such as
`description` can be added if your pages define it (a missing one is simply left
off). Before writing it, check in the throwaway site which of `excerpt` /
`description` the scaffolded pages actually carry, and say so accurately. This
site's own `config/search.yaml` indexes both `description` and `excerpt` —
that is fine; do not change it.

**This site's closing claim — decided for you:** this site's search page has no
Markdown heading and keeps the template's `h1` (no `show_title` in its
`config/search.yaml`), with `group_by_lang: true` and all three translation keys
in en/de/es. Do **not** restructure the site's search page to match the
tutorial's `show_title: false` example. Instead, step 4 presents
`show_title: false` with an own `# Search` heading as the example, plus one
sentence for the other case (no heading in the Markdown → keep the default and
the template's `h1`), and the closing sentence says accurately how this site
does it (template's own heading, translated in all three languages,
`group_by_lang: true`).

**Versions** (`npm view`, 2026-10-13): `plugin-search` 2.3.0, `core` 4.16.0,
`nera` 1.11.0, `plugin-code-blocks` — check with
`npm view @nera-static/<name> version`. If `plugin-search` is newer than 2.3.0,
read its new CHANGELOG entries first and cover them.

**Expected stamp** (English frontmatter only, 4-space indent):

```yaml
verified_on: 2026-10-13
verified_with:
    plugin-search: 2.3.0
```

(use the date you actually verify on, if it is later).

### Prove it in a throwaway site — every command and snippet the tutorial shows

Needs Node ≥ 20.19 (22 preferred; `node -v`). Network: the npm registry works.

```bash
T=$(mktemp -d) && cd "$T" && npx @nera-static/nera new site && cd site
npm install @nera-static/plugin-search
npx nera-search            # publishes template + client
npx nera-search            # second run: skips both
```

Then follow the tutorial **as you rewrote it**, step by step (config, view,
Markdown page with `# Search`, `show_title: false`, plugin order), and check
with `grep`/a small script over `public/`, not by eye:

1. `npx nera build --check` reports no `a11y-h1` and no `a11y-form-label` for
   the search page (ideally "No problems found" overall; if the scaffold itself
   warns about something unrelated, quote it).
2. The built search page has exactly one `<h1>`, and the input has
   `aria-label="Search"`; with a `search_label` translation added in
   `config/app.yaml` (as the tutorial shows) the label follows it.
3. Flip `show_title` back to default with the `# Search` heading still there:
   `--check` warns `a11y-h1` — which proves the tutorial's reason is real.
4. A page with `<aside data-search-ignore>secret-word</aside>` in its Markdown:
   `secret-word` is absent from `public/search-index.json` while the page's
   other text is present. (Check where the index lands — the README's
   "Generated Output" section says it is written into the source tree too.)
5. The step-5 per-language part still holds (`group_by_lang: true` with a
   `lang: de` page → `search-index.de.json`), unchanged text otherwise.

Delete `$T` afterwards.

### Verify claims

`npm view` works. raw.githubusercontent.com of the public repo
`seebaermichi/nera-plugin-search` may work too; nera.js.org probably does not.
If the network blocks something, rely on the facts above and note "not verified
online" in the result file.

## What to build

1. **Step 3 ("Configure"), all three languages:** the config example with the
   plugin's default fields plus the one sentence on `fields` replacing the list
   and on adding `description` etc. (see the decision above); mention
   `group_by_lang`/`show_title` only where they are taught. Add a short
   paragraph on `data-search-ignore` here (or where it reads best), naming the
   code-blocks plugin as the common source.
2. **Step 4 ("Add a search page"), all three languages:** the view snippet, the
   Markdown page with its own heading, `show_title: false`, the one sentence on
   the no-heading case, the plugin order (kept), and the three translation keys
   with a short `config/app.yaml` example (e.g. `search_label` for German). Keep
   it tight.
3. **Replace the "Upgrading an existing site…" paragraph** (at the end of step 5
   today) with the general refresh rule; place it where it reads best (it is
   about step 2's publishing, so it may move there). Keep the section count
   equal across the three languages.
4. **Closing sentence:** accurate about this site, per the decision above.
5. **Re-check the rest** (steps 1, 2, 5) against the facts and the throwaway
   site; fix whatever is wrong in all three languages.
6. **English stamp:** `verified_on` and `verified_with` as above.
7. Anything else rule 6 turns up in this repo while you are there — own commits.

## Done when

Run on Node ≥ 20.19 (prefer 22; `node -v`), after `npm ci`:

```bash
npm run lint && npm test && npm run validate && npm run build -- --check
```

- all pass with **zero warnings**, including warnings that were there before you
  started (rule 6), unless the fix is outside this repo, which is then a
  Carry-forward; `nera build --check` ends with "No problems found";
- a small script (paste it and its output into Verification) shows, for the
  three tutorial files: each contains `show_title`, `search_title`,
  `search_placeholder`, `search_label`, `data-search-ignore` and
  `--force`; none contains `data-search-index` outside step 5's per-language
  explanation (i.e. the July-migration paragraph is gone — say how you checked);
  each has the same number of `## ` sections; the English frontmatter has
  `plugin-search: <npm current>` under `verified_with` and today's
  `verified_on`;
- the five throwaway-site checks above ran, with their output in Verification;
- the branch is pushed and the result file is committed on it.

## The result file (your handoff back)

Write **`plans/cloud/01a136ac-bc82-70f7-9a8f-aaef6fddb2c3-result.md`** on your
branch, with exactly these sections:

```text
# Result — Tutorial "Add client-side search" (01a136ac-bc82-70f7-9a8f-aaef6fddb2c3)

## Plan
(the plan you wrote before editing; leave it, even if you deviated)

## Summary
(3–6 lines: what changed and where)

## Files changed
(one line per file: path — what)

## Commits
(git log --oneline main..HEAD)

## Verification
(the commands you ran and their relevant output)

## Decisions
(each choice you made that the brief did not settle, one bullet each)

## Proposed spec note
none

## Fixed along the way
(each fix beyond the task, per rule 6: commit — file — what; or "none")

## Carry-forwards
(only what could not be fixed here, per rule 6: file or repo — what — which
reason (other repo / release / GitHub setting / missing resource); or "none")

## Review hints
(where a reviewer should look hardest: claims you could not verify, spots you are
unsure of, anything that might be wrong)

## Not verified
(network checks that were blocked, or "none")
```

Finish your session with a one-paragraph summary in chat that names the branch
and the result file.
