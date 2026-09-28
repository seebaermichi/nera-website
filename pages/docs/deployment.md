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

## Cache busting

Browsers cache stylesheets, scripts and fonts, so after a deploy visitors may
keep seeing the old CSS or JS until they force a reload. Turn on content hashing
in `config/app.yaml` (requires `@nera-static/core` 4.11 or newer):

```yaml
asset_hashing: true
```

On every build Nera appends `?v=<hash>` to each local asset URL — stylesheets,
scripts, images, `srcset`, the search index and `url(…)` references inside CSS
such as fonts. The hash comes from the file's content, so a URL changes exactly
when its file does and stays cacheable otherwise. Your templates keep plain
paths like `/css/main.css`; never add `?v=` by hand.

Page links, external URLs and URLs that already have a query string are left
alone, and it works together with `base_path`. Without the key the build output
is unchanged.

## Before you launch

- Set `app_origin` in `config/canonical-links.yaml` to your real domain so
  canonical URLs are correct.
- Add an `.neraignore` at the project root to keep source-only assets out of the
  build.

> `public/` is deleted and rebuilt on every render — never edit it by hand, and
> never commit it as source.
