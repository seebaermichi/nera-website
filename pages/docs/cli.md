---
layout: pages/docs.pug
title: CLI reference
slug: cli
lang: en
description: The nera CLI — scaffold, build, preview, update, validate and check a site.
pagination_order: 7
---

# CLI reference

## The `nera` CLI (`@nera-static/nera`)

One command scaffolds, builds, previews, updates and validates a site. Scaffold
a new one with:

```bash
npx @nera-static/nera new <project-name>
```

`nera new .` scaffolds into the current, empty folder instead, and
`--theme <name>` starts the site from a theme. `--starter <name>` starts it
from a ready-to-edit starter kit instead (`blank`, `blog`, `business` or
`portfolio`; not together with `--theme`), and `--name "<site name>"` and
`--lang <code>` set `name` and `lang` in `config/app.yaml`:

```bash
npx @nera-static/nera new my-blog --starter blog --name "My Blog" --lang de
```

On a terminal, without `--starter` or `--yes`, `nera new` asks what you are
building, the site name and the language; with `--yes`, or without a terminal,
it never asks. [Starter kits](#starter-kits) below has the details.

A scaffolded site depends on `@nera-static/nera`, so run these from inside it
with `npx`, e.g. `npx nera validate`. The scaffold also wires `build`, `dev` and
`serve` to npm scripts, e.g. `npm run dev`:

| Command | What it does |
| --- | --- |
| `nera build` | Build `pages/` → `public/`; with `--check`, check the result too |
| `nera dev` | Build + live-reload preview on `:3000` |
| `nera serve` | Serve `public/` without rebuilding |
| `nera update` | Update the site's Nera packages (`npm update`) and raise their `^` ranges in `package.json` to the installed versions, then create or refresh `AGENTS.md` and `CLAUDE.md` |
| `nera validate` | Check layouts, includes and YAML before publishing |
| `nera check` | Check the built `public/` for accessibility, privacy and legal-notice problems |

### Starter kits

A starter kit is a whole ready-to-edit site: sample pages, config, optional
site-level `theme/` overrides, assets and the theme and plugins it depends on.
`nera new --starter` copies its `pages/`, `config/`, `theme/`, `assets/`,
`plugins/` and `.neraignore` over the base template, adds its `dependencies`
to the site's `package.json`, applies `--name` and `--lang`, installs, and
prints the `## First steps` section of the starter's README (nothing, when it
has none). After that the site owns the files: a starter has no update path,
though the theme it depends on still updates through npm.

`--name "<site name>"` and `--lang <code>` set `name:` and `lang:` in
`config/app.yaml`, with or without a starter. A new language gets a copy of
the current language's `translations:` entry, ready to translate, so no page
shows a raw translation key.

`--starter` takes:

- a starter name: `blank`, `blog`, `business` or `portfolio`, short for
  `@nera-static/starter-blank` and so on;
- a package name: `@acme/starter-shop`, or unscoped `nera-starter-shop`;
- a GitHub URL: `https://github.com/owner/repo` (optionally `.git`, `#ref`),
  or `github:owner/repo#ref`;
- a local path: `./my-starter`, `../my-starter` or an absolute path.

Packages and GitHub repositories are downloaded with
`npm pack --ignore-scripts`, so no script of the starter runs. A starter is a
package whose `package.json` has a `nera.starter` field
(`{ "label": "…", "description": "…" }`); anything else is refused before
anything is written. A starter that sets `theme:` in its `config/app.yaml`
leaves out the scaffold's starter templates, as `--theme` does.

Run `nera new my-site` on a terminal and it asks instead:

```text
What are you building?
  1) Empty — the base template, no starter
  2) …
Choose 1–2 [1]:
Site name [My Nera Site]:
Language [en]:
```

The list comes from the npm registry (packages with the keyword
`nera-starter`, official `@nera-static/` ones first), or from a short list
bundled with the CLI when the registry cannot be reached. Enter accepts the
default. Every question has a flag (`--starter`, `--name`, `--lang`); with
`--yes`, or without a terminal (scripts, CI, AI agents), nothing is asked and
`nera new` scaffolds the base template.

The official starters:

| Starter | What you get |
| --- | --- |
| `blank` | One accessible layout, no theme |
| `blog` | A blog on `@nera-static/theme-blog` with tags, an archive, an Atom feed and a sitemap |
| `business` | A small-business site on `@nera-static/theme-business` with services, opening hours and a contact form |
| `portfolio` | A designer's portfolio on `@nera-static/theme-business` with projects in image galleries, an about page and a contact form |

### Checking the built site

`nera validate` reads your sources. `nera check` reads what the build produced —
the page a visitor gets, with its layout, navigation, footer, scripts,
stylesheets and fonts — and looks for problems a parser can find there:

```bash
nera build --check   # build, then check — the one command for CI
nera check           # check an existing public/ without rebuilding
```

Run `nera build` first; without `public/`, `nera check` stops with "run
`nera build` first". A problem in a template is reported once, with the number
of pages it appears on.

Every finding is a **warning** by default, so the command exits `0`. It exits
`1` only when a rule you promoted to `error` fires — that is how you make it a
CI gate.

**These are hints, not legal advice.** A clean run is not proof of compliance:
automated checks find only part of the accessibility problems (about a third
of WCAG failures). Colour contrast, visible focus and whether a law applies to
your site are not checked. Every report ends with that reminder.

