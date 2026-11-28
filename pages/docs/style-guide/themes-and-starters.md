---
layout: pages/docs.pug
title: Themes and starters
slug: style-guide-themes-and-starters
lang: en
description: The anatomy of a Nera theme and a Nera starter — one theme.css, design tokens, seams, the neraTheme helper object, the custom-property prefixes, webfonts, the fixture site, and what a starter copies.
pagination_order: 3
---

# Themes and starters

A theme is the look of a site, shipped as an npm package whose files a site
overrides one by one. A starter is a whole sample site that `nera new
--starter <name>` copies once. Both follow one layout, so a theme author who
knows one official theme finds their way in every other, and a new theme
starts from this page and from `node scripts/new-repo.js theme <name>` (or
`starter <name>`) in the generator repo, rather than from a copy of a sibling.

How a site installs and overrides a theme is in the
[core concepts](/docs/core-concepts.html); how a site uses a starter is in
the [CLI reference](/docs/cli.html).

## Theme files

```text
nera-theme-<name>/
├── views/
│   ├── layouts/layout.pug    # the shell: blocks head, header, main, footer, scripts
│   ├── pages/                # one view per page type: default.pug, home.pug, post.pug, …
│   └── partials/
│       ├── helpers.pug       # the contract functions and the neraTheme object
│       ├── tokens.pug        # config/theme.yaml tokens as --theme-* custom properties
│       ├── head.pug  header.pug  footer.pug  scripts.pug  lang-switch.pug  …
│       └── <seam>.pug        # empty or a plugin-free default; a site overrides it
├── assets/
│   ├── css/theme.css         # the one stylesheet
│   └── fonts/<name>/         # only with webfonts: woff2 files plus their licence texts
├── config/theme.yaml         # every key the theme reads, with its default
├── test/
│   ├── site/                 # the fixture site the tests build, in two languages
│   ├── helpers/  global-setup.js
│   └── <section>.test.js     # one file per section of the theme's contract
├── README.md  CHANGELOG.md  LICENSE  package.json  package-lock.json
├── eslint.config.js  vitest.config.js  .editorconfig  .gitignore
├── .husky/                   # pre-commit: npm run lint, pre-push: npm run lint && npx vitest run
└── .github/                  # workflows/test.yml, workflows/publish.yml, dependabot.yml, FUNDING.yml
```

- **One stylesheet, `assets/css/theme.css`.** No `@import` chain and no
  build step: the file a site links is the file in the repository.
- **A script a plugin needs comes from that plugin**, never from a copy in
  the theme (see "Starter files" below).
- `package.json` lists `views`, `assets`, `config` and `CHANGELOG.md` in
  `files`, carries `nera.generator` with the core floor
  (`{ "generator": ">=4.15.0" }`), lists the plugins it styles as optional
  `peerDependencies`, and has the keywords `nera` and `nera-theme`.

## Design tokens

A site changes a theme's colours, fonts and sizes in its own
`config/theme.yaml`, without touching the CSS:

```yaml
# config/theme.yaml
tokens:
    color:
        bg: '#f4f5f7'
        accent: '#d02408'
        accent_text: '#ffffff'
    font:
        body: "'Inter', system-ui, sans-serif"
    size:
        measure: '46rem'
```

`partials/tokens.pug` turns every token into a custom property named
`--theme-<group>-<name>`, with `_` written as `-`: `tokens.color.accent_text`
becomes `--theme-color-accent-text`. It writes them into one inline `<style>`
and drops every value that could break out of the rule (`<`, `>`, `{`, `}`,
`;`). The theme's own `config/theme.yaml` holds every key with its default,
and `theme.css` repeats that default as the fallback of each `var()`.

## Custom properties

Every custom property in a theme or a plugin carries a prefix that says who
owns it:

| prefix | owner | example |
|---|---|---|
| `--theme-*` | the public tokens from `config/theme.yaml`; a site may set them | `--theme-color-accent` |
| `--<theme>-*` | a theme's internal aliases, named after the theme | `--stack-bg` |
| `--nera-<plugin>-*` | a plugin's default styles | `--nera-code-bg` |

**No unprefixed custom property** in a theme or a plugin. A short name such
as `--bg`, `--text` or `--accent` collides with a site's own CSS. A theme
that wants short internal names aliases the tokens once, under its own
prefix, and uses the aliases from then on:

```css
:root {
    --stack-bg: var(--theme-color-bg, #f4f5f7);
    --stack-accent: var(--theme-color-accent, #d02408);
}

body {
    background: var(--stack-bg);
}
```

Renaming a custom property a site may have set is a breaking change and
needs a major release.

## Seams

A seam is a partial the theme ships empty, or with a default that needs no
plugin. A site fills it by putting a file of the same path into its own
`theme/views/`. Common seams are `head-extra`, `scripts-extra`,
`footer-extra` and `nav-main`; blog themes add seams such as `post-media`,
`post-tags`, `post-pagination` and `tag-cloud`.

- **A theme reads no plugin data.** It does not look into `app.tags`,
  `meta.images` or any other key a plugin writes, and it does not parse a
  page's `content`. Plugin output reaches a page only through a seam the
  site fills, so a plugin's new data shape can never break a theme.
- A seam override starts with a one-line comment that says what it fills:
  `//- Seam override: plugin-navigation's list form …`.
- The theme's README lists every seam with where it renders, what is in
  scope and the typical override, ready to copy.

## The helper object: `neraTheme`

`partials/helpers.pug` holds two things:

