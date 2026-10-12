---
layout: pages/docs.pug
title: Getting started
slug: getting-started
lang: en
description: Scaffold a new Nera site with the nera CLI and build it.
pagination_order: 2
---

# Getting started

## Requirements

- **Node.js 20.19 or newer** (22.12 or newer on the 22 line)
- npm (bundled with Node)

## Scaffold a site

`nera new` scaffolds a new site whose one Nera dependency is
`@nera-static/nera`, which brings the `@nera-static/core` engine — no clone, no
vendored source:

```bash
npx @nera-static/nera new my-site
cd my-site
npm run dev
```

`npm run dev` renders the site and starts a live-reloading preview on
`http://localhost:3000`. Already in the folder the site should live in? `npx
@nera-static/nera new .` scaffolds into the current, empty folder.

## Build for production

```bash
npm run build
```

This deletes and regenerates `public/`. Deploy that folder to any static host.

## Update later

```bash
npx nera update
```

`nera update` bumps the site's Nera packages with `npm update` and refreshes
Nera's part of `AGENTS.md`, leaving your `pages/`, `config/` and `theme/`
untouched.
