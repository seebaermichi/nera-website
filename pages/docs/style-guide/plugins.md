---
layout: pages/docs.pug
title: Plugins
slug: style-guide-plugins
lang: en
description: The anatomy of a Nera plugin — files, hook shape, config and warnings through @nera-static/plugin-utils, package.json, README and CHANGELOG.
pagination_order: 2
---

# Plugins

Every Nera plugin has the same anatomy. Open `index.js` and you see the
hooks; open `src/config.js` and you see the config keys and their defaults;
open the README and the sections come in the same order as in every other
plugin. This page describes that anatomy, for the official
`@nera-static/plugin-*` packages and for your own.

How a site uses plugins, and the hook contract itself, is in the
[plugins documentation](/docs/plugins.html).

## Files

```text
nera-plugin-<name>/
├── index.js                  # the hooks only: header comment, imports, exported hooks
├── src/
│   ├── config.js             # the config reader: defaults, one reader per key, loadConfig()
│   ├── log.js                # the package's logger: createLogger('plugin-<name>')
│   └── <feature>.js          # pure functions, one concern per file
├── config/<name>.yaml        # every key, with its default; `nera add` copies it
├── views/                    # only with templates: flat <template>.pug, plus partials/ and helper/
├── assets/                   # only when getAssets ships static files (served under public/_nera/)
├── bin/publish-template.js   # only with views/
├── test/                     # see the Tests page of this guide
├── README.md  CHANGELOG.md  LICENSE  package.json  package-lock.json
├── eslint.config.js  .editorconfig  .gitignore
├── .husky/                   # pre-commit: npm run lint, pre-push: npx vitest run
└── .github/                  # workflows/test.yml, workflows/publish.yml, dependabot.yml, FUNDING.yml
```

- A plugin has **no `src/warn.js` and no `src/guard.js`**. The warning
  format and the core version guard come from `@nera-static/plugin-utils`
  (`/log` and `/guard`, from version 1.7.0), so they cannot drift.
- `config/<name>.yaml` lists every key, set or commented out, with its
  default. It is what `nera add <name>` copies into a site, so a plugin has no
  `bin/publish-config.js`.
- `bin/publish-template.js` exists only when the plugin has `views/`. It
  calls `publishAllTemplates` from `@nera-static/plugin-utils`.

## The hooks

`index.js` holds the hooks and nothing else. Everything a hook does beyond
reading its input and returning its output lives in `src/`.

```js
// @nera-static/plugin-example — adds a list of related pages to every page.
//
// getAppData checks the core version and adds app.example, getMetaData adds
// meta.related to every page, getAssets ships the default styles.
import { fileURLToPath } from 'node:url'
import { assertCoreVersion } from '@nera-static/plugin-utils/guard'
import { loadConfig } from './src/config.js'
import { log } from './src/log.js'
import { relatedPages } from './src/related.js'

export function getAppData({ app = {}, pagesData = [] } = {}) {
    assertCoreVersion({ plugin: 'plugin-example', from: import.meta.url })
    return { ...app, example: { count: pagesData.length } }
}

export function getMetaData({ app = {}, pagesData = [] } = {}) {
    const config = loadConfig({ app })
    return pagesData.map((page) => ({
        ...page,
        meta: { ...page.meta, related: relatedPages(page, pagesData, config, { onWarning: log.warn }) },
    }))
}

export function getAssets({ app = {}, pagesData = [] } = {}) {
    return [{ from: fileURLToPath(new URL('./assets/example.css', import.meta.url)), to: '_nera/example.css' }]
}
```

The rules:

- **Destructure with defaults**: `({ app = {}, pagesData = [] } = {})`.
  Never `(data)` with `data.app`.
- **Export each hook with `export function`**, never through
  `export { … }`.
- **Synchronous** unless the hook really has to wait. Core awaits every
  hook, but a synchronous one is easier to test and to reason about.
- **Read the config inside the hook** through `loadConfig({ app })`, never
  at module scope. Then a test can run the hook against a site in a
  temporary folder.
- **Return a new value.** `getAppData` returns a new plain object,
  `getMetaData` a new array of new page objects. Never change the input.
- **The guard runs in `getAppData`**, the first hook core calls, and only in
  a plugin that has `getAssets`. Core older than 4.13.0 never calls
  `getAssets`, and the build would still exit 0; `assertCoreVersion` turns
  that into an error. Such a plugin also declares
  `"peerDependencies": { "@nera-static/core": ">=4.13.0" }`.
