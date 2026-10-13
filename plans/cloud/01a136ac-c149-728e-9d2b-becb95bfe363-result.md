# Result — Tutorial "Open external links in a new tab" (01a136ac-c149-728e-9d2b-becb95bfe363)

## Plan

1. Baseline on the branch: `npm ci`, then `npm run lint && npm test && npm run validate
   && npm run build -- --check` — note any warning (rule 6: fix it). `npm view` plugin-
   link-attributes, core, nera; read the plugin's README/CHANGELOG and core's CHANGELOG
   4.13.0 → current under `node_modules/`.
2. Throwaway site (`npx @nera-static/nera new site` + plugin): run `npx nera-link-attributes`
   three times (create / skip / `--force`), then the four checks — no config → build passes,
   no `target`; with config → external link gets `target`/`rel`, internal not; layout link
   untouched and the tutorial's Pug line renders as shown; this repo's GitHub links in
   `public/` carry the attributes (content and layout).
3. Edit the tutorial, en then de and es:
   - step 1: reword "No template to publish" so it does not contradict the config command;
   - step 2: lead with `npx nera-link-attributes` (writes the defaults shown, skips an
     existing file, `--force` replaces it), keep the YAML, one sentence: no `attributes` →
     pages unchanged; half-sentence that existing attributes on a link are kept;
   - step 3 / closing claim: fix only what the checks prove wrong;
   - drop the Node blockquote. Keep 3 `## ` sections each.
4. English stamp: `plugin-link-attributes: 2.1.1`, `core: <npm current>`, `verified_on` today.
5. Checks again from a clean `npm ci`, a parity/stamp script, review `git diff main...HEAD`,
   then fill in this file and push.

## Summary

The "Open external links in a new tab" tutorial (en/de/es) no longer ends with the
obsolete Node ≥ 20.18.1 note. Step 2 now leads with `npx nera-link-attributes` (writes
the default config, skips an existing file, `--force` replaces it), keeps the YAML as the
hand-written alternative, says the plugin leaves pages unchanged without `attributes`, and
adds that existing attributes on a link are never overwritten. Step 1's "no template"
line now points at the config file so it no longer reads as a contradiction. English stamp:
`plugin-link-attributes: 2.1.1`, `core: 4.16.0`, `verified_on: 2026-10-13`. Along the way:
plugin-navigation floor raised to `^3.1.1` and the lockfile refreshed (core 4.16.0).

## Files changed

- `pages/tutorials/external-links-new-tab.md` — step 1 line, step 2 command/no-op/kept-attributes, Node note removed, stamp `core: 4.16.0`
- `pages/de/tutorials/external-links-new-tab.md` — same, in German (du)
- `pages/es/tutorials/external-links-new-tab.md` — same, in Spanish
- `package.json` — `@nera-static/plugin-navigation` `^3.1.0` → `^3.1.1`
- `package-lock.json` — `npm update`: core 4.15.0 → 4.16.0, plugin-navigation 3.1.0 → 3.1.1, eslint 10.11.0 → 10.12.0 and transitive bumps
- `plans/cloud/01a136ac-c149-728e-9d2b-becb95bfe363-result.md` — this file

## Commits

(see `git log --oneline main..HEAD`; at the time of writing:)

```text
91c846e chore(deps): plugin-navigation floor ^3.1.1, lockfile to core 4.16.0
4a02d52 docs(tutorials): stamp external links with core 4.16.0
d33ecac docs(tutorials): external links shows npx nera-link-attributes, drops the Node note
090281c chore(plan): plan for the external links tutorial issue
```

plus the commit adding this result section.

## Verification

Node v22.22.0.

**Versions** (`npm view @nera-static/<name> version`): plugin-link-attributes 2.1.1,
core 4.16.0, nera 1.11.0. Read: plugin README + CHANGELOG 2.1.0–2.1.1, `index.js`,
`bin/publish-config.js` (from `node_modules/`); core CHANGELOG 4.14.0–4.16.0 (not in the npm
tarball; fetched from raw.githubusercontent.com/seebaermichi/nera/main/CHANGELOG.md):
4.14.0 Node floor, 4.15.0 frontmatter via `yaml` + own asset copy, 4.15.1 build log /
dotenv quiet, 4.15.2 README badges, 4.16.0 themed site without views — none touches links.

**Baseline on main's tree** (`npm ci`, then the four checks): exit 0, 30/30 tests,
`✓ No problems found.` (validate and build --check), no warnings.

**Throwaway site** (`npx @nera-static/nera new site`, nera 1.11.0, core 4.16.0,
plugin-link-attributes 2.1.1):

```text
--- run1
✅ link-attributes.yaml published to config/
--- run2
⚠️ config/link-attributes.yaml already exists. Skipping.
    Re-run with --force to overwrite (this will discard your edits).
--- force   (after appending "# edited" to the file)
✅ link-attributes.yaml published to config/
attributes:
  - target="_blank"
  - rel="noopener noreferrer"
```

Test page `pages/links.md`: `[external](https://example.com)`, `[internal](/index.html)`,
`<a href="https://keep.example" target="_self">`. Layout `theme/views/layouts/layout.pug`
got a plain `a.plain-layout(href="https://example.org/plain")` and the tutorial's line
`a.site-header__cta(href=app.repo_url, target="_blank", rel="noopener noreferrer") GitHub`
(`repo_url` added to `config/app.yaml`). All `<a>` tags of `public/links.html` by script:

