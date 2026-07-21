---
layout: pages/docs.pug
title: Getting started
slug: getting-started
lang: en
description: Scaffold a new Nera site with the installer and render it.
pagination_order: 2
---

# Getting started

## Requirements

- **Node.js ≥ 20**
- npm (bundled with Node)

## Scaffold a site

The `@nera-static/installer` CLI clones the generator and makes it your own project:

```bash
npx @nera-static/installer new my-site
cd my-site
npm run dev
```

`npm run dev` renders the site and starts a live-reloading preview on
`http://localhost:3000`.

## Build for production

```bash
npm run render
```

This deletes and regenerates `public/`. Deploy that folder to any static host.

## Update later

```bash
npx @nera-static/installer update
```

`nera update` refreshes the generator core in place while leaving your `pages/`,
`config/` and `views/` untouched.
