# Cloud brief — Tutorial "Open external links in a new tab": drop the Node note, show the config command (01a136ac-c149-728e-9d2b-becb95bfe363)

Snagio issue `01a136ac-c149-728e-9d2b-becb95bfe363` (improvement, group "Tutorials").
You work it in a Claude Code cloud session on `seebaermichi/nera-website`. The
maintainer reviews your branch locally afterwards and closes the issue there, so
**your output is a branch plus one result file** (format at the end).

You have no access to Snagio, to the sibling repos on the maintainer's disk, or to
the workspace-level `CLAUDE.md`. Everything you need is in this brief, in the
repo, and in the npm registry. Do not run the `.claude/skills/*` loop commands or
`.claude/scripts/snagio`; they need a local token and are not part of this session.

## The task

The tutorial `pages/tutorials/external-links-new-tab.md` (plus its de and es
translations) ends with a Node-floor note that no reader can act on any more
(every Nera site already needs a newer Node than this plugin does), and its
step 2 never mentions `npx nera-link-attributes`, the command that writes the
default config for you, nor that the plugin changes nothing without configured
attributes. Drop the note, add those two facts to step 2, re-check the rest of
the tutorial against the plugin as it is today, and refresh the English stamp.
Docs-only change, in three languages. Small: edits, not a rewrite.

Issue text, verbatim:

```text
## Today
`pages/tutorials/external-links-new-tab.md` (stamp `plugin-link-attributes: 2.1.1`, `core: 4.13.0`) ends with "Node note: this plugin uses cheerio under the hood, so it needs Node ≥ 20.18.1 to build." That note is obsolete: since core 4.14.0 (`^20.19.0 || >=22.0.0`) and nera 1.4.0 (`^20.19.0 || >=22.12.0`), every Nera site already needs a newer Node than the plugin does.

It also never mentions `npx nera-link-attributes`, which copies the default `config/link-attributes.yaml` into the site (optional; `--force` replaces an existing one, since 2.1.0), and that the plugin is a no-op without any configured attributes.

## Instead
- Drop the Node note (en/de/es).
- Step 2 mentions `npx nera-link-attributes` as the quick way to get the config, and that without attributes the plugin leaves pages unchanged.
- Re-check the rest against the README (`a[href^="http"], a[href^="www"]` selection, layout links needing manual attributes).

## Why
A floor note readers can't act on only creates doubt; the publish command saves typing YAML by hand.

## Where
- `pages/tutorials/external-links-new-tab.md` (+ de, es)
- Sources: `../nera-plugin-link-attributes/README.md`, `CHANGELOG.md` 2.1.0–2.1.1; `../generator/CHANGELOG.md` 4.14.0

## Acceptance criteria
- [ ] No Node floor note; the config command is shown, in en/de/es.
- [ ] English stamp `plugin-link-attributes: <current>`, `core: <current>`, `verified_on` today.
```

(The `../…` sources in the issue are sibling repos you cannot see; their
relevant content is in "Facts" below, and the npm tarballs carry the README and
CHANGELOG — read them under `node_modules/` in the throwaway site.)

## Rules (read these first)

1. Read `README.md`, `.claude/issue-conventions.md` (the review rules for this
   repo — they apply to you), the three tutorial files
   (`pages/tutorials/external-links-new-tab.md`,
   `pages/de/tutorials/external-links-new-tab.md`,
   `pages/es/tutorials/external-links-new-tab.md`), a neighbouring tutorial for
   tone and stamp format (`pages/tutorials/custom-navigation.md` and its de/es
   copies), and the site's own `config/link-attributes.yaml`.
2. Work on a branch named **`issue/01a136ac-c149-link-attributes`**, created
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
maintainer's drift report checks this parity; today it is 3 each, and this task
should keep it at 3). Only the English page carries `verified_on` /
`verified_with`; de/es carry no stamp. Do not change `description`/`keywords`
unless they became wrong.

**The plugin, `@nera-static/plugin-link-attributes` 2.1.1** (latest on npm;
from its README, CHANGELOG and source):

- **Install** `npm install @nera-static/plugin-link-attributes`. Nera picks it up
  automatically (any `@nera-static/plugin-*` dependency of the site is loaded).