- **The contract functions** every view of the theme, and a site's own
  layout, may call: in the blog and business themes `pageLang(page)`,
  `sameLang(page)`, `homeHref(lang)`, `formatDate(value, lang)`,
  `isoDate(value)` and `hrefFor(value, lang)`. They are documented in the
  README and are part of the contract.
- **One object for the theme's internal helpers, named `neraTheme`** in
  every theme, never after the theme. The shared partials (`tokens.pug`,
  `lang-switch.pug`, `head.pug`) then read the same in every theme, and a
  check can hold them identical.

```pug
//- partials/tokens.pug
if neraTheme.tokenRule()
    style!= neraTheme.tokenRule()
```

`neraTheme` stays internal: a site calls the contract functions, not the
object. A theme that renames its helper object to `neraTheme` still says so
in its CHANGELOG, because a site that copied a partial calling the old name
breaks.

## Webfonts

- A theme with webfonts **serves them itself**: woff2 files under
  `assets/fonts/<theme>/`, next to the licence text of each family
  (`OFL-<family>.txt`). No request to a font CDN, so a site with the theme
  makes no third-party request.
- The `@font-face` rules come first in `theme.css`, under a comment that
  names the licence and the source package with its version, for example
  `From @fontsource-variable/inter 5.3.0`.
- Every `font-family` ends in a system font stack, so text renders before the
  font has loaded (`font-display: swap`).
- A theme without webfonts uses system font stacks only.

## Theme tests

A theme is tested by building a site with it, not by unit tests of its
templates:

- `test/site/` is a complete fixture site in two languages that uses the
  theme from the repository (`theme: ../..`) and every plugin the theme
  styles.
- `test/global-setup.js` builds each variant of the fixture once, through
  the installed `nera` CLI, and the test files read the output.
- One test file per section of the theme's contract: `build`, `contract`,
  `contrast`, `override`, `pages`, `package`, `plugin-classes`, `tokens`,
  `validate` and so on.
- The fixture passes `nera validate` and `nera build --check` with every rule
  at `error`; a rule the theme deliberately breaks (external links in a new
  tab) is turned off in the fixture's `config/validate.yaml`, with a comment
  that says why, and named in the README.
- The shared theme suites move into `@nera-static/test-utils` (coming), so a
  theme passes its options instead of copying the suites.

## Starter files

```text
nera-starter-<name>/
├── pages/                    # the sample pages, ready to edit
├── config/                   # app.yaml, theme.yaml and every plugin's config
├── theme/                    # the sample site's own files: seam overrides, vendor views, images
├── assets/  plugins/  .neraignore   # only when the sample site needs them
├── test/
│   ├── package.test.js       # the package: name, files, nera.starter, dependencies
│   └── scaffold.test.js      # nera new --starter on this repo, then a clean build
├── README.md  CHANGELOG.md  LICENSE  package.json  package-lock.json
├── eslint.config.js  .editorconfig  .gitignore  .husky/  .github/
```

- **`nera new` copies only `pages/`, `config/`, `theme/`, `assets/`,
  `plugins/` and `.neraignore`.** Everything else in the repository, its
  tests included, stays behind. The CLI merges the starter's `dependencies`
  into the new site's `package.json`.
- `package.json` carries `nera.starter` with a `label` and a `description`,
  which `nera new` shows when it offers the starters:

  ```json
  "nera": {
      "starter": {
          "label": "Blog for developers",
          "description": "A ready-to-edit Nera blog for developers on @nera-static/theme-stack: …"
      }
  }
  ```

- Plugins and the theme are `dependencies`. `@nera-static/nera` is a
  devDependency only: the CLI never merges it, so the new site keeps the
  version it was created with.
- `files` lists the copied folders and `CHANGELOG.md`, and leaves out what a
  build writes, such as `!theme/assets/search-index*.json`.
- **A starter copies no plugin script.** A script such as the search or the
  contact form script comes from its plugin through `getAssets`, served under
  `public/_nera/<plugin>.js`, and the layout links it there. A copy in
  `theme/assets/js/` would have to be refreshed by hand on every plugin
  release, and nothing would notice when it drifts.
- Vendor views under `theme/views/vendor/plugin-<name>/` are the published
  templates of the installed plugin version, unchanged. A deliberate change
  goes into a seam override, not into the vendor copy.
- A fresh site from the starter passes `nera validate` and
  `nera build --check` without a finding. `scaffold.test.js` proves it.

## Starter README

The sections come in this order:

```markdown
# @nera-static/starter-example
[![Test](…)](…)
[![npm version](…)](…)

A ready-to-edit … for the Nera static site generator, on @nera-static/theme-…

## Usage                     npx @nera-static/nera new my-site --starter example
## What you get              the pages, the plugins, what the sample shows
## <extra sections>          optional, e.g. picture credits or texts for --lang de
## Requirements              the CLI, core and Node floors
## License
## First steps               always last
```

**`## First steps` is always the last section.** `nera new` prints it after
the site is created, from its heading to the next `#` or `##` heading, its
`###` subsections included; as the last section it is also where the README
ends, with the same text the new owner just saw. It is a short numbered
list of what the new owner must change first: the site's `origin`, the legal pages, the author.

## Versioning

Themes and starters follow the release rules of the
[plugins page](/docs/style-guide/plugins.html#changelog), with these
additions:

- **Major** for a theme: a renamed or removed seam, a contract function, a
  token or a public class; a changed meaning of a `config/theme.yaml` key; a
  higher core floor.
- A starter has no update path: a site created from it owns its files, so a
  starter release changes only what new sites get.
