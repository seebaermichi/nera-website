---
layout: pages/docs.pug
title: Core concepts
slug: core-concepts
lang: en
description: The render pipeline, the app and meta objects, layouts and translations.
pagination_order: 3
---

# Core concepts

## The four-stage pipeline

Every build runs the same fixed pipeline: **load app data → render pages →
apply plugins → write output.** Understanding these four stages explains almost
everything about how Nera behaves.

## `app` vs `meta`

Two data objects reach your templates:

- **`app`** — global values from `config/app.yaml`, available on every page.
- **`meta`** — per-page values: your frontmatter, plus derived keys like
  `meta.href`, `meta.dirname`, `meta.filename` and `meta.createdAt`.

Plugins add to both — for example, `plugin-navigation` sets `app.nav`, and
`plugin-tags` sets `meta.tagLinks`.

## Layouts

Layouts are Pug files under `theme/views/`. A page's `layout` frontmatter picks one:

```markdown
---
layout: pages/docs.pug
title: My page
---
```

The path is relative to `theme/views/`, so `pages/docs.pug` is
`theme/views/pages/docs.pug`.

If `config/app.yaml` sets `theme:` (a package such as `@nera-static/theme-example`,
or a local folder), the layouts come from that theme, and a file in your own
`theme/views/` or `theme/assets/` replaces the theme's file at the same path —
override one template without copying the rest. `npx @nera-static/nera new
my-site --theme example` starts a site that way.

## Translations

`config/app.yaml` holds a `translations` map. In a layout, `t('key')` resolves
`app.translations[meta.lang || app.lang][key]`, falling back to the key itself —
so missing translations are visible, not silent.
