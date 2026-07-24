---
layout: pages/tutorial.pug
title: Tag your content and get topic pages for free
slug: tag-your-content
lang: en
description: Add tags to pages with plugin-tags and get auto-generated tag overview pages and a tag cloud.
keywords: nera tags, plugin-tags, tag pages, topic pages, static site tags
tags: plugins, tags
pagination_order: 3
createdAt: 2026-07-19
---
`@nera-static/plugin-tags` reads a `tags:` field from your frontmatter, then builds
a browsable overview page for every tag automatically.

## 1. Install and publish templates

```bash
npm install @nera-static/plugin-tags
npx nera-tags
```

## 2. Tag some pages

Add a comma-separated `tags` value to any page's frontmatter:

```markdown
---
layout: pages/tutorial.pug
title: Add client-side search
tags: plugins, search
---
```

Tags are slugified and case-folded, so `Web Dev`, `web dev` and `WEB DEV` all map to
one page at `/tags/web-dev.html`.

## 3. Configure (optional)

`config/tags.yaml` — every key is optional:

```yaml
meta_property_name: tags
tag_overview_path: '/tags'
tag_separator: ','
tag_overview_layout: pages/tag-overview.pug
```

The `tag_overview_layout` points at a layout that renders the published overview
template. Create `views/pages/tag-overview.pug`:

```pug
extends ../layouts/layout

block content
  .container
    include ../vendor/plugin-tags/pages/tag-overview
```

## 4. Show tags on a page

The plugin gives each page a `meta.tagLinks` list. Include the published partial in
your article layout:

```pug
if meta.tagLinks
  include ../vendor/plugin-tags/partials/tag-links
```

And for a site-wide cloud, `app.tagCloud` drives the `tag-cloud` partial:

```pug
if app.tagCloud
  include ../vendor/plugin-tags/partials/tag-cloud
```

## 5. Per-language tags (optional)

By default every tag lives in one namespace, so a multilingual site merges all
languages into one overview page. Set `group_by_lang` to give each language its
own:

```yaml
group_by_lang: true
```

Tags are then collected per `meta.lang`, and the language code prefixes the whole
`tag_overview_path`. With `tag_overview_path: '/tutorials/tags'` you get:

```
/tutorials/tags/<slug>.html       # default language
/de/tutorials/tags/<slug>.html    # German pages only
/es/tutorials/tags/<slug>.html    # Spanish pages only
```

The default language stays unprefixed, which is what you want when it is served
from the root. If every language sits in its own directory, add
`prefix_default_lang: true` so it gets a segment too. Pages without a `meta.lang`
fall into the default language rather than a bucket of their own, so a
single-language site is unaffected by any of this.

Chips and clouds follow along on their own: `meta.tagLinks` links within the
page's own language, and each page gets a `meta.tagCloud` scoped to it. Watch one
detail — `app.tagCloud` still exists, but with grouping on it holds the *default*
language's cloud. Guarding on it is fine; reading it directly to render a cloud
is not, because a German page would show English tags. The shipped `tag-cloud`
partial already prefers `meta.tagCloud` and falls back to `app.tagCloud`, so use
the partial rather than looping yourself. `app.tagCloudByLang` has every
language, keyed by code, if you need them all at once.

Generated overview pages also carry their own `meta.lang`, so `t()` inside the
overview layout resolves in that page's language.

Render, and every tag now has its own page — no manual index maintenance. The
tutorial you're reading is tagged this way; the chips above link to the generated
tag pages. This site runs with `group_by_lang: true`, so those chips lead to the
tag pages for whichever language you are reading.