| rule | default | basis |
| --- | --- | --- |
| `a11y-html-lang` | warning | WCAG 3.1.1 |
| `a11y-title` | warning | WCAG 2.4.2 |
| `a11y-h1` | warning | WCAG 1.3.1 |
| `a11y-heading-skip` | warning | WCAG 1.3.1 |
| `a11y-img-alt` | warning | WCAG 1.1.1 |
| `a11y-form-label` | warning | WCAG 1.3.1, 4.1.2 |
| `a11y-link-name` | warning | WCAG 2.4.4, 4.1.2 |
| `a11y-main` | warning | WCAG 1.3.1 |
| `a11y-skip-link` | warning | WCAG 2.4.1 |
| `a11y-nav-name` | warning | WCAG 1.3.1 |
| `a11y-duplicate-id` | warning | WCAG 4.1.2 |
| `a11y-viewport-zoom` | warning | WCAG 1.4.4 |
| `a11y-link-lang` | off (opt-in) | WCAG 3.1.2 |
| `a11y-target-blank` | off (opt-in) | WCAG 3.2.5 (AAA) |
| `a11y-reduced-motion` | off (opt-in) | WCAG 2.3.3 (AAA) |
| `privacy-third-party` | warning | Art. 6 DSGVO |
| `privacy-consent-leak` | warning | § 25 TDDDG |
| `privacy-insecure` | warning | Art. 32 DSGVO |
| `privacy-storage` | off (opt-in) | § 25 TDDDG |
| `legal-imprint-link` | warning | § 5 DDG |
| `legal-privacy-link` | warning | Art. 13 DSGVO |
| `legal-outdated-law` | warning | DDG, TDDDG, MStV |

Configure the checks in `config/validate.yaml` (optional — without it the
defaults above apply):

```yaml
rules:
  a11y-img-alt: error         # promote: the check fails
  a11y-target-blank: warning  # enable an opt-in rule
  a11y-skip-link: off         # disable
legal:
  imprint:                    # per language, the page every page links to
    de: /de/impressum.html
    en: /en/imprint.html
  privacy:
    de: /de/datenschutz.html
    en: /en/privacy.html
privacy:
  allowed_hosts:              # third-party hosts you have accounted for
    - cdn.example.org
```

To silence a rule on one page, list it in the page's frontmatter as
`validate_ignore: [a11y-h1]`.

To silence a rule on whole files or folders, list them under `ignore`. This
works for `nera validate` too — for example for `layout-missing` on content
fragments that another page pulls in, or on drafts, which have no `layout` on
purpose:

```yaml
ignore:
  layout-missing:
    - pages/*/references      # a folder covers everything below it
    - pages/de/blog/drafts    # * stands for one folder name
```

Paths are relative to the site root. Requires `@nera-static/validate` 1.3.0,
which `npm update` brings into an existing site.

**Your own host.** To tell your resources from third-party ones,
`privacy-third-party` reads `origin` from `config/app.yaml`, else `app_origin`
from `config/canonical-links.yaml` (with and without `www.`). With neither set,
only relative URLs count as your own.

**Consent-gated resources.** A script or embed in the markup of
`@nera-static/plugin-consent` (`type="text/plain"` with `data-src`, or
`data-consent-src` instead of `src`) loads nothing on page view, so
`privacy-third-party` does not report it. An element marked `data-consent`
that still loads is what `privacy-consent-leak` reports. The tutorial
[Add a consent banner — or none](/tutorials/consent-banner.html) shows both.

**Imprint and privacy links in German and English only.** Without `legal`
config, the links are found by their text — *Impressum*, *Imprint*, *Legal
notice*, *Datenschutz*, *Privacy*, *Data protection* — and only on German and
English pages. For any other language, name the pages under
`legal.imprint.<lang>` and `legal.privacy.<lang>`.

The full rule descriptions are in the
[`@nera-static/validate` README](https://github.com/seebaermichi/nera-validate#checking-the-built-output).

### Instructions for AI assistants

Every scaffolded site carries an `AGENTS.md` — the file Codex, Cursor, Copilot
and other assistants read first — and a `CLAUDE.md` holding the single line
`@AGENTS.md`, so Claude Code loads the same text. `AGENTS.md` ends with a
**Notes for this site** section for your own instructions, below the marker
line `<!-- nera:site-notes … -->`. Keep that line in place: the part above it
is Nera's, the part below it is yours.

From `@nera-static/nera` 1.7.0 on, `nera update` keeps both files current, with
no extra flag. After updating the packages (and after `nera update --migrate`)
it:

- creates `AGENTS.md` and `CLAUDE.md` when they are missing, so an older site
  gets them too;
- replaces only the part of `AGENTS.md` above the marker line with the text from
  the installed `@nera-static/nera`; the marker line and your notes below it
  stay exactly as they are;
- leaves an `AGENTS.md` without the marker line alone and prints a hint — copy
  the marker line from the template directly above your own notes to opt in;
- never touches an existing `CLAUDE.md`.

A file is written only when its content changes, so running `nera update` again
changes nothing.

### Migrating an older (cloned) site

Sites created before the CLI were git clones that vendored the engine under
`src/`. Inside such a site, run `nera update --migrate` — it adds the
`@nera-static/nera` dependency, rewrites the scripts, removes the vendored
`src/` engine, and installs, leaving your `pages/`, `config/` and `theme/`
untouched.

## Plugin publish commands

Each template-shipping plugin exposes a bin to copy its Pug into
`theme/views/vendor/`, e.g.:

```bash
npx nera-navigation
npx nera-tags
npx nera-search --force   # overwrite existing published templates
```
