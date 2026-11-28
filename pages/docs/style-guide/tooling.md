---
layout: pages/docs.pug
title: Tooling
slug: style-guide-tooling
lang: en
description: The tools that keep the Nera handwriting — nera-stan in every repository, its rules, fixes and exceptions, the shared .editorconfig and the weekly cross-repository check. No Prettier.
pagination_order: 5
---

# Tooling

A rule that only lives on a page drifts. Every rule of this guide that a
machine can check is checked by one tool, `nera-stan`, which every Nera
repository runs in `npm run lint`. What a single repository cannot see,
such as a helper written twice in two packages, a weekly check across all
repositories finds. Everything else is in the shared `.editorconfig`.

## nera-stan

`@nera-static/stan` (bin `nera-stan`, from version 1.0.0) is the handwriting
check of a single Nera repository. It is a devDependency of every package
and runs as its lint script:

```json
"scripts": {
    "lint": "nera-stan"
}
```

So the same check runs everywhere it matters:

- **on your machine**, with `npm run lint`, and through the husky hooks:
  `pre-commit: npm run lint` before every commit,
  `pre-push: npm run lint && npx vitest run` before every push;
- **in CI**, where `test.yml` runs `npm run lint` on every push and pull
  request, and `publish.yml` refuses to publish a release that fails it.

`nera-stan` brings its own ESLint configuration and never reads the
repository's `eslint.config.js`, so no repository can loosen a rule. The
`eslint.config.js` only serves your editor, and it is two lines:

```js
import nera from '@nera-static/stan'

export default [...nera]
```

### Running it

```text
nera-stan [dir] [--fix]
```

- **`dir`** is the repository to check, the current directory by default.
- **`--fix`** applies the fixes that have one obviously correct result and
  leaves everything else to you.
- **`--help`** and **`--version`** print the usage and the version.

`nera-stan` prints one finding per line on stdout, sorted by file and line,
with the file relative to the repository, and a summary line on stderr:

```text
index.js:14 nera/shared-logger `console.warn` in plugin runtime code: `import { createLogger } from '@nera-static/plugin-utils/log'`, create one logger with `createLogger('plugin-example')` and call its `warn`/`info` instead
src/related.js:3 @stylistic/comma-dangle Missing trailing comma.
nera-stan: 2 problems (1 fixable with --fix)
```

The exit code says how it went:

| Exit code | Meaning                                                   |
| --------- | --------------------------------------------------------- |
| `0`       | clean                                                     |
| `1`       | findings                                                  |
| `2`       | a usage error, a missing or invalid `package.json`, or an internal error |

Every rule is an error. There is no warning level: what `nera-stan` reports
is fixed, or it is a documented exception.

### Repository kinds

Some rules apply only to some kinds of repository. `nera-stan` reads the kind
from `package.json`, nothing else:

| Kind      | Detected by                                                                 |
| --------- | --------------------------------------------------------------------------- |
| `core`    | the name `@nera-static/core`                                                |
| `starter` | a `nera.starter` field                                                      |
| `theme`   | a name `@nera-static/theme-*`, or a `nera.generator` field                  |
| `plugin`  | a name `@nera-static/plugin-*`, except `@nera-static/plugin-utils`          |
| `site`    | no `@nera-static/` name, and a dependency on `@nera-static/nera`            |
| `tool`    | everything else: the CLI, the validator, plugin-utils, the MCP server, … |

### What it checks

In every kind, for every `.js`, `.mjs` and `.cjs` file:

- **ESLint's recommended rules**, with the Node globals (the browser globals
  for scripts under `assets/`, vitest's in test files).
- **The formatting**: 4 spaces, no semicolons, single quotes (double quotes
  where they avoid escaping), trailing commas in multi-line literals,
  parentheses around every arrow function parameter, spaces inside braces, a
  final newline, no trailing spaces, at most 120 characters per line (long
  strings, URLs and comments excepted).
- **`prefer-const`, `no-var` and `no-unused-vars`.**
- **Built-in modules with the `node:` prefix** (`n/prefer-node-protocol`).

And the Nera rules:

