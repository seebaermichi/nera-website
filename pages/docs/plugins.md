---
layout: pages/docs.pug
title: Plugins
slug: docs-plugins
lang: en
description: Installing plugins, the hook contract, config resolution, and templates.
pagination_order: 5
---

# Plugins

## Installing

```bash
npm install @nera-static/plugin-navigation
```

Any dependency whose name starts with `@nera-static/plugin-` is discovered and
applied automatically — no registration step. (`@nera-static/plugin-utils` is a
helper library, not a plugin, and is skipped.)

A plugin for one site only needs no package: put it in
`src/plugins/<name>/index.js`, or set another folder with `folders.plugins` in
`config/app.yaml`. See [Write your own local plugin](/tutorials/write-a-local-plugin.html).

## The hook contract

A plugin is an ESM module exporting up to three hooks, `getAppData`,
`getMetaData` and `getAssets` (below):

```js
export function getAppData({ app, pagesData }) {
    return { ...app, myKey: 'value' }   // must return a plain object
}

export function getMetaData({ app, pagesData }) {
    return pagesData                    // must return an array
}
```

`getAppData` runs first; `getMetaData` sees the `app` it returned. Core awaits
every hook (since core 4.3.0; older versions silently replaced `app` with a
Promise), but **synchronous stays the safe default** — it is what the published
plugins do.

A plugin that produces files (generated images, for example) also exports
`getAssets` (core ≥ 4.13.0). It runs after every plugin's `getAppData` and
`getMetaData`, sees the final `app` and `pagesData`, and returns what to copy into
`public/`:

```js
export function getAssets({ app, pagesData }) {
    return [{ from: '/abs/path/to/files', to: '_img' }]
}
```

`from` is an absolute file or folder, `to` a path inside `public/`. Core copies
these after the theme's assets and before your own, so your `theme/assets/` still wins
on a name clash. Invalid entries are skipped with a warning.

## Config lives in your project

Every plugin reads `config/<name>.yaml` from **your** site, not from the package.
The YAML shipped inside the package is documentation; copy it into your `config/`
and edit. Missing keys fall back to sensible defaults.

## Ordering

`config/plugin-order.yaml` controls execution order: names under `start:` run
first, then everything else alphabetically, then names under `end:`. Search runs
last so it indexes the final page data.

## Templates

Plugins that ship views expose a publish command:

```bash
npx nera-navigation      # copies templates into theme/views/vendor/plugin-navigation/
```

Then `include` them from your layouts. Publishing **skips if the folder already
exists** — delete it (or pass `--force`) to pull in template updates.
