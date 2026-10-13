---
layout: pages/tutorial.pug
title: How this website is built
slug: how-this-site-is-built
lang: en
description: A case study of the Nera site itself — the plugins, the ordering, the local plugins, and how it is checked and deployed.
keywords: nera case study, static site example, nera website, dogfooding
tags: case-study, plugins, advanced
pagination_order: 9
createdAt: 2026-07-13
verified_on: 2026-10-13
verified_with:
    nera: 1.11.0
    plugin-canonical-links: 2.2.3
    plugin-code-blocks: 1.2.1
    plugin-link-attributes: 2.1.1
    plugin-navigation: 3.1.0
    plugin-page-pagination: 2.4.0
    plugin-search: 2.3.0
    plugin-tags: 3.3.0
---
This whole site is built with Nera. Nothing here is special-cased — it's the same
generator and the same public plugins you'd install. Here's the full recipe.

## Scaffolded like any site

It started with the nera CLI, which scaffolds a site whose one Nera dependency is
`@nera-static/nera` (it brings the `@nera-static/core` engine):

```bash
npx @nera-static/nera new nera-website
```

## Ten plugins, each doing one thing

| Plugin | Job | Config |
| --- | --- | --- |
| `plugin-navigation` | Header + footer menus with active states | `config/navigation.yaml` |
| `plugin-tags` | Tutorial tags + per-language `/tutorials/tags/*` pages | `config/tags.yaml` |
| `plugin-search` | Per-language client-side search index + box | `config/search.yaml` |
| `plugin-page-pagination` | Prev/next in docs and tutorials | `config/page-pagination.yaml` |
| `plugin-canonical-links` | Canonical `<link>` tags for SEO | `config/canonical-links.yaml` |
| `plugin-link-attributes` | External links open in a new tab | `config/link-attributes.yaml` |
| `plugin-code-blocks` | Build-time syntax highlighting with a copy button | `config/code-blocks.yaml` |
| `tutorials-list` (local) | Builds `app.tutorials` for the index | — |
| `llms-txt` (local) | `llms.txt`, `llms-full.txt` and a `.md` per page for AI assistants | `config/llms-txt.yaml` |
| `skill-zip` (local) | [The Nera skill](/docs/using-ai.html) as a zip for claude.ai and Claude Desktop | — |

The three local plugins — `tutorials-list`, `llms-txt` and `skill-zip` — live in
`plugins/`, set with `folders.plugins` in `config/app.yaml`. `llms-txt` and
`skill-zip` write files rather than data, and hand them to the build through the
`getAssets` hook (see [Write your own local plugin](/tutorials/write-a-local-plugin.html)).
`skill-zip` reads the skill from the installed `@nera-static/nera`, so the
download always matches the CLI the site builds with. Most of the others have
their own tutorial in this section, if you want the details.

## Order matters — canonical links and search run last

Search builds its index from the final state of every page, so it has to run after
everything else. Canonical links have to come after `plugin-tags` too, or the tag
pages it generates get no canonical link — and alphabetically, `canonical-links`
would run before `tags`. `config/plugin-order.yaml` says so:

```yaml
plugin-order:
    - end:
          - plugin-canonical-links
          - plugin-search
```

Everything else runs alphabetically in between. This is the one place plugin
ordering is load-bearing on this site.

## Templates we own

Plugins that ship views were published into `theme/views/vendor/` with commands like
`npx nera-navigation`. Those copies are ours to edit and style — nothing important
is hidden inside `node_modules`.

## Content is just Markdown

Every page you're reading is a Markdown file under `pages/` with a `layout` in its
frontmatter. The docs are `pages/docs/*.md`; this tutorial is
`pages/tutorials/how-this-site-is-built.md`. Folders become URLs; no routing config
exists.

## Build

```bash
npm run build   # pages/ -> public/
```

## Checks and deploy

Every push to `main` and every pull request against it runs
`.github/workflows/test.yml` on Node 20 and 22 — the same commands you can run
locally:

```bash
npm ci
npm run lint              # eslint
npm test                  # node --test on the tests beside the local plugins
npm run validate          # nera validate: layouts, includes, frontmatter
npm run build -- --check  # nera build --check
```

`--check` looks at the built `public/` for accessibility, privacy and
legal-notice problems and reports what it finds. Findings are warnings, so they
fail the run only for a rule that `config/validate.yaml` promotes to an error.

A push to `main` then runs `.github/workflows/deploy.yml`: `npm ci`,
`npm run build`, and `public/` is published to GitHub Pages — the site you are
reading at nera.js.org.

That's the entire stack: Markdown in, static HTML out, plugins for the rest. If
you've read the other tutorials in this section, you've now seen every piece of it
in isolation — this is just all of them together.