| Rule                    | Kinds          | Files                         | What it refuses | `--fix` |
| ----------------------- | -------------- | ----------------------------- | --------------- | ------- |
| `nera/no-local-helper`  | all but plugin-utils and test-utils | all but the browser scripts in `assets/` and `views/` | a local function with the name or the shape of a `@nera-static/plugin-utils` helper; the message names the export to import | no |
| `nera/shared-logger`    | plugin         | runtime code (not `test/`, `bin/`, `scripts/`, `views/`, `assets/`) | a bare `console.*`; use `createLogger` | no |
| `nera/no-copied-from`   | all            | comments everywhere; `ROADMAP` in published files | a "copied from …" note, and a reference to a local-only `ROADMAP` file | no |
| `nera/hook-shape`       | plugin         | runtime code                  | a hook exported through `export { … }`, a hook that does not destructure its argument with defaults, a config read at module scope | adds the missing defaults |
| `nera/test-no-chdir`    | all            | test files                    | `process.chdir` | no |
| `nera/test-no-cwd-path` | all            | test files                    | a path resolved against the current directory, as `path.resolve('views/x.pug')` | no |
| `nera/test-name`        | all            | test files                    | a test name that starts with "should" | no |
| `nera/test-helpers`     | all            | test files                    | a local copy of a `@nera-static/test-utils` helper | no |

Test files are everything under `test/` and every `*.test.js`. The writing
rules behind the test rules are on the [Tests](/docs/style-guide/tests.html)
page.

`--fix` changes only what has one correct result: the formatting rules,
the `node:` prefix, and the missing defaults of a hook
(`({ app, pagesData })` becomes `({ app = {}, pagesData = [] } = {})`).
It never rewrites `(data)` into a destructured argument, and it does not
rename tests, because dropping "should" changes the verb.

Since 1.1.0 three more rule families stand next to the code rules:

- `css/*`: every CSS file through stylelint, with the BEM class pattern and
  the [custom-property prefixes](/docs/style-guide/themes-and-starters.html#custom-properties).
- `pug/*`: every Pug template parses, is indented in multiples of 4 spaces
  without tabs, quotes attribute values singly and writes BEM class literals.
- `structure/*`: `package.json`, README, CHANGELOG, LICENSE, the canonical
  files and the files each kind of repository must have.

### Exceptions

- **Always ignored**: `node_modules/`, `public/`, `dist/`, `coverage/`,
  `.nera-cache/` and `test/site/public/`, plus everything the repository's
  `.gitignore` lists.
- **A repository's own exceptions** go into `package.json`, under one key,
  and nowhere else:

  ```json
  "nera-stan": {
      "ignores": ["test/markup/", "demo/demo.js"],
      "variants": { ".github/workflows/test.yml": "image-cache" },
      "skip": { "structure/test-scripts": "a theme without tests: it compiles its templates instead" }
  }
  ```

  `ignores` is for files that are not Nera code, such as generated fixtures
  or a vendored demo. `variants` picks a named variant of a canonical file,
  and `skip` switches a rule off with its reason. The
  [README](https://github.com/seebaermichi/nera-stan#readme) lists the
  allowed values.
- **A single line** can be excepted with an ESLint comment that names the
  rule and says why:

  ```js
  // eslint-disable-next-line nera/shared-logger -- the CLI prints its own report
  console.log(report)
  ```

  A disable comment that no longer suppresses anything is itself an error,
  so exceptions do not outlive their reason. A disable comment without a
  reason after ` -- ` is an error too.

## .editorconfig

Every repository carries the same `.editorconfig`. It sets the indentation
for the file types no linter touches, such as Pug, CSS, YAML and JSON, in
every editor that reads it:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 4
insert_final_newline = true
trim_trailing_whitespace = true

[*.md]
trim_trailing_whitespace = false
```

Markdown keeps its trailing whitespace, because two trailing spaces are a
line break there.

## The weekly cross-repository check

`nera-stan` sees one repository at a time. `style-check`, a script in the
engine's repository (`generator/scripts/style-check.js`), reads all of them
side by side and reports what only shows up across repositories:

- helpers defined in two or more repositories, which belong in
  `@nera-static/plugin-utils`;
- plugin templates and scripts that a theme, a starter or the website
  copied, compared with the plugin version they were copied from;
- files that must be identical in every repository of a kind.

It runs every Monday on a fresh clone of all public Nera repositories and
writes its report into the workflow summary. A deliberate difference is
listed in its allow-list with a reason, and stays visible in the report as
allowed.

## No Prettier

Nera does not use Prettier. ESLint's formatting rules already enforce the
handwriting for JavaScript, a second formatter would fight them, and the
Pug plugin for Prettier would rewrite every template. There is no build or
format step in a Nera package: what you write is what `nera-stan` checks.
