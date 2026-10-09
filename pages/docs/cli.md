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

A scaffolded site depends on `@nera-static/nera`, so run these from inside it
(the scaffold wires each to an npm script too, e.g. `npm run dev`):

| Command | What it does |
| --- | --- |
| `nera build` | Build `pages/` → `public/`; with `--check`, check the result too |
| `nera dev` | Build + live-reload preview on `:3000` |
| `nera serve` | Serve `public/` without rebuilding |
| `nera update` | Update the site's Nera packages (`npm update`) |
| `nera validate` | Check layouts, includes and YAML before publishing |
| `nera check` | Check the built `public/` for accessibility, privacy and legal-notice problems |

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

**Imprint and privacy links in German and English only.** Without `legal`
config, the links are found by their text — *Impressum*, *Imprint*, *Legal
notice*, *Datenschutz*, *Privacy*, *Data protection* — and only on German and
English pages. For any other language, name the pages under
`legal.imprint.<lang>` and `legal.privacy.<lang>`.

The full rule descriptions are in the
[`@nera-static/validate` README](https://github.com/seebaermichi/nera-validate#checking-the-built-output).

### Migrating an older (cloned) site

Sites created before the CLI were git clones that vendored the engine under
`src/`. Inside such a site, run `nera update --migrate` — it adds the
`@nera-static/nera` dependency, rewrites the scripts, removes the vendored
`src/` engine, and installs, leaving your `pages/`, `config/` and `theme/`
untouched.

## Plugin publish commands

Each template-shipping plugin exposes a bin to copy its Pug into
`views/vendor/`, e.g.:

```bash
npx nera-navigation
npx nera-tags
npx nera-search --force   # overwrite existing published templates
```
