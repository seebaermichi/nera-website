---
layout: pages/tutorial.pug
title: Tag your content and get topic pages for free
slug: tag-your-content
lang: en
description: Add tags to pages with plugin-tags and get auto-generated tag overview pages and a tag cloud.
keywords: nera tags, plugin-tags, tag pages, topic pages, static site tags
tags: plugins, tags
pagination_order: 3
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

Render, and every tag now has its own page — no manual index maintenance. The
tutorial you're reading is tagged this way; the chips above link to the generated
tag pages.
