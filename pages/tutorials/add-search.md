---
layout: pages/tutorial.pug
title: Add client-side search
slug: add-search
lang: en
description: Wire up plugin-search to generate an index and a working search box.
keywords: nera search, static site search, client-side search
tags: plugins, search
pagination_order: 4
createdAt: 2026-07-18
verified_on: 2026-10-13
verified_with:
    plugin-search: 2.3.0
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

This copies the search box into `theme/views/vendor/plugin-search/` and the client into
`theme/assets/js/search.js`.

Both copies are yours from then on. Running `npx nera-search` again skips the
template if the `vendor/plugin-search/` folder exists and the client if
`search.js` exists, so it never discards your edits — and a template change in a
new release never reaches your site on its own. To refresh after an upgrade, run
`npx nera-search --force`, but only if you never edited the copies: it overwrites
both. If you did, diff them against the package and merge the changes by hand
(the plugin README's *Template Publishing* section explains how).

## 3. Configure

`config/search.yaml` controls which fields are indexed. The file is optional;
these are the defaults:

```yaml
fields:
    - title
    - excerpt
    - content
    - href
strip_html: true
output_filename: search-index.json
```

`fields` replaces the default list rather than extending it, so keep `content`
(the page body) and `href` (the result link). Any other frontmatter key works if
your pages define it — the starter page `nera new` scaffolds has a `description`
but no `excerpt`, so add `description` if you want it indexed; a field a page
lacks is simply left off its entry.

To keep part of a page out of the index, mark it with `data-search-ignore`: the
element and everything inside it is dropped from `content`.
`@nera-static/plugin-code-blocks` (1.1.0 and later) marks its code-block bar this
way, so file names and the Copy button stay out of your results. In Markdown,
write the attribute on raw HTML:

```html
<aside data-search-ignore>Not part of the index.</aside>
```

## 4. Add a search page

The search box is Pug, so it belongs in a view, not in the Markdown. Create
`theme/views/pages/search.pug` on top of the layout `nera new` scaffolds:

```pug
extends ../layouts/layout

block content
  main
    article!= content
    include /vendor/plugin-search/search.pug
```

The leading slash resolves the include from `theme/views/`. Then point a page at
the view — a page without `layout` is neither rendered nor indexed:

```markdown
---
title: Search
layout: pages/search.pug
---

# Search

Search across the documentation.
```

That page brings its own `# Search` heading, so turn off the template's `h1` in
`config/search.yaml`, or `nera build --check` warns `a11y-h1` about two of them:

```yaml
show_title: false
```

If your page has no heading of its own, leave `show_title` out and the template's
`h1` is the page heading.

The template's texts go through `t()`: `search_title` (the heading, default
`Search`), `search_placeholder` (default `Search...`) and `search_label`, the
input's accessible name (default `Search`). Translate them under `translations`
in `config/app.yaml`, for example for German:

```yaml
translations:
    de:
        search_title: Suche
        search_placeholder: Suchen…
        search_label: Suche
```

Finally, make sure search runs **last** in `config/plugin-order.yaml` so it
indexes final page data, including pages other plugins generate:

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

Render, and you have working search. This site's [Search page](/search.html) is
built from the same parts, with two differences: its Markdown has no heading, so
it keeps the template's `h1`, translated with the three keys in English, German
and Spanish; and it sets `group_by_lang: true`, so the box returns only pages in
the language you are reading.