- **Files go through `getAssets`.** Core deletes `public/` after the
  plugins have run, so whatever a plugin writes there directly is lost. A
  plugin's files are served under `_nera/<name>.*`.

## Config

`src/config.js` describes the config file once: its defaults and one reader
per top-level key. `createConfigReader` from
`@nera-static/plugin-utils/config` does the rest: it copies the defaults,
skips empty keys, ignores unknown ones and prints the warnings.

```js
import { createConfigReader, loadPluginConfig } from '@nera-static/plugin-utils/config'
import { isText } from '@nera-static/plugin-utils/values'
import { log } from './log.js'

const reader = createConfigReader({
    file: 'config/example.yaml',
    defaults: { heading: 'Related pages', limit: 3 },
    readers: {
        heading: (value, current, r) => (isText(value) ? value.trim() : r.bad('heading', value, current)),
        limit: (value, current, r) => (Number.isInteger(value) && value > 0 ? value : r.bad('limit', value, current)),
    },
    warn: log.warn,
})

export function loadConfig({ cwd = process.cwd(), app } = {}) {
    return reader.normalize(loadPluginConfig('example', { cwd, app }))
}
```

- **`loadPluginConfig(name, { cwd, app })`** reads the site's
  `config/<name>.yaml`, or the folder `app.folders.config` names. Pass the
  `app` your hook receives.
- **`reader.normalize(raw)`** returns a fresh copy of the defaults with each
  valid key replaced. A missing file gives the defaults without a word; a key
  left empty in YAML keeps its default.
- **Every key has a reader**, and a reader either returns the checked value
  or calls `r.bad(key, value, fallback)`, `r.ignore(where, what)` or
  `r.unknown(where, key)`. A key without a reader is reported as unknown.
- **The shipped `config/<name>.yaml` equals the defaults.** A test parses it
  and compares it with `reader.defaults()`.

## Warnings and errors

`src/log.js` creates the package's logger once:

```js
import { createLogger } from '@nera-static/plugin-utils/log'

export const log = createLogger('plugin-example')
```

Every message a plugin prints goes through it, so a site owner can tell from
the build log where a message came from:

```text
⚠️ plugin-example: config/example.yaml: expected a mapping at the top level, using defaults
⚠️ plugin-example: config/example.yaml: ignoring unknown key "limits"
⚠️ plugin-example: config/example.yaml: invalid limit 0, using 3
⚠️ plugin-example: /blog/first.html: no date — add `date:` to its frontmatter
```

- `log.warn(message)` prints `⚠️ plugin-<name>: <message>`. The config
  messages above come from the config reader; do not write your own.
- `log.page(page, what, todo)` warns about one page:
  `<page>: <what> — <todo>`. Say what is wrong and what to do about it.
- `log.info(message)` prints `ℹ️ plugin-<name>: <message>`, for a rare
  summary line.
- **No bare `console.*`** in a plugin's runtime code. `nera-stan` refuses it
  (rule `nera/shared-logger`, from version 1.0.0).
- **An error that should stop the build is thrown**, not logged:
  `throw new Error('plugin-<name>: …')`, with the same prefix and no emoji,
  as `assertCoreVersion` does:

```text
plugin-example: @nera-static/core 4.12.0 is too old; it needs >= 4.13.0 (the getAssets hook). Update with `npm update @nera-static/nera` (or `@nera-static/core`).
```

Feature modules in `src/` do not import the logger. They take an
`onWarning` callback, as `relatedPages` does above, so they stay pure
functions and a test can collect their warnings.

## Templates

- Views are flat: `views/<template>.pug`, with subfolders only for
  `partials/` and `helper/`.
- A site gets them through `npm run publish-template` (and `nera add`),
  which copies them to `views/vendor/plugin-<name>/`.
- **The markup and the BEM class names are a public contract.** Sites hold
  copies of the templates and style the classes from their own CSS, so
  renaming `.tag-cloud__item` breaks them: that is a major release.
