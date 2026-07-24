---
layout: pages/docs.pug
title: Deployment
slug: deployment
lang: en
description: Building the site and hosting the public/ folder.
pagination_order: 6
---

# Deployment

Nera outputs a plain `public/` folder — deploy it anywhere that serves static
files.

## Build

```bash
npm run build
```

## Host it

- **Netlify / Vercel** — build command `npm run build`, publish directory
  `public`.
- **GitHub Pages** — render in CI, then publish `public/` to the `gh-pages` branch.
- **Any static host / CDN** — upload the contents of `public/`.

## Before you launch

- Set `app_origin` in `config/canonical-links.yaml` to your real domain so
  canonical URLs are correct.
- Add an `.neraignore` at the project root to keep source-only assets out of the
  build.

> `public/` is deleted and rebuilt on every render — never edit it by hand, and
> never commit it as source.
