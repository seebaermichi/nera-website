---
layout: pages/tutorial.pug
title: How this website is built
slug: how-this-site-is-built
lang: en
description: A case study of the Nera site itself — the plugins, the ordering, and the local plugin behind it.
keywords: nera case study, static site example, nera website, dogfooding
tags: case-study, plugins, advanced
pagination_order: 9
---

# How this website is built

This whole site is built with Nera. Nothing here is special-cased — it's the same
generator and the same public plugins you'd install. Here's the full recipe.

## Scaffolded like any site

It started with the installer, which clones the generator and makes it your own
project:

```bash
npx @nera-static/installer new nera-website
```

## Seven plugins, each doing one thing

| Plugin | Job | Config |
| --- | --- | --- |
| `plugin-navigation` | Header + footer menus with active states | `config/navigation.yaml` |
| `plugin-tags` | Tutorial tags + auto-generated `/tags/*` pages | `config/tags.yaml` |
| `plugin-search` | Client-side search index + box | `config/search.yaml` |
| `plugin-page-pagination` | Prev/next in docs and tutorials | `config/page-pagination.yaml` |
| `plugin-canonical-links` | Canonical `<link>` tags for SEO | `config/canonical-links.yaml` |
| `plugin-link-attributes` | External links open in a new tab | `config/link-attributes.yaml` |
| `tutorials-list` (local) | Builds `app.tutorials` for the index | — |

Each has its own tutorial in this section, if you want the details.

## Order matters — search runs last

Search builds its index from the final state of every page, so it has to run after
everything else. `config/plugin-order.yaml` says so:

```yaml
plugin-order:
    - end:
          - plugin-search
```

Everything else runs alphabetically in between. This is the one place plugin
ordering is load-bearing on this site.

## Templates we own

Plugins that ship views were published into `views/vendor/` with commands like
`npx nera-navigation`. Those copies are ours to edit and style — nothing important
is hidden inside `node_modules`.

## Content is just Markdown

Every page you're reading is a Markdown file under `pages/` with a `layout` in its
frontmatter. The docs are `pages/docs/*.md`; this tutorial is
`pages/tutorials/how-this-site-is-built.md`. Folders become URLs; no routing config
exists.

## Build

```bash
npm run render   # pages/ -> public/
```

That's the entire stack: Markdown in, static HTML out, plugins for the rest. If
you've read the other tutorials in this section, you've now seen every piece of it
in isolation — this is just all of them together.
