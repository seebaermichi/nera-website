---
layout: pages/docs.pug
title: Tests
slug: style-guide-tests
lang: en
description: How every Nera package writes its tests — layout and names, one vitest.config.js, the test scripts, the writing rules and the integration patterns per kind of package.
pagination_order: 4
---

# Tests

Every Nera package is tested with [vitest](https://vitest.dev), and every
package writes its tests the same way: the same folders, the same file
names, the same config, the same style inside a test. Open the tests of any
Nera package and you find the end-to-end test in the same file, the
fixtures in the same folder and the same phrasing in every `it`.

## Layout and names

```text
test/
├── <module>.test.js          # one file per source module
├── integration.test.js       # the end-to-end test through core or the CLI
├── helpers.js                # the package's own helpers, when it needs any
├── helpers/<topic>.js        # instead of helpers.js, once a second concern appears
├── fixtures/<name>/          # data a test reads
├── site/                     # a whole fixture site (themes, starters)
└── global-setup.js           # only for builds shared across files
```

- **Tests live in `test/`** at the root of the repository, never in `src/`.
- **One file per source module**: `src/config.js` is tested in
  `test/config.test.js`.
- **The end-to-end test is always `test/integration.test.js`**: it builds a
  site through core or runs the CLI. Themes keep one file per section of
  their contract instead, and read the builds from `test/global-setup.js`
  (see [Themes and starters](/docs/style-guide/themes-and-starters.html#theme-tests)).
- **No infixes**: no `.unit.`, `.integration.` or `.template.` in a file
  name. The folder and the module name say enough.
- **Fixtures**: data in `test/fixtures/<name>`, a whole fixture site in
  `test/site/`.
- **Helpers**: the package's own helpers in `test/helpers.js`, split into
  `test/helpers/<topic>.js` once there is a second concern (for example
  `test/helpers/fake-github.js`). A helper that more than one package needs
  belongs in `@nera-static/test-utils`, not in a copy.
- **`test/global-setup.js` only for builds shared across files**, as in
  themes and starters, where building the fixture once per file would be
  too slow.

## vitest.config.js

Every repository has a `vitest.config.js`, and it starts from the same
content:

```js
import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: ['test/**/*.test.js'],
        environment: 'node',
        restoreMocks: true,
        unstubEnvs: true,
        unstubGlobals: true,
    },
})
```

- **`restoreMocks`, `unstubEnvs` and `unstubGlobals`** undo every spy, every
  stubbed environment variable and every stubbed global after each test, so
  no test has to clean up after itself and none leaks into the next.
- **No `globals: true`.** Tests import what they use from `'vitest'`.
- **Anything else is added only when the package needs it, with a comment
  that says why**: `testTimeout` and `hookTimeout` when every test builds a
  site, `globalSetup: ['test/global-setup.js']` for shared builds,
  `isolate: false` where the test files do not touch shared state.
- **A timeout that only a few tests need stays on those tests**, as the
  third argument of `it`, not in the config.

## Scripts

```json
"scripts": {
    "lint": "nera-stan",
    "test": "vitest run",
    "test:watch": "vitest",
    "prepare": "husky"
}
```

- **`npm test` runs the suite once and exits**, the same single pass that
  CI (`npx vitest run` in `test.yml`) and the husky `pre-push` hook run.
  Watch mode is `npm run test:watch`.
- **No coverage script** until someone needs coverage.
- **`npm run lint` runs `nera-stan`**, which also checks the test files
  (see [Tooling](/docs/style-guide/tooling.html)).

## Writing tests

```js
import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import { loadConfig } from '../src/config.js'

const ROOT = path.resolve(import.meta.dirname, '..')

describe('loadConfig', () => {
    it('returns the defaults when the config file is missing', () => {
        expect(loadConfig({ cwd: path.join(ROOT, 'test/fixtures/empty') })).toEqual({ heading: 'Related pages', limit: 3 })
    })

    it('warns about an unknown key and ignores it', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const config = loadConfig({ cwd: path.join(ROOT, 'test/fixtures/unknown-key') })

        expect(config).not.toHaveProperty('limits')
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('ignoring unknown key "limits"'))
    })
})
```

- **Import everything explicitly from `'vitest'`**, and use `it`, never
  `test`.
- **`describe` names the unit** (a function, a module, a command) or the
  scenario, in lower case: `describe('a site deployed under base_path')`.
- **`it` states the behaviour in the present tense, without "should"**:
  `it('copies the stylesheet')`, not `it('should copy the stylesheet')`.
- **English**, in names and comments.
- **`expect` only**, no other assertion library.
- **No file snapshots.** Write the expected values out. An inline snapshot
  is fine for long generated markup, such as the `<picture>` element of the
  images plugin.
- **Anchor paths on the test file**:
  `path.resolve(import.meta.dirname, '..')`. Never resolve a path against
  the current directory, as in `path.resolve('views/tags.pug')`: the test
  then passes only when vitest runs from the package root.
- **Temporary folders only under `os.tmpdir()`**, never inside the
  repository, and removed after the tests.
- **Never `process.chdir`.** A hook that reads `process.cwd()` is tested by
  spying on it (`vi.spyOn(process, 'cwd')`) or by passing `cwd` in, as
  `loadConfig({ cwd })` allows.
- **Mock with `vi.spyOn` and with `vi.fn()` passed in** as a dependency.
  `vi.mock` only when the code offers no seam. Restoring is left to
  `restoreMocks`.
- **Built-in modules with the `node:` prefix**: `'node:fs'`,
  `'node:path'`, `'node:os'`. Synchronous `fs` is fine for writing fixtures.

`nera-stan` checks four of these rules in every test file, from version
1.0.0: `nera/test-no-chdir`, `nera/test-no-cwd-path`, `nera/test-name` and
`nera/test-helpers`.

## Integration tests

How the end-to-end test builds its site depends on the kind of package:

- **Plugins**: `test/integration.test.js` creates a site in a temporary
  folder with the plugin under test, builds it through `@nera-static/core`
  and asserts on the files in `public/`. Every plugin has
  `@nera-static/core` as a devDependency for this. The unit tests of a hook
  run it against a temporary site by pointing `process.cwd()` at it, not by
  changing the directory.
- **Themes and starters**: `test/global-setup.js` builds each variant of
  the fixture site once, and the test files read the builds through
  vitest's `inject('builds')`.
- **The CLI, the validator and the MCP server**: a temporary folder with the
  files the test needs, and the working directory passed in or spied on.

## Shared test helpers

`@nera-static/test-utils` (coming) will hold the helpers that Nera packages
write today in their own `test/helpers.js`: creating a temporary folder and
writing files into it, building a site in it, reading its `public/`,
capturing console output, running the CLI, and the shared suites for themes
and for template publishing.

- **A generic test helper comes from `@nera-static/test-utils`**, not from a
  local copy. `nera/test-helpers` refuses a function in a test file that
  carries the name of one of its helpers; the list of names ships with
  `nera-stan` 1.0.0.
- **What only your package needs stays in `test/helpers.js`**, such as a fake
  of an external service.
