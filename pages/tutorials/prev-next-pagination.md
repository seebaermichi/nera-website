---
layout: pages/tutorial.pug
title: Add prev/next links between pages
slug: prev-next-pagination
lang: en
description: Use plugin-page-pagination to link sibling pages in reading order.
keywords: nera pagination, plugin-page-pagination, prev next links, docs navigation
tags: plugins, pagination
pagination_order: 5
---

# Add prev/next links between pages

`@nera-static/plugin-page-pagination` links each page to its previous and next
**sibling** — pages in the same directory — in an order you control. Perfect for
docs and multi-part tutorials.

## 1. Install and publish the template

```bash
npm install @nera-static/plugin-page-pagination
npx nera-page-pagination
```

## 2. Order the pages

By default the plugin reads a `pagination_order` number from each page:

```markdown
---
title: Getting started
pagination_order: 2
---
```

Pages are ordered by `pagination_order` first, then by creation date, then by
path — so a page without an explicit order still lands somewhere stable.

> Ordering starts at `0` if you want it to: the plugin treats `0` as a real value,
> not "missing". Change the key name in `config/page-pagination.yaml` with
> `order_property` if you prefer.

## 3. Render the links

The plugin adds `meta.pagePagination` with `.previous` and `.next`. Include the
published template, guarded so it's hidden when there's nowhere to go:

```pug
if meta.pagePagination && (meta.pagePagination.previous || meta.pagePagination.next)
  include ../vendor/plugin-page-pagination/page-pagination
```

## Why "siblings only" matters

Pagination is scoped per directory, so `pages/docs/*.md` paginate among themselves
and `pages/tutorials/*.md` among themselves — they never bleed into each other. Put
a sequence in its own folder and it just works. This site's docs use exactly this.
