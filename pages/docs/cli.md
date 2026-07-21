---
layout: pages/docs.pug
title: CLI reference
slug: cli
lang: en
description: The nera installer commands and the generator npm scripts.
pagination_order: 7
---

# CLI reference

## Installer (`@nera-static/installer`)

```bash
npx @nera-static/installer new <project-name>   # scaffold a new site
npx @nera-static/installer update               # update the generator core in place
```

## Generator scripts

Run these from inside a site:

| Command | What it does |
| --- | --- |
| `npm run render` | Build `pages/` → `public/` |
| `npm run dev` | Render + live-reload preview on `:3000` |
| `npm run serve` | Serve `public/` without rebuilding |

## Plugin publish commands

Each template-shipping plugin exposes a bin to copy its Pug into
`views/vendor/`, e.g.:

```bash
npx nera-navigation
npx nera-tags
npx nera-search --force   # overwrite existing published templates
```
