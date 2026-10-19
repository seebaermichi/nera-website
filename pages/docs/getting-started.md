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

- **Node.js 22.12 or newer**
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
untouched. From `@nera-static/nera` 1.15.0 on, it also raises their `^` ranges
in `package.json` (and `package-lock.json`) to the versions it installed, so
`^1.0.0` becomes, say, `^1.15.0`; it never crosses a major version. How an AI assistant uses `AGENTS.md` is explained in
[Using Nera with AI](/docs/using-ai.html).
