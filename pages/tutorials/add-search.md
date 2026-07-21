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

## 5. Per-language search (optional)

By default every page lands in one index, so the search box on a German page
also returns English and Spanish hits. Set `group_by_lang` to give each language
an index of its own:

```yaml
group_by_lang: true
```

Pages are grouped by `meta.lang`, and the language code goes before the
extension of `output_filename`. The default language keeps the plain filename:

```
/search-index.json       # default language
/search-index.de.json    # German pages only
/search-index.es.json    # Spanish pages only
```

Pages without a `meta.lang` fall into the default language — `lang` in
`config/app.yaml` — so a single-language site is unaffected by any of this.

Every page then carries `meta.searchIndexPath`, the index for its own language.
The published `search.pug` passes it to the client as `data-search-index` and
`search.js` fetches that URL, so your own markup needs no change. Watch one
detail — `app.searchIndexPath` still exists, but with grouping on it points at
the *default* language's index, so building the attribute from it would search
English from a German page. `app.searchIndexPaths` has every language keyed by
code, and each index entry carries its `lang`.

Because search runs last (step 4), pages other plugins generate land in the
right language too — the tag pages from `plugin-tags` among them.

Upgrading an existing site has one catch worth knowing: `npx nera-search` skips
files you already published, and `--force` overwrites them along with any edits
you made. If your copies are customised, merge the two changes by hand instead —
the `data-search-index` attribute in the template, and `search.js` reading
`input.dataset.searchIndex`. Until you do, the old client keeps requesting
`/search-index.json` and every page searches the default language.

Render, and you have working search. This site's [Search page](/search.html) is
built exactly this way, with `group_by_lang: true` — the box returns only pages
in the language you are reading.
