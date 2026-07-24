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

- **Node.js ≥ 20**
- npm (bundled with Node)

## Scaffold a site

`nera new` scaffolds a new site that depends on the `@nera-static/core` engine —
no clone, no vendored source:

```bash
npx @nera-static/nera new my-site
cd my-site
npm run dev
```

`npm run dev` renders the site and starts a live-reloading preview on
`http://localhost:3000`.

## Build for production

```bash
npm run build
```

This deletes and regenerates `public/`. Deploy that folder to any static host.

## Update later

```bash
nera update
```

`nera update` bumps the site's Nera packages with `npm update`, leaving your
`pages/`, `config/` and `theme/` untouched.
