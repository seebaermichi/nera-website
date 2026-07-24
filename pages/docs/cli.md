---
layout: pages/docs.pug
title: CLI reference
slug: cli
lang: en
description: The nera CLI — scaffold, build, preview, update and validate a site.
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
| `nera build` | Build `pages/` → `public/` |
| `nera dev` | Build + live-reload preview on `:3000` |
| `nera serve` | Serve `public/` without rebuilding |
| `nera update` | Update the site's Nera packages (`npm update`) |
| `nera validate` | Check layouts, includes and YAML before publishing |

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
