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
---
`@nera-static/plugin-link-attributes` post-processes your rendered HTML and adds
attributes to outbound links — so every external link opens in a new tab, safely,
without you touching the Markdown.

## 1. Install

```bash
npm install @nera-static/plugin-link-attributes
```

No template to publish — this plugin only transforms content.

## 2. Configure

`config/link-attributes.yaml` lists the attributes to add:

```yaml
attributes:
    - target="_blank"
    - rel="noopener noreferrer"
```

The plugin targets only links whose `href` starts with `http` or `www`, so your
internal links (`/docs/...`) are left alone. The `rel="noopener noreferrer"` is
worth keeping — it closes the tab-nabbing hole that bare `target="_blank"` opens.

## 3. The one gotcha: layout links

The plugin rewrites links inside your **Markdown content**, not links you write
directly in Pug layouts (a header "GitHub" button, a footer link). Add the same
attributes to those by hand:

```pug
a.site-header__cta(href=app.repo_url, target="_blank", rel="noopener noreferrer") GitHub
```

Render, and every outbound link — in content and in your layout — opens in a new
tab. This site does exactly this; try any GitHub link.

> Node note: this plugin uses cheerio under the hood, so it needs Node ≥ 20.18.1 to
> build. It doesn't affect your visitors — the output is plain HTML.
