---
layout: pages/tutorial.pug
title: Write your own local plugin
slug: write-a-local-plugin
lang: en
description: Build a project-local plugin that adds data to app with the getAppData hook and writes a file into public/ with the getAssets hook.
keywords: nera plugin, local plugin, getAppData, getMetaData, getAssets, plugin contract
tags: plugins, local-plugins, advanced
pagination_order: 8
createdAt: 2026-07-14
verified_on: 2026-10-25
verified_with:
    core: 4.18.2
---
You don't need to publish to npm to extend Nera. Any module at
`src/plugins/<name>/index.js` is discovered and applied automatically — that is
the default, and a site made with `nera new` has no setting for it. To keep
local plugins elsewhere, set `folders.plugins` in `config/app.yaml` — this site
uses `plugins/`:

```yaml
folders:
    plugins: ./plugins
```

Let's build a real one: a plugin that collects every tutorial into a list for an
index page — a simplified version of the plugin that powers this site — and then
publishes the same list as `tutorials.json`.

## The contract

A plugin exports any of three hooks:

```js
export function getAppData({ app, pagesData }) {
    // must return a plain object — becomes the new `app`
}

export function getMetaData({ app, pagesData }) {
    // must return an array — becomes the new `pagesData`
}

export function getAssets({ app, pagesData }) {
    // must return an array of { from, to } — files core copies into public/
}
```

`getAppData` runs first; `getMetaData` sees the `app` it returned. `getAssets`
(core ≥ 4.13.0) runs once every plugin is done with the other two. Nera awaits
all hooks (since core 4.3.0; older versions silently replaced `app` with a
Promise), but **synchronous stays the safe default** — it is what the published
plugins do.

A hook that returns the wrong type does not stop the build: core prints a warning
such as `⚠️ Plugin "tutorials-list" getAppData returned invalid format, skipping
replace.` and keeps the old data. When a plugin seems to do nothing, read the
build log first. "The hook contract" in the [plugin docs](/docs/plugins.html#the-hook-contract) has
the short version.

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

## Hand over a file with `getAssets`

Now publish the same list as `/tutorials.json`. Writing it into `public/` from a
hook does not work: plugins run *before* core deletes and re-creates `public/`,
so the file is gone by the end of the build. Write it into
`.nera-cache/tutorials-list/` instead (`nera new` puts `.nera-cache` in
`.gitignore`) and return it from `getAssets`. Add this to the same file:

```js
import fs from 'fs'
import path from 'path'

// getAppData from above stays as it is

export function getAssets({ app }) {
    if (!Array.isArray(app?.tutorials)) return []

    const dir = path.resolve(process.cwd(), '.nera-cache/tutorials-list')
    const from = path.join(dir, 'tutorials.json')

    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(from, `${JSON.stringify(app.tutorials, null, 4)}\n`)

    return [{ from, to: 'tutorials.json' }]
}
```

Each entry is `{ from, to }`: `from` is an **absolute** path to a file or folder,
`to` a path **relative to `public/`** — the target file for a file, the folder
its contents go into for a folder (`''` is `public/` itself). `getAssets` sees
the final `app`, so `app.tutorials` from your own `getAppData` is already there.

After `nera build`, `public/tutorials.json` holds the list, newest first:

```json
[
    {
        "href": "/tutorials/second.html",
        "title": "Second tutorial",
        "description": "The newer one.",
        "createdAt": "2026-08-01T00:00:00.000Z"
    },
    {
        "href": "/tutorials/first.html",
        "title": "First tutorial",
        "description": "The older one.",
        "createdAt": "2026-07-01T00:00:00.000Z"
    }
]
```

Core copies the files in the order theme → plugins → site, so a file of the same
name in your own `theme/assets/` still wins. The copy happens before `base_path`
and asset hashing, so both cover plugin files too. An entry with a relative
`from` or a `to` outside `public/` is skipped with a warning, such as
`⚠️ Plugin "tutorials-list" getAssets entry skipped: "from" must be an absolute
path (…)`. For real-world examples, see this site's
[`llms-txt`](https://github.com/seebaermichi/nera-website/tree/main/plugins/llms-txt)
and [`skill-zip`](https://github.com/seebaermichi/nera-website/tree/main/plugins/skill-zip)
plugins.

## Why return a *new* object

Nera threads each hook's return value into the next. Returning `{ ...app, tutorials }`
(rather than mutating `app`) keeps that data flow predictable — the same reason the
built-in plugins do it. From here, the same pattern builds related-posts lists,
author pages, "recently updated" widgets — anything derived from your content.
