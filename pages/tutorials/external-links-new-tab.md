---
layout: pages/tutorial.pug
title: Open external links in a new tab
slug: external-links-new-tab
lang: en
description: Use plugin-link-attributes to add target and rel to outbound links automatically.
keywords: nera external links, plugin-link-attributes, target blank, noopener
tags: plugins, links
pagination_order: 6
createdAt: 2026-07-16
verified_on: 2026-10-13
verified_with:
    plugin-link-attributes: 2.1.1
    core: 4.13.0
---
`@nera-static/plugin-link-attributes` post-processes your rendered HTML and adds
attributes to outbound links — so every external link opens in a new tab, safely,
without you touching the Markdown.

## 1. Install

```bash
npm install @nera-static/plugin-link-attributes
```

No template to publish — this plugin only transforms content. Its one setting
lives in a config file.

## 2. Configure

`config/link-attributes.yaml` lists the attributes to add. The quick way to get
it is the plugin's own command, which writes the defaults shown below:

```bash
npx nera-link-attributes
```

An existing file is left alone, so re-running never overwrites your edits;
`npx nera-link-attributes --force` replaces it with a fresh copy. You can also
write the file by hand:

```yaml
attributes:
    - target="_blank"
    - rel="noopener noreferrer"
```

Without any `attributes` the plugin leaves your pages unchanged — no file, no new
tabs.

The plugin targets only links whose `href` starts with `http` or `www`, so your
internal links (`/docs/...`) are left alone, and an attribute a link already has
is never overwritten. The `rel="noopener noreferrer"` is worth keeping — it closes
the tab-nabbing hole that bare `target="_blank"` opens.

## 3. The one gotcha: layout links

The plugin rewrites links inside your **Markdown content**, not links you write
directly in Pug layouts (a header "GitHub" button, a footer link). Add the same
attributes to those by hand:

```pug
a.site-header__cta(href=app.repo_url, target="_blank", rel="noopener noreferrer") GitHub
```

Render, and every outbound link — in content and in your layout — opens in a new
tab. This site does exactly this; try any GitHub link.
