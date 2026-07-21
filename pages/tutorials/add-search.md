---
layout: pages/tutorial.pug
title: Add client-side search
slug: add-search
lang: en
description: Wire up plugin-search to generate an index and a working search box.
keywords: nera search, static site search, client-side search
tags: plugins, search
pagination_order: 4
---
`@nera-static/plugin-search` builds a JSON index at render time and ships a small
client script — no server required.

## 1. Install

```bash
npm install @nera-static/plugin-search
```

## 2. Publish the template

```bash
npx nera-search
```

This copies the search box into `views/vendor/plugin-search/` and the client into
`assets/js/search.js`.

## 3. Configure

`config/search.yaml` controls which fields are indexed:

```yaml
fields:
    - title
    - description
    - content
    - href
strip_html: true
output_filename: search-index.json
```

## 4. Add a search page

Create a page that includes the published search partial, then make sure search
runs **last** in `config/plugin-order.yaml` so it indexes final page data:

```yaml
plugin-order:
    - end:
          - plugin-search
```

Render, and you have working search. This site's [Search page](/search.html) is
built exactly this way.
