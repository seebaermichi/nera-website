---
layout: pages/tutorial.pug
title: Write your own local plugin
slug: write-a-local-plugin
lang: en
description: Build a project-local plugin that adds data to app, using the getAppData hook.
keywords: nera plugin, local plugin, getAppData, getMetaData, plugin contract
tags: plugins, local-plugins, advanced
pagination_order: 8
createdAt: 2026-07-14
---
You don't need to publish to npm to extend Nera. Any module at
`src/plugins/<name>/index.js` is discovered and applied automatically. Let's build
a real one: a plugin that collects every tutorial into a list for an index page —
the exact plugin that powers this site.

## The contract

A plugin exports either or both of two hooks:

```js
export function getAppData({ app, pagesData }) {
    // must return a plain object — becomes the new `app`
}

export function getMetaData({ app, pagesData }) {
    // must return an array — becomes the new `pagesData`
}
```

`getAppData` runs first; `getMetaData` sees the `app` it returned. **Keep them
synchronous** — an async hook can silently wipe `app` on older generator versions.

## Build it

Create `src/plugins/tutorials-list/index.js`:

```js
export function getAppData({ app, pagesData }) {
    if (!app || typeof app !== 'object') return app
    if (!Array.isArray(pagesData)) return app

    const tutorials = pagesData
        .filter(({ meta }) => {
            const href = meta?.href || ''
            return href.startsWith('/tutorials/') && href !== '/tutorials/index.html'
        })
        .map(({ meta }) => ({
            href: meta.href,
            title: meta.title || meta.href,
            description: meta.description || '',
            createdAt: meta.createdAt,
        }))
        .sort((a, b) => {
            const da = new Date(a.createdAt).getTime()
            const db = new Date(b.createdAt).getTime()
            if (!Number.isNaN(da) && !Number.isNaN(db) && da !== db) return db - da
            return String(a.href).localeCompare(String(b.href))
        })

    return { ...app, tutorials }
}
```

That's the whole plugin. It reads every page, keeps the ones under `/tutorials/`,
and returns a new `app` with a sorted `tutorials` array.

## Use it in a layout

`app.tutorials` is now available in every view:

```pug
if app.tutorials && app.tutorials.length
  ul.tutorials__list
    each post in app.tutorials
      li.tutorials__item
        a.tutorials__link(href=post.href)
          h2 #{ post.title }
          p #{ post.description }
```

## Why return a *new* object

Nera threads each hook's return value into the next. Returning `{ ...app, tutorials }`
(rather than mutating `app`) keeps that data flow predictable — the same reason the
built-in plugins do it. From here, the same pattern builds related-posts lists,
author pages, "recently updated" widgets — anything derived from your content.