- Default styles use custom properties named `--nera-<name>-*`, as
  `--nera-code-*` in `plugin-code-blocks`. See
  [Themes and starters](/docs/style-guide/themes-and-starters.html#custom-properties)
  for the full prefix rule.

## package.json

The keys come in this order. Leave out what does not apply.

```json
{
    "name": "@nera-static/plugin-example",
    "version": "1.0.0",
    "description": "A plugin for the Nera static site generator that adds related pages.",
    "main": "index.js",
    "type": "module",
    "exports": { ".": "./index.js" },
    "bin": { "nera-example": "bin/publish-template.js" },
    "scripts": {
        "publish-template": "node ./bin/publish-template.js",
        "lint": "nera-stan",
        "test": "vitest run",
        "test:watch": "vitest",
        "prepare": "husky"
    },
    "files": ["bin", "config", "index.js", "src", "views", "assets", "CHANGELOG.md"],
    "keywords": ["nera", "nera-plugin", "static-site-generator", "related-pages"],
    "author": "Michael Becker",
    "license": "MIT",
    "repository": { "type": "git", "url": "git+https://github.com/seebaermichi/nera-plugin-example.git" },
    "bugs": { "url": "https://github.com/seebaermichi/nera-plugin-example/issues" },
    "homepage": "https://github.com/seebaermichi/nera-plugin-example#readme",
    "publishConfig": { "access": "public" },
    "sideEffects": false,
    "engines": { "node": ">=22.12.0" },
    "peerDependencies": { "@nera-static/core": ">=4.13.0" },
    "dependencies": { "@nera-static/plugin-utils": "^1.7.0" },
    "devDependencies": { "@nera-static/core": "^4.15.1", "@nera-static/stan": "^1.0.0", "husky": "^9.1.7", "vitest": "^5.0.0" }
}
```

- `bin` and the `publish-template` script only with `views/`; `views` and
  `assets` in `files` only when the folders exist. `CHANGELOG.md` is always
  in `files`.
- `peerDependencies` on core only for a plugin with `getAssets` (and so with
  the guard).
- `engines.node` is core's floor.
- `keywords` always include `nera`, `nera-plugin` and
  `static-site-generator`, never the generic `plugin`.
- Write `package.json` the way `npm pkg fix` leaves it: `bin` paths without
  a leading `./`, `repository.url` with the `git+` prefix.

## README

The sections come in this order. Leave out the optional ones that do not
apply, and add no others between them.

```markdown
# @nera-static/plugin-example
[![Test](…/actions/workflows/test.yml/badge.svg)](…/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/@nera-static/plugin-example)](https://www.npmjs.com/package/@nera-static/plugin-example)

A plugin for the [Nera](https://nera.js.org) static site generator that …

## ✨ Features
## 🚀 Installation          nera add example, then npm install … as the manual path
## 🧩 Usage                 a minimal working example
## ⚙️ Configuration         a key | default | meaning table, then the full shipped YAML
## <feature sections>       plain headings without emoji, e.g. "Multilingual sites"
## 🛠️ Template Publishing   only with views/
## 🎨 Styling               only with views/: the BEM classes are the public contract
## 📊 Generated Output      the exact app.<key> / meta.<key> shape
## ⚠️ Warnings              optional: the messages and what to do about them
## Known limitations        optional
## 🧩 Compatibility         core floor, Node floor, plugin order (start: / end:)
## 🧪 Development
## 🤝 Contributing          one line linking the shared contributing guide
## 📦 License
```

- A plugin with the core guard says so right under the first paragraph:
  `Requires @nera-static/core 4.13.0 or later`, linked to Compatibility.
- **The README is the public spec.** Everything a user needs, such as a
  markup contract, is written there. Never link a `ROADMAP` file: it is
  local only and the link would end in a 404.
- No `Author` and no `Links` section: `package.json` already carries both.

## CHANGELOG

Every plugin keeps a `CHANGELOG.md` in the
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format:

```markdown
## [2.0.0] - 2026-11-27

### Changed

-   **BREAKING**: `app.example` is now `app.related`.

### Migration from v1.x

-   Replace `app.example` with `app.related` in your templates.
```

- One heading per release, `## [x.y.z] - YYYY-MM-DD`, newest first.
- Only the groups `### Added`, `### Changed`, `### Fixed` and
  `### Removed`.
- Bullets are written `-   …`, a dash and three spaces, so the text starts
  in column 4.
- A breaking entry starts with `**BREAKING**:`, and a major release has a
  `### Migration from vX.x` section with the before and after.
- **The version bump and the CHANGELOG entry go in the same commit as the
  change**, not at release time.

What counts as what:

- **Major** — a hook's return shape, a renamed or removed config key or a
  default with a new meaning, a renamed `app.<key>` or `meta.<key>`, changed
  template markup or BEM classes, a higher core floor.
- **Minor** — a new config key with a sensible default, a new template, a new
  `app.<key>` beside the existing ones, a higher Node floor documented as the
  real one.
- **Patch** — a bugfix with the same output shape, README and internal
  changes.
- **No release** — a `package-lock.json` refresh, devDependency bumps, CI,
  husky or lint configuration.