- **Publish the config:** `npx nera-link-attributes` (the package's `bin`)
  copies the shipped default `config/link-attributes.yaml` into the site. If
  the file already exists it is left alone (and the command says so), so
  re-running never overwrites edits; `npx nera-link-attributes --force`
  replaces it with a fresh copy of the defaults (since 2.1.0). Publishing is
  **optional**.
- **Shipped default config** (2-space indent in the package; the tutorial and
  the site use 4 spaces — keep the tutorial's 4):

  ```yaml
  attributes:
    - target="_blank"
    - rel="noopener noreferrer"
  ```

- **No attributes → no-op.** Without the config file, with an empty
  `attributes`, or with no `attributes` key, the plugin passes every page
  through unchanged; it does not fail the build (fixed in 2.1.0 — before that a
  missing file crashed the build once a page had an external link).
- **Selection:** `$('a[href^="http"], a[href^="www"]')` (cheerio) — only links
  whose `href` starts with `http` or `www`. Internal links (`/docs/…`,
  relative) are untouched. Existing attributes on a link are **not**
  overwritten. Attribute values may contain `=` (2.1.1 fix, e.g.
  `data-track="src=nav&type=ext"`).
- **Scope:** it runs in `getMetaData` on each page's rendered **Markdown
  content**, so links written directly in Pug layouts/includes are not
  processed — the tutorial's step 3 gotcha. Prove it in the throwaway site.
- **Node:** the plugin's `engines.node` is `>=20.18.1` (cheerio). Every Nera
  site already needs more: `@nera-static/core` ≥ 4.14.0 declares
  `^20.19.0 || >=22.0.0`, `@nera-static/nera` ≥ 1.4.0 declares
  `^20.19.0 || >=22.12.0`. So the tutorial's Node note is obsolete; drop it,
  do not replace it with another floor note.

**Versions** (`npm view`, 2026-10-13): `plugin-link-attributes` 2.1.1,
`core` 4.16.0, `nera` 1.11.0. Re-check with
`npm view @nera-static/<name> version`. The core CHANGELOG entries between the
stamped 4.13.0 and 4.16.0 (4.14.0 Node floor, 4.15.0 frontmatter parsed with
`yaml`, 4.15.1 build log names pages, 4.15.2, 4.16.0 themed sites need no
`views/`) do not touch link handling — read them yourself in the throwaway site
(`node_modules/@nera-static/core/CHANGELOG.md`) before stamping. If either
package is newer than above, read its new entries first.

**Expected stamp** (English frontmatter only, 4-space indent):

```yaml
verified_on: 2026-10-13
verified_with:
    plugin-link-attributes: 2.1.1
    core: 4.16.0
```

(use the date you actually verify on, if it is later).

### Prove it in a throwaway site — every command and snippet the tutorial shows

Needs Node ≥ 20.19 (22 preferred; `node -v`). Network: the npm registry works.

```bash
T=$(mktemp -d) && cd "$T" && npx @nera-static/nera new site && cd site
npm install @nera-static/plugin-link-attributes
npx nera-link-attributes          # creates config/link-attributes.yaml
npx nera-link-attributes          # second run: leaves it alone, says so
npx nera-link-attributes --force  # replaces it
```

Then check, with `grep`/a small script over `public/`, not by eye:

1. **No config → unchanged:** delete `config/link-attributes.yaml`, add a page
   with an external link (`[x](https://example.com)`) and an internal one,
   `npx nera build`: the build succeeds and the external `<a>` has no `target`.
2. **With config:** restore it, rebuild: the external link carries
   `target="_blank" rel="noopener noreferrer"`, the internal one does not.
3. **Layout links:** a link in the layout (`theme/views/…` or `views/…`, as the
   scaffold has it) is **not** rewritten; the tutorial's Pug line
   (`a.site-header__cta(href=…, target="_blank", rel="noopener noreferrer") GitHub`)
   renders as shown — compile it in the throwaway layout.
4. The tutorial's closing claim "This site does exactly this; try any GitHub
   link" — check it against this repo: `npm run build` here, then confirm the
   GitHub links in `public/` (content and layout) carry the attributes. If not,
   fix the sentence (or the site, per rule 6).

Delete `$T` afterwards.

### Verify claims

`npm view` works. raw.githubusercontent.com of the public repo
`seebaermichi/nera-plugin-link-attributes` may work too; nera.js.org probably
does not. If the network blocks something, rely on the facts above and note
"not verified online" in the result file.

## What to build

1. **All three languages:** remove the closing Node blockquote entirely.
2. **Step 2 ("Configure"), all three languages:** lead with
   `npx nera-link-attributes` as the quick way to get `config/link-attributes.yaml`
   (it writes the defaults shown; it skips an existing file, `--force` replaces
   it), keep the YAML example, and add one sentence that without any
   `attributes` the plugin leaves pages unchanged. Keep step 1's "No template
   to publish — this plugin only transforms content" true (it publishes a
   config, not a template — reword if that line now reads as a contradiction).
3. **Re-check the rest** against the facts and your throwaway site: the
   `http`/`www` selection sentence, the "existing attributes are kept" fact
   (add a half-sentence only if it helps), step 3's layout-links gotcha and its
   Pug snippet, the closing claim about this site. Fix whatever is wrong in all
   three languages.
4. **English stamp:** `verified_on` and `verified_with` as above.
5. Anything else rule 6 turns up in this repo while you are there — own commits.

## Done when

Run on Node ≥ 20.19 (prefer 22; `node -v`), after `npm ci`:

```bash
npm run lint && npm test && npm run validate && npm run build -- --check
```

- all pass with **zero warnings**, including warnings that were there before you
  started (rule 6), unless the fix is outside this repo, which is then a
  Carry-forward; `nera build --check` ends with "No problems found";
- a small script (paste it and its output into Verification) shows, for the
  three tutorial files: no line matching `/Node/i` together with `20.18`; each
  contains `npx nera-link-attributes`; each has 3 `## ` sections; the English
  frontmatter has `plugin-link-attributes: <npm current>` and
  `core: <npm current>` under `verified_with` and today's `verified_on`;
- the four throwaway-site checks above ran, with their output in Verification;
- the branch is pushed and the result file is committed on it.

## The result file (your handoff back)

Write **`plans/cloud/01a136ac-c149-728e-9d2b-becb95bfe363-result.md`** on your
branch, with exactly these sections:

```text
# Result — Tutorial "Open external links in a new tab" (01a136ac-c149-728e-9d2b-becb95bfe363)

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