```text
=== 1. no config (config/link-attributes.yaml removed)
build exit 0
📄 Page processing complete: 2 success, 0 errors
<a class="plain-layout" href="https://example.org/plain">
<a class="site-header__cta" href="https://github.com/seebaermichi/nera" target="_blank" rel="noopener noreferrer">
<a href="https://example.com">
<a href="/index.html">
<a href="https://keep.example" target="_self">
=== 2+3. with config
build exit 0
<a class="plain-layout" href="https://example.org/plain">
<a class="site-header__cta" href="https://github.com/seebaermichi/nera" target="_blank" rel="noopener noreferrer">
<a href="https://example.com" target="_blank" rel="noopener noreferrer">
<a href="/index.html">
<a href="https://keep.example" target="_self" rel="noopener noreferrer">
=== attributes: []
exit 0
<a href="https://example.com">
```

So: no config / empty list → unchanged, build passes (1); with config the external link
gets both attributes, the internal one none, an existing `target` is kept (2); the plain
layout link is not rewritten and the tutorial's Pug line renders as shown (3). Throwaway
directory deleted afterwards.

**Check 4, this site** (`npm run build`, script over every `public/**/*.html`):

```text
github links with target+rel: 387  without: 0
```

Covers layout links (`site-header.pug`, `site-footer.pug` set the attributes by hand) and
content links (e.g. `pages/de/about.md`'s `](https://github.com/seebaermichi/nera)` →
`<a href="https://github.com/seebaermichi/nera" target="_blank" rel="noopener noreferrer">`
in `public/de/about.html`). The closing claim stays as is.

**Tutorial script** (`node verify.mjs`):

```text
pages/tutorials/external-links-new-tab.md | node+20.18 lines: 0 | npx nera-link-attributes: true | ## sections: 3
pages/de/tutorials/external-links-new-tab.md | node+20.18 lines: 0 | npx nera-link-attributes: true | ## sections: 3
pages/es/tutorials/external-links-new-tab.md | node+20.18 lines: 0 | npx nera-link-attributes: true | ## sections: 3
npm current: plugin-link-attributes 2.1.1 core 4.16.0 today 2026-10-13
stamp plugin-link-attributes ok: true
stamp core ok: true
verified_on today: true
```

(The script: for each file, count lines matching `/Node/i` that contain `20.18`, check
`npx nera-link-attributes`, count `^## `; in the English frontmatter regex-match
`    plugin-link-attributes: <npm view>` and `    core: <npm view>` under `verified_with:`
and `verified_on: <today>`.)

**Done-when, final** (`rm -rf node_modules && npm ci`, then
`npm run lint && npm test && npm run validate && npm run build -- --check`): exit 0;
`npm ci` "found 0 vulnerabilities"; `# pass 30`, `# fail 0`; validate `✓ No problems found.`;
`Page processing complete: 72 success, 0 errors`; `Plugin loading complete: 10 loaded,
0 failed`; build --check `✓ No problems found.`; no warning lines in the log.

## Decisions

- The command block is shown before the YAML, and the YAML is kept as "you can also write
  the file by hand" — the YAML still documents what the file contains.
- The tutorial keeps 4-space YAML although the shipped default uses 2 spaces; "writes the
  defaults shown below" refers to the content, which is identical.
- Step 1's "No template to publish" kept, with one added sentence ("Its one setting lives in
  a config file.") rather than a rewrite.
- "Existing attributes are kept" added as a half-sentence to the http/www paragraph (proved
  in check 2 with `target="_self"`).
- No new `##` section and no new note blockquote; `description`/`keywords` unchanged.
- Stamp split into its own commit so the CHANGELOG reading is attached to it.
- plugin-navigation floor raised to `^3.1.1` because the vendored `helper/setup.pug` is
  already 3.1.1's (commit 42ca0d4) and the navigation tutorial is stamped 3.1.1; eslint's
  floor left at `^10.11.0` (lockfile has 10.12.0, nothing needs the floor raised).
- The uncommitted change on `main` in
  `plans/issues/01a136ac-bb86-…-ten-plugins.log.md` (a browser-test section from another
  issue) was present when the container started; it is not mine and is left uncommitted.

## Proposed spec note
none

## Fixed along the way

- `91c846e` — `package.json`, `package-lock.json` — the lockfile pinned core 4.15.0 and
  plugin-navigation 3.1.0 (floor `^3.1.0`) while the vendor template and the nav tutorial are
  at 3.1.1; floor → `^3.1.1`, `npm update` → core 4.16.0, plugin-navigation 3.1.1,
  eslint 10.12.0. `npm outdated` now empty, `npm audit` 0 vulnerabilities, all checks pass.

## Carry-forwards

- `seebaermichi/nera-plugin-link-attributes` README (Compatibility) still states
  "Node.js >= 20.18.1 … On Node 18 the plugin fails to load" — true for the package itself,
  so no change needed; listed only so the reviewer knows it was seen (other repo, no action).
- Reconciliation in `../nera-cli/ROADMAP-ai.md` and the drift report
  (`node ../.claude/skills/tutorial-review/drift.mjs`) — other repo / missing resource.

## Review hints

- German and Spanish wording of the new step-2 lines (my translations): "Am schnellsten
  bekommst du sie …", "Ohne `attributes` … — keine Datei, keine neuen Tabs.", "Sin ningún
  atributo en `attributes` … — sin archivo, no hay pestañas nuevas."
- "no file, no new tabs" compresses "no file / empty list → unchanged" — proved for both.
- The lockfile diff is large (`npm update` moved transitive deps too); checks pass on it.

## Not verified

- nera.js.org (live site) not checked; the claim was checked on this repo's local build.
